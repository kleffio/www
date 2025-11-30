package com.kleff.projectmanagementservice.datalayer.project;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;

import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID projectId;
    String name;
    String description;
    String ownerId;
    String repositoryUrl;
    String branch;
    String dockerComposePath;
    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    Map<String, String> environmentVariables;
    ProjectStatus projectStatus;
    Date createdDate;
    Date updatedDate;

}
