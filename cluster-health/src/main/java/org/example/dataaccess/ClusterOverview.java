package org.example.dataaccess;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClusterOverview {
    private int totalNodes;
    private int runningNodes;
    private int totalPods;
    private int totalNamespaces;
    private double cpuUsagePercent;
    private double memoryUsagePercent;
}