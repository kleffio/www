package com.kleff.projectmanagementservice.datalayer.project;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface ProjectRepository extends ReactiveCrudRepository<Project, String> {
    Mono<Project> findByProjectId(String projectId);
}
