package com.kleff.projectmanagementservice;


import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.kleff.projectmanagementservice.buisnesslayer.ProjectServiceImpl;
import com.kleff.projectmanagementservice.datalayer.project.Project;
import com.kleff.projectmanagementservice.datalayer.project.ProjectRepository;
import com.kleff.projectmanagementservice.datalayer.project.ProjectStatus;
import com.kleff.projectmanagementservice.presentationlayer.ProjectController;

@WebMvcTest(ProjectController.class)
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProjectServiceImpl projectService;

    @MockitoBean
    private ProjectRepository projectRepository;

    private Project testProject;
    private String projectId;
    private String ownerId;

    @BeforeEach
    void setUp() {
        projectId = UUID.randomUUID().toString();
        ownerId = "user-123";

        testProject = new Project();
        testProject.setProjectId(UUID.fromString(projectId));
        testProject.setName("Test Project");
        testProject.setDescription("Test Description");
        testProject.setOwnerId(ownerId);
        testProject.setRepositoryUrl("https://github.com/test/repo");
        testProject.setBranch("main");
        testProject.setDockerComposePath("/docker-compose.yml");
        testProject.setProjectStatus(ProjectStatus.ACTIVE);
        testProject.setCreatedDate(new Date());
        testProject.setUpdatedDate(new Date());
    }

    @Test
    void getAllOwnedProjects_ShouldReturnListOfProjects() throws Exception {
        // Arrange
        List<Project> projects = Arrays.asList(testProject);
        when(projectService.getAllOwnedProjects(ownerId)).thenReturn(projects);

        // Act & Assert
        mockMvc.perform(get("/api/v1/projects/owner/{ownerId}", ownerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Test Project")))
                .andExpect(jsonPath("$[0].ownerId", is(ownerId)));

        verify(projectService, times(1)).getAllOwnedProjects(ownerId);
    }

    @Test
    void getProjectById_WhenProjectExists_ShouldReturnProject() throws Exception {
        // Arrange
        when(projectService.getProjectById(projectId)).thenReturn(testProject);

        // Act & Assert
        mockMvc.perform(get("/api/v1/projects/{projectId}", projectId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Test Project")))
                .andExpect(jsonPath("$.description", is("Test Description")))
                .andExpect(jsonPath("$.ownerId", is(ownerId)))
                .andExpect(jsonPath("$.projectStatus", is("ACTIVE")));

        verify(projectService, times(1)).getProjectById(projectId);
    }

    @Test
    void createProject_WithValidData_ShouldReturnCreatedProject() throws Exception {
        // Arrange
        when(projectService.createProject(any(Project.class))).thenReturn(testProject);

        // Plain JSON string - no ObjectMapper needed!
        String jsonRequest = """
            {
                "name": "Test Project",
                "description": "Test Description",
                "ownerId": "user-123",
                "repositoryUrl": "https://github.com/test/repo",
                "branch": "main",
                "dockerComposePath": "/docker-compose.yml",
                "projectStatus": "ACTIVE"
            }
            """;

        // Act & Assert
        mockMvc.perform(post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Test Project")))
                .andExpect(jsonPath("$.ownerId", is(ownerId)));

        verify(projectService, times(1)).createProject(any(Project.class));
    }

    @Test
    void createProject_WithMinimalData_ShouldReturnCreatedProject() throws Exception {
        // Arrange
        Project minimalProject = new Project();
        minimalProject.setProjectId(UUID.randomUUID());
        minimalProject.setName("Minimal Project");
        minimalProject.setOwnerId(ownerId);
        minimalProject.setCreatedDate(new Date());
        minimalProject.setUpdatedDate(new Date());

        when(projectService.createProject(any(Project.class))).thenReturn(minimalProject);

        String jsonRequest = """
            {
                "name": "Minimal Project",
                "ownerId": "user-123"
            }
            """;

        // Act & Assert
        mockMvc.perform(post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Minimal Project")));

        verify(projectService, times(1)).createProject(any(Project.class));
    }

    @Test
    void updateProject_WhenProjectExists_ShouldReturnUpdatedProject() throws Exception {
        // Arrange
        Project updatedProject = new Project();
        updatedProject.setProjectId(UUID.fromString(projectId));
        updatedProject.setName("Updated Project");
        updatedProject.setDescription("Updated Description");

        when(projectService.updateProject(eq(projectId), any(Project.class)))
                .thenReturn(updatedProject);

        String jsonRequest = """
            {
                "name": "Updated Project",
                "description": "Updated Description"
            }
            """;

        // Act & Assert
        mockMvc.perform(patch("/api/v1/projects/{projectId}", projectId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Project")))
                .andExpect(jsonPath("$.description", is("Updated Description")));

        verify(projectService, times(1)).updateProject(eq(projectId), any(Project.class));
    }

    @Test
    void updateProject_WhenProjectDoesNotExist_ShouldReturnNotFound() throws Exception {
        // Arrange
        when(projectService.updateProject(eq(projectId), any(Project.class)))
                .thenThrow(new RuntimeException("Project not found"));

        String jsonRequest = """
            {
                "name": "Updated Project"
            }
            """;

        // Act & Assert
        mockMvc.perform(patch("/api/v1/projects/{projectId}", projectId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isNotFound());

        verify(projectService, times(1)).updateProject(eq(projectId), any(Project.class));
    }

    @Test
    void partialUpdateProject_WithOnlyName_ShouldUpdateName() throws Exception {
        // Arrange
        testProject.setName("Partially Updated Name");
        when(projectService.updateProject(eq(projectId), any(Project.class)))
                .thenReturn(testProject);

        String jsonRequest = """
            {
                "name": "Partially Updated Name"
            }
            """;

        // Act & Assert
        mockMvc.perform(patch("/api/v1/projects/{projectId}", projectId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Partially Updated Name")));

        verify(projectService, times(1)).updateProject(eq(projectId), any(Project.class));
    }

    @Test
    void deleteProject_WhenProjectExists_ShouldReturnDeletedProject() throws Exception {
        // Arrange
        testProject.setProjectStatus(ProjectStatus.DELETED);
        when(projectService.deleteProject(projectId)).thenReturn(testProject);

        // Act & Assert
        mockMvc.perform(delete("/api/v1/projects/{projectId}", projectId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectStatus", is("DELETED")));

        verify(projectService, times(1)).deleteProject(projectId);
    }

    @Test
    void deleteProject_WhenProjectDoesNotExist_ShouldReturnNotFound() throws Exception {
        // Arrange
        when(projectService.deleteProject(projectId))
                .thenThrow(new RuntimeException("Project not found"));

        // Act & Assert
        mockMvc.perform(delete("/api/v1/projects/{projectId}", projectId))
                .andExpect(status().isNotFound());

        verify(projectService, times(1)).deleteProject(projectId);
    }
}