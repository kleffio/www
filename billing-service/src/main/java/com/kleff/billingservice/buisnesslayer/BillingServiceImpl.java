package com.kleff.billingservice.buisnesslayer;

import com.kleff.billingservice.datalayer.Allocation.ReservedAllocation;
import com.kleff.billingservice.datalayer.Allocation.ReservedAllocationRepository;
import com.kleff.billingservice.datalayer.Invoice.Invoice;
import com.kleff.billingservice.datalayer.Invoice.InvoiceRepository;
import com.kleff.billingservice.datalayer.Invoice.InvoiceStatus;
import com.kleff.billingservice.datalayer.Record.InvoiceItem;
import com.kleff.billingservice.datalayer.Record.InvoiceItemRepository;
import com.kleff.billingservice.datalayer.Record.UsageRecord;
import com.kleff.billingservice.datalayer.Record.UsageRecordRepository;
import org.springframework.data.crossstore.ChangeSetPersister;

import java.util.List;

public class BillingServiceImpl implements BillingService {

    private ReservedAllocationRepository reservedAllocationRepository;
    private InvoiceItemRepository invoiceItemRepository;
    private InvoiceRepository invoiceRepository;
    private UsageRecordRepository usageRecordRepository;
    private Double taxes = 0.15;
    private Double cpu_hour_rate = 2.0;
    private Double ram_hour_rate = 2.0;
    private Double storage_hour_rate = 2.0;

    @Override
    public void createInvoiceItem(List<UsageRecord> records) {

    }

    @Override
    public List<InvoiceItem> getInvoiceItemsForProject(String projectId) {
        return List.of();
    }

    @Override
    public Invoice createInvoice(List<InvoiceItem> items) {
        Invoice  invoice = aggregateInvoiceItems(items);
        return invoiceRepository.save(invoice);
    }

    @Override
    public InvoiceItem getInvoiceItem(String invoiceId) {
        return invoiceItemRepository.findById(invoiceId).orElse(null);
    }

    @Override
    public List<InvoiceItem> getInvoiceItemsForAProject(String projectId) {
        return invoiceItemRepository.findByProjectId(projectId);
    }

    @Override
    public void createUsageRecord(UsageRecord records) {
    usageRecordRepository.save(records);
    }

    @Override
    public List<UsageRecord> getUsageRecordsForProject(String projectId) {
        return usageRecordRepository.findByProjectIdIs(projectId);
    }

    @Override
    public void payInvoice(String invoiceId) {
    try {
        Invoice bill = invoiceRepository.findByInvoiceId(invoiceId);
        bill.setStatus(InvoiceStatus.PAID);
        invoiceRepository.save(bill);
    }
    catch (Exception e){
        throw new RuntimeException("Payment registry failed");
    }
    }


    @Override
    public void createReservedAllocation(ReservedAllocation reservedAllocation) {
    reservedAllocationRepository.save(reservedAllocation);
    }

    public Invoice aggregateInvoiceItems(List<InvoiceItem> invoiceItems) {
        Invoice invoice = new Invoice();
        Double total = 0.0;
        for (InvoiceItem item : invoiceItems) {
            total += item.getAmount();
        }
        invoice.setSubtotal(total);
        Double taxAmmount = total * taxes;
        invoice.setTaxes(taxAmmount);
        invoice.setTotal(total+taxAmmount);
        return invoice;
    }
     public InvoiceItem mapUsageRecordToInvoiceItem(List<UsageRecord> usageRecord) {
        InvoiceItem invoiceItem = new InvoiceItem();
         invoiceItem.setMetric(usageRecord.get(0).getMetric());

        return invoiceItem;
     }
}
