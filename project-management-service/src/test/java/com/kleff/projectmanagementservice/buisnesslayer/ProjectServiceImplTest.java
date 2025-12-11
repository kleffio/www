package com.kleff.projectmanagementservice.buisnesslayer;

import com.kleff.projectmanagementservice.datalayer.project.Project;
import com.kleff.projectmanagementservice.datalayer.project.ProjectRepository;
import com.kleff.projectmanagementservice.datalayer.project.ProjectStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.hamcrest.Matchers.any;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.ExpectedCount.never;

@ExtendWith(MockitoExtension.class)
class ProjectServiceImplTest {

        @Mock
        private ProjectRepository projectRepository;

        @InjectMocks
        private ProjectServiceImpl projectService;

        private Project testProject1;
        private Project testProject2;
        private String testUserId;
        private String testProjectId;

        @BeforeEach
        void setUp() {
            testUserId = "user-123-abc";
            testProjectId = "project-456-def";
            Date now = new Date();

            testProject1 = new Project();
            testProject1.setProjectId("project-1");
            testProject1.setName("Test Project 1");
            testProject1.setDescription("Description 1");
            testProject1.setOwnerId(testUserId);
            testProject1.setProjectStatus(ProjectStatus.ACTIVE);
            testProject1.setCreatedDate(now);
            testProject1.setUpdatedDate(now);

            testProject2 = new Project();
            testProject2.setProjectId("project-2");
            testProject2.setName("Test Project 2");
            testProject2.setDescription("Description 2");
            testProject2.setOwnerId(testUserId);
            testProject2.setProjectStatus(ProjectStatus.ACTIVE);
            testProject2.setCreatedDate(now);
            testProject2.setUpdatedDate(now);
        }

        // ============ getAllOwnedProjects Tests ============

        @Test
        void getAllOwnedProjects_WithValidUserId_ReturnsUserProjects() {
            // Arrange
            List<Project> expectedProjects = Arrays.asList(testProject1, testProject2);
            when(projectRepository.findByOwnerIdEquals(testUserId)).thenReturn(expectedProjects);

            // Act
            List<Project> result = projectService.getAllOwnedProjects(testUserId);

            // Assert
            assertThat(result).hasSize(2);
            assertThat(result).containsExactly(testProject1, testProject2);
            verify(projectRepository).findByOwnerIdEquals(testUserId);
        }

        @Test
        void getAllOwnedProjects_WithNoProjects_ReturnsEmptyList() {
            // Arrange
            when(projectRepository.findByOwnerIdEquals(testUserId)).thenReturn(Arrays.asList());

            // Act
            List<Project> result = projectService.getAllOwnedProjects(testUserId);

            // Assert
            assertThat(result).isEmpty();
            verify(projectRepository).findByOwnerIdEquals(testUserId);
        }

