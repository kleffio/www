package org.example.business;

import java.util.List;

import org.example.dataaccess.ClusterOverview;
import org.example.dataaccess.DatabaseMetrics;
import org.example.dataaccess.MetricCard;
import org.example.dataaccess.NamespaceMetric;
import org.example.dataaccess.NodeMetric;
import org.example.dataaccess.ResourceUtilization;
import org.example.dataaccess.UnhealthyPod;


public interface MetricsService {

    // Overview metrics
    ClusterOverview getClusterOverview();

    // Node metrics
    List<NodeMetric> getNodeMetrics();

    // Namespace metrics
    List<NamespaceMetric> getNamespaceMetrics();

    // Unhealthy pods
    List<UnhealthyPod> getUnhealthyPods();

    // Time-series data for charts
    ResourceUtilization getCpuUtilization(String duration);

    ResourceUtilization getMemoryUtilization(String duration);

    // Metric cards with sparklines
    MetricCard getPodCountMetric(String duration);

    MetricCard getNodeCountMetric(String duration);

    MetricCard getRequestCountMetric(String duration);

    // Database metrics
    DatabaseMetrics getDatabaseIoMetrics(String duration);

    MetricCard getTenantCountMetric(String duration);
}