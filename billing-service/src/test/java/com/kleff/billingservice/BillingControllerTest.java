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
    private Invoice invoice;
    private ReservedAllocation reservedAllocation;

    @BeforeEach
    void setUp() {
        usageRecord = new UsageRecord();
        usageRecord.setProjectId("proj-123");
        usageRecord.setCPU_HOURS(10.0);
        usageRecord.setRecordedAt(LocalDateTime.now());

        invoice = new Invoice();
        invoice.setInvoiceId("inv-123");
        invoice.setSubtotal(100.0);
        invoice.setTaxes(15.0);
        invoice.setTotal(115.0);
        invoice.setStatus(InvoiceStatus.OPEN);

        reservedAllocation = new ReservedAllocation();
        reservedAllocation.setProjectId("proj-123");
    }

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

//    @Test
//    void getUsageRecordsForProject_ShouldReturnList() throws Exception {
//        List<UsageRecord> records = Arrays.asList(usageRecord);
//        when(billingService.getUsageRecordsForProject(anyString())).thenReturn(records);
//
//        mockMvc.perform(get("/api/v1/billing/proj-123/usage-records/"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$[0].projectId").value("proj-123"))
//                .andExpect(jsonPath("$[0].CPU_HOURS").value(10.0));
//
//        verify(billingService, times(1)).getUsageRecordsForProject("proj-123");
//    }

//    @Test
//    void createInvoice_ShouldReturnCreatedInvoice() throws Exception {
//        when(billingService.createInvoice(any(Invoice.class))).thenReturn(invoice);
//
//        mockMvc.perform(post("/api/v1/billing/invoices/")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(invoice)))
//                .andExpect(status().isCreated())
//                .andExpect(jsonPath("$.invoiceId").value("inv-123"))
//                .andExpect(jsonPath("$.total").value(115.0))
//                .andExpect(jsonPath("$.status").value("OPEN"));
//
//        verify(billingService, times(1)).createInvoice(any(Invoice.class));
//    }

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