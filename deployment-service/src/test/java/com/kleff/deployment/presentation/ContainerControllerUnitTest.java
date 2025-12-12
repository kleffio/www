package com.kleff.deployment.presentation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kleff.deployment.business.ContainerServiceImpl;
import com.kleff.deployment.data.container.Container;
import com.kleff.deployment.data.container.ContainerRequestModel;
import com.kleff.deployment.data.container.ContainerResponseModel;
import com.kleff.deployment.presentation.ContainerController;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ContainerController.class)
class ContainerControllerUnitTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // DEPRECATION CHECK: If Spring Boot 3.4+, change @MockBean to @MockitoBean
    @MockitoBean
    private ContainerServiceImpl containerService;

    @Test
    @DisplayName("GET /api/v1/containers - Success")
    void getAllContainers_Success() throws Exception {
        // Arrange
        ContainerResponseModel responseModel = ContainerResponseModel.builder()
                .containerID("c-123")
                .name("test-container")
                .status("Running")
                .build();

        when(containerService.getAllContainers()).thenReturn(List.of(responseModel));

        // Act & Assert
        mockMvc.perform(get("/api/v1/containers")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].containerID").value("c-123"))
                .andExpect(jsonPath("$[0].name").value("test-container"));
    }

    @Test
    @DisplayName("GET /api/v1/containers/{projectID} - Success")
    void getContainersByProjectID_Success() throws Exception {
        // Arrange
        String projectId = "proj-001";
        Container container = Container.builder()
                .containerID("c-123")
                .projectID(projectId)
                .name("project-container")
                .build();

        when(containerService.getContainersByProjectID(projectId))
                .thenReturn(List.of(container));

        // Act & Assert
        mockMvc.perform(get("/api/v1/containers/{projectID}", projectId)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].projectID").value(projectId))
                .andExpect(jsonPath("$[0].name").value("project-container"));
    }

    @Test
    @DisplayName("GET /api/v1/containers/{projectID} - Empty Result")
    void getContainersByProjectID_Empty() throws Exception {
        // Arrange
        when(containerService.getContainersByProjectID(anyString()))
                .thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/api/v1/containers/unknown-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("POST /api/v1/containers - Success")
    void createContainer_Success() throws Exception {
        // Arrange
        ContainerRequestModel request = ContainerRequestModel.builder()
                .name("new-app")
                .projectID("proj-1")
                .image("nginx")
                .port(8080)
                .repoUrl("git@github.com")
                .build();

        ContainerResponseModel response = ContainerResponseModel.builder()
                .containerID("generated-id")
                .name("new-app")
                .status("Running")
                .createdAt(LocalDateTime.now())
                .build();

        when(containerService.createContainer(any(ContainerRequestModel.class)))
                .thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/v1/containers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.containerID").value("generated-id"))
                .andExpect(jsonPath("$.status").value("Running"));
    }
}