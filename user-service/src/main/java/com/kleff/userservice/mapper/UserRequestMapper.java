package com.kleff.userservice.mapper;

import com.kleff.userservice.dataaccess.User;
import com.kleff.userservice.presentation.models.UserRequestModel;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UserRequestMapper {

    @Mapping(target = "authentikUid", source = "authentikUid")
    User toEntity(UserRequestModel model, String authentikUid);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(UserRequestModel model, @MappingTarget User user);
}
