package com.kleff.projectmanagementservice.presentationlayer.customrole;

import com.kleff.projectmanagementservice.datalayer.collaborator.ProjectPermission;
import jakarta.validation.constraints.NotBlank;
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
public class CustomRoleRequestModel {
    @NotNull
    private String projectId;

    @NotBlank(message = "Role name is required")
    private String name;

    private String description;

    @NotNull(message = "Permissions are required")
    private Set<ProjectPermission> permissions;
}