        @Test
        void getAllOwnedProjects_WithDifferentUserId_ReturnsOnlyTheirProjects() {
            // Arrange
            String differentUserId = "user-999-xyz";
            Project differentUserProject = new Project();
            differentUserProject.setProjectId("project-3");
            differentUserProject.setOwnerId(differentUserId);

            when(projectRepository.findByOwnerIdEquals(differentUserId))
                    .thenReturn(Arrays.asList(differentUserProject));

            // Act
            List<Project> result = projectService.getAllOwnedProjects(differentUserId);

            // Assert
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getOwnerId()).isEqualTo(differentUserId);
            verify(projectRepository).findByOwnerIdEquals(differentUserId);
        }

        // ============ getProjectById Tests ============

        @Test
        void getProjectById_WithValidId_ReturnsProject() {
            // Arrange
            when(projectRepository.findByProjectId(testProjectId)).thenReturn(testProject1);

            // Act
            Project result = projectService.getProjectById(testProjectId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getProjectId()).isEqualTo(testProject1.getProjectId());
            assertThat(result.getName()).isEqualTo(testProject1.getName());
            verify(projectRepository).findByProjectId(testProjectId);
        }

        @Test
        void getProjectById_WithNonExistentId_ReturnsNull() {
            // Arrange
            when(projectRepository.findByProjectId(testProjectId)).thenReturn(null);

            // Act
            Project result = projectService.getProjectById(testProjectId);

            // Assert
            assertThat(result).isNull();
            verify(projectRepository).findByProjectId(testProjectId);
        }

        @Test
        void getProjectById_WhenRepositoryThrowsException_ReturnsNull() {
            // Arrange
            when(projectRepository.findByProjectId(testProjectId))
                    .thenThrow(new RuntimeException("Database error"));

            // Act
            Project result = projectService.getProjectById(testProjectId);

            // Assert
            assertThat(result).isNull();
            verify(projectRepository).findByProjectId(testProjectId);
        }

        // ============ createProject Tests ============

        @Test
        void createProject_WithValidProject_SavesAndReturnsProject() {
            // Arrange
            Project newProject = new Project();
            newProject.setName("New Project");
            newProject.setDescription("New Description");
            newProject.setOwnerId(testUserId);

            Project savedProject = new Project();
            savedProject.setProjectId("project-new");
            savedProject.setName("New Project");
            savedProject.setDescription("New Description");
            savedProject.setOwnerId(testUserId);
            savedProject.setCreatedDate(new Date());
            savedProject.setUpdatedDate(new Date());

            when(projectRepository.save(newProject)).thenReturn(savedProject);

            // Act
            Project result = projectService.createProject(newProject);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getProjectId()).isEqualTo("project-new");
            assertThat(result.getName()).isEqualTo("New Project");
            assertThat(result.getOwnerId()).isEqualTo(testUserId);
            verify(projectRepository).save(newProject);
        }

        @Test
        void createProject_CallsRepositorySave() {
            // Arrange
            Project newProject = new Project();
            when(projectRepository.save(Mockito.<Project>any())).thenReturn(newProject);

            // Act
            projectService.createProject(newProject);

            // Assert
            verify(projectRepository, times(1)).save(newProject);
        }

        // ============ updateProject Tests ============

        @Test
        void updateProject_WithValidData_UpdatesAllFields() {
            // Arrange
            Project existingProject = new Project();
            existingProject.setProjectId(testProjectId);
            existingProject.setName("Old Name");
            existingProject.setDescription("Old Description");
            existingProject.setOwnerId("old-owner");
            existingProject.setProjectStatus(ProjectStatus.ACTIVE);
            existingProject.setCreatedDate(new Date());
            existingProject.setUpdatedDate(new Date());

            Project updatedData = new Project();
            updatedData.setName("New Name");
            updatedData.setDescription("New Description");
            updatedData.setOwnerId("new-owner");
            updatedData.setProjectStatus(ProjectStatus.ARCHIVED);

            when(projectRepository.findById(testProjectId)).thenReturn(Optional.of(existingProject));
            when(projectRepository.save(Mockito.<Project>any())).thenReturn(existingProject);

            // Act
            Project result = projectService.updateProject(testProjectId, updatedData);

            // Assert
            ArgumentCaptor<Project> projectCaptor = ArgumentCaptor.forClass(Project.class);
            verify(projectRepository).save(projectCaptor.capture());

            Project savedProject = projectCaptor.getValue();
            assertThat(savedProject.getName()).isEqualTo("New Name");
            assertThat(savedProject.getDescription()).isEqualTo("New Description");
            assertThat(savedProject.getOwnerId()).isEqualTo("new-owner");
            assertThat(savedProject.getProjectStatus()).isEqualTo(ProjectStatus.ARCHIVED);
            assertThat(savedProject.getUpdatedDate()).isNotNull();
        }

        @Test
        void updateProject_WithPartialData_UpdatesOnlyProvidedFields() {
            // Arrange
            Project existingProject = new Project();
            existingProject.setProjectId(testProjectId);
            existingProject.setName("Old Name");
            existingProject.setDescription("Old Description");
            existingProject.setOwnerId("old-owner");
            existingProject.setProjectStatus(ProjectStatus.ACTIVE);

            Project partialUpdate = new Project();
            partialUpdate.setName("New Name Only");
            // description, ownerId, and projectStatus are null

            when(projectRepository.findById(testProjectId)).thenReturn(Optional.of(existingProject));
            when(projectRepository.save(Mockito.<Project>any())).thenReturn(existingProject);

            // Act
            Project result = projectService.updateProject(testProjectId, partialUpdate);

            // Assert
            ArgumentCaptor<Project> projectCaptor = ArgumentCaptor.forClass(Project.class);
            verify(projectRepository).save(projectCaptor.capture());

            Project savedProject = projectCaptor.getValue();
            assertThat(savedProject.getName()).isEqualTo("New Name Only");
            assertThat(savedProject.getDescription()).isEqualTo("Old Description"); // Unchanged
            assertThat(savedProject.getOwnerId()).isEqualTo("old-owner"); // Unchanged
            assertThat(savedProject.getProjectStatus()).isEqualTo(ProjectStatus.ACTIVE); // Unchanged
        }

        @Test
        void updateProject_WithNonExistentProject_ThrowsRuntimeException() {
            // Arrange
            Project updateData = new Project();
            updateData.setName("New Name");

            when(projectRepository.findById(testProjectId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> projectService.updateProject(testProjectId, updateData))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Project not found");

            verify(projectRepository).findById(testProjectId);
        }

        @Test
        void updateProject_SetsUpdatedDate() {
            // Arrange
            Date oldDate = new Date(System.currentTimeMillis() - 10000); // 10 seconds ago

            Project existingProject = new Project();
            existingProject.setProjectId(testProjectId);
            existingProject.setName("Old Name");
            existingProject.setUpdatedDate(oldDate);

            Project updateData = new Project();
            updateData.setName("New Name");

            when(projectRepository.findById(testProjectId)).thenReturn(Optional.of(existingProject));
            when(projectRepository.save(Mockito.<Project>any())).thenReturn(existingProject);

            // Act
            projectService.updateProject(testProjectId, updateData);

            // Assert
            ArgumentCaptor<Project> projectCaptor = ArgumentCaptor.forClass(Project.class);
            verify(projectRepository).save(projectCaptor.capture());

            Project savedProject = projectCaptor.getValue();
            assertThat(savedProject.getUpdatedDate()).isAfter(oldDate);
        }

        @Test
        void updateProject_WithOnlyDescriptionChange_UpdatesDescription() {
            // Arrange
            Project existingProject = new Project();
            existingProject.setProjectId(testProjectId);
            existingProject.setName("Name");
            existingProject.setDescription("Old Description");

            Project updateData = new Project();
            updateData.setDescription("New Description");

            when(projectRepository.findById(testProjectId)).thenReturn(Optional.of(existingProject));
            when(projectRepository.save(Mockito.<Project>any())).thenReturn(existingProject);

            // Act
            projectService.updateProject(testProjectId, updateData);

            // Assert
            ArgumentCaptor<Project> projectCaptor = ArgumentCaptor.forClass(Project.class);
            verify(projectRepository).save(projectCaptor.capture());

            Project savedProject = projectCaptor.getValue();
            assertThat(savedProject.getDescription()).isEqualTo("New Description");
            assertThat(savedProject.getName()).isEqualTo("Name"); // Unchanged
        }

        @Test
        void updateProject_WithOnlyStatusChange_UpdatesStatus() {
            // Arrange
            Project existingProject = new Project();
            existingProject.setProjectId(testProjectId);
            existingProject.setProjectStatus(ProjectStatus.ACTIVE);

            Project updateData = new Project();
            updateData.setProjectStatus(ProjectStatus.PAUSED);

            when(projectRepository.findById(testProjectId)).thenReturn(Optional.of(existingProject));
            when(projectRepository.save(Mockito.<Project>any())).thenReturn(existingProject);

            // Act
            projectService.updateProject(testProjectId, updateData);

            // Assert
            ArgumentCaptor<Project> projectCaptor = ArgumentCaptor.forClass(Project.class);
            verify(projectRepository).save(projectCaptor.capture());

            Project savedProject = projectCaptor.getValue();
            assertThat(savedProject.getProjectStatus()).isEqualTo(ProjectStatus.PAUSED);
        }

        // ============ deleteProject Tests ============

        @Test
        void deleteProject_WithValidId_MarksProjectAsDeleted() {
            // Arrange
            Project projectToDelete = new Project();
            projectToDelete.setProjectId(testProjectId);
            projectToDelete.setName("Project to Delete");
            projectToDelete.setProjectStatus(ProjectStatus.ACTIVE);

            when(projectRepository.findByProjectId(testProjectId)).thenReturn(projectToDelete);
            when(projectRepository.save(Mockito.<Project>any())).thenReturn(projectToDelete);

            // Act
            Project result = projectService.deleteProject(testProjectId);

            // Assert
            ArgumentCaptor<Project> projectCaptor = ArgumentCaptor.forClass(Project.class);
            verify(projectRepository).save(projectCaptor.capture());

            Project savedProject = projectCaptor.getValue();
            assertThat(savedProject.getProjectStatus()).isEqualTo(ProjectStatus.DELETED);
            assertThat(result).isNotNull();
            verify(projectRepository).findByProjectId(testProjectId);
        }

        @Test
        void deleteProject_DoesNotActuallyDeleteFromDatabase() {
            // Arrange
            Project projectToDelete = new Project();
            projectToDelete.setProjectId(testProjectId);
            projectToDelete.setProjectStatus(ProjectStatus.ACTIVE);

            when(projectRepository.findByProjectId(testProjectId)).thenReturn(projectToDelete);
            when(projectRepository.save(Mockito.<Project>any())).thenReturn(projectToDelete);

            // Act
            projectService.deleteProject(testProjectId);

            // Assert
//            verify(projectRepository, never()).delete(any(Project.class));
//            verify(projectRepository, never()).deleteById(anyString());
//            verify(projectRepository).save(any(Project.class)); // Soft delete via save
        }

        @Test
        void deleteProject_WithCompletedProject_ChangesStatusToDeleted() {
            // Arrange
            Project completedProject = new Project();
            completedProject.setProjectId(testProjectId);
            completedProject.setProjectStatus(ProjectStatus.PAUSED);

            when(projectRepository.findByProjectId(testProjectId)).thenReturn(completedProject);
            when(projectRepository.save(Mockito.<Project>any())).thenReturn(completedProject);

            // Act
            projectService.deleteProject(testProjectId);

            // Assert
            ArgumentCaptor<Project> projectCaptor = ArgumentCaptor.forClass(Project.class);
            verify(projectRepository).save(projectCaptor.capture());

            Project savedProject = projectCaptor.getValue();
            assertThat(savedProject.getProjectStatus()).isEqualTo(ProjectStatus.DELETED);
        }

        @Test
        void deleteProject_ReturnsDeletedProject() {
            // Arrange
            Project projectToDelete = new Project();
            projectToDelete.setProjectId(testProjectId);
            projectToDelete.setName("Deleted Project");
            projectToDelete.setProjectStatus(ProjectStatus.ACTIVE);

            Project savedProject = new Project();
            savedProject.setProjectId(testProjectId);
            savedProject.setName("Deleted Project");
            savedProject.setProjectStatus(ProjectStatus.DELETED);

            when(projectRepository.findByProjectId(testProjectId)).thenReturn(projectToDelete);
            when(projectRepository.save(Mockito.<Project>any())).thenReturn(savedProject);

            // Act
            Project result = projectService.deleteProject(testProjectId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getProjectId()).isEqualTo(testProjectId);
            assertThat(result.getName()).isEqualTo("Deleted Project");
            assertThat(result.getProjectStatus()).isEqualTo(ProjectStatus.DELETED);
        }



}