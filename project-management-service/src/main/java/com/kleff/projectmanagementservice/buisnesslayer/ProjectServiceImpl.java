package com.kleff.projectmanagementservice.buisnesslayer;

import com.kleff.projectmanagementservice.datalayer.project.Project;
import com.kleff.projectmanagementservice.datalayer.project.ProjectRepository;

import java.util.List;

public class ProjectServiceImpl extends ProjectService{
    private ProjectRepository projectRepository;
    public ProjectServiceImpl(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Override
    public List<Project> getAllOwnedProjects(String ownerId) {
        return List.of();
    }

    @Override
    public Project getProjectById(String projectId) {
        try {
            return projectRepository.findByProjectId(projectId);
        }
        catch (Exception e) {
            return null;
        }
        }


    @Override
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    @Override
    public Project updateProject(Project project) {
        return null;
    }

    @Override
    public Project deleteProject(String projectId) {
        return null;
    }
}
