package org.example.dataaccess;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetricCard {
    private String title;
    private String value;
    private double rawValue;
    private String changePercent;
    private String changeLabel;
    private String status;  // "excellent", "good", "warning", "critical"
    private List<TimeSeriesDataPoint> sparkline;
}