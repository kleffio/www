package com.kleff.projectmanagementservice.presentationlayer.invitation;

import com.kleff.projectmanagementservice.buisnesslayer.invitation.InvitationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @PostMapping("/projects/{projectId}/invitations")
    public ResponseEntity<InvitationResponseModel> createInvitation(@PathVariable String projectId,
                                                                    @RequestBody InvitationRequestModel request,
                                                                    @AuthenticationPrincipal Jwt jwt) {
        String inviterId = jwt.getSubject();
        request.setProjectId(projectId);
        InvitationResponseModel response = invitationService.createInvitation(request, inviterId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/users/me/invitations")
    public ResponseEntity<List<InvitationResponseModel>> getPendingInvitationsForCurrentUser(@AuthenticationPrincipal Jwt jwt) {

        String currentUserEmail = jwt.getClaimAsString("email");
        List<InvitationResponseModel> invitations = invitationService.getPendingInvitationsForEmail(currentUserEmail);
        return ResponseEntity.ok(invitations);
    }

    @PostMapping("/invitations/{invitationId}/accept")
    public ResponseEntity<InvitationResponseModel> acceptInvitation(@PathVariable Integer invitationId,
                                                                    @AuthenticationPrincipal Jwt jwt) {

        String currentUserId = jwt.getSubject();
        String currentUserEmail = jwt.getClaimAsString("email");
        InvitationResponseModel response = invitationService.acceptInvitation(invitationId, currentUserId, currentUserEmail);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/invitations/{invitationId}")
    public ResponseEntity<Void> cancelInvitation(
            @PathVariable Integer invitationId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {

        String requesterId = jwt.getSubject();
        invitationService.cancelInvitation(invitationId, requesterId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
