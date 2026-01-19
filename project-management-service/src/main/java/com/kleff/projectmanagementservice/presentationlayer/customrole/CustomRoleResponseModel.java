package com.kleff.projectmanagementservice.presentationlayer.customrole;

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
public class CustomRoleResponseModel {
    private Integer id;
    private String projectId;
    private String name;
    private String description;
    private Set<ProjectPermission> permissions;
    private String createdBy;
    private Date createdAt;
    private Date updatedAt;
}
