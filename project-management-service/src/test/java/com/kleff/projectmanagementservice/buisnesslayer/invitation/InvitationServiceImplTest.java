package com.kleff.projectmanagementservice.buisnesslayer.invitation;

import com.kleff.projectmanagementservice.buisnesslayer.collaborator.CollaboratorService;
import com.kleff.projectmanagementservice.datalayer.collaborator.CollaboratorRole;
import com.kleff.projectmanagementservice.datalayer.collaborator.ProjectPermission;
import com.kleff.projectmanagementservice.datalayer.customrole.CustomRole;
import com.kleff.projectmanagementservice.datalayer.customrole.CustomRoleRepository;
import com.kleff.projectmanagementservice.datalayer.invitation.Invitation;
import com.kleff.projectmanagementservice.datalayer.invitation.InvitationRepository;
import com.kleff.projectmanagementservice.datalayer.invitation.InviteStatus;
import com.kleff.projectmanagementservice.mappinglayer.invitation.InvitationRequestMapper;
import com.kleff.projectmanagementservice.mappinglayer.invitation.InvitationResponseMapper;
import com.kleff.projectmanagementservice.presentationlayer.collaborator.CollaboratorRequestModel;
import com.kleff.projectmanagementservice.presentationlayer.invitation.InvitationRequestModel;
import com.kleff.projectmanagementservice.presentationlayer.invitation.InvitationResponseModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvitationServiceImplTest {

    @Mock
    private InvitationRepository invitationRepository;

    @Mock
    private CustomRoleRepository customRoleRepository;

    @Mock
    private CollaboratorService collaboratorService;

    @Mock
    private InvitationRequestMapper requestMapper;

    @Mock
    private InvitationResponseMapper responseMapper;

    @InjectMocks
    private InvitationServiceImpl invitationService;

    private String testProjectId;
    private String inviterUserId;
    private String inviteeEmail;
    private InvitationRequestModel testRequest;
    private Invitation testInvitation;
    private InvitationResponseModel testResponse;

    @BeforeEach
    void setUp() {
        testProjectId = "project-123";
        inviterUserId = "inviter-456";
        inviteeEmail = "invitee@example.com";

        testRequest = InvitationRequestModel.builder()
                .projectId(testProjectId)
                .inviteeEmail(inviteeEmail)
                .role(CollaboratorRole.DEVELOPER)
                .permissions(Set.of(ProjectPermission.READ_PROJECT))
                .build();

        testInvitation = new Invitation();
        testInvitation.setId(1);
        testInvitation.setProjectId(testProjectId);
        testInvitation.setInviteeEmail(inviteeEmail);
        testInvitation.setRole(CollaboratorRole.DEVELOPER);

        testResponse = InvitationResponseModel.builder()
                .id(1)
                .projectId(testProjectId)
                .inviteeEmail(inviteeEmail)
                .role(CollaboratorRole.DEVELOPER)
                .build();
    }

    // ============ createInvitation Tests ============

    @Test
    void createInvitation_WithValidRequest_CreatesAndReturnsInvitation() {
        // Arrange
        when(requestMapper.requestToEntity(testRequest)).thenReturn(testInvitation);
        when(invitationRepository.save(any(Invitation.class))).thenReturn(testInvitation);
        when(responseMapper.toResponseModel(testInvitation)).thenReturn(testResponse);

        // Act
        InvitationResponseModel result = invitationService.createInvitation(testRequest, inviterUserId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getInviteeEmail()).isEqualTo(inviteeEmail);
        verify(invitationRepository).save(any(Invitation.class));
    }

    @Test
    void createInvitation_SetsInviterId() {
        // Arrange
        when(requestMapper.requestToEntity(testRequest)).thenReturn(testInvitation);
        when(invitationRepository.save(any(Invitation.class))).thenReturn(testInvitation);
        when(responseMapper.toResponseModel(any(Invitation.class))).thenReturn(testResponse);

        // Act
        invitationService.createInvitation(testRequest, inviterUserId);

        // Assert
        ArgumentCaptor<Invitation> captor = ArgumentCaptor.forClass(Invitation.class);
        verify(invitationRepository).save(captor.capture());
        assertThat(captor.getValue().getInviterId()).isEqualTo(inviterUserId);
    }

    @Test
    void createInvitation_SetsStatusToPending() {
        // Arrange
        when(requestMapper.requestToEntity(testRequest)).thenReturn(testInvitation);
        when(invitationRepository.save(any(Invitation.class))).thenReturn(testInvitation);
        when(responseMapper.toResponseModel(any(Invitation.class))).thenReturn(testResponse);

        // Act
        invitationService.createInvitation(testRequest, inviterUserId);

        // Assert
        ArgumentCaptor<Invitation> captor = ArgumentCaptor.forClass(Invitation.class);
        verify(invitationRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(InviteStatus.PENDING);
    }

    @Test
    void createInvitation_SetsCreatedAtAndUpdatedAt() {
        // Arrange
        when(requestMapper.requestToEntity(testRequest)).thenReturn(testInvitation);
        when(invitationRepository.save(any(Invitation.class))).thenReturn(testInvitation);
        when(responseMapper.toResponseModel(any(Invitation.class))).thenReturn(testResponse);

        // Act
        invitationService.createInvitation(testRequest, inviterUserId);

        // Assert
        ArgumentCaptor<Invitation> captor = ArgumentCaptor.forClass(Invitation.class);
        verify(invitationRepository).save(captor.capture());
        assertThat(captor.getValue().getCreatedAt()).isNotNull();
        assertThat(captor.getValue().getUpdatedAt()).isNotNull();
    }

    @Test
    void createInvitation_WithNullEmail_ThrowsException() {
        // Arrange
        InvitationRequestModel invalidRequest = InvitationRequestModel.builder()
                .projectId(testProjectId)
                .inviteeEmail(null)
                .build();

        // Act & Assert
        assertThatThrownBy(() -> invitationService.createInvitation(invalidRequest, inviterUserId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("inviteeEmail is required");

        verify(invitationRepository, never()).save(any());
    }

    @Test
    void createInvitation_WithBlankEmail_ThrowsException() {
        // Arrange
        InvitationRequestModel invalidRequest = InvitationRequestModel.builder()
                .projectId(testProjectId)
                .inviteeEmail("   ")
                .build();

        // Act & Assert
        assertThatThrownBy(() -> invitationService.createInvitation(invalidRequest, inviterUserId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("inviteeEmail is required");
    }

    // ============ getPendingInvitationsForEmail Tests ============

    @Test
    void getPendingInvitationsForEmail_ReturnsInvitations() {
        // Arrange
        Invitation inv1 = new Invitation();
        inv1.setId(1);
        inv1.setInviteeEmail(inviteeEmail);

        Invitation inv2 = new Invitation();
        inv2.setId(2);
        inv2.setInviteeEmail(inviteeEmail);

        when(invitationRepository.findByInviteeEmailAndStatus(inviteeEmail, InviteStatus.PENDING))
                .thenReturn(Arrays.asList(inv1, inv2));
        when(responseMapper.toResponseModel(inv1)).thenReturn(testResponse);
        when(responseMapper.toResponseModel(inv2)).thenReturn(testResponse);

        // Act
        List<InvitationResponseModel> result = invitationService.getPendingInvitationsForEmail(inviteeEmail);

        // Assert
        assertThat(result).hasSize(2);
        verify(invitationRepository).findByInviteeEmailAndStatus(inviteeEmail, InviteStatus.PENDING);
    }

    @Test
    void getPendingInvitationsForEmail_WithCustomRole_SetsCustomRoleName() {
        // Arrange
        Invitation invWithCustomRole = new Invitation();
        invWithCustomRole.setId(1);
        invWithCustomRole.setCustomRoleId(5);

        CustomRole customRole = new CustomRole();
        customRole.setId(5);
        customRole.setName("Custom Developer");

        InvitationResponseModel response = InvitationResponseModel.builder()
                .id(1)
                .customRoleId(5)
                .build();

        when(invitationRepository.findByInviteeEmailAndStatus(inviteeEmail, InviteStatus.PENDING))
                .thenReturn(Arrays.asList(invWithCustomRole));
        when(customRoleRepository.findById(5)).thenReturn(Optional.of(customRole));
        when(responseMapper.toResponseModel(invWithCustomRole)).thenReturn(response);

        // Act
        List<InvitationResponseModel> result = invitationService.getPendingInvitationsForEmail(inviteeEmail);

        // Assert
        assertThat(result.get(0).getCustomRoleName()).isEqualTo("Custom Developer");
    }

    @Test
    void getPendingInvitationsForEmail_WithEmptyList_ReturnsEmptyList() {
        // Arrange
        when(invitationRepository.findByInviteeEmailAndStatus(inviteeEmail, InviteStatus.PENDING))
                .thenReturn(Arrays.asList());

        // Act
        List<InvitationResponseModel> result = invitationService.getPendingInvitationsForEmail(inviteeEmail);

        // Assert
        assertThat(result).isEmpty();
    }

    // ============ getPendingInvitationsForProject Tests ============

    @Test
    void getPendingInvitationsForProject_ReturnsInvitations() {
        // Arrange
        Invitation inv1 = new Invitation();
        inv1.setId(1);
        inv1.setProjectId(testProjectId);

        when(invitationRepository.findByProjectIdAndStatus(testProjectId, InviteStatus.PENDING))
                .thenReturn(Arrays.asList(inv1));
        when(responseMapper.toResponseModel(inv1)).thenReturn(testResponse);

        // Act
        List<InvitationResponseModel> result = invitationService.getPendingInvitationsForProject(testProjectId);

        // Assert
        assertThat(result).hasSize(1);
        verify(invitationRepository).findByProjectIdAndStatus(testProjectId, InviteStatus.PENDING);
    }

    @Test
    void getPendingInvitationsForProject_WithCustomRole_SetsCustomRoleName() {
        // Arrange
        Invitation invWithCustomRole = new Invitation();
        invWithCustomRole.setCustomRoleId(3);

        CustomRole customRole = new CustomRole();
        customRole.setName("Project Lead");

        InvitationResponseModel response = InvitationResponseModel.builder()
                .customRoleId(3)
                .build();

        when(invitationRepository.findByProjectIdAndStatus(testProjectId, InviteStatus.PENDING))
                .thenReturn(Arrays.asList(invWithCustomRole));
        when(customRoleRepository.findById(3)).thenReturn(Optional.of(customRole));
        when(responseMapper.toResponseModel(invWithCustomRole)).thenReturn(response);

        // Act
        List<InvitationResponseModel> result = invitationService.getPendingInvitationsForProject(testProjectId);

        // Assert
        assertThat(result.get(0).getCustomRoleName()).isEqualTo("Project Lead");
    }

    // ============ acceptInvitation Tests ============

    @Test
    void acceptInvitation_WithValidInvitation_AcceptsAndCreatesCollaborator() {
        // Arrange
        String currentUserId = "user-789";
        testInvitation.setStatus(InviteStatus.PENDING);
        testInvitation.setInviteeEmail(inviteeEmail);
        testInvitation.setInviterId(inviterUserId);

        when(invitationRepository.findById(1)).thenReturn(Optional.of(testInvitation));
        when(invitationRepository.save(any(Invitation.class))).thenReturn(testInvitation);
        when(responseMapper.toResponseModel(any(Invitation.class))).thenReturn(testResponse);

        // Act
        InvitationResponseModel result = invitationService.acceptInvitation(1, currentUserId, inviteeEmail);

        // Assert
        assertThat(result).isNotNull();
        verify(collaboratorService).addCollaborator(any(CollaboratorRequestModel.class), eq(inviterUserId));
        verify(invitationRepository).save(any(Invitation.class));
    }

    @Test
    void acceptInvitation_SetsStatusToAccepted() {
        // Arrange
        String currentUserId = "user-789";
        testInvitation.setStatus(InviteStatus.PENDING);
        testInvitation.setInviteeEmail(inviteeEmail);

        when(invitationRepository.findById(1)).thenReturn(Optional.of(testInvitation));
        when(invitationRepository.save(any(Invitation.class))).thenReturn(testInvitation);
        when(responseMapper.toResponseModel(any(Invitation.class))).thenReturn(testResponse);

        // Act
        invitationService.acceptInvitation(1, currentUserId, inviteeEmail);

        // Assert
        ArgumentCaptor<Invitation> captor = ArgumentCaptor.forClass(Invitation.class);
        verify(invitationRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(InviteStatus.ACCEPTED);
    }

    @Test
    void acceptInvitation_CreatesCollaboratorWithCorrectData() {
        // Arrange
        String currentUserId = "user-789";
        testInvitation.setStatus(InviteStatus.PENDING);
        testInvitation.setInviteeEmail(inviteeEmail);
        testInvitation.setInviterId(inviterUserId);
        testInvitation.setRole(CollaboratorRole.DEVELOPER);
        testInvitation.setCustomRoleId(3);
        testInvitation.setPermissions(Set.of(ProjectPermission.DEPLOY));

        when(invitationRepository.findById(1)).thenReturn(Optional.of(testInvitation));
        when(invitationRepository.save(any(Invitation.class))).thenReturn(testInvitation);
        when(responseMapper.toResponseModel(any(Invitation.class))).thenReturn(testResponse);

        // Act
        invitationService.acceptInvitation(1, currentUserId, inviteeEmail);

        // Assert
        ArgumentCaptor<CollaboratorRequestModel> captor = ArgumentCaptor.forClass(CollaboratorRequestModel.class);
        verify(collaboratorService).addCollaborator(captor.capture(), eq(inviterUserId));
        
        CollaboratorRequestModel collab = captor.getValue();
        assertThat(collab.getProjectId()).isEqualTo(testProjectId);
        assertThat(collab.getUserId()).isEqualTo(currentUserId);
        assertThat(collab.getRole()).isEqualTo(CollaboratorRole.DEVELOPER);
        assertThat(collab.getCustomRoleId()).isEqualTo(3);
        assertThat(collab.getPermissions()).containsExactly(ProjectPermission.DEPLOY);
    }

    @Test
    void acceptInvitation_WhenNotFound_ThrowsException() {
        // Arrange
        when(invitationRepository.findById(1)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> invitationService.acceptInvitation(1, "user", inviteeEmail))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invitation not found");
    }

    @Test
    void acceptInvitation_WhenNotPending_ThrowsException() {
        // Arrange
        testInvitation.setStatus(InviteStatus.ACCEPTED);
        testInvitation.setInviteeEmail(inviteeEmail);

        when(invitationRepository.findById(1)).thenReturn(Optional.of(testInvitation));

        // Act & Assert
        assertThatThrownBy(() -> invitationService.acceptInvitation(1, "user", inviteeEmail))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Invitation is not pending");
    }

    @Test
    void acceptInvitation_WhenEmailMismatch_ThrowsSecurityException() {
        // Arrange
        testInvitation.setStatus(InviteStatus.PENDING);
        testInvitation.setInviteeEmail("other@example.com");

        when(invitationRepository.findById(1)).thenReturn(Optional.of(testInvitation));

        // Act & Assert
        assertThatThrownBy(() -> invitationService.acceptInvitation(1, "user", inviteeEmail))
                .isInstanceOf(SecurityException.class)
                .hasMessage("Authenticated user does not match invitee email");
    }

    // ============ rejectInvitation Tests ============

    @Test
    void rejectInvitation_WithValidInvitation_SetsStatusToRefused() {
        // Arrange
        testInvitation.setStatus(InviteStatus.PENDING);
        testInvitation.setInviteeEmail(inviteeEmail);

        when(invitationRepository.findById(1)).thenReturn(Optional.of(testInvitation));
        when(invitationRepository.save(any(Invitation.class))).thenReturn(testInvitation);
        when(responseMapper.toResponseModel(any(Invitation.class))).thenReturn(testResponse);

        // Act
        InvitationResponseModel result = invitationService.rejectInvitation(1, inviteeEmail);

        // Assert
        assertThat(result).isNotNull();
        ArgumentCaptor<Invitation> captor = ArgumentCaptor.forClass(Invitation.class);
        verify(invitationRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(InviteStatus.REFUSED);
    }

    @Test
    void rejectInvitation_UpdatesUpdatedAt() {
        // Arrange
        testInvitation.setStatus(InviteStatus.PENDING);
        testInvitation.setInviteeEmail(inviteeEmail);
        testInvitation.setUpdatedAt(Instant.now().minusSeconds(100));

        when(invitationRepository.findById(1)).thenReturn(Optional.of(testInvitation));
        when(invitationRepository.save(any(Invitation.class))).thenReturn(testInvitation);
        when(responseMapper.toResponseModel(any(Invitation.class))).thenReturn(testResponse);

        // Act
        invitationService.rejectInvitation(1, inviteeEmail);

        // Assert
        ArgumentCaptor<Invitation> captor = ArgumentCaptor.forClass(Invitation.class);
        verify(invitationRepository).save(captor.capture());
        assertThat(captor.getValue().getUpdatedAt()).isNotNull();
    }

    @Test
    void rejectInvitation_WhenNotFound_ThrowsException() {
        // Arrange
        when(invitationRepository.findById(1)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> invitationService.rejectInvitation(1, inviteeEmail))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invitation not found");
    }

    @Test
    void rejectInvitation_WhenNotPending_ThrowsException() {
        // Arrange
        testInvitation.setStatus(InviteStatus.REFUSED);
        testInvitation.setInviteeEmail(inviteeEmail);

        when(invitationRepository.findById(1)).thenReturn(Optional.of(testInvitation));

        // Act & Assert
        assertThatThrownBy(() -> invitationService.rejectInvitation(1, inviteeEmail))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Invitation is not pending");
    }

    @Test
    void rejectInvitation_WhenEmailMismatch_ThrowsSecurityException() {
        // Arrange
        testInvitation.setStatus(InviteStatus.PENDING);
        testInvitation.setInviteeEmail("other@example.com");

        when(invitationRepository.findById(1)).thenReturn(Optional.of(testInvitation));

        // Act & Assert
        assertThatThrownBy(() -> invitationService.rejectInvitation(1, inviteeEmail))
                .isInstanceOf(SecurityException.class)
                .hasMessage("Authenticated user does not match invitee email");
    }

    // ============ cancelInvitation Tests ============

    @Test
    void cancelInvitation_WithValidRequester_SetsStatusToExpired() {
        // Arrange
        testInvitation.setInviterId(inviterUserId);

        when(invitationRepository.findById(1)).thenReturn(Optional.of(testInvitation));
        when(invitationRepository.save(any(Invitation.class))).thenReturn(testInvitation);

        // Act
        invitationService.cancelInvitation(1, inviterUserId);

        // Assert
        ArgumentCaptor<Invitation> captor = ArgumentCaptor.forClass(Invitation.class);
        verify(invitationRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(InviteStatus.EXPIRED);
    }

    @Test
    void cancelInvitation_UpdatesUpdatedAt() {
        // Arrange
        testInvitation.setInviterId(inviterUserId);

        when(invitationRepository.findById(1)).thenReturn(Optional.of(testInvitation));
        when(invitationRepository.save(any(Invitation.class))).thenReturn(testInvitation);

        // Act
        invitationService.cancelInvitation(1, inviterUserId);

        // Assert
        ArgumentCaptor<Invitation> captor = ArgumentCaptor.forClass(Invitation.class);
        verify(invitationRepository).save(captor.capture());
        assertThat(captor.getValue().getUpdatedAt()).isNotNull();
    }

    @Test
    void cancelInvitation_WhenNotFound_ThrowsException() {
        // Arrange
        when(invitationRepository.findById(1)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> invitationService.cancelInvitation(1, inviterUserId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invitation not found");
    }

    @Test
    void cancelInvitation_WhenRequesterNotInviter_ThrowsSecurityException() {
        // Arrange
        testInvitation.setInviterId("different-user");

        when(invitationRepository.findById(1)).thenReturn(Optional.of(testInvitation));

        // Act & Assert
        assertThatThrownBy(() -> invitationService.cancelInvitation(1, inviterUserId))
                .isInstanceOf(SecurityException.class)
                .hasMessage("Only inviter can cancel the invitation");
    }
}
