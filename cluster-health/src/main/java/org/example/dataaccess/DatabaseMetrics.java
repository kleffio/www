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
public class DatabaseMetrics {
    private double diskReadBytesPerSec;    
    private double diskWriteBytesPerSec;   
    private double diskReadOpsPerSec;      
    private double diskWriteOpsPerSec;  
    
    private double networkReceiveBytesPerSec;  
    private double networkTransmitBytesPerSec; 
    private double networkReceiveOpsPerSec;    
    private double networkTransmitOpsPerSec;   
    
    private List<TimeSeriesDataPoint> diskReadHistory;      
    private List<TimeSeriesDataPoint> diskWriteHistory;     
    private List<TimeSeriesDataPoint> networkReceiveHistory; 
    private List<TimeSeriesDataPoint> networkTransmitHistory; 
    
    private String source;  
}
