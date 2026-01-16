package com.kleff.projectmanagementservice.buisnesslayer;

import com.kleff.projectmanagementservice.datalayer.project.Project;
import com.kleff.projectmanagementservice.datalayer.project.ProjectRepository;
import com.kleff.projectmanagementservice.datalayer.project.ProjectStatus;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class ProjectServiceImpl implements ProjectService {

    private ProjectRepository projectRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    //this currently only gets all projects
    @Override
    public List<Project> getAllOwnedProjects(String userId) {

        return projectRepository.findByOwnerIdEquals(userId);
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
    public Project updateProject(String projectId, Project updatedProject) {
            Project existing = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            if (updatedProject.getName() != null) {
                existing.setName(updatedProject.getName());
            }
            if (updatedProject.getDescription() != null) {
                existing.setDescription(updatedProject.getDescription());
            }
            if (updatedProject.getOwnerId() != null) {
                existing.setOwnerId(updatedProject.getOwnerId());
            }
            if (updatedProject.getProjectStatus() != null) {
                existing.setProjectStatus(updatedProject.getProjectStatus());
            }
            existing.setUpdatedDate(new Date());
            return projectRepository.save(existing);

    }

    @Override
    public Project deleteProject(String projectId) {
        Project toDelete = projectRepository.findByProjectId(projectId);
        toDelete.setProjectStatus(ProjectStatus.DELETED);
        return projectRepository.save(toDelete);
    }
}
