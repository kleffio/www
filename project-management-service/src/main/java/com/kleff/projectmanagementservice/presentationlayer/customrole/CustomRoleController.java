package com.kleff.projectmanagementservice.presentationlayer.customrole;

import com.kleff.projectmanagementservice.buisnesslayer.customrole.CustomRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CustomRoleController {

    private final CustomRoleService customRoleService;

    @PostMapping("/projects/{projectId}/custom-roles")
    public ResponseEntity<CustomRoleResponseModel> createCustomRole(
            @PathVariable String projectId,
            @RequestBody CustomRoleRequestModel request,
            @AuthenticationPrincipal Jwt jwt) {
        String createdBy = jwt.getSubject();
        request.setProjectId(projectId);
        CustomRoleResponseModel response = customRoleService.createCustomRole(request, createdBy);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/projects/{projectId}/custom-roles")
    public ResponseEntity<List<CustomRoleResponseModel>> getProjectCustomRoles(@PathVariable String projectId) {
        List<CustomRoleResponseModel> customRoles = customRoleService.getProjectCustomRoles(projectId);
        return ResponseEntity.ok(customRoles);
    }

    @PutMapping("/custom-roles/{roleId}")
    public ResponseEntity<CustomRoleResponseModel> updateCustomRole(
            @PathVariable Integer roleId,
            @RequestBody CustomRoleRequestModel request,
            @AuthenticationPrincipal Jwt jwt) {
        CustomRoleResponseModel response = customRoleService.updateCustomRole(roleId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/custom-roles/{roleId}")
    public ResponseEntity<Void> deleteCustomRole(
            @PathVariable Integer roleId,
            @AuthenticationPrincipal Jwt jwt) {
        customRoleService.deleteCustomRole(roleId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
