package com.kleff.projectmanagementservice.presentationlayer.collaborator;

import com.kleff.projectmanagementservice.buisnesslayer.collaborator.CollaboratorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class CollaboratorController {

    private final CollaboratorService collaboratorService;

    public CollaboratorController(CollaboratorService collaboratorService) {
        this.collaboratorService = collaboratorService;
    }

    @PostMapping("/projects/{projectId}/collaborators")
    public ResponseEntity<CollaboratorResponseModel> addCollaborator(@PathVariable String projectId,
                                                                     @RequestBody CollaboratorRequestModel request,
                                                                     @AuthenticationPrincipal Jwt jwt) {
        String invitedBy = jwt.getSubject();
        request.setProjectId(projectId);
        CollaboratorResponseModel response = collaboratorService.addCollaborator(request, invitedBy);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/projects/{projectId}/collaborators")
    public ResponseEntity<List<CollaboratorResponseModel>> getProjectCollaborators(@PathVariable String projectId) {
        List<CollaboratorResponseModel> collaborators = collaboratorService.getProjectCollaborators(projectId);
        return ResponseEntity.ok(collaborators);
    }

    @PutMapping("/projects/{projectId}/collaborators/{userId}")
    public ResponseEntity<CollaboratorResponseModel> updateCollaborator(@PathVariable String projectId,
                                                                        @PathVariable String userId,
                                                                        @RequestBody CollaboratorRequestModel request,
                                                                        @AuthenticationPrincipal Jwt jwt) {
        CollaboratorResponseModel response = collaboratorService.updateCollaborator(projectId, userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/projects/{projectId}/collaborators/{userId}")
    public ResponseEntity<Void> removeCollaborator(
            @PathVariable String projectId,
            @PathVariable String userId,
            @AuthenticationPrincipal Jwt jwt) {
        collaboratorService.removeCollaborator(projectId, userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/collaborators/{projectId}/user/{userId}/permissions")
    public ResponseEntity<List<String>> getUserPermissions(
            @PathVariable String projectId,
            @PathVariable String userId,
            @AuthenticationPrincipal Jwt jwt) {
        List<String> permissions = collaboratorService.getUserPermissions(projectId, userId);
        return ResponseEntity.ok(permissions);
    }
}
