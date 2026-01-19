package com.kleff.projectmanagementservice.buisnesslayer.customrole;

import com.kleff.projectmanagementservice.datalayer.collaborator.ProjectPermission;
import com.kleff.projectmanagementservice.datalayer.customrole.CustomRole;
import com.kleff.projectmanagementservice.datalayer.customrole.CustomRoleRepository;
import com.kleff.projectmanagementservice.mappinglayer.customrole.CustomRoleRequestMapper;
import com.kleff.projectmanagementservice.mappinglayer.customrole.CustomRoleResponseMapper;
import com.kleff.projectmanagementservice.presentationlayer.customrole.CustomRoleRequestModel;
import com.kleff.projectmanagementservice.presentationlayer.customrole.CustomRoleResponseModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomRoleServiceImplTest {

    @Mock
    private CustomRoleRepository customRoleRepository;

    @Mock
    private CustomRoleRequestMapper requestMapper;

    @Mock
    private CustomRoleResponseMapper responseMapper;

    @InjectMocks
    private CustomRoleServiceImpl customRoleService;

    private String testProjectId;
    private String createdBy;
    private CustomRoleRequestModel testRequest;
    private CustomRole testCustomRole;
    private CustomRoleResponseModel testResponse;

    @BeforeEach
    void setUp() {
        testProjectId = "project-123";
        createdBy = "admin-456";

        testRequest = CustomRoleRequestModel.builder()
                .projectId(testProjectId)
                .name("Custom Developer")
                .description("Custom developer role")
                .permissions(Set.of(ProjectPermission.READ_PROJECT, ProjectPermission.DEPLOY))
                .build();

        testCustomRole = new CustomRole();
        testCustomRole.setId(1);
        testCustomRole.setProjectId(testProjectId);
        testCustomRole.setName("Custom Developer");
        testCustomRole.setDescription("Custom developer role");
        testCustomRole.setPermissions(Set.of(ProjectPermission.READ_PROJECT, ProjectPermission.DEPLOY));

        testResponse = CustomRoleResponseModel.builder()
                .id(1)
                .projectId(testProjectId)
                .name("Custom Developer")
                .description("Custom developer role")
                .permissions(Set.of(ProjectPermission.READ_PROJECT, ProjectPermission.DEPLOY))
                .build();
    }

    // ============ createCustomRole Tests ============

    @Test
    void createCustomRole_WithValidRequest_CreatesAndReturnsRole() {
        // Arrange
        when(customRoleRepository.existsByProjectIdAndName(testProjectId, "Custom Developer"))
                .thenReturn(false);
        when(requestMapper.requestToEntity(testRequest)).thenReturn(testCustomRole);
        when(customRoleRepository.save(any(CustomRole.class))).thenReturn(testCustomRole);
        when(responseMapper.toResponseModel(testCustomRole)).thenReturn(testResponse);

        // Act
        CustomRoleResponseModel result = customRoleService.createCustomRole(testRequest, createdBy);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Custom Developer");
        verify(customRoleRepository).save(any(CustomRole.class));
    }

    @Test
    void createCustomRole_SetsCreatedBy() {
        // Arrange
        when(customRoleRepository.existsByProjectIdAndName(testProjectId, "Custom Developer"))
                .thenReturn(false);
        when(requestMapper.requestToEntity(testRequest)).thenReturn(testCustomRole);
        when(customRoleRepository.save(any(CustomRole.class))).thenReturn(testCustomRole);
        when(responseMapper.toResponseModel(any(CustomRole.class))).thenReturn(testResponse);

        // Act
        customRoleService.createCustomRole(testRequest, createdBy);

        // Assert
        ArgumentCaptor<CustomRole> captor = ArgumentCaptor.forClass(CustomRole.class);
        verify(customRoleRepository).save(captor.capture());
        assertThat(captor.getValue().getCreatedBy()).isEqualTo(createdBy);
    }

    @Test
    void createCustomRole_WhenNameExists_ThrowsException() {
        // Arrange
        when(customRoleRepository.existsByProjectIdAndName(testProjectId, "Custom Developer"))
                .thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> customRoleService.createCustomRole(testRequest, createdBy))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("A custom role with this name already exists for this project");

        verify(customRoleRepository, never()).save(any());
    }

    @Test
    void createCustomRole_ChecksNameExistenceForCorrectProject() {
        // Arrange
        when(customRoleRepository.existsByProjectIdAndName(testProjectId, "Custom Developer"))
                .thenReturn(false);
        when(requestMapper.requestToEntity(testRequest)).thenReturn(testCustomRole);
        when(customRoleRepository.save(any(CustomRole.class))).thenReturn(testCustomRole);
        when(responseMapper.toResponseModel(any(CustomRole.class))).thenReturn(testResponse);

        // Act
        customRoleService.createCustomRole(testRequest, createdBy);

        // Assert
        verify(customRoleRepository).existsByProjectIdAndName(testProjectId, "Custom Developer");
    }

    // ============ getProjectCustomRoles Tests ============

    @Test
    void getProjectCustomRoles_ReturnsListOfRoles() {
        // Arrange
        CustomRole role1 = new CustomRole();
        role1.setId(1);
        role1.setName("Role 1");

        CustomRole role2 = new CustomRole();
        role2.setId(2);
        role2.setName("Role 2");

        List<CustomRole> roles = Arrays.asList(role1, role2);

        CustomRoleResponseModel response1 = CustomRoleResponseModel.builder()
                .id(1).name("Role 1").build();
        CustomRoleResponseModel response2 = CustomRoleResponseModel.builder()
                .id(2).name("Role 2").build();

        when(customRoleRepository.findByProjectId(testProjectId)).thenReturn(roles);
        when(responseMapper.entityListToResponseList(roles))
                .thenReturn(Arrays.asList(response1, response2));

        // Act
        List<CustomRoleResponseModel> result = customRoleService.getProjectCustomRoles(testProjectId);

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Role 1");
        assertThat(result.get(1).getName()).isEqualTo("Role 2");
        verify(customRoleRepository).findByProjectId(testProjectId);
    }

    @Test
    void getProjectCustomRoles_WithEmptyList_ReturnsEmptyList() {
        // Arrange
        when(customRoleRepository.findByProjectId(testProjectId)).thenReturn(Arrays.asList());
        when(responseMapper.entityListToResponseList(any())).thenReturn(Arrays.asList());

        // Act
        List<CustomRoleResponseModel> result = customRoleService.getProjectCustomRoles(testProjectId);

        // Assert
        assertThat(result).isEmpty();
    }

    // ============ updateCustomRole Tests ============

    @Test
    void updateCustomRole_WithValidData_UpdatesAllFields() {
        // Arrange
        CustomRoleRequestModel updateRequest = CustomRoleRequestModel.builder()
                .name("Updated Role")
                .description("Updated description")
                .permissions(Set.of(ProjectPermission.WRITE_PROJECT))
                .build();

        when(customRoleRepository.findById(1)).thenReturn(Optional.of(testCustomRole));
        when(customRoleRepository.save(any(CustomRole.class))).thenReturn(testCustomRole);
        when(responseMapper.toResponseModel(any(CustomRole.class))).thenReturn(testResponse);

        // Act
        CustomRoleResponseModel result = customRoleService.updateCustomRole(1, updateRequest);

        // Assert
        assertThat(result).isNotNull();
        ArgumentCaptor<CustomRole> captor = ArgumentCaptor.forClass(CustomRole.class);
        verify(customRoleRepository).save(captor.capture());
        
        CustomRole saved = captor.getValue();
        assertThat(saved.getName()).isEqualTo("Updated Role");
        assertThat(saved.getDescription()).isEqualTo("Updated description");
        assertThat(saved.getPermissions()).containsExactly(ProjectPermission.WRITE_PROJECT);
    }

    @Test
    void updateCustomRole_WhenNotFound_ThrowsException() {
        // Arrange
        CustomRoleRequestModel updateRequest = CustomRoleRequestModel.builder()
                .name("Updated Role")
                .build();

        when(customRoleRepository.findById(1)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> customRoleService.updateCustomRole(1, updateRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Custom role not found");

        verify(customRoleRepository, never()).save(any());
    }

    @Test
    void updateCustomRole_UpdatesName() {
        // Arrange
        CustomRoleRequestModel updateRequest = CustomRoleRequestModel.builder()
                .name("New Name")
                .description("desc")
                .permissions(Set.of(ProjectPermission.READ_PROJECT))
                .build();

        when(customRoleRepository.findById(1)).thenReturn(Optional.of(testCustomRole));
        when(customRoleRepository.save(any(CustomRole.class))).thenReturn(testCustomRole);
        when(responseMapper.toResponseModel(any(CustomRole.class))).thenReturn(testResponse);

        // Act
        customRoleService.updateCustomRole(1, updateRequest);

        // Assert
        ArgumentCaptor<CustomRole> captor = ArgumentCaptor.forClass(CustomRole.class);
        verify(customRoleRepository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("New Name");
    }

    @Test
    void updateCustomRole_UpdatesDescription() {
        // Arrange
        CustomRoleRequestModel updateRequest = CustomRoleRequestModel.builder()
                .name("name")
                .description("New Description")
                .permissions(Set.of(ProjectPermission.READ_PROJECT))
                .build();

        when(customRoleRepository.findById(1)).thenReturn(Optional.of(testCustomRole));
        when(customRoleRepository.save(any(CustomRole.class))).thenReturn(testCustomRole);
        when(responseMapper.toResponseModel(any(CustomRole.class))).thenReturn(testResponse);

        // Act
        customRoleService.updateCustomRole(1, updateRequest);

        // Assert
        ArgumentCaptor<CustomRole> captor = ArgumentCaptor.forClass(CustomRole.class);
        verify(customRoleRepository).save(captor.capture());
        assertThat(captor.getValue().getDescription()).isEqualTo("New Description");
    }

    @Test
    void updateCustomRole_UpdatesPermissions() {
        // Arrange
        CustomRoleRequestModel updateRequest = CustomRoleRequestModel.builder()
                .name("name")
                .description("desc")
                .permissions(Set.of(ProjectPermission.READ_PROJECT, ProjectPermission.DEPLOY))
                .build();

        when(customRoleRepository.findById(1)).thenReturn(Optional.of(testCustomRole));
        when(customRoleRepository.save(any(CustomRole.class))).thenReturn(testCustomRole);
        when(responseMapper.toResponseModel(any(CustomRole.class))).thenReturn(testResponse);

        // Act
        customRoleService.updateCustomRole(1, updateRequest);

        // Assert
        ArgumentCaptor<CustomRole> captor = ArgumentCaptor.forClass(CustomRole.class);
        verify(customRoleRepository).save(captor.capture());
        assertThat(captor.getValue().getPermissions()).containsExactlyInAnyOrder(ProjectPermission.READ_PROJECT, ProjectPermission.DEPLOY);
    }

    // ============ deleteCustomRole Tests ============

    @Test
    void deleteCustomRole_CallsRepositoryDeleteById() {
        // Act
        customRoleService.deleteCustomRole(1);

        // Assert
        verify(customRoleRepository).deleteById(1);
    }

    @Test
    void deleteCustomRole_WithDifferentId_DeletesCorrectRole() {
        // Act
        customRoleService.deleteCustomRole(99);

        // Assert
        verify(customRoleRepository).deleteById(99);
    }
}
