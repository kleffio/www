package com.kleff.projectmanagementservice.mappinglayer.invitation;

import com.kleff.projectmanagementservice.datalayer.invitation.Invitation;
import com.kleff.projectmanagementservice.presentationlayer.invitation.InvitationResponseModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InvitationResponseMapper {

    @Mappings({
        @Mapping(source = "id", target = "id"),
        @Mapping(source = "projectId", target = "projectId"),
        @Mapping(source = "inviterId", target = "inviterId"),
        @Mapping(source = "inviteeEmail", target = "inviteeEmail"),
        @Mapping(source = "role", target = "role"),
        @Mapping(source = "customRoleId", target = "customRoleId"),
        @Mapping(source = "status", target = "status"),
        @Mapping(source = "expiresAt", target = "expiresAt"),
        @Mapping(source = "createdAt", target = "createdAt"),
        @Mapping(source = "updatedAt", target = "updatedAt")
    })
    InvitationResponseModel toResponseModel(Invitation invitation);

    List<InvitationResponseModel> entityListToResponseList(List<Invitation> list);
}
