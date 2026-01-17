package com.kleff.projectmanagementservice.buisnesslayer.invitation;

import com.kleff.projectmanagementservice.buisnesslayer.collaborator.CollaboratorService;
import com.kleff.projectmanagementservice.datalayer.invitation.Invitation;
import com.kleff.projectmanagementservice.datalayer.invitation.InvitationRepository;
import com.kleff.projectmanagementservice.datalayer.invitation.InviteStatus;
import com.kleff.projectmanagementservice.mappinglayer.invitation.InvitationRequestMapper;
import com.kleff.projectmanagementservice.mappinglayer.invitation.InvitationResponseMapper;
import com.kleff.projectmanagementservice.presentationlayer.collaborator.CollaboratorRequestModel;
import com.kleff.projectmanagementservice.presentationlayer.invitation.InvitationRequestModel;
import com.kleff.projectmanagementservice.presentationlayer.invitation.InvitationResponseModel;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvitationServiceImpl implements InvitationService {

    private final InvitationRepository invitationRepository;
    private final CollaboratorService collaboratorService;
    private final InvitationRequestMapper requestMapper;
    private final InvitationResponseMapper responseMapper;

    public InvitationServiceImpl(InvitationRepository invitationRepository,
                                 CollaboratorService collaboratorService,
                                 InvitationRequestMapper requestMapper,
                                 InvitationResponseMapper responseMapper) {
        this.invitationRepository = invitationRepository;
        this.collaboratorService = collaboratorService;
        this.requestMapper = requestMapper;
        this.responseMapper = responseMapper;
    }

    @Override
    public InvitationResponseModel createInvitation(InvitationRequestModel request, String inviterId) {
        if ((request.getInviteeEmail() == null || request.getInviteeEmail().isBlank())) {
            throw new IllegalArgumentException("inviteeEmail is required");
        }

        Invitation entity = requestMapper.requestToEntity(request);
        entity.setInviterId(inviterId);
        entity.setStatus(InviteStatus.PENDING);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());

        Invitation saved = invitationRepository.save(entity);
        return responseMapper.toResponseModel(saved);
    }

    @Override
    public List<InvitationResponseModel> getPendingInvitationsForEmail(String inviteeEmail) {
        return invitationRepository.findByInviteeEmailAndStatus(inviteeEmail, InviteStatus.PENDING)
                .stream()
                .map(responseMapper::toResponseModel)
                .collect(Collectors.toList());
    }

    @Override
    public InvitationResponseModel acceptInvitation(Integer invitationId, String currentUserId, String currentUserEmail) {
        Invitation inv = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException("Invitation not found"));

        if (inv.getStatus() != InviteStatus.PENDING) {
            throw new IllegalStateException("Invitation is not pending");
        }

        if (inv.getInviteeEmail() == null || !inv.getInviteeEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new SecurityException("Authenticated user does not match invitee email");
        }

        CollaboratorRequestModel collabRequest = CollaboratorRequestModel.builder()
                .projectId(inv.getProjectId())
                .userId(currentUserId)
                .role(inv.getRole())
                .permissions(null)
                .build();

        collaboratorService.addCollaborator(collabRequest, inv.getInviterId());

        inv.setStatus(InviteStatus.ACCEPTED);
        inv.setUpdatedAt(Instant.now());
        invitationRepository.save(inv);

        return responseMapper.toResponseModel(inv);
    }

    @Override
    public void cancelInvitation(Integer invitationId, String requesterId) {
        Invitation inv = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException("Invitation not found"));

        if (!inv.getInviterId().equals(requesterId)) {
            throw new SecurityException("Only inviter can cancel the invitation");
        }

        inv.setStatus(InviteStatus.EXPIRED);
        inv.setUpdatedAt(Instant.now());
        invitationRepository.save(inv);
    }
}
