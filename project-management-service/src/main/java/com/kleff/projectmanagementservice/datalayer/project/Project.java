package com.kleff.projectmanagementservice.datalayer.project;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    String projectId;
    String name;
    String description;
    String ownerId;
    String repositoryUrl;
    String branch;
    String dockerComposePath;
    Map<String, String> environmentVariables;
    ProjectStatus projectStatus;
    Date createdDate;
    Date updatedDate;

}
