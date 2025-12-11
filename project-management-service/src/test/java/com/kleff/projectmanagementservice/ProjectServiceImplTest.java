package com.kleff.projectmanagementservice;

import com.kleff.projectmanagementservice.buisnesslayer.ProjectServiceImpl;
import com.kleff.projectmanagementservice.datalayer.project.Project;
import com.kleff.projectmanagementservice.datalayer.project.ProjectRepository;
import com.kleff.projectmanagementservice.datalayer.project.ProjectStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceImplTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectServiceImpl projectService;

    private Project testProject;
    private String projectId;
    private String ownerId;

    @BeforeEach
    void setUp() {
        projectId = UUID.randomUUID().toString();
        ownerId = "user-123";

        testProject = Project.builder()
                .projectId(UUID.fromString(projectId))
                .name("Test Project")
                .description("Test Description")
                .ownerId(ownerId)
                .repositoryUrl("https://github.com/test/repo")
                .branch("main")
                .dockerComposePath("/docker-compose.yml")
                .projectStatus(ProjectStatus.ACTIVE)
                .createdDate(new Date())
                .updatedDate(new Date())
                .build();
    }

    @Test
    void getProjectById_WhenProjectExists_ShouldReturnProject() {
        // Arrange
        when(projectRepository.findByProjectId(projectId)).thenReturn(testProject);

        // Act
        Project result = projectService.getProjectById(projectId);

        // Assert
        assertNotNull(result);
        assertEquals(projectId, result.getProjectId().toString());
        assertEquals("Test Project", result.getName());
        verify(projectRepository, times(1)).findByProjectId(projectId);
    }

    @Test
    void getProjectById_WhenProjectDoesNotExist_ShouldReturnNull() {
        // Arrange
        when(projectRepository.findByProjectId(projectId)).thenReturn(null);

        // Act
        Project result = projectService.getProjectById(projectId);

        // Assert
        assertNull(result);
        verify(projectRepository, times(1)).findByProjectId(projectId);
    }

    @Test
    void getProjectById_WhenExceptionThrown_ShouldReturnNull() {
        // Arrange
        when(projectRepository.findByProjectId(projectId))
                .thenThrow(new RuntimeException("Database error"));

        // Act
        Project result = projectService.getProjectById(projectId);

        // Assert
        assertNull(result);
        verify(projectRepository, times(1)).findByProjectId(projectId);
    }

    @Test
    void createProject_ShouldSaveAndReturnProject() {
        // Arrange
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // Act
        Project result = projectService.createProject(testProject);

        // Assert
        assertNotNull(result);
        assertEquals("Test Project", result.getName());
        assertEquals(ownerId, result.getOwnerId());
        verify(projectRepository, times(1)).save(testProject);
    }

    @Test
    void updateProject_WhenProjectExists_ShouldUpdateAndReturnProject() {
        // Arrange
        Project updatedData = Project.builder()
                .name("Updated Name")
                .description("Updated Description")
                .build();

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // Act
        Project result = projectService.updateProject(projectId, updatedData);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Name", result.getName());
        assertEquals("Updated Description", result.getDescription());
        verify(projectRepository, times(1)).findById(projectId);
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    void updateProject_WhenOnlyNameProvided_ShouldUpdateOnlyName() {
        // Arrange
        String originalDescription = testProject.getDescription();
        Project updatedData = Project.builder()
                .name("New Name Only")
                .build();

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // Act
        Project result = projectService.updateProject(projectId, updatedData);

        // Assert
        assertNotNull(result);
        assertEquals("New Name Only", result.getName());
        assertEquals(originalDescription, result.getDescription()); // Should remain unchanged
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    void updateProject_WhenProjectDoesNotExist_ShouldThrowException() {
        // Arrange
        Project updatedData = Project.builder().name("Updated Name").build();
        when(projectRepository.findById(projectId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            projectService.updateProject(projectId, updatedData);
        });
        verify(projectRepository, times(1)).findById(projectId);
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void updateProject_ShouldUpdateUpdatedDate() {
        // Arrange
        Date originalDate = testProject.getUpdatedDate();
        Project updatedData = Project.builder().name("Updated Name").build();

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project saved = invocation.getArgument(0);
            assertNotEquals(originalDate, saved.getUpdatedDate());
            return saved;
        });

        // Act
        projectService.updateProject(projectId, updatedData);

        // Assert
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    void updateProject_WithAllFields_ShouldUpdateAllFields() {
        // Arrange
        Project updatedData = Project.builder()
                .name("New Name")
                .description("New Description")
                .ownerId("new-owner")
                .repositoryUrl("https://github.com/new/repo")
                .branch("develop")
                .dockerComposePath("/new/path/docker-compose.yml")
                .projectStatus(ProjectStatus.ARCHIVED)
                .build();

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // Act
        Project result = projectService.updateProject(projectId, updatedData);

        // Assert
        assertNotNull(result);
        assertEquals("New Name", result.getName());
        assertEquals("New Description", result.getDescription());
        assertEquals("new-owner", result.getOwnerId());
        assertEquals("https://github.com/new/repo", result.getRepositoryUrl());
        assertEquals("develop", result.getBranch());
        assertEquals("/new/path/docker-compose.yml", result.getDockerComposePath());
        assertEquals(ProjectStatus.ARCHIVED, result.getProjectStatus());
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    void deleteProject_WhenProjectExists_ShouldMarkAsDeletedAndReturnProject() {
        // Arrange
        when(projectRepository.findByProjectId(projectId)).thenReturn(testProject);
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // Act
        Project result = projectService.deleteProject(projectId);

        // Assert
        assertNotNull(result);
        assertEquals(ProjectStatus.DELETED, result.getProjectStatus());
        verify(projectRepository, times(1)).findByProjectId(projectId);
        verify(projectRepository, times(1)).save(testProject);
    }

    @Test
    void deleteProject_WhenProjectDoesNotExist_ShouldThrowException() {
        // Arrange
        when(projectRepository.findByProjectId(projectId)).thenReturn(null);

        // Act & Assert
        assertThrows(NullPointerException.class, () -> {
            projectService.deleteProject(projectId);
        });
        verify(projectRepository, times(1)).findByProjectId(projectId);
        verify(projectRepository, never()).save(any(Project.class));
    }
}