package com.kleff.projectmanagementservice.presentationlayer.collaborator;

import com.kleff.projectmanagementservice.datalayer.collaborator.CollaboratorRole;
import com.kleff.projectmanagementservice.datalayer.collaborator.CollaboratorStatus;
import com.kleff.projectmanagementservice.datalayer.collaborator.ProjectPermission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollaboratorResponseModel {

    private Integer id;
    private String projectId;
    private String userId;
    private CollaboratorRole role;
    private Integer customRoleId;
    private String customRoleName;
    private CollaboratorStatus status;
    private Set<ProjectPermission> permissions;
    private String invitedBy;
    private Date invitedAt;
    private Date acceptedAt;
    private Date createdAt;
    private Date updatedAt;
}