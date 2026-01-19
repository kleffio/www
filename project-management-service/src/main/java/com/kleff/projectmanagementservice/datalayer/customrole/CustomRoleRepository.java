package com.kleff.projectmanagementservice.datalayer.customrole;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomRoleRepository extends JpaRepository<CustomRole, Integer> {
    List<CustomRole> findByProjectId(String projectId);
    boolean existsByProjectIdAndName(String projectId, String name);
}
