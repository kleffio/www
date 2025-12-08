package com.kleff.deployment.data.container;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContainerRepository extends JpaRepository<Container, String> {
    Container findContainerByContainerID(String containerID);
    List<Container> findContainersByProjectID(String projectID);
}
