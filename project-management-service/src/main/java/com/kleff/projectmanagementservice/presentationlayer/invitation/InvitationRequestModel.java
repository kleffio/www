package com.kleff.projectmanagementservice.presentationlayer.invitation;

import com.kleff.projectmanagementservice.datalayer.collaborator.CollaboratorRole;
import com.kleff.projectmanagementservice.datalayer.collaborator.ProjectPermission;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationRequestModel {
    @NotNull
    private String projectId;

    private String inviteeId;

    @Pattern(regexp = "^$|^\\S+@\\S+\\.\\S+$", message = "must be a valid email or empty")
    private String inviteeEmail;

    @NotNull
    private CollaboratorRole role;

    private Integer customRoleId;

    private Set<ProjectPermission> permissions;

    private String note;
}
