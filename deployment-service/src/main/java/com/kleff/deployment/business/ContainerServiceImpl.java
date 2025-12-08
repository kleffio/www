package com.kleff.deployment.business;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kleff.deployment.data.container.*;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContainerServiceImpl {

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

    public Container getContainerByContainerId(String containerId) {
        try {
            return containerRepository.findContainerByContainerID(containerId);
        } catch (Exception e) {
            return null;
        }
    }

    public List<Container> getContainersByProjectID(String projectID) {
        try {
            return containerRepository.findContainersByProjectID(projectID);
        } catch (Exception e) {
            return null;
        }
    }

    public ContainerResponseModel createContainer(ContainerRequestModel containerRequestModel) {
        Container container = containerMapper.containerRequestModelToContainer(containerRequestModel);
        container.setStatus("Running"); 
        container.setCreatedAt(LocalDateTime.now());
        
        Container savedContainer = containerRepository.save(container);

        triggerBuildDeployment(containerRequestModel);

        return containerMapper.containerToContainerResponseModel(savedContainer);
    }

    private void triggerBuildDeployment(ContainerRequestModel request) {
        String deploymentServiceUrl = "https://api.kleff.io/api/v1/deployment/build"; 

        GoBuildRequest buildRequest = new GoBuildRequest(
                request.getRepoUrl(),
                request.getBranch(),
                request.getImage(),
                request.getPort()
        );

        try {
            restTemplate.postForObject(deploymentServiceUrl, buildRequest, String.class);
            System.out.println("Build triggered successfully for: " + request.getName());
        } catch (Exception e) {
            System.err.println("Failed to trigger build service: " + e.getMessage());
        }
    }

    private static class GoBuildRequest {
        @JsonProperty("repo_url")
        private String repoUrl;

        @JsonProperty("branch")
        private String branch;

        @JsonProperty("image_name")
        private String imageName;

        @JsonProperty("app_port")
        private int appPort;

        public GoBuildRequest(String repoUrl, String branch, String imageName, int appPort) {
            this.repoUrl = repoUrl;
            this.branch = (branch == null || branch.isEmpty()) ? "main" : branch;
            this.imageName = imageName;
            this.appPort = appPort;
        }
        
        public String getRepoUrl() { return repoUrl; }
        public String getBranch() { return branch; }
        public String getImageName() { return imageName; }
        public int getAppPort() { return appPort; }
    }
}