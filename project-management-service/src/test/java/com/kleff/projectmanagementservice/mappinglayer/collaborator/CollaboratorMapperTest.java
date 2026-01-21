package com.kleff.projectmanagementservice.mappinglayer.collaborator;

import com.kleff.projectmanagementservice.datalayer.collaborator.Collaborator;
import com.kleff.projectmanagementservice.datalayer.collaborator.CollaboratorRole;
import com.kleff.projectmanagementservice.datalayer.collaborator.CollaboratorStatus;
import com.kleff.projectmanagementservice.datalayer.collaborator.ProjectPermission;
import com.kleff.projectmanagementservice.presentationlayer.collaborator.CollaboratorRequestModel;
import com.kleff.projectmanagementservice.presentationlayer.collaborator.CollaboratorResponseModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class CollaboratorMapperTest {

    private CollaboratorRequestMapper requestMapper;
    private CollaboratorResponseMapper responseMapper;

    @BeforeEach
    void setUp() {
        requestMapper = Mappers.getMapper(CollaboratorRequestMapper.class);
        responseMapper = Mappers.getMapper(CollaboratorResponseMapper.class);
    }

    @Test
    void requestMapper_MapsAllFields() {
        // Arrange
        CollaboratorRequestModel request = CollaboratorRequestModel.builder()
                .projectId("project-123")
                .userId("user-456")
                .role(CollaboratorRole.DEVELOPER)
                .customRoleId(5)
                .permissions(Set.of(ProjectPermission.READ_PROJECT, ProjectPermission.DEPLOY))
                .build();

        // Act
        Collaborator result = requestMapper.requestToEntity(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getProjectId()).isEqualTo("project-123");
        assertThat(result.getUserId()).isEqualTo("user-456");
        assertThat(result.getRole()).isEqualTo(CollaboratorRole.DEVELOPER);
        assertThat(result.getCustomRoleId()).isEqualTo(5);
        assertThat(result.getPermissions()).containsExactlyInAnyOrder(
                ProjectPermission.READ_PROJECT, ProjectPermission.DEPLOY);
    }

    @Test
    void requestMapper_IgnoresGeneratedFields() {
        // Arrange
        CollaboratorRequestModel request = CollaboratorRequestModel.builder()
                .projectId("project-123")
                .userId("user-456")
                .role(CollaboratorRole.ADMIN)
                .build();

        // Act
        Collaborator result = requestMapper.requestToEntity(request);

        // Assert
        assertThat(result.getId()).isNull();
        assertThat(result.getCollaboratorStatus()).isNull();
        assertThat(result.getInvitedBy()).isNull();
        assertThat(result.getInvitedAt()).isNull();
        assertThat(result.getAcceptedAt()).isNull();
    }

    @Test
    void responseMapper_MapsAllFields() {
        // Arrange
        Date now = new Date();
        Instant instant = Instant.now();
        
        Collaborator collaborator = new Collaborator();
        collaborator.setId(1);
        collaborator.setProjectId("project-123");
        collaborator.setUserId("user-456");
        collaborator.setRole(CollaboratorRole.ADMIN);
        collaborator.setCustomRoleId(3);
        collaborator.setCollaboratorStatus(CollaboratorStatus.ACCEPTED);
        collaborator.setPermissions(Set.of(ProjectPermission.MANAGE_COLLABORATORS));
        collaborator.setInvitedBy("admin-789");
        collaborator.setInvitedAt(now);
        collaborator.setAcceptedAt(now);
        collaborator.setCreatedAt(now);
        collaborator.setUpdatedAt(now);

        // Act
        CollaboratorResponseModel result = responseMapper.toResponseModel(collaborator);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1);
        assertThat(result.getProjectId()).isEqualTo("project-123");
        assertThat(result.getUserId()).isEqualTo("user-456");
        assertThat(result.getRole()).isEqualTo(CollaboratorRole.ADMIN);
        assertThat(result.getCustomRoleId()).isEqualTo(3);
        assertThat(result.getStatus()).isEqualTo(CollaboratorStatus.ACCEPTED);
        assertThat(result.getPermissions()).containsExactly(ProjectPermission.MANAGE_COLLABORATORS);
        assertThat(result.getInvitedBy()).isEqualTo("admin-789");
        assertThat(result.getInvitedAt()).isEqualTo(now);
        assertThat(result.getAcceptedAt()).isEqualTo(now);
        assertThat(result.getCreatedAt()).isNotNull();
        assertThat(result.getUpdatedAt()).isNotNull();
    }

    @Test
    void responseMapper_MapsListCorrectly() {
        // Arrange
        Collaborator collab1 = new Collaborator();
        collab1.setId(1);
        collab1.setUserId("user-1");
        collab1.setProjectId("project-1");

        Collaborator collab2 = new Collaborator();
        collab2.setId(2);
        collab2.setUserId("user-2");
        collab2.setProjectId("project-1");

        List<Collaborator> collaborators = Arrays.asList(collab1, collab2);

        // Act
        List<CollaboratorResponseModel> result = responseMapper.entityListToResponseList(collaborators);

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(1);
        assertThat(result.get(0).getUserId()).isEqualTo("user-1");
        assertThat(result.get(1).getId()).isEqualTo(2);
        assertThat(result.get(1).getUserId()).isEqualTo("user-2");
    }

    @Test
    void responseMapper_HandlesNullPermissions() {
        // Arrange
        Collaborator collaborator = new Collaborator();
        collaborator.setId(1);
        collaborator.setUserId("user-1");
        collaborator.setPermissions(null);

        // Act
        CollaboratorResponseModel result = responseMapper.toResponseModel(collaborator);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getPermissions()).isNull();
    }

    @Test
    void responseMapper_HandlesEmptyList() {
        // Act
        List<CollaboratorResponseModel> result = responseMapper.entityListToResponseList(Arrays.asList());

        // Assert
        assertThat(result).isEmpty();
    }
}
