package com.kleff.projectmanagementservice.datalayer.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
    Project findByProjectId(String projectId);
}
