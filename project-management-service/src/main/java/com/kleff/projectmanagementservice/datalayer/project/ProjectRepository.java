package com.kleff.projectmanagementservice.datalayer.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
    Project findByProjectId(String projectId);

    List<Project> findByOwnerIdEquals(String userId);

    @Query("SELECT p.project_i FROM projects p")
    List<String> getAllProjectIds();
}
