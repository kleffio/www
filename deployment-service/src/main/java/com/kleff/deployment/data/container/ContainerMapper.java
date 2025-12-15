package com.kleff.deployment.data.container;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.Map;

@Mapper(componentModel = "spring")
public interface ContainerMapper {

    @Mapping(target = "envVariables", source = "envVariables", qualifiedByName = "jsonToMap")
    ContainerResponseModel containerToContainerResponseModel(Container container);
    
    List<ContainerResponseModel> containerToContainerResponseModel(List<Container> container);
    
    @Mapping(target = "envVariables", source = "envVariables", qualifiedByName = "mapToJson")
    Container containerRequestModelToContainer(ContainerRequestModel containerRequest);
    
    @Named("mapToJson")
    default String mapToJson(Map<String, String> map) {
        if (map == null || map.isEmpty()) {
            return null;
        }
        try {
            return new ObjectMapper().writeValueAsString(map);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
    
    @Named("jsonToMap")
    default Map<String, String> jsonToMap(String json) {
        if (json == null || json.isEmpty()) {
            return null;
        }
        try {
            return new ObjectMapper().readValue(json, Map.class);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}
