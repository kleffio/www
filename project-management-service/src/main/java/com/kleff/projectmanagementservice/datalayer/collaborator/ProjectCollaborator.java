package com.kleff.projectmanagementservice.datalayer.collaborator;

import com.kleff.projectmanagementservice.datalayer.project.ProjectStatus;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectCollaborator {
    @Id
    String collaboratorId;
    String projectId;
    String userId;
    CollaboratorRole role;
    ProjectPermission permissions;
    //Currently only stores as a string same for the other ids
    String invitedBy;
    Date invitedAt;
    Date acceptedAt;
}
