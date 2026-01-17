package com.kleff.projectmanagementservice.mappinglayer.invitation;

import com.kleff.projectmanagementservice.datalayer.invitation.Invitation;
import com.kleff.projectmanagementservice.presentationlayer.invitation.InvitationRequestModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface InvitationRequestMapper {

    @Mappings({
        @Mapping(source = "projectId", target = "projectId"),
        @Mapping(source = "inviteeEmail", target = "inviteeEmail"),
        @Mapping(source = "role", target = "role")
    })
    Invitation requestToEntity(InvitationRequestModel request);
}
