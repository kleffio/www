package org.example.dataaccess;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NodeMetric {
    private String name;
    private String status;
    private double cpuUsagePercent;
    private double memoryUsagePercent;
    private double diskUsagePercent;
    private int podCount;
}