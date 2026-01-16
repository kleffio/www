package com.kleff.billingservice.presentationlayer;

import com.kleff.billingservice.buisnesslayer.BillingService;
import com.kleff.billingservice.datalayer.Allocation.ReservedAllocation;
import com.kleff.billingservice.datalayer.Invoice.Invoice;
import com.kleff.billingservice.datalayer.Record.UsageRecord;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @PostMapping("/pay/{projectId}/")
    public ResponseEntity<?> payInvoice(
            @PathVariable String projectId,
            @RequestBody String invoiceId,
            Principal principal) {

        try {
            // Validate and compute amount server-side
            long amountCents = billingService.computeOutstandingCents(
                    invoiceId,
                    principal.getName()
            );

            SessionCreateParams params = SessionCreateParams.builder()
                    .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setQuantity(1L)
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("usd")
                                                    .setUnitAmount(amountCents)
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName("Invoice #" + invoiceId)
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .build()
                    )
                    .setSuccessUrl("https://your-frontend.example/invoices/" + invoiceId + "/success?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl("https://your-frontend.example/invoices/" + invoiceId)
                    .putMetadata("invoiceId", invoiceId)
                    .build();

            Session session = Session.create(params);

            Map<String, String> response = new HashMap<>();
            response.put("url", session.getUrl());
            response.put("sessionId", session.getId());
            return ResponseEntity.ok(response);

        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Payment processing error"));
        }
    }

    // Reserved Allocation Endpoints
    @PostMapping("/reserved-allocations/")
    public ResponseEntity<String> createReservedAllocation(@RequestBody ReservedAllocation reservedAllocation) {
        billingService.createReservedAllocation(reservedAllocation);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Reserved allocation created successfully");
    }

    @GetMapping("/{projectId}/invoices/")
    public ResponseEntity<List<Invoice>> getInvoicesForProject(@PathVariable String projectId) {
        List<Invoice> items = billingService.getInvoicesForAProject(projectId);
        return ResponseEntity.ok(items);
    }

    @PostMapping("/invoice")
    public ResponseEntity<String> createInvoice(@RequestBody Invoice invoice) {
        billingService.createInvoice(invoice);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Invoice created successfully");
    }


}