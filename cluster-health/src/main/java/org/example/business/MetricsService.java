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

    ClusterOverview getClusterOverview();

    List<NodeMetric> getNodeMetrics();

    List<NamespaceMetric> getNamespaceMetrics();

    List<UnhealthyPod> getUnhealthyPods();

    ResourceUtilization getCpuUtilization(String duration);

    ResourceUtilization getMemoryUtilization(String duration);

    MetricCard getPodCountMetric(String duration);

    MetricCard getNodeCountMetric(String duration);

    MetricCard getRequestCountMetric(String duration);

    DatabaseMetrics getDatabaseIoMetrics(String duration);

    MetricCard getTenantCountMetric(String duration);
}