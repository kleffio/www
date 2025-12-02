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
    // Disk I/O metrics (for database storage)
    private double diskReadBytesPerSec;    // Disk read throughput in bytes/sec
    private double diskWriteBytesPerSec;   // Disk write throughput in bytes/sec
    private double diskReadOpsPerSec;      // Disk read operations per second
    private double diskWriteOpsPerSec;     // Disk write operations per second
    
    // Network I/O metrics (for database connections/queries)
    private double networkReceiveBytesPerSec;  // Network receive throughput in bytes/sec
    private double networkTransmitBytesPerSec; // Network transmit throughput in bytes/sec
    private double networkReceiveOpsPerSec;    // Network receive packets per second
    private double networkTransmitOpsPerSec;   // Network transmit packets per second
    
    // Historical data for charts
    private List<TimeSeriesDataPoint> diskReadHistory;      // Historical disk read data
    private List<TimeSeriesDataPoint> diskWriteHistory;     // Historical disk write data
    private List<TimeSeriesDataPoint> networkReceiveHistory; // Historical network receive data
    private List<TimeSeriesDataPoint> networkTransmitHistory; // Historical network transmit data
    
    // Metadata
    private String source;  // e.g., "postgres", "mysql", "all-databases"
}
