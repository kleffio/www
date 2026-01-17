package com.kleff.projectmanagementservice.buisnesslayer.invitation;

import com.kleff.projectmanagementservice.presentationlayer.invitation.InvitationRequestModel;
import com.kleff.projectmanagementservice.presentationlayer.invitation.InvitationResponseModel;

import java.util.List;

public interface InvitationService {
    InvitationResponseModel createInvitation(InvitationRequestModel request, String inviterId);

    List<InvitationResponseModel> getPendingInvitationsForEmail(String inviteeEmail);

    InvitationResponseModel acceptInvitation(Integer invitationId, String currentUserId, String currentUserEmail);

    void cancelInvitation(Integer invitationId, String requesterId);
}
