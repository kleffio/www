package com.kleff.projectmanagementservice.datalayer.collaborator;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface collaboratorRepository extends JpaRepository<Collaborator, Integer> {
    Optional<Collaborator> findByProjectIdAndUserId(String projectId, String userId);

    List<Collaborator> findByProjectId(String projectId);

    boolean existsByProjectIdAndUserId(String projectId, String userId);
}