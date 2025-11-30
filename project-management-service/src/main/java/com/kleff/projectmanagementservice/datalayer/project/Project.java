package com.kleff.projectmanagementservice.datalayer.project;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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
    private String projectId;
    private String name;
    private String description;
    private String ownerId;
    private String repositoryUrl;
    private String branch;
    private String dockerComposePath;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, String> environmentVariables;
    private ProjectStatus projectStatus;
    private Date createdDate;
    private Date updatedDate;
}
