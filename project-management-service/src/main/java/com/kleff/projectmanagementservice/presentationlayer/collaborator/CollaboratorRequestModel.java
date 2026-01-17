package com.kleff.projectmanagementservice.presentationlayer.collaborator;

import com.kleff.projectmanagementservice.datalayer.collaborator.CollaboratorRole;
import com.kleff.projectmanagementservice.datalayer.collaborator.ProjectPermission;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollaboratorRequestModel {

    @NotNull
    private String projectId;

    @NotNull
    private String userId;

    @NotNull
    private CollaboratorRole role;

    // Optional explicit permissions to override role defaults
    private Set<ProjectPermission> permissions;
}