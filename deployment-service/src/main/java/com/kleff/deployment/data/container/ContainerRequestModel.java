package com.kleff.deployment.data.container;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContainerRequestModel {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String containerID;
    private String projectID;
    private String name;
    private String image;
    private int port;
    private String repoUrl; 
    private String branch;
}
