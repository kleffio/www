package com.kleff.projectmanagementservice.mappinglayer.customrole;

import com.kleff.projectmanagementservice.datalayer.collaborator.ProjectPermission;
import com.kleff.projectmanagementservice.datalayer.customrole.CustomRole;
import com.kleff.projectmanagementservice.presentationlayer.customrole.CustomRoleRequestModel;
import com.kleff.projectmanagementservice.presentationlayer.customrole.CustomRoleResponseModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class CustomRoleMapperTest {

    private CustomRoleRequestMapper requestMapper;
    private CustomRoleResponseMapper responseMapper;

    @BeforeEach
    void setUp() {
        requestMapper = Mappers.getMapper(CustomRoleRequestMapper.class);
        responseMapper = Mappers.getMapper(CustomRoleResponseMapper.class);
    }

    @Test
    void requestMapper_MapsAllFields() {
        // Arrange
        CustomRoleRequestModel request = CustomRoleRequestModel.builder()
                .projectId("project-123")
                .name("Custom Developer")
                .description("Custom developer role")
                .permissions(Set.of(ProjectPermission.READ_PROJECT, ProjectPermission.DEPLOY))
                .build();

        // Act
        CustomRole result = requestMapper.requestToEntity(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getProjectId()).isEqualTo("project-123");
        assertThat(result.getName()).isEqualTo("Custom Developer");
        assertThat(result.getDescription()).isEqualTo("Custom developer role");
        assertThat(result.getPermissions()).containsExactlyInAnyOrder(
                ProjectPermission.READ_PROJECT, ProjectPermission.DEPLOY);
    }

    @Test
    void requestMapper_IgnoresGeneratedFields() {
        // Arrange
        CustomRoleRequestModel request = CustomRoleRequestModel.builder()
                .projectId("project-123")
                .name("Test Role")
                .build();

        // Act
        CustomRole result = requestMapper.requestToEntity(request);

        // Assert
        assertThat(result.getId()).isNull();
        assertThat(result.getCreatedBy()).isNull();
        assertThat(result.getCreatedAt()).isNull();
        assertThat(result.getUpdatedAt()).isNull();
    }

    @Test
    void requestMapper_HandlesNullDescription() {
        // Arrange
        CustomRoleRequestModel request = CustomRoleRequestModel.builder()
                .projectId("project-123")
                .name("Test Role")
                .description(null)
                .permissions(Set.of(ProjectPermission.VIEW_LOGS))
                .build();

        // Act
        CustomRole result = requestMapper.requestToEntity(request);

        // Assert
        assertThat(result.getDescription()).isNull();
    }

    @Test
    void responseMapper_MapsAllFields() {
        // Arrange
        Date now = new Date();
        
        CustomRole customRole = new CustomRole();
        customRole.setId(5);
        customRole.setProjectId("project-123");
        customRole.setName("Project Lead");
        customRole.setDescription("Lead role with full permissions");
        customRole.setPermissions(Set.of(
                ProjectPermission.READ_PROJECT,
                ProjectPermission.WRITE_PROJECT,
                ProjectPermission.MANAGE_COLLABORATORS
        ));
        customRole.setCreatedBy("admin-456");
        customRole.setCreatedAt(now);
        customRole.setUpdatedAt(now);

        // Act
        CustomRoleResponseModel result = responseMapper.toResponseModel(customRole);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(5);
        assertThat(result.getProjectId()).isEqualTo("project-123");
        assertThat(result.getName()).isEqualTo("Project Lead");
        assertThat(result.getDescription()).isEqualTo("Lead role with full permissions");
        assertThat(result.getPermissions()).containsExactlyInAnyOrder(
                ProjectPermission.READ_PROJECT,
                ProjectPermission.WRITE_PROJECT,
                ProjectPermission.MANAGE_COLLABORATORS
        );
        assertThat(result.getCreatedBy()).isEqualTo("admin-456");
        assertThat(result.getCreatedAt()).isNotNull();
        assertThat(result.getUpdatedAt()).isNotNull();
    }

    @Test
    void responseMapper_MapsListCorrectly() {
        // Arrange
        CustomRole role1 = new CustomRole();
        role1.setId(1);
        role1.setName("Role 1");
        role1.setProjectId("project-1");

        CustomRole role2 = new CustomRole();
        role2.setId(2);
        role2.setName("Role 2");
        role2.setProjectId("project-1");

        List<CustomRole> roles = Arrays.asList(role1, role2);

        // Act
        List<CustomRoleResponseModel> result = responseMapper.entityListToResponseList(roles);

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(1);
        assertThat(result.get(0).getName()).isEqualTo("Role 1");
        assertThat(result.get(1).getId()).isEqualTo(2);
        assertThat(result.get(1).getName()).isEqualTo("Role 2");
    }

    @Test
    void responseMapper_HandlesEmptyList() {
        // Act
        List<CustomRoleResponseModel> result = responseMapper.entityListToResponseList(Arrays.asList());

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    void responseMapper_HandlesNullPermissions() {
        // Arrange
        CustomRole customRole = new CustomRole();
        customRole.setId(1);
        customRole.setName("Test Role");
        customRole.setPermissions(null);

        // Act
        CustomRoleResponseModel result = responseMapper.toResponseModel(customRole);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getPermissions()).isNull();
    }
}
