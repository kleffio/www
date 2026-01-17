package com.kleff.projectmanagementservice.mappinglayer.collaborator;

import com.kleff.projectmanagementservice.datalayer.collaborator.Collaborator;
import com.kleff.projectmanagementservice.presentationlayer.collaborator.CollaboratorResponseModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CollaboratorResponseMapper {

    @Mappings({
        @Mapping(source = "id", target = "id"),
        @Mapping(source = "projectId", target = "projectId"),
        @Mapping(source = "userId", target = "userId"),
        @Mapping(source = "role", target = "role"),
        @Mapping(source = "collaboratorStatus", target = "status"),
        @Mapping(source = "permissions", target = "permissions"),
        @Mapping(source = "invitedBy", target = "invitedBy"),
        @Mapping(source = "invitedAt", target = "invitedAt"),
        @Mapping(source = "acceptedAt", target = "acceptedAt"),
        @Mapping(source = "createdAt", target = "createdAt"),
        @Mapping(source = "updatedAt", target = "updatedAt")
    })
    CollaboratorResponseModel toResponseModel(Collaborator collaborator);

    List<CollaboratorResponseModel> entityListToResponseList(List<Collaborator> list);
}
