package com.kleff.billingservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kleff.billingservice.buisnesslayer.BillingService;
import com.kleff.billingservice.datalayer.Allocation.ReservedAllocation;
import com.kleff.billingservice.datalayer.Invoice.Invoice;
import com.kleff.billingservice.datalayer.Invoice.InvoiceStatus;
import com.kleff.billingservice.datalayer.Record.UsageRecord;
import com.kleff.billingservice.presentationlayer.BillingController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BillingController.class)
class BillingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BillingService billingService;

    private UsageRecord usageRecord;
    private InvoiceItem invoiceItem;
    private Invoice invoice;
    private ReservedAllocation reservedAllocation;

    @BeforeEach
    void setUp() {
        // Setup test data
        usageRecord = new UsageRecord();
        usageRecord.setProjectId("proj-123");
        usageRecord.setMetric(UsageMetric.CPU_HOURS);
        usageRecord.setQuantity(10.0);
        usageRecord.setRecordedAt(LocalDateTime.now());

        invoiceItem = new InvoiceItem();
        invoiceItem.setProjectId("proj-123");
        invoiceItem.setMetric(UsageMetric.CPU_HOURS);
        invoiceItem.setQuantity(10.0);
        invoiceItem.setUnitPrice(2.0);
        invoiceItem.setAmount(20.0);

        invoice = new Invoice();
        invoice.setInvoiceId("inv-123");
        invoice.setSubtotal(100.0);
        invoice.setTaxes(15.0);
        invoice.setTotal(115.0);
        invoice.setStatus(InvoiceStatus.OPEN);

        reservedAllocation = new ReservedAllocation();
        reservedAllocation.setProjectId("proj-123");
    }

    // Usage Record Tests
    @Test
    void createUsageRecord_ShouldReturnCreated() throws Exception {
        doNothing().when(billingService).createUsageRecord(any(UsageRecord.class));

        mockMvc.perform(post("/api/v1/billing/usage-records/")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(usageRecord)))
                .andExpect(status().isCreated())
                .andExpect(content().string("Usage record created successfully"));

        verify(billingService, times(1)).createUsageRecord(any(UsageRecord.class));
    }

    @Test
    void getUsageRecordsForProject_ShouldReturnList() throws Exception {
        List<UsageRecord> records = Arrays.asList(usageRecord);
        when(billingService.getUsageRecordsForProject(anyString())).thenReturn(records);

        mockMvc.perform(get("/api/v1/billing/proj-123/usage-records/"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].projectId").value("proj-123"))
                .andExpect(jsonPath("$[0].metric").value("CPU_HOURS"));

        verify(billingService, times(1)).getUsageRecordsForProject("proj-123");
    }

    // Invoice Item Tests
    @Test
    void createInvoiceItem_ShouldReturnCreated() throws Exception {
        doNothing().when(billingService).createInvoiceItem(any(UsageRecord.class));

        mockMvc.perform(post("/api/v1/billing/invoice-items/")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(usageRecord)))
                .andExpect(status().isCreated())
                .andExpect(content().string("Invoice item created successfully"));

        verify(billingService, times(1)).createInvoiceItem(any(UsageRecord.class));
    }

    @Test
    void getInvoiceItem_WhenExists_ShouldReturnItem() throws Exception {
        when(billingService.getInvoiceItem(anyString())).thenReturn(invoiceItem);

        mockMvc.perform(get("/api/v1/billing/invoice-items/item-123/"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectId").value("proj-123"))
                .andExpect(jsonPath("$.amount").value(20.0));

        verify(billingService, times(1)).getInvoiceItem("item-123");
    }

    @Test
    void getInvoiceItem_WhenNotFound_ShouldReturn404() throws Exception {
        when(billingService.getInvoiceItem(anyString())).thenReturn(null);

        mockMvc.perform(get("/api/v1/billing/invoice-items/item-999/"))
                .andExpect(status().isNotFound());

        verify(billingService, times(1)).getInvoiceItem("item-999");
    }

    @Test
    void getInvoiceItemsForProject_ShouldReturnList() throws Exception {
        List<InvoiceItem> items = Arrays.asList(invoiceItem);
        when(billingService.getInvoiceItemsForProject(anyString())).thenReturn(items);

        mockMvc.perform(get("/api/v1/billing/proj-123/invoice-items/"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].projectId").value("proj-123"))
                .andExpect(jsonPath("$[0].amount").value(20.0));

        verify(billingService, times(1)).getInvoiceItemsForProject("proj-123");
    }

    // Invoice Tests
    @Test
    void createInvoice_ShouldReturnCreatedInvoice() throws Exception {
        List<InvoiceItem> items = Arrays.asList(invoiceItem);
        when(billingService.createInvoice(anyList())).thenReturn(invoice);

        mockMvc.perform(post("/api/v1/billing/invoices/")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(items)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.invoiceId").value("inv-123"))
                .andExpect(jsonPath("$.total").value(115.0))
                .andExpect(jsonPath("$.status").value("OPEN"));

        verify(billingService, times(1)).createInvoice(anyList());
    }

    @Test
    void payInvoice_WhenSuccessful_ShouldReturnOk() throws Exception {
        doNothing().when(billingService).payInvoice(anyString());

        mockMvc.perform(post("/api/v1/billing/invoices/inv-123/pay/"))
                .andExpect(status().isOk())
                .andExpect(content().string("Invoice paid successfully"));

        verify(billingService, times(1)).payInvoice("inv-123");
    }

    @Test
    void payInvoice_WhenFails_ShouldReturnError() throws Exception {
        doThrow(new RuntimeException("Payment registry failed"))
                .when(billingService).payInvoice(anyString());

        mockMvc.perform(post("/api/v1/billing/invoices/inv-999/pay/"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Payment failed: Payment registry failed"));

        verify(billingService, times(1)).payInvoice("inv-999");
    }

    // Reserved Allocation Tests
    @Test
    void createReservedAllocation_ShouldReturnCreated() throws Exception {
        doNothing().when(billingService).createReservedAllocation(any(ReservedAllocation.class));

        mockMvc.perform(post("/api/v1/billing/reserved-allocations/")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reservedAllocation)))
                .andExpect(status().isCreated())
                .andExpect(content().string("Reserved allocation created successfully"));

        verify(billingService, times(1)).createReservedAllocation(any(ReservedAllocation.class));
    }
}