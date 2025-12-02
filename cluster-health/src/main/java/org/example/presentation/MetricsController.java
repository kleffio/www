package org.example.presentation;


import java.util.List;

import org.example.business.MetricsService;
import org.example.dataaccess.ClusterOverview;
import org.example.dataaccess.DatabaseMetrics;
import org.example.dataaccess.MetricCard;
import org.example.dataaccess.NamespaceMetric;
import org.example.dataaccess.NodeMetric;
import org.example.dataaccess.ResourceUtilization;
import org.example.dataaccess.UnhealthyPod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/metrics")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class MetricsController {

    private final MetricsService metricsService;

    public MetricsController(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    /**
     * Get cluster overview metrics
     * GET /api/metrics/overview
     */
    @GetMapping("/overview")
    public ResponseEntity<ClusterOverview> getOverview() {
        log.info("GET /api/metrics/overview");
        return ResponseEntity.ok(metricsService.getClusterOverview());
    }

    /**
     * Get per-node metrics
     * GET /api/metrics/nodes
     */
    @GetMapping("/nodes")
    public ResponseEntity<List<NodeMetric>> getNodes() {
        log.info("GET /api/metrics/nodes");
        return ResponseEntity.ok(metricsService.getNodeMetrics());
    }

    /**
     * Get namespace metrics
     * GET /api/metrics/namespaces
     */
    @GetMapping("/namespaces")
    public ResponseEntity<List<NamespaceMetric>> getNamespaces() {
        log.info("GET /api/metrics/namespaces");
        return ResponseEntity.ok(metricsService.getNamespaceMetrics());
    }

    /**
     * Get unhealthy pods
     * GET /api/metrics/unhealthy
     */
    @GetMapping("/unhealthy")
    public ResponseEntity<List<UnhealthyPod>> getUnhealthyPods() {
        log.info("GET /api/metrics/unhealthy");
        return ResponseEntity.ok(metricsService.getUnhealthyPods());
    }

    /**
     * Get CPU utilization with time-series (for charts!)
     * GET /api/metrics/cpu?duration=1h
     */
    @GetMapping("/cpu")
    public ResponseEntity<ResourceUtilization> getCpuUtilization(
            @RequestParam(defaultValue = "1h") String duration) {
        log.info("GET /api/metrics/cpu?duration={}", duration);
        return ResponseEntity.ok(metricsService.getCpuUtilization(duration));
    }

    /**
     * Get memory utilization with time-series (for charts!)
     * GET /api/metrics/memory?duration=1h
     */
    @GetMapping("/memory")
    public ResponseEntity<ResourceUtilization> getMemoryUtilization(
            @RequestParam(defaultValue = "1h") String duration) {
        log.info("GET /api/metrics/memory?duration={}", duration);
        return ResponseEntity.ok(metricsService.getMemoryUtilization(duration));
    }

    /**
     * Get pod count metric card with sparkline
     * GET /api/metrics/pods-metric?duration=1h
     */
    @GetMapping("/pods-metric")
    public ResponseEntity<MetricCard> getPodMetric(
            @RequestParam(defaultValue = "1h") String duration) {
        log.info("GET /api/metrics/pods-metric?duration={}", duration);
        return ResponseEntity.ok(metricsService.getPodCountMetric(duration));
    }

    /**
     * Get node count metric card
     * GET /api/metrics/nodes-metric?duration=1h
     */
    @GetMapping("/nodes-metric")
    public ResponseEntity<MetricCard> getNodeMetric(
            @RequestParam(defaultValue = "1h") String duration) {
        log.info("GET /api/metrics/nodes-metric?duration={}", duration);
        return ResponseEntity.ok(metricsService.getNodeCountMetric(duration));
    }

    /**
     * Get network/request metric card
     * GET /api/metrics/requests-metric?duration=1h
     */
    @GetMapping("/requests-metric")
    public ResponseEntity<MetricCard> getRequestMetric(
            @RequestParam(defaultValue = "1h") String duration) {
        log.info("GET /api/metrics/requests-metric?duration={}", duration);
        return ResponseEntity.ok(metricsService.getRequestCountMetric(duration));
    }

    /**
     * Get database I/O metrics (disk read/write)
     * GET /api/metrics/database-io?duration=1h
     */
    @GetMapping("/database-io")
    public ResponseEntity<DatabaseMetrics> getDatabaseIoMetrics(
            @RequestParam(defaultValue = "1h") String duration) {
        log.info("GET /api/metrics/database-io?duration={}", duration);
        return ResponseEntity.ok(metricsService.getDatabaseIoMetrics(duration));
    }

    /**
     * Get tenant count metric card
     * GET /api/metrics/tenants-metric?duration=1h
     */
    @GetMapping("/tenants-metric")
    public ResponseEntity<MetricCard> getTenantMetric(
            @RequestParam(defaultValue = "1h") String duration) {
        log.info("GET /api/metrics/tenants-metric?duration={}", duration);
        return ResponseEntity.ok(metricsService.getTenantCountMetric(duration));
    }

    /**
     * Health check endpoint
     * GET /api/metrics/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}