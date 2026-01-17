package com.kleff.projectmanagementservice.presentationlayer.invitation;

import com.kleff.projectmanagementservice.datalayer.collaborator.CollaboratorRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationRequestModel {
    @NotNull
    private String projectId;

    /**
     * Prefer inviteeId (authentik UUID). If you accept emails, use inviteeEmail instead.
     */
    private String inviteeId;

    @Pattern(regexp = "^$|^\\S+@\\S+\\.\\S+$", message = "must be a valid email or empty")
    private String inviteeEmail;

    @NotNull
    private CollaboratorRole role;

    private String note;
}
