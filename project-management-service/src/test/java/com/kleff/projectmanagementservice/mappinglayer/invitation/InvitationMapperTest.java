package com.kleff.projectmanagementservice.mappinglayer.invitation;

import com.kleff.projectmanagementservice.datalayer.collaborator.CollaboratorRole;
import com.kleff.projectmanagementservice.datalayer.collaborator.ProjectPermission;
import com.kleff.projectmanagementservice.datalayer.invitation.InviteStatus;
import com.kleff.projectmanagementservice.datalayer.invitation.Invitation;
import com.kleff.projectmanagementservice.presentationlayer.invitation.InvitationRequestModel;
import com.kleff.projectmanagementservice.presentationlayer.invitation.InvitationResponseModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class InvitationMapperTest {

    private InvitationRequestMapper requestMapper;
    private InvitationResponseMapper responseMapper;

    @BeforeEach
    void setUp() {
        requestMapper = Mappers.getMapper(InvitationRequestMapper.class);
        responseMapper = Mappers.getMapper(InvitationResponseMapper.class);
    }

    @Test
    void requestMapper_MapsAllFields() {
        // Arrange
        InvitationRequestModel request = InvitationRequestModel.builder()
                .projectId("project-123")
                .inviteeEmail("user@example.com")
                .role(CollaboratorRole.DEVELOPER)
                .customRoleId(5)
                .permissions(Set.of(ProjectPermission.READ_PROJECT, ProjectPermission.DEPLOY))
                .build();

        // Act
        Invitation result = requestMapper.requestToEntity(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getProjectId()).isEqualTo("project-123");
        assertThat(result.getInviteeEmail()).isEqualTo("user@example.com");
        assertThat(result.getRole()).isEqualTo(CollaboratorRole.DEVELOPER);
        assertThat(result.getCustomRoleId()).isEqualTo(5);
        assertThat(result.getPermissions()).containsExactlyInAnyOrder(
                ProjectPermission.READ_PROJECT, ProjectPermission.DEPLOY);
    }

    @Test
    void requestMapper_HandlesNullCustomRoleId() {
        // Arrange
        InvitationRequestModel request = InvitationRequestModel.builder()
                .projectId("project-123")
                .inviteeEmail("user@example.com")
                .role(CollaboratorRole.ADMIN)
                .customRoleId(null)
                .permissions(Set.of(ProjectPermission.MANAGE_COLLABORATORS))
                .build();

        // Act
        Invitation result = requestMapper.requestToEntity(request);

        // Assert
        assertThat(result.getCustomRoleId()).isNull();
    }

    @Test
    void requestMapper_HandlesNullPermissions() {
        // Arrange
        InvitationRequestModel request = InvitationRequestModel.builder()
                .projectId("project-123")
                .inviteeEmail("user@example.com")
                .role(CollaboratorRole.VIEWER)
                .permissions(null)
                .build();

        // Act
        Invitation result = requestMapper.requestToEntity(request);

        // Assert
        assertThat(result.getPermissions()).isNull();
    }

    @Test
    void responseMapper_MapsAllFields() {
        // Arrange
        Instant now = Instant.now();
        
        Invitation invitation = new Invitation();
        invitation.setId(10);
        invitation.setProjectId("project-123");
        invitation.setInviterId("inviter-456");
        invitation.setInviteeEmail("invitee@example.com");
        invitation.setRole(CollaboratorRole.DEVELOPER);
        invitation.setCustomRoleId(7);
        invitation.setStatus(InviteStatus.PENDING);
        invitation.setExpiresAt(now.plusSeconds(86400));
        invitation.setCreatedAt(now);
        invitation.setUpdatedAt(now);

        // Act
        InvitationResponseModel result = responseMapper.toResponseModel(invitation);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(10);
        assertThat(result.getProjectId()).isEqualTo("project-123");
        assertThat(result.getInviterId()).isEqualTo("inviter-456");
        assertThat(result.getInviteeEmail()).isEqualTo("invitee@example.com");
        assertThat(result.getRole()).isEqualTo(CollaboratorRole.DEVELOPER);
        assertThat(result.getCustomRoleId()).isEqualTo(7);
        assertThat(result.getStatus()).isEqualTo(InviteStatus.PENDING);
        assertThat(result.getExpiresAt()).isEqualTo(now.plusSeconds(86400));
        assertThat(result.getCreatedAt()).isEqualTo(now);
        assertThat(result.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    void responseMapper_HandlesAcceptedStatus() {
        // Arrange
        Invitation invitation = new Invitation();
        invitation.setId(1);
        invitation.setStatus(InviteStatus.ACCEPTED);
        invitation.setInviteeEmail("user@example.com");

        // Act
        InvitationResponseModel result = responseMapper.toResponseModel(invitation);

        // Assert
        assertThat(result.getStatus()).isEqualTo(InviteStatus.ACCEPTED);
    }

    @Test
    void responseMapper_HandlesRefusedStatus() {
        // Arrange
        Invitation invitation = new Invitation();
        invitation.setId(1);
        invitation.setStatus(InviteStatus.REFUSED);
        invitation.setInviteeEmail("user@example.com");

        // Act
        InvitationResponseModel result = responseMapper.toResponseModel(invitation);

        // Assert
        assertThat(result.getStatus()).isEqualTo(InviteStatus.REFUSED);
    }

    @Test
    void responseMapper_HandlesExpiredStatus() {
        // Arrange
        Invitation invitation = new Invitation();
        invitation.setId(1);
        invitation.setStatus(InviteStatus.EXPIRED);
        invitation.setInviteeEmail("user@example.com");

        // Act
        InvitationResponseModel result = responseMapper.toResponseModel(invitation);

        // Assert
        assertThat(result.getStatus()).isEqualTo(InviteStatus.EXPIRED);
    }

    @Test
    void responseMapper_MapsListCorrectly() {
        // Arrange
        Invitation inv1 = new Invitation();
        inv1.setId(1);
        inv1.setInviteeEmail("user1@example.com");
        inv1.setProjectId("project-1");

        Invitation inv2 = new Invitation();
        inv2.setId(2);
        inv2.setInviteeEmail("user2@example.com");
        inv2.setProjectId("project-1");

        List<Invitation> invitations = Arrays.asList(inv1, inv2);

        // Act
        List<InvitationResponseModel> result = responseMapper.entityListToResponseList(invitations);

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(1);
        assertThat(result.get(0).getInviteeEmail()).isEqualTo("user1@example.com");
        assertThat(result.get(1).getId()).isEqualTo(2);
        assertThat(result.get(1).getInviteeEmail()).isEqualTo("user2@example.com");
    }

    @Test
    void responseMapper_HandlesEmptyList() {
        // Act
        List<InvitationResponseModel> result = responseMapper.entityListToResponseList(Arrays.asList());

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    void responseMapper_HandlesNullCustomRoleId() {
        // Arrange
        Invitation invitation = new Invitation();
        invitation.setId(1);
        invitation.setCustomRoleId(null);
        invitation.setInviteeEmail("user@example.com");

        // Act
        InvitationResponseModel result = responseMapper.toResponseModel(invitation);

        // Assert
        assertThat(result.getCustomRoleId()).isNull();
    }
}
