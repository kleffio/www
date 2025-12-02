package org.example.dataaccess;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String status;  
    private List<TimeSeriesDataPoint> sparkline;
}