package com.kleff.projectmanagementservice.datalayer.project;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table("projects")
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
    //Currently impossible to use we need to figure out a better way of storing them
//    Map<String, String> environmentVariables;
    ProjectStatus projectStatus;
    Date createdDate;
    Date updatedDate;

}
