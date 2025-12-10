package com.kleff.projectmanagementservice.presentationlayer;

import com.kleff.projectmanagementservice.buisnesslayer.ProjectService;
import com.kleff.projectmanagementservice.buisnesslayer.ProjectServiceImpl;
import com.kleff.projectmanagementservice.datalayer.project.Project;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import javax.print.attribute.standard.DateTimeAtCreation;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping("/all")
    public List<Project> getAllProjects() {
        return null;
    }


    @GetMapping
    public ResponseEntity<List<Project>> getAllOwnedProjects(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        List<Project> projects = projectService.getAllOwnedProjects(userId);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<Project> getProjectById(@PathVariable String projectId) {
        Project project = projectService.getProjectById(projectId);
        if (project == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(project);
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project,@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        project.setOwnerId(userId);
        Date date = new Date();
        project.setCreatedDate(date);
        project.setUpdatedDate(date);
        Project createdProject = projectService.createProject(project);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProject);
    }


    @PatchMapping("/{projectId}")
    public ResponseEntity<Project> patchProject(
            @PathVariable String projectId,
            @RequestBody Project updatedProject,
            @AuthenticationPrincipal Jwt jwt) {
            String userId = jwt.getSubject();
            Project projectAllowed = projectService.getProjectById(projectId);
            if (userId == projectAllowed.getOwnerId())
        try {
            Date date = new Date();
            updatedProject.setUpdatedDate(date);
            Project project = projectService.updateProject(projectId, updatedProject);
            return ResponseEntity.ok(project);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
            else{
                return null;
            }
    }


    @DeleteMapping("/{projectId}")
    public ResponseEntity<Project> deleteProject(@PathVariable String projectId, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        Project projectAllowed = projectService.getProjectById(projectId);
        if (userId == projectAllowed.getOwnerId()) {
            try {
                Project deletedProject = projectService.deleteProject(projectId);
                return ResponseEntity.ok(deletedProject);
            } catch (Exception e) {
                return ResponseEntity.notFound().build();
            }
        }
        else {
            return null;
        }
    }
}