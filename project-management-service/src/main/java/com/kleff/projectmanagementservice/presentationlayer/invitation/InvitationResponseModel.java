package com.kleff.projectmanagementservice.presentationlayer.invitation;

import com.kleff.projectmanagementservice.datalayer.collaborator.CollaboratorRole;
import com.kleff.projectmanagementservice.datalayer.invitation.InviteStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationResponseModel {
    private Integer id;
    private String projectId;
    private String inviterId;
    private String inviteeEmail;
    private String inviteeId;
    private CollaboratorRole role;
    private InviteStatus status;
    private Instant expiresAt;
    private Instant createdAt;
    private Instant updatedAt;
    private String note;
}
