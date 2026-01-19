package com.kleff.projectmanagementservice.buisnesslayer.customrole;

import com.kleff.projectmanagementservice.presentationlayer.customrole.CustomRoleRequestModel;
import com.kleff.projectmanagementservice.presentationlayer.customrole.CustomRoleResponseModel;

import java.util.List;

public interface CustomRoleService {
    CustomRoleResponseModel createCustomRole(CustomRoleRequestModel request, String createdBy);
    List<CustomRoleResponseModel> getProjectCustomRoles(String projectId);
    CustomRoleResponseModel updateCustomRole(Integer roleId, CustomRoleRequestModel request);
    void deleteCustomRole(Integer roleId);
}
