package com.kleff.projectmanagementservice.mappinglayer.collaborator;

import com.kleff.projectmanagementservice.datalayer.collaborator.Collaborator;
import com.kleff.projectmanagementservice.presentationlayer.collaborator.CollaboratorRequestModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface CollaboratorRequestMapper {

    @Mappings({
        @Mapping(source = "projectId", target = "projectId"),
        @Mapping(source = "userId", target = "userId"),
        @Mapping(source = "role", target = "role"),
        @Mapping(source = "permissions", target = "permissions"),
        @Mapping(target = "id", ignore = true),
        @Mapping(target = "collaboratorStatus", ignore = true),
        @Mapping(target = "invitedBy", ignore = true),
        @Mapping(target = "invitedAt", ignore = true),
        @Mapping(target = "acceptedAt", ignore = true),
        @Mapping(target = "createdAt", ignore = true),
        @Mapping(target = "updatedAt", ignore = true)
    })
    Collaborator requestToEntity(CollaboratorRequestModel request);
}
