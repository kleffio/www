package com.kleff.billingservice.buisnesslayer;

import com.kleff.billingservice.datalayer.Allocation.ReservedAllocation;
import com.kleff.billingservice.datalayer.Invoice.Invoice;
import com.kleff.billingservice.datalayer.Record.InvoiceItem;
import com.kleff.billingservice.datalayer.Record.UsageRecord;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface BillingService {
    public void createInvoiceItem(List<UsageRecord> records);
    public List<InvoiceItem> getInvoiceItemsForProject(String projectId);
    public Invoice createInvoice(List<InvoiceItem> items);
    public InvoiceItem getInvoiceItem(String invoiceId);
    public List<InvoiceItem> getInvoiceItemsForAProject(String projectId);
    public void createUsageRecord(UsageRecord record);
    public List<UsageRecord> getUsageRecordsForProject(String projectId);
    public void payInvoice(String invoiceId);
    public void createReservedAllocation(ReservedAllocation reservedAllocation);
    public List<UsageRecord> getUsageRecordsForAProjectForOneMetric(String projectId, String metricId);


}
