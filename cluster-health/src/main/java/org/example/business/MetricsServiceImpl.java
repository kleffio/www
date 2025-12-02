package org.example.business;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.example.dataaccess.ClusterOverview;
import org.example.dataaccess.DatabaseMetrics;
import org.example.dataaccess.MetricCard;
import org.example.dataaccess.NamespaceMetric;
import org.example.dataaccess.NodeMetric;
import org.example.dataaccess.ResourceUtilization;
import org.example.dataaccess.TimeSeriesDataPoint;
import org.example.dataaccess.UnhealthyPod;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class MetricsServiceImpl implements MetricsService {

    private final String prometheusUrl;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public MetricsServiceImpl(
            @Value("${prometheus.url}") String prometheusUrl,
            WebClient webClient) {
        this.prometheusUrl = prometheusUrl;
        this.webClient = webClient;
        this.objectMapper = new ObjectMapper();
        log.info("MetricsService initialized with Prometheus URL: {}", prometheusUrl);
    }


    private String executeQuery(String query) {
        try {
            log.debug("Executing query: {}", query);

            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String fullUrlString = prometheusUrl + "/api/v1/query?query=" + encodedQuery;
            URI fullUri = new URI(fullUrlString);

            String result = webClient.get()
                    .uri(fullUri)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.debug("Query successful");
            return result;

        } catch (Exception e) {
            log.error("Error executing query: {}", e.getMessage());
            throw new RuntimeException("Failed to query Prometheus: " + e.getMessage(), e);
        }
    }

    private String executeRangeQuery(String query, String start, String end, String step) {
        try {
            log.debug("Executing range query: {}", query);

            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String fullUrlString = prometheusUrl + "/api/v1/query_range?query=" + encodedQuery
                    + "&start=" + start
                    + "&end=" + end
                    + "&step=" + step;
            URI fullUri = new URI(fullUrlString);

            String result = webClient.get()
                    .uri(fullUri)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.debug("Range query successful");
            return result;

        } catch (Exception e) {
            log.error("Error executing range query: {}", e.getMessage());
            throw new RuntimeException("Failed to query Prometheus: " + e.getMessage(), e);
        }
    }


    private double parseSingleValue(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode result = root.path("data").path("result");

            if (result.isArray() && result.size() > 0) {
                JsonNode value = result.get(0).path("value");
                if (value.isArray() && value.size() > 1) {
                    return Double.parseDouble(value.get(1).asText());
                }
            }
            return 0.0;
        } catch (Exception e) {
            log.error("Error parsing single value: {}", e.getMessage());
            return 0.0;
        }
    }

    private Map<String, Double> parseMultipleValues(String jsonResponse, String labelKey) {
        Map<String, Double> results = new HashMap<>();
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode resultArray = root.path("data").path("result");

            if (resultArray.isArray()) {
                for (JsonNode item : resultArray) {
                    String label = item.path("metric").path(labelKey).asText();
                    JsonNode value = item.path("value");
                    if (value.isArray() && value.size() > 1) {
                        double val = Double.parseDouble(value.get(1).asText());
                        results.put(label, val);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error parsing multiple values: {}", e.getMessage());
        }
        return results;
    }

    private List<TimeSeriesDataPoint> parseTimeSeriesData(String jsonResponse) {
        List<TimeSeriesDataPoint> dataPoints = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode resultArray = root.path("data").path("result");

            if (resultArray.isArray() && resultArray.size() > 0) {
                JsonNode values = resultArray.get(0).path("values");

                for (JsonNode point : values) {
                    if (point.isArray() && point.size() >= 2) {
                        long timestamp = point.get(0).asLong();
                        double value = Double.parseDouble(point.get(1).asText());

                        dataPoints.add(TimeSeriesDataPoint.builder()
                                .timestamp(timestamp)
                                .value(Math.round(value * 100.0) / 100.0)
                                .build());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error parsing time-series data: {}", e.getMessage());
        }
        return dataPoints;
    }

    // ==================== SERVICE METHODS ====================

    @Override
    public ClusterOverview getClusterOverview() {
        log.info("Fetching cluster overview");

        String nodesQuery = "count(kube_node_info)";
        double totalNodes = parseSingleValue(executeQuery(nodesQuery));

        String runningNodesQuery = "count(kube_node_status_condition{condition=\"Ready\",status=\"true\"})";
        double runningNodes = parseSingleValue(executeQuery(runningNodesQuery));

        String podsQuery = "count(kube_pod_info)";
        double totalPods = parseSingleValue(executeQuery(podsQuery));

        String namespacesQuery = "count(count by (namespace) (kube_pod_info))";
        double totalNamespaces = parseSingleValue(executeQuery(namespacesQuery));

        String cpuQuery = "100 * sum(rate(container_cpu_usage_seconds_total{container!=\"\"}[5m])) / sum(machine_cpu_cores)";
        double cpuUsage = parseSingleValue(executeQuery(cpuQuery));

        String memoryQuery = "100 * sum(container_memory_working_set_bytes{container!=\"\"}) / sum(machine_memory_bytes)";
        double memoryUsage = parseSingleValue(executeQuery(memoryQuery));

        return ClusterOverview.builder()
                .totalNodes((int) totalNodes)
                .runningNodes((int) runningNodes)
                .totalPods((int) totalPods)
                .totalNamespaces((int) totalNamespaces)
                .cpuUsagePercent(Math.round(cpuUsage * 10.0) / 10.0)
                .memoryUsagePercent(Math.round(memoryUsage * 10.0) / 10.0)
                .build();
    }

    @Override
    public List<NodeMetric> getNodeMetrics() {
        log.info("Fetching node metrics");
        List<NodeMetric> nodes = new ArrayList<>();

        String nodeNamesQuery = "kube_node_info";
        String nodeNamesResponse = executeQuery(nodeNamesQuery);

        try {
            JsonNode root = objectMapper.readTree(nodeNamesResponse);
            JsonNode resultArray = root.path("data").path("result");

            for (JsonNode item : resultArray) {
                String nodeName = item.path("metric").path("node").asText();

                String cpuQuery = String.format(
                        "100 * sum(rate(container_cpu_usage_seconds_total{node=\"%s\"}[5m])) / sum(machine_cpu_cores{node=\"%s\"})",
                        nodeName, nodeName
                );
                double cpuUsage = parseSingleValue(executeQuery(cpuQuery));

                String memoryQuery = String.format(
                        "100 * sum(container_memory_working_set_bytes{node=\"%s\"}) / sum(machine_memory_bytes{node=\"%s\"})",
                        nodeName, nodeName
                );
                double memoryUsage = parseSingleValue(executeQuery(memoryQuery));

                String diskQuery = String.format(
                        "100 * (1 - sum(node_filesystem_avail_bytes{node=\"%s\"}) / sum(node_filesystem_size_bytes{node=\"%s\"}))",
                        nodeName, nodeName
                );
                double diskUsage = parseSingleValue(executeQuery(diskQuery));

                String podCountQuery = String.format("count(kube_pod_info{node=\"%s\"})", nodeName);
                double podCount = parseSingleValue(executeQuery(podCountQuery));

                String statusQuery = String.format(
                        "kube_node_status_condition{node=\"%s\",condition=\"Ready\",status=\"true\"}",
                        nodeName
                );
                double statusValue = parseSingleValue(executeQuery(statusQuery));
                String status = statusValue > 0 ? "Ready" : "NotReady";

                nodes.add(NodeMetric.builder()
                        .name(nodeName)
                        .status(status)
                        .cpuUsagePercent(Math.round(cpuUsage * 10.0) / 10.0)
                        .memoryUsagePercent(Math.round(memoryUsage * 10.0) / 10.0)
                        .diskUsagePercent(Math.round(diskUsage * 10.0) / 10.0)
                        .podCount((int) podCount)
                        .build());
            }
        } catch (Exception e) {
            log.error("Error parsing node metrics: {}", e.getMessage());
        }

        return nodes;
    }

    @Override
    public List<NamespaceMetric> getNamespaceMetrics() {
        log.info("Fetching namespace metrics");
        List<NamespaceMetric> namespaces = new ArrayList<>();

        String podQuery = "count(kube_pod_info) by (namespace)";
        Map<String, Double> podCounts = parseMultipleValues(executeQuery(podQuery), "namespace");

        String cpuQuery = "sum(rate(container_cpu_usage_seconds_total[5m])) by (namespace)";
        Map<String, Double> cpuUsage = parseMultipleValues(executeQuery(cpuQuery), "namespace");

        String memoryQuery = "sum(container_memory_working_set_bytes) by (namespace)";
        Map<String, Double> memoryBytes = parseMultipleValues(executeQuery(memoryQuery), "namespace");

        for (String namespace : podCounts.keySet()) {
            double memoryMB = memoryBytes.getOrDefault(namespace, 0.0) / 1024.0 / 1024.0;

            namespaces.add(NamespaceMetric.builder()
                    .name(namespace)
                    .podCount(podCounts.get(namespace).intValue())
                    .cpuCores(Math.round(cpuUsage.getOrDefault(namespace, 0.0) * 1000.0) / 1000.0)
                    .memoryMB(Math.round(memoryMB * 10.0) / 10.0)
                    .build());
        }

        return namespaces;
    }

    @Override
    public List<UnhealthyPod> getUnhealthyPods() {
        log.info("Fetching unhealthy pods");
        List<UnhealthyPod> unhealthyPods = new ArrayList<>();

        String[] badPhases = {"Pending", "Failed", "Unknown"};

        for (String phase : badPhases) {
            String query = String.format("kube_pod_status_phase{phase=\"%s\"} == 1", phase);
            String response = executeQuery(query);

            try {
                JsonNode root = objectMapper.readTree(response);
                JsonNode resultArray = root.path("data").path("result");

                for (JsonNode item : resultArray) {
                    JsonNode metric = item.path("metric");
                    String podName = metric.path("pod").asText();
                    String namespace = metric.path("namespace").asText();

                    unhealthyPods.add(UnhealthyPod.builder()
                            .name(podName)
                            .namespace(namespace)
                            .phase(phase)
                            .issue(getIssueFromPhase(phase))
                            .build());
                }
            } catch (Exception e) {
                log.error("Error parsing unhealthy pods for phase {}: {}", phase, e.getMessage());
            }
        }

        return unhealthyPods;
    }

    @Override
    public ResourceUtilization getCpuUtilization(String duration) {
        log.info("Fetching CPU utilization for duration: {}", duration);

        String cpuQuery = "100 * sum(rate(container_cpu_usage_seconds_total{container!=\"\"}[5m])) / sum(machine_cpu_cores)";
        double currentCpu = parseSingleValue(executeQuery(cpuQuery));

        long now = System.currentTimeMillis() / 1000;
        long start = now - parseDuration(duration);
        List<TimeSeriesDataPoint> history = parseTimeSeriesData(
                executeRangeQuery(cpuQuery, String.valueOf(start), String.valueOf(now), "5m")
        );

        double changePercent = calculateChangePercent(history, currentCpu);
        String trend = determineTrend(changePercent);

        return ResourceUtilization.builder()
                .currentValue(Math.round(currentCpu * 10.0) / 10.0)
                .changePercent(Math.round(changePercent * 10.0) / 10.0)
                .trend(trend)
                .history(history)
                .build();
    }

    @Override
    public ResourceUtilization getMemoryUtilization(String duration) {
        log.info("Fetching memory utilization for duration: {}", duration);

        String memoryQuery = "100 * sum(container_memory_working_set_bytes{container!=\"\"}) / sum(machine_memory_bytes)";
        double currentMemory = parseSingleValue(executeQuery(memoryQuery));

        long now = System.currentTimeMillis() / 1000;
        long start = now - parseDuration(duration);
        List<TimeSeriesDataPoint> history = parseTimeSeriesData(
                executeRangeQuery(memoryQuery, String.valueOf(start), String.valueOf(now), "5m")
        );

        double changePercent = calculateChangePercent(history, currentMemory);
        String trend = determineTrend(changePercent);

        return ResourceUtilization.builder()
                .currentValue(Math.round(currentMemory * 10.0) / 10.0)
                .changePercent(Math.round(changePercent * 10.0) / 10.0)
                .trend(trend)
                .history(history)
                .build();
    }

    @Override
    public MetricCard getPodCountMetric(String duration) {
        log.info("Fetching pod count metric for duration: {}", duration);

        String podQuery = "count(kube_pod_info)";
        double currentPods = parseSingleValue(executeQuery(podQuery));

        long now = System.currentTimeMillis() / 1000;
        long start = now - parseDuration(duration);
        List<TimeSeriesDataPoint> sparkline = parseTimeSeriesData(
                executeRangeQuery(podQuery, String.valueOf(start), String.valueOf(now), "5m")
        );

        double changePercent = calculateChangePercent(sparkline, currentPods);

        return MetricCard.builder()
                .title("Total Pods")
                .value(formatLargeNumber(currentPods))
                .rawValue(currentPods)
                .changePercent(formatChangePercent(changePercent))
                .changeLabel("from last " + duration)
                .status(getMetricStatus(changePercent))
                .sparkline(sparkline)
                .build();
    }

    @Override
    public MetricCard getNodeCountMetric(String duration) {
        log.info("Fetching node count metric");

        String nodeQuery = "count(kube_node_info)";
        double currentNodes = parseSingleValue(executeQuery(nodeQuery));

        long now = System.currentTimeMillis() / 1000;
        long start = now - parseDuration(duration);
        List<TimeSeriesDataPoint> sparkline = parseTimeSeriesData(
                executeRangeQuery(nodeQuery, String.valueOf(start), String.valueOf(now), "5m")
        );

        double changePercent = calculateChangePercent(sparkline, currentNodes);

        return MetricCard.builder()
                .title("Cluster Nodes")
                .value(String.valueOf((int) currentNodes))
                .rawValue(currentNodes)
                .changePercent(formatChangePercent(changePercent))
                .changeLabel("from last " + duration)
                .status("excellent")
                .sparkline(sparkline)
                .build();
    }

    @Override
    public MetricCard getRequestCountMetric(String duration) {
        log.info("Fetching request count metric");

        String requestQuery = "sum(rate(container_network_receive_bytes_total[5m]))";
        double currentRequests = parseSingleValue(executeQuery(requestQuery));

        long now = System.currentTimeMillis() / 1000;
        long start = now - parseDuration(duration);
        List<TimeSeriesDataPoint> sparkline = parseTimeSeriesData(
                executeRangeQuery(requestQuery, String.valueOf(start), String.valueOf(now), "5m")
        );

        double changePercent = calculateChangePercent(sparkline, currentRequests);

        return MetricCard.builder()
                .title("Network Traffic")
                .value(formatBytes(currentRequests))
                .rawValue(currentRequests)
                .changePercent(formatChangePercent(changePercent))
                .changeLabel("from last " + duration)
                .status(getMetricStatus(changePercent))
                .sparkline(sparkline)
                .build();
    }

    @Override
    public DatabaseMetrics getDatabaseIoMetrics(String duration) {
        log.info("Fetching database I/O metrics for duration: {}", duration);

        long now = System.currentTimeMillis() / 1000;
        long start = now - parseDuration(duration);

       
        String dbPodFilter = "container=~\".*postgres.*|.*mysql.*|.*mariadb.*|.*mongodb.*|.*redis.*\"";
        
        
        String readBytesQuery = String.format(
            "sum(rate(container_fs_reads_bytes_total{%s}[5m]))", dbPodFilter
        );
        double currentReadBytes = parseSingleValue(executeQuery(readBytesQuery));
        List<TimeSeriesDataPoint> diskReadHistory = parseTimeSeriesData(
                executeRangeQuery(readBytesQuery, String.valueOf(start), String.valueOf(now), "5m")
        );

        String writeBytesQuery = String.format(
            "sum(rate(container_fs_writes_bytes_total{%s}[5m]))", dbPodFilter
        );
        double currentWriteBytes = parseSingleValue(executeQuery(writeBytesQuery));
        List<TimeSeriesDataPoint> diskWriteHistory = parseTimeSeriesData(
                executeRangeQuery(writeBytesQuery, String.valueOf(start), String.valueOf(now), "5m")
        );


        String readOpsQuery = String.format(
            "sum(rate(container_fs_reads_total{%s}[5m]))", dbPodFilter
        );
        double currentReadOps = parseSingleValue(executeQuery(readOpsQuery));

        String writeOpsQuery = String.format(
            "sum(rate(container_fs_writes_total{%s}[5m]))", dbPodFilter
        );
        double currentWriteOps = parseSingleValue(executeQuery(writeOpsQuery));


        String networkReceiveQuery = String.format(
            "sum(rate(container_network_receive_bytes_total{%s}[5m]))", dbPodFilter
        );
        double currentNetworkReceive = parseSingleValue(executeQuery(networkReceiveQuery));
        List<TimeSeriesDataPoint> networkReceiveHistory = parseTimeSeriesData(
                executeRangeQuery(networkReceiveQuery, String.valueOf(start), String.valueOf(now), "5m")
        );


        String networkTransmitQuery = String.format(
            "sum(rate(container_network_transmit_bytes_total{%s}[5m]))", dbPodFilter
        );
        double currentNetworkTransmit = parseSingleValue(executeQuery(networkTransmitQuery));
        List<TimeSeriesDataPoint> networkTransmitHistory = parseTimeSeriesData(
                executeRangeQuery(networkTransmitQuery, String.valueOf(start), String.valueOf(now), "5m")
        );


        String networkReceiveOpsQuery = String.format(
            "sum(rate(container_network_receive_packets_total{%s}[5m]))", dbPodFilter
        );
        double currentNetworkReceiveOps = parseSingleValue(executeQuery(networkReceiveOpsQuery));

        String networkTransmitOpsQuery = String.format(
            "sum(rate(container_network_transmit_packets_total{%s}[5m]))", dbPodFilter
        );
        double currentNetworkTransmitOps = parseSingleValue(executeQuery(networkTransmitOpsQuery));

        return DatabaseMetrics.builder()
                .diskReadBytesPerSec(Math.round(currentReadBytes * 100.0) / 100.0)
                .diskWriteBytesPerSec(Math.round(currentWriteBytes * 100.0) / 100.0)
                .diskReadOpsPerSec(Math.round(currentReadOps * 100.0) / 100.0)
                .diskWriteOpsPerSec(Math.round(currentWriteOps * 100.0) / 100.0)
                .networkReceiveBytesPerSec(Math.round(currentNetworkReceive * 100.0) / 100.0)
                .networkTransmitBytesPerSec(Math.round(currentNetworkTransmit * 100.0) / 100.0)
                .networkReceiveOpsPerSec(Math.round(currentNetworkReceiveOps * 100.0) / 100.0)
                .networkTransmitOpsPerSec(Math.round(currentNetworkTransmitOps * 100.0) / 100.0)
                .diskReadHistory(diskReadHistory)
                .diskWriteHistory(diskWriteHistory)
                .networkReceiveHistory(networkReceiveHistory)
                .networkTransmitHistory(networkTransmitHistory)
                .source("Database Pods (postgres, mysql, mariadb, mongodb, redis)")
                .build();
    }

    @Override
    public MetricCard getTenantCountMetric(String duration) {
        log.info("Fetching tenant count metric");


        double tenantCount = 3.0;

        return MetricCard.builder()
                .title("Active Tenants")
                .value(String.valueOf((int) tenantCount))
                .rawValue(tenantCount)
                .changePercent("+0.0%")
                .changeLabel("Hardcoded value")
                .status("excellent")
                .sparkline(new ArrayList<>())
                .build();
    }


    private String getIssueFromPhase(String phase) {
        return switch (phase) {
            case "Pending" -> "Pod is pending";
            case "Failed" -> "Pod has failed";
            case "Unknown" -> "Pod status unknown";
            default -> phase;
        };
    }

    private long parseDuration(String duration) {
        return switch (duration.toLowerCase()) {
            case "1h" -> 3600;
            case "6h" -> 21600;
            case "24h", "1d" -> 86400;
            case "7d" -> 604800;
            default -> 3600;
        };
    }

    private double calculateChangePercent(List<TimeSeriesDataPoint> history, double currentValue) {
        if (history.isEmpty()) return 0.0;
        double oldValue = history.get(0).getValue();
        if (oldValue == 0) return 0.0;
        return ((currentValue - oldValue) / oldValue) * 100;
    }

    private String determineTrend(double changePercent) {
        if (changePercent > 1.0) return "up";
        if (changePercent < -1.0) return "down";
        return "stable";
    }

    private String formatChangePercent(double percent) {
        if (percent >= 0) {
            return "+" + String.format("%.1f%%", percent);
        }
        return String.format("%.1f%%", percent);
    }

    private String formatLargeNumber(double number) {
        if (number >= 1_000_000) {
            return String.format("%.1fM", number / 1_000_000);
        } else if (number >= 1_000) {
            return String.format("%.1fK", number / 1_000);
        }
        return String.valueOf((int) number);
    }

    private String formatBytes(double bytes) {
        if (bytes >= 1_099_511_627_776.0) {
            return String.format("%.1f TB", bytes / 1_099_511_627_776.0);
        } else if (bytes >= 1_073_741_824.0) {
            return String.format("%.1f GB", bytes / 1_073_741_824.0);
        } else if (bytes >= 1_048_576.0) {
            return String.format("%.1f MB", bytes / 1_048_576.0);
        }
        return String.format("%.1f KB", bytes / 1024.0);
    }

    private String getMetricStatus(double changePercent) {
        double absChange = Math.abs(changePercent);
        if (absChange < 5) return "excellent";
        if (absChange < 15) return "good";
        if (absChange < 30) return "warning";
        return "critical";
    }
}