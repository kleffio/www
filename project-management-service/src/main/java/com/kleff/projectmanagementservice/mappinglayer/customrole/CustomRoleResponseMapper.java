package com.kleff.projectmanagementservice.mappinglayer.customrole;

import com.kleff.projectmanagementservice.datalayer.customrole.CustomRole;
import com.kleff.projectmanagementservice.presentationlayer.customrole.CustomRoleResponseModel;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CustomRoleResponseMapper {
    CustomRoleResponseModel toResponseModel(CustomRole customRole);
    List<CustomRoleResponseModel> entityListToResponseList(List<CustomRole> customRoles);
}
