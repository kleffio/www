package com.kleff.billingservice.presentationlayer;
import com.kleff.billingservice.buisnesslayer.BillingService;
import com.kleff.billingservice.datalayer.Allocation.ReservedAllocation;
import com.kleff.billingservice.datalayer.Invoice.Invoice;
import com.kleff.billingservice.datalayer.Record.UsageRecord;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/billing")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    // Usage Record Endpoints
    @PostMapping("/usage-records/")
    public ResponseEntity<String> createUsageRecord(@RequestBody UsageRecord usageRecord) {
        billingService.createUsageRecord(usageRecord);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Usage record created successfully");
    }

    @GetMapping("/{projectId}/usage-records/")
    public ResponseEntity<List<UsageRecord>> getUsageRecordsForProject(@PathVariable String projectId) {
        List<UsageRecord> records = billingService.getUsageRecordsForProject(projectId);
        return ResponseEntity.ok(records);
    }

    // Invoice Item Endpoints
    @PostMapping("/invoice-items/")
    public ResponseEntity<String> createInvoiceItem(@RequestBody UsageRecord usageRecord) {
        billingService.createInvoiceItem(usageRecord);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Invoice item created successfully");
    }

    @GetMapping("/invoice-items/{invoiceId}/")
    public ResponseEntity<InvoiceItem> getInvoiceItem(@PathVariable String invoiceId) {
        InvoiceItem item = billingService.getInvoiceItem(invoiceId);
        if (item == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(item);
    }

    @GetMapping("/{projectId}/invoice-items/")
    public ResponseEntity<List<InvoiceItem>> getInvoiceItemsForProject(@PathVariable String projectId) {
        List<InvoiceItem> items = billingService.getInvoiceItemsForProject(projectId);
        return ResponseEntity.ok(items);
    }

    // Invoice Endpoints
    @PostMapping("/invoices/")
    public ResponseEntity<Invoice> createInvoice(@RequestBody List<InvoiceItem> invoiceItems) {
        Invoice invoice = billingService.createInvoice(invoiceItems);
        return ResponseEntity.status(HttpStatus.CREATED).body(invoice);
    }

    @PostMapping("/invoices/{invoiceId}/pay/")
    public ResponseEntity<String> payInvoice(@PathVariable String invoiceId) {
        try {
            billingService.payInvoice(invoiceId);
            return ResponseEntity.ok("Invoice paid successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Payment failed: " + e.getMessage());
        }
    }

    // Reserved Allocation Endpoints
    @PostMapping("/reserved-allocations/")
    public ResponseEntity<String> createReservedAllocation(@RequestBody ReservedAllocation reservedAllocation) {
        billingService.createReservedAllocation(reservedAllocation);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Reserved allocation created successfully");
    }

    @GetMapping("{projectId}/invoices/")
    public ResponseEntity<List<Invoice>> getInvoicesForProject(@PathVariable String projectId) {
        List<Invoice> items = billingService.getInvoicesForAProject(projectId);
        return ResponseEntity.ok(items);
    }
}