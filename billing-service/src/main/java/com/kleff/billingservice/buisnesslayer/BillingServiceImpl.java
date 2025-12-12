package com.kleff.billingservice.buisnesslayer;

import com.kleff.billingservice.datalayer.Allocation.ReservedAllocation;
import com.kleff.billingservice.datalayer.Allocation.ReservedAllocationRepository;
import com.kleff.billingservice.datalayer.Invoice.Invoice;
import com.kleff.billingservice.datalayer.Invoice.InvoiceRepository;
import com.kleff.billingservice.datalayer.Invoice.InvoiceStatus;
import com.kleff.billingservice.datalayer.Record.*;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
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
    public void createInvoiceItem(UsageRecord records) {
    InvoiceItem invoiceItem = new InvoiceItem();
    invoiceItem.setMetric(records.getMetric());
    invoiceItem.setQuantity(records.getQuantity());
    switch (records.getMetric()) {
        case CPU_HOURS -> invoiceItem.setUnitPrice(cpu_hour_rate);
        case MEMORY_GB_HOURS -> invoiceItem.setUnitPrice(ram_hour_rate);
        case STORAGE_GB -> invoiceItem.setUnitPrice(storage_hour_rate);
    }
    invoiceItem.setAmount((records.getQuantity() * invoiceItem.getUnitPrice()));
    }

    @Override
    public List<InvoiceItem> getInvoiceItemsForProject(String projectId) {
        return invoiceItemRepository.findByProjectId(projectId);
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

    @Override
    public List<Invoice> getInvoicesForAProject(String projectId) {
        return invoiceRepository.findByProjectId(projectId);
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

}
