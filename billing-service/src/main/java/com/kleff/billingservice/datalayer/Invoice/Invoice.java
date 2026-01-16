package com.kleff.billingservice.datalayer.Invoice;

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
@Table(name = "invoices")
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String invoiceId;
    String projectId;
    Date startDate;
    Date endDate;
    InvoiceStatus status;
    Double totalCPU;
    Double totalRAM;
    Double totalSTORAGE;
    Double subtotal;
    Double taxes;
    Double total;
    Double totalPaid;
}
