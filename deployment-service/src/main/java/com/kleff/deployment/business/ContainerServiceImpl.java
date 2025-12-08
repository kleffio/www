package com.kleff.deployment.business;

import com.kleff.deployment.data.container.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Service
public class ContainerServiceImpl  {

    private final ContainerRepository containerRepository;
    private final ContainerMapper containerMapper;

    public ContainerServiceImpl(ContainerRepository containerRepository,  ContainerMapper containerMapper) {
        this.containerRepository = containerRepository;
        this.containerMapper = containerMapper;
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
        Container container = new Container();
        container = containerMapper.containerRequestModelToContainer(containerRequestModel);
        container.setCreatedAt(LocalDateTime.now());
        return containerMapper.containerToContainerResponseModel(containerRepository.save(container));
    }
}
