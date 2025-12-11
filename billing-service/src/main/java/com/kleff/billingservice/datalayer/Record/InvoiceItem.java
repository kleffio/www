package com.kleff.billingservice.datalayer.Record;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "invoice_items")
public class InvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
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
