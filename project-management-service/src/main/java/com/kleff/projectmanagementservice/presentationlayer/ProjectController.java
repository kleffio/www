package com.kleff.projectmanagementservice.presentationlayer;

import com.kleff.projectmanagementservice.buisnesslayer.ProjectService;
import com.kleff.projectmanagementservice.datalayer.project.Project;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<Project>> getAllOwnedProjects(@PathVariable String ownerId) {
        List<Project> projects = projectService.getAllOwnedProjects(ownerId);
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
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        Project createdProject = projectService.createProject(project);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProject);
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<Project> updateProject(
            @PathVariable String projectId,
            @RequestBody Project updatedProject) {
        try {
            Project project = projectService.updateProject(projectId, updatedProject);
            return ResponseEntity.ok(project);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{projectId}")
    public ResponseEntity<Project> partialUpdateProject(
            @PathVariable String projectId,
            @RequestBody Project updatedProject) {
        try {
            Project project = projectService.updateProject(projectId, updatedProject);
            return ResponseEntity.ok(project);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Project> deleteProject(@PathVariable String projectId) {
        try {
            Project deletedProject = projectService.deleteProject(projectId);
            return ResponseEntity.ok(deletedProject);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}