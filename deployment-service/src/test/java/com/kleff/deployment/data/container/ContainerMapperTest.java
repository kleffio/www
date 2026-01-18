package com.kleff.deployment.data.container;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ContainerMapperTest {

    private ContainerMapper containerMapper;

    @BeforeEach
    void setUp() {
        containerMapper = Mappers.getMapper(ContainerMapper.class);
    }

    @Test
    void containerToContainerResponseModel_shouldMapContainerToResponseModel() {
        // Given
        Container container = Container.builder()
                .containerID("test-id")
                .projectID("project-1")
                .name("test-container")
                .status("Running")
                .image("test-image:latest")
                .port(8080)
                .createdAt(LocalDateTime.now())
                .repoUrl("https://github.com/example/repo")
                .branch("main")
                .envVariables("{\"KEY1\":\"value1\",\"KEY2\":\"value2\"}")
                .build();

        // When
        ContainerResponseModel responseModel = containerMapper.containerToContainerResponseModel(container);

        // Then
        assertThat(responseModel).isNotNull();
        assertThat(responseModel.getContainerID()).isEqualTo(container.getContainerID());
        assertThat(responseModel.getProjectID()).isEqualTo(container.getProjectID());
        assertThat(responseModel.getName()).isEqualTo(container.getName());
        assertThat(responseModel.getStatus()).isEqualTo(container.getStatus());
        assertThat(responseModel.getImage()).isEqualTo(container.getImage());
        assertThat(responseModel.getPort()).isEqualTo(container.getPort());
        assertThat(responseModel.getCreatedAt()).isEqualTo(container.getCreatedAt());
        assertThat(responseModel.getRepoUrl()).isEqualTo(container.getRepoUrl());
        assertThat(responseModel.getBranch()).isEqualTo(container.getBranch());
        assertThat(responseModel.getEnvVariables())
                .hasSize(2)
                .containsEntry("KEY1", "value1")
                .containsEntry("KEY2", "value2");
    }

    @Test
    void containerToContainerResponseModel_shouldHandleEmptyEnvVariables() {
        // Given
        Container container = Container.builder()
                .containerID("test-id")
                .envVariables(null) // Test null
                .build();

        // When
        ContainerResponseModel responseModel = containerMapper.containerToContainerResponseModel(container);

        // Then
        assertThat(responseModel.getEnvVariables()).isNull();

        // Test empty JSON object
        container.setEnvVariables("{}");
        responseModel = containerMapper.containerToContainerResponseModel(container);
        assertThat(responseModel.getEnvVariables()).isEmpty();
    }

    @Test
    void containerToContainerResponseModel_shouldMapListOfContainers() {
        // Given
        Container container1 = Container.builder().containerID("id1").name("container-1").build();
        Container container2 = Container.builder().containerID("id2").name("container-2").build();

        // When
        List<ContainerResponseModel> responseModels = containerMapper.containerToContainerResponseModel(
                List.of(container1, container2));

        // Then
        assertThat(responseModels).hasSize(2);
        assertThat(responseModels.get(0).getContainerID()).isEqualTo("id1");
        assertThat(responseModels.get(1).getContainerID()).isEqualTo("id2");
    }

    @Test
    void containerRequestModelToContainer_shouldMapRequestModelToContainer() {
        // Given
        ContainerRequestModel requestModel = ContainerRequestModel.builder()
                .containerID("test-id")
                .projectID("project-1")
                .name("test-container")
                .image("test-image:latest")
                .port(8080)
                .repoUrl("https://github.com/example/repo")
                .branch("main")
                .envVariables(Map.of("KEY1", "value1", "KEY2", "value2"))
                .build();

        // When
        Container container = containerMapper.containerRequestModelToContainer(requestModel);

        // Then
        assertThat(container).isNotNull();
        assertThat(container.getContainerID()).isEqualTo(requestModel.getContainerID());
        assertThat(container.getProjectID()).isEqualTo(requestModel.getProjectID());
        assertThat(container.getName()).isEqualTo(requestModel.getName());
        assertThat(container.getImage()).isEqualTo(requestModel.getImage());
        assertThat(container.getPort()).isEqualTo(requestModel.getPort());
        assertThat(container.getRepoUrl()).isEqualTo(requestModel.getRepoUrl());
        assertThat(container.getBranch()).isEqualTo(requestModel.getBranch());
        assertThat(container.getStatus()).isEqualTo("Pending"); // Default from @Mapping
        assertThat(container.getCreatedAt()).isNotNull(); // Should be set by @Mapping
        
        // Verify envVariables JSON string
        assertThat(container.getEnvVariables()).isNotNull();
        assertThat(container.getEnvVariables())
                .contains("\"KEY1\":\"value1\"")
                .contains("\"KEY2\":\"value2\"");
    }

    @Test
    void containerRequestModelToContainer_shouldHandleNullAndEmptyValues() {
        // Given
        ContainerRequestModel requestModel = ContainerRequestModel.builder()
                .envVariables(null) // Test null
                .build();

        // When
        Container container = containerMapper.containerRequestModelToContainer(requestModel);

        // Then
        assertThat(container.getEnvVariables()).isNull();

        // Test empty map
        requestModel.setEnvVariables(Map.of());
        container = containerMapper.containerRequestModelToContainer(requestModel);
        assertThat(container.getEnvVariables()).isNull(); // Because the mapper returns null for empty maps
    }
}
