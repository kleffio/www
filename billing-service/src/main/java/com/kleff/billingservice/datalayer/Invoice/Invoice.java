package com.kleff.billingservice.datalayer.Invoice;

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
@Table(name = "Invoices")
public class Invoice {
    String invoiceId;
    String billedToWorkspace;
    Date periodStart;
    Date periodEnd;
    InvoiceStatus status;
    Double subtotal;
    Double taxes;
    Double total;
}
