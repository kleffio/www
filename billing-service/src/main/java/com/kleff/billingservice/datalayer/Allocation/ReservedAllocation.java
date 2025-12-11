package com.kleff.billingservice.datalayer.Allocation;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reserved_allocations")
public class ReservedAllocation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String allocationId;
    String userId;
    String workspaceId;
    String projectId;
    Double cpuCores;
    Double memoryGb;
    Double storageGb;
    int containerLimit;
    Double monthlyPrice;
    Date startDate;
    Date endDate;

}
