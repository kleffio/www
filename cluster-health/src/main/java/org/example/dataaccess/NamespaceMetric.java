package org.example.dataaccess;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NamespaceMetric {
    private String name;
    private int podCount;
    private double cpuCores;
    private double memoryMB;
}