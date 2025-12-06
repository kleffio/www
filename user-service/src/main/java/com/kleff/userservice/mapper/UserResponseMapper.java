package com.kleff.userservice.mapper;

import com.kleff.userservice.dataaccess.User;
import com.kleff.userservice.presentation.models.UserResponseModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserResponseMapper {

    @Mapping(target = "authentikUid", source = "authentikUid")
    UserResponseModel toModel(User user);
}
