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
public class ResourceUtilization {
    private double currentValue;
    private double changePercent;
    private String trend;  
    private List<TimeSeriesDataPoint> history;
}