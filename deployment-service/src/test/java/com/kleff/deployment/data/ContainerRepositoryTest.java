package com.kleff.deployment.data;

import com.kleff.deployment.data.container.Container;
import com.kleff.deployment.data.container.ContainerRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ContainerRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ContainerRepository containerRepository;

    @Test
    @DisplayName("Happy Path: Find Container by generated ContainerID")
    void whenFindContainerByContainerID_thenReturnContainer() {
        // Arrange
        Container container = Container.builder()
                .projectID("proj-123")
                .name("test-container")
                .image("nginx:latest")
                .port(8080)
                .createdAt(LocalDateTime.now())
                .status("Running")
                .build();

        // Persist and flush to ensure ID is generated
        Container savedContainer = entityManager.persistFlushFind(container);

        // Act
        Container found = containerRepository.findContainerByContainerID(savedContainer.getContainerID());

        // Assert
        assertThat(found).isNotNull();
        assertThat(found.getContainerID()).isEqualTo(savedContainer.getContainerID());
        assertThat(found.getName()).isEqualTo("test-container");
    }

    @Test
    @DisplayName("Edge Case: Find Container by non-existent ID returns null")
    void whenInvalidContainerID_thenReturnNull() {
        // Act
        Container found = containerRepository.findContainerByContainerID("non-existent-uuid");

        // Assert
        assertThat(found).isNull();
    }

    @Test
    @DisplayName("Happy Path: Find Containers by ProjectID")
    void whenFindContainersByProjectID_thenReturnList() {
        // Arrange
        String projectID = "proj-alpha";
        Container c1 = Container.builder().projectID(projectID).name("c1").build();
        Container c2 = Container.builder().projectID(projectID).name("c2").build();
        Container c3 = Container.builder().projectID("proj-beta").name("c3").build(); // Different project

        entityManager.persist(c1);
        entityManager.persist(c2);
        entityManager.persist(c3);
        entityManager.flush();

        // Act
        List<Container> results = containerRepository.findContainersByProjectID(projectID);

        // Assert
        assertThat(results).hasSize(2);
        assertThat(results).extracting(Container::getName).containsExactlyInAnyOrder("c1", "c2");
    }

    @Test
    @DisplayName("Edge Case: Find Containers by ProjectID with no matches returns empty list")
    void whenProjectIDHasNoContainers_thenReturnEmptyList() {
        // Act
        List<Container> results = containerRepository.findContainersByProjectID("empty-project-id");

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).isEmpty();
    }
}