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


    @GetMapping("/overview")
    public ResponseEntity<ClusterOverview> getOverview() {
        log.info("GET /api/metrics/overview");
        return ResponseEntity.ok(metricsService.getClusterOverview());
    }


    @GetMapping("/nodes")
    public ResponseEntity<List<NodeMetric>> getNodes() {
        log.info("GET /api/metrics/nodes");
        return ResponseEntity.ok(metricsService.getNodeMetrics());
    }


    @GetMapping("/namespaces")
    public ResponseEntity<List<NamespaceMetric>> getNamespaces() {
        log.info("GET /api/metrics/namespaces");
        return ResponseEntity.ok(metricsService.getNamespaceMetrics());
    }


    @GetMapping("/unhealthy")
    public ResponseEntity<List<UnhealthyPod>> getUnhealthyPods() {
        log.info("GET /api/metrics/unhealthy");
        return ResponseEntity.ok(metricsService.getUnhealthyPods());
    }


    @GetMapping("/cpu")
    public ResponseEntity<ResourceUtilization> getCpuUtilization(
            @RequestParam(defaultValue = "1h") String duration) {
        log.info("GET /api/metrics/cpu?duration={}", duration);
        return ResponseEntity.ok(metricsService.getCpuUtilization(duration));
    }


    @GetMapping("/memory")
    public ResponseEntity<ResourceUtilization> getMemoryUtilization(
            @RequestParam(defaultValue = "1h") String duration) {
        log.info("GET /api/metrics/memory?duration={}", duration);
        return ResponseEntity.ok(metricsService.getMemoryUtilization(duration));
    }

    @GetMapping("/pods-metric")
    public ResponseEntity<MetricCard> getPodMetric(
            @RequestParam(defaultValue = "1h") String duration) {
        log.info("GET /api/metrics/pods-metric?duration={}", duration);
        return ResponseEntity.ok(metricsService.getPodCountMetric(duration));
    }


    @GetMapping("/nodes-metric")
    public ResponseEntity<MetricCard> getNodeMetric(
            @RequestParam(defaultValue = "1h") String duration) {
        log.info("GET /api/metrics/nodes-metric?duration={}", duration);
        return ResponseEntity.ok(metricsService.getNodeCountMetric(duration));
    }


    @GetMapping("/requests-metric")
    public ResponseEntity<MetricCard> getRequestMetric(
            @RequestParam(defaultValue = "1h") String duration) {
        log.info("GET /api/metrics/requests-metric?duration={}", duration);
        return ResponseEntity.ok(metricsService.getRequestCountMetric(duration));
    }

    @GetMapping("/database-io")
    public ResponseEntity<DatabaseMetrics> getDatabaseIoMetrics(
            @RequestParam(defaultValue = "1h") String duration) {
        log.info("GET /api/metrics/database-io?duration={}", duration);
        return ResponseEntity.ok(metricsService.getDatabaseIoMetrics(duration));
    }


    @GetMapping("/tenants-metric")
    public ResponseEntity<MetricCard> getTenantMetric(
            @RequestParam(defaultValue = "1h") String duration) {
        log.info("GET /api/metrics/tenants-metric?duration={}", duration);
        return ResponseEntity.ok(metricsService.getTenantCountMetric(duration));
    }


    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}