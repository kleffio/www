package com.kleff.billingservice.datalayer.Record;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "InvoiceItems")
public class InvoiceItem {
    String itemId;
    String invoiceId;
    String projectId;
    String description;
    PricingModel pricingModel;
    UsageMetric metric;
    Double quantity;
    Double unitPrice;
    Double amount;
}
