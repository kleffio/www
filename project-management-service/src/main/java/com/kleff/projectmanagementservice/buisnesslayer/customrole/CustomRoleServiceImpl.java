package com.kleff.projectmanagementservice.buisnesslayer.customrole;

import com.kleff.projectmanagementservice.datalayer.customrole.CustomRole;
import com.kleff.projectmanagementservice.datalayer.customrole.CustomRoleRepository;
import com.kleff.projectmanagementservice.mappinglayer.customrole.CustomRoleRequestMapper;
import com.kleff.projectmanagementservice.mappinglayer.customrole.CustomRoleResponseMapper;
import com.kleff.projectmanagementservice.presentationlayer.customrole.CustomRoleRequestModel;
import com.kleff.projectmanagementservice.presentationlayer.customrole.CustomRoleResponseModel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomRoleServiceImpl implements CustomRoleService {

    private final CustomRoleRepository customRoleRepository;
    private final CustomRoleRequestMapper requestMapper;
    private final CustomRoleResponseMapper responseMapper;

    @Override
    public CustomRoleResponseModel createCustomRole(CustomRoleRequestModel request, String createdBy) {
        // Check if role name already exists for this project
        if (customRoleRepository.existsByProjectIdAndName(request.getProjectId(), request.getName())) {
            throw new IllegalArgumentException("A custom role with this name already exists for this project");
        }

        CustomRole customRole = requestMapper.requestToEntity(request);
        customRole.setCreatedBy(createdBy);

        CustomRole saved = customRoleRepository.save(customRole);
        return responseMapper.toResponseModel(saved);
    }

    @Override
    public List<CustomRoleResponseModel> getProjectCustomRoles(String projectId) {
        List<CustomRole> customRoles = customRoleRepository.findByProjectId(projectId);
        return responseMapper.entityListToResponseList(customRoles);
    }

    @Override
    public CustomRoleResponseModel updateCustomRole(Integer roleId, CustomRoleRequestModel request) {
        CustomRole customRole = customRoleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Custom role not found"));

        customRole.setName(request.getName());
        customRole.setDescription(request.getDescription());
        customRole.setPermissions(request.getPermissions());

        CustomRole updated = customRoleRepository.save(customRole);
        return responseMapper.toResponseModel(updated);
    }

    @Override
    public void deleteCustomRole(Integer roleId) {
        customRoleRepository.deleteById(roleId);
    }
}
