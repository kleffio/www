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
public class ResourceUtilization {
    private double currentValue;
    private double changePercent;
    private String trend;  // "up", "down", "stable"
    private List<TimeSeriesDataPoint> history;
}