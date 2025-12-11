package com.kleff.billingservice.datalayer.Allocation;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
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
@Table(name = "ReservedAllocations")
public class ReservedAllocation {
    String allocationId;
    String userId;
    String WorkspaceIdentifier;
    String projectId;
    Double cpuCores;
    Double memoryGb;
    Double storageGb;
    int containerLimit;
    Double monthlyPrice;
    Date startDate;
    Date endDate;

}
