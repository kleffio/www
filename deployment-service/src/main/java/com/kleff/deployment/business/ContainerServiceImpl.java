package com.kleff.deployment.business;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kleff.deployment.data.container.*;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ContainerServiceImpl {

    private static final Logger log = LoggerFactory.getLogger(ContainerServiceImpl.class);

    private final ContainerRepository containerRepository;
    private final ContainerMapper containerMapper;
    private final RestTemplate restTemplate;

    public ContainerServiceImpl(ContainerRepository containerRepository, 
                                ContainerMapper containerMapper,
                                RestTemplateBuilder restTemplateBuilder) {
        this.containerRepository = containerRepository;
        this.containerMapper = containerMapper;
        this.restTemplate = restTemplateBuilder.build();
    }

    public List<ContainerResponseModel> getAllContainers() {
        return containerMapper.containerToContainerResponseModel(containerRepository.findAll());
    }
    public ContainerResponseModel toResponseModel(Container container) {
        return containerMapper.containerToContainerResponseModel(container);
    }

    public Container getContainerByContainerId(String containerId) {
        try {
            return containerRepository.findContainerByContainerID(containerId);
        } catch (Exception e) {
            log.error("Error finding container with ID {}: {}", containerId, e.getMessage());
            return null;
        }
    }

    public List<Container> getContainersByProjectID(String projectID) {
        return containerRepository.findContainersByProjectID(projectID);
    }

    public ContainerResponseModel createContainer(ContainerRequestModel containerRequestModel) {
        Container container = containerMapper.containerRequestModelToContainer(containerRequestModel);
        container.setStatus("Running"); 
        container.setCreatedAt(LocalDateTime.now());
        
        Container savedContainer = containerRepository.save(container);

        // FIX: Pass both the request and the ID from the saved object
        triggerBuildDeployment(containerRequestModel, savedContainer.getContainerID());

        return containerMapper.containerToContainerResponseModel(savedContainer);
    }

    public ContainerResponseModel updateContainer(String containerID, ContainerRequestModel request) {
        Container existingContainer = containerRepository.findContainerByContainerID(containerID);
        if (existingContainer == null) {
            throw new RuntimeException("Container not found with ID: " + containerID);
        }

        existingContainer.setName(request.getName());
        existingContainer.setRepoUrl(request.getRepoUrl());
        existingContainer.setBranch(request.getBranch());
        existingContainer.setPort(request.getPort());
        existingContainer.setProjectID(request.getProjectID());
        
        if (request.getEnvVariables() != null) {
            existingContainer.setEnvVariables(containerMapper.mapToJson(request.getEnvVariables()));
        }

        Container updatedContainer = containerRepository.save(existingContainer);

        // FIX: Pass both the request and the containerID
        triggerBuildDeployment(request, containerID);

        return containerMapper.containerToContainerResponseModel(updatedContainer);
    }

    public ContainerResponseModel updateContainerEnvVariables(String containerID, Map<String, String> envVariables) {
        Container container = containerRepository.findContainerByContainerID(containerID);
        if (container == null) {
            throw new RuntimeException("Container not found with ID: " + containerID);
        }

        container.setEnvVariables(containerMapper.mapToJson(envVariables));
        Container updatedContainer = containerRepository.save(container);

        triggerWebAppUpdate(container, envVariables);

        return containerMapper.containerToContainerResponseModel(updatedContainer);
    }

    private void triggerBuildDeployment(ContainerRequestModel request, String containerID) {
        String deploymentServiceUrl = "http://deployment-backend-service.kleff-deployment.svc.cluster.local/api/v1/build/create"; 

        GoBuildRequest buildRequest = new GoBuildRequest(
                containerID,
                request.getProjectID(),
                request.getRepoUrl(),
                request.getBranch(),
                request.getPort(),
                request.getName(),
                request.getEnvVariables()
        );

        try {
            restTemplate.postForObject(deploymentServiceUrl, buildRequest, String.class);
            log.info("Update/Build triggered successfully for: {}", request.getName());
        } catch (Exception e) {
            log.error("Failed to trigger build service for {}: {}", request.getName(), e.getMessage());
        }
    }

    private void triggerWebAppUpdate(Container container, Map<String, String> envVariables) {
        String updateServiceUrl = "https://api.kleff.io/api/v1/webapp/update";

        Map<String, Object> updateRequest = Map.of(
            "projectID", container.getProjectID(),
            "name", container.getName(),
            "envVariables", envVariables
        );

        try {
            // Note: RestTemplate.patchForObject requires a specific HttpComponents client to work correctly 
            // with some APIs. If this fails, consider using restTemplate.postForObject or exchange.
            restTemplate.patchForObject(updateServiceUrl, updateRequest, String.class);
            log.info("WebApp update triggered successfully for: {}", container.getName());
        } catch (Exception e) {
            log.error("Failed to trigger WebApp update: {}", e.getMessage());
        }
    }

    // Static Inner DTO
    private static class GoBuildRequest {
        @JsonProperty("containerID") private String containerID;
        @JsonProperty("projectID") private String projectID;
        @JsonProperty("repoUrl") private String repoUrl;
        @JsonProperty("branch") private String branch;
        @JsonProperty("port") private int port;
        @JsonProperty("name") private String name;
        @JsonProperty("envVariables") private Map<String, String> envVariables;

        public GoBuildRequest(String containerID, String projectID, String repoUrl, String branch, int port, String name, Map<String, String> envVariables) {
            this.containerID = containerID;
            this.projectID = projectID;
            this.repoUrl = repoUrl;
            this.branch = (branch == null || branch.isEmpty()) ? "main" : branch;
            this.port = port;
            this.name = name;
            this.envVariables = envVariables;
        }
    }
}
