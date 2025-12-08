package com.kleff.deployment.data.container;

import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ContainerMapper {

    ContainerResponseModel containerToContainerResponseModel(Container container);
    List<ContainerResponseModel> containerToContainerResponseModel(List<Container> container);
    Container containerRequestModelToContainer(ContainerRequestModel containerRequest);
}
