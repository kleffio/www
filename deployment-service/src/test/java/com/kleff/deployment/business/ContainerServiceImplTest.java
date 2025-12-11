package com.kleff.deployment.business;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kleff.deployment.data.container.Container;
import com.kleff.deployment.data.container.ContainerMapper;
import com.kleff.deployment.data.container.ContainerRepository;
import com.kleff.deployment.data.container.ContainerRequestModel;
import com.kleff.deployment.data.container.ContainerResponseModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.ExpectedCount;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@ExtendWith(MockitoExtension.class)
class ContainerServiceImplTest {

    // 1. Standard Mocks for Data Access and Mapping
    @Mock
    private ContainerRepository containerRepository;

    @Mock
    private ContainerMapper containerMapper;

    // 2. We mock the Builder, but we need a REAL RestTemplate to bind the Server to
    @Mock
    private RestTemplateBuilder restTemplateBuilder;

    private ContainerServiceImpl containerService;
    private MockRestServiceServer mockServer;
    private ObjectMapper objectMapper; // Helper for JSON matching

    @BeforeEach
    void setUp() {
        // "Web Services" Course Methodology:
        // Create a real RestTemplate so we can bind MockRestServiceServer to it.
        RestTemplate restTemplate = new RestTemplate();

        // Configure the mock builder to return our real template
        when(restTemplateBuilder.build()).thenReturn(restTemplate);

        // Bind the server to the template
        mockServer = MockRestServiceServer.createServer(restTemplate);

        // Manual constructor injection to ensure our Setup is used
        containerService = new ContainerServiceImpl(containerRepository, containerMapper, restTemplateBuilder);

        objectMapper = new ObjectMapper();
    }

    // --- Happy Path Tests ---

    @Test
    @DisplayName("getAllContainers: Should return list of response models")
    void whenGetAllContainers_thenReturnList() {
        // Arrange
        Container container = Container.builder().containerID("uuid-1").name("test-app").build();
        ContainerResponseModel response = ContainerResponseModel.builder().containerID("uuid-1").name("test-app").build();

        when(containerRepository.findAll()).thenReturn(List.of(container));
        when(containerMapper.containerToContainerResponseModel(anyList())).thenReturn(List.of(response));

        // Act
        List<ContainerResponseModel> result = containerService.getAllContainers();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getContainerID()).isEqualTo("uuid-1");
        verify(containerRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getContainerByContainerId: Should return container when found")
    void whenGetContainerFound_thenReturnContainer() {
        // Arrange
        String id = "uuid-1";
        Container container = Container.builder().containerID(id).build();
        when(containerRepository.findContainerByContainerID(id)).thenReturn(container);

        // Act
        Container result = containerService.getContainerByContainerId(id);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContainerID()).isEqualTo(id);
    }

    @Test
    @DisplayName("createContainer: Should save entity, trigger external build, and return response")
    void whenCreateContainer_thenSaveAndTriggerBuild() throws JsonProcessingException {
        // Arrange
        ContainerRequestModel request = ContainerRequestModel.builder()
                .name("microservice-a")
                .repoUrl("https://github.com/kleff/repo")
                .branch("develop")
                .image("alpine:latest")
                .port(8080)
                .build();

        Container mappedContainer = Container.builder()
                .name("microservice-a")
                .repoUrl("https://github.com/kleff/repo")
                .build();

        // Used to simulate what the DB returns after save (usually has an ID)
        Container savedContainer = Container.builder()
                .containerID("generated-id")
                .name("microservice-a")
                .status("Running") // The service logic sets this
                .build();

        ContainerResponseModel expectedResponse = ContainerResponseModel.builder()
                .containerID("generated-id")
                .status("Running")
                .build();

        when(containerMapper.containerRequestModelToContainer(request)).thenReturn(mappedContainer);
        when(containerRepository.save(any(Container.class))).thenReturn(savedContainer);
        when(containerMapper.containerToContainerResponseModel(savedContainer)).thenReturn(expectedResponse);

        // EXPECTATION: External API Call (MockRestServiceServer)
        // We verify that the Service hits the deployment URL with specific JSON data
        mockServer.expect(ExpectedCount.once(),
                        requestTo("https://api.kleff.io/api/v1/deployment/build"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().json(objectMapper.writeValueAsString(new Object() {
                    // Create an anonymous object matching the structure of GoBuildRequest for verification
                    public String repo_url = "https://github.com/kleff/repo";
                    public String branch = "develop";
                    public String image_name = "alpine:latest";
                    public int app_port = 8080;
                })))
                .andRespond(withSuccess("Build Started", MediaType.TEXT_PLAIN));

        // Act
        ContainerResponseModel actualResponse = containerService.createContainer(request);

        // Assert
        mockServer.verify(); // Verifies the external HTTP call happened
        assertThat(actualResponse.getContainerID()).isEqualTo("generated-id");

        // Business Rule Verification: Check if Status and CreatedAt were set
        ArgumentCaptor<Container> containerCaptor = ArgumentCaptor.forClass(Container.class);
        verify(containerRepository).save(containerCaptor.capture());

        Container captured = containerCaptor.getValue();
        assertThat(captured.getStatus()).isEqualTo("Running");
        assertThat(captured.getCreatedAt()).isNotNull();
    }

    // --- Edge Cases / Exception Handling ---

    @Test
    @DisplayName("getContainerByContainerId: Should return null on exception/not found")
    void whenGetContainerException_thenReturnNull() {
        // Arrange
        when(containerRepository.findContainerByContainerID(anyString())).thenThrow(new RuntimeException("DB Error"));

        // Act
        Container result = containerService.getContainerByContainerId("invalid-id");

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("createContainer: Should still return created container if External Build API fails")
    void whenExternalBuildFails_thenStillReturnSavedContainer() {
        // The service consumes the exception from the RestTemplate.
        // We need to ensure the DB transaction isn't rolled back and the user still gets a response.

        // Arrange
        ContainerRequestModel request = ContainerRequestModel.builder().name("app").build();
        Container mapped = Container.builder().name("app").build();
        Container saved = Container.builder().containerID("123").name("app").build();
        ContainerResponseModel response = ContainerResponseModel.builder().containerID("123").build();

        when(containerMapper.containerRequestModelToContainer(request)).thenReturn(mapped);
        when(containerRepository.save(any(Container.class))).thenReturn(saved);
        when(containerMapper.containerToContainerResponseModel(saved)).thenReturn(response);

        // EXPECTATION: External API Fails with 500
        mockServer.expect(ExpectedCount.once(), requestTo("https://api.kleff.io/api/v1/deployment/build"))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        // Act
        ContainerResponseModel result = containerService.createContainer(request);

        // Assert
        mockServer.verify();
        verify(containerRepository).save(any(Container.class)); // DB save still happened
        assertThat(result).isNotNull(); // User still got a response
    }
}