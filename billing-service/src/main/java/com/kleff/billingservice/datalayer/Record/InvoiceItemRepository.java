package com.kleff.billingservice.datalayer.Record;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, String> {
    public List<InvoiceItem> findByInvoiceId(String invoiceId);
    public List<InvoiceItem> findByProjectId(String projectId);
}
