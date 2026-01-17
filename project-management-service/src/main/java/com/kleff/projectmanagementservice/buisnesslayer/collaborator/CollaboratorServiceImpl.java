package com.kleff.projectmanagementservice.buisnesslayer.collaborator;

import com.kleff.projectmanagementservice.datalayer.collaborator.Collaborator;
import com.kleff.projectmanagementservice.datalayer.collaborator.CollaboratorStatus;
import com.kleff.projectmanagementservice.datalayer.collaborator.collaboratorRepository;
import com.kleff.projectmanagementservice.mappinglayer.collaborator.CollaboratorRequestMapper;
import com.kleff.projectmanagementservice.mappinglayer.collaborator.CollaboratorResponseMapper;
import com.kleff.projectmanagementservice.presentationlayer.collaborator.CollaboratorRequestModel;
import com.kleff.projectmanagementservice.presentationlayer.collaborator.CollaboratorResponseModel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CollaboratorServiceImpl implements CollaboratorService {

    private final collaboratorRepository collaboratorRepo;
    private final CollaboratorRequestMapper requestMapper;
    private final CollaboratorResponseMapper responseMapper;

    @Override
    public CollaboratorResponseModel addCollaborator(CollaboratorRequestModel request, String invitedBy) {
        Collaborator collaborator = requestMapper.requestToEntity(request);
        collaborator.setCollaboratorStatus(CollaboratorStatus.ACCEPTED);
        collaborator.setInvitedBy(invitedBy);
        collaborator.setInvitedAt(new Date());
        collaborator.setAcceptedAt(new Date());

        Collaborator saved = collaboratorRepo.save(collaborator);
        return responseMapper.toResponseModel(saved);
    }

    @Override
    public CollaboratorResponseModel updateCollaborator(String projectId, String userId, CollaboratorRequestModel request) {
        Collaborator collaborator = collaboratorRepo.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Collaborator not found"));

        collaborator.setRole(request.getRole());
        collaborator.setPermissions(request.getPermissions());

        Collaborator updated = collaboratorRepo.save(collaborator);
        return responseMapper.toResponseModel(updated);
    }

    @Override
    public List<CollaboratorResponseModel> getProjectCollaborators(String projectId) {
        List<Collaborator> collaborators = collaboratorRepo.findByProjectId(projectId);
        return responseMapper.entityListToResponseList(collaborators);
    }

    @Override
    public void removeCollaborator(String projectId, String userId) {
        collaboratorRepo.findByProjectIdAndUserId(projectId, userId)
                .ifPresent(collaboratorRepo::delete);
    }
}
