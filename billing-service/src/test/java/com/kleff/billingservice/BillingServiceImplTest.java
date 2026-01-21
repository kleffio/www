package com.kleff.billingservice;

import com.kleff.billingservice.buisnesslayer.BillingServiceImpl;
import com.kleff.billingservice.datalayer.Allocation.ReservedAllocation;
import com.kleff.billingservice.datalayer.Allocation.ReservedAllocationRepository;
import com.kleff.billingservice.datalayer.Invoice.Invoice;
import com.kleff.billingservice.datalayer.Invoice.InvoiceRepository;
import com.kleff.billingservice.datalayer.Invoice.InvoiceStatus;
import com.kleff.billingservice.datalayer.Pricing.PriceRepository;
import com.kleff.billingservice.datalayer.Pricing.Price;
import com.kleff.billingservice.datalayer.Record.UsageRecord;
import com.kleff.billingservice.datalayer.Record.UsageRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillingServiceImplTest {

    @Mock
    private ReservedAllocationRepository reservedAllocationRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private UsageRecordRepository usageRecordRepository;

    @Mock
    private PriceRepository priceRepository;

    @InjectMocks
    private BillingServiceImpl billingService;

    private UsageRecord cpuUsageRecord;
    private UsageRecord memoryUsageRecord;
    private UsageRecord storageUsageRecord;
    private Invoice invoice;
    private ReservedAllocation reservedAllocation;

    @BeforeEach
    void setUp() {
        cpuUsageRecord = new UsageRecord();
        cpuUsageRecord.setProjectId("proj-123");
        cpuUsageRecord.setCPU_HOURS(10.0);
        cpuUsageRecord.setRecordedAt(LocalDateTime.now());

        memoryUsageRecord = new UsageRecord();
        memoryUsageRecord.setProjectId("proj-123");
        memoryUsageRecord.setMEMORY_GB_HOURS(5.0);
        memoryUsageRecord.setRecordedAt(LocalDateTime.now());

        storageUsageRecord = new UsageRecord();
        storageUsageRecord.setProjectId("proj-123");
        storageUsageRecord.setSTORAGE_GB(20.0);
        storageUsageRecord.setRecordedAt(LocalDateTime.now());

        invoice = new Invoice();
        invoice.setInvoiceId("inv-123");
        invoice.setSubtotal(100.0);
        invoice.setTaxes(15.0);
        invoice.setTotal(115.0);
        invoice.setStatus(InvoiceStatus.DRAFT);

        reservedAllocation = new ReservedAllocation();
        reservedAllocation.setProjectId("proj-123");
    }

    @Test
    void createUsageRecord_ShouldSaveRecord() {
        when(usageRecordRepository.save(any(UsageRecord.class))).thenReturn(cpuUsageRecord);

        billingService.createUsageRecord(cpuUsageRecord);

        verify(usageRecordRepository, times(1)).save(cpuUsageRecord);
    }

    @Test
    void getUsageRecordsForProject_ShouldReturnListOfRecords() {
        List<UsageRecord> expectedRecords = Arrays.asList(cpuUsageRecord, memoryUsageRecord);
        when(usageRecordRepository.findByProjectIdIs(anyString())).thenReturn(expectedRecords);

        List<UsageRecord> result = billingService.getUsageRecordsForProject("proj-123");

        assertNotNull(result);
        assertEquals(2, result.size());
        verify(usageRecordRepository, times(1)).findByProjectIdIs("proj-123");
    }

    @Test
    void createInvoice_ShouldSaveInvoice() {
        when(invoiceRepository.save(any(Invoice.class))).thenReturn(invoice);

        Invoice param = new Invoice();
        param.setProjectId("proj-123");
        Invoice result = billingService.createInvoice(param);

        assertNotNull(result);
        assertEquals("inv-123", result.getInvoiceId());
        verify(invoiceRepository, times(1)).save(any(Invoice.class));
    }

    @Test
    void payInvoice_WhenSuccessful_ShouldUpdateStatus() {
        Invoice unpaidInvoice = new Invoice();
        unpaidInvoice.setInvoiceId("inv-123");
        unpaidInvoice.setStatus(InvoiceStatus.DRAFT);

        when(invoiceRepository.findByInvoiceId(anyString())).thenReturn(unpaidInvoice);
        when(invoiceRepository.save(any(Invoice.class))).thenReturn(unpaidInvoice);

        billingService.payInvoice("inv-123");

        assertEquals(InvoiceStatus.PAID, unpaidInvoice.getStatus());
        verify(invoiceRepository, times(1)).findByInvoiceId("inv-123");
        verify(invoiceRepository, times(1)).save(unpaidInvoice);
    }

    @Test
    void payInvoice_WhenInvoiceNotFound_ShouldThrowException() {
        when(invoiceRepository.findByInvoiceId(anyString())).thenReturn(null);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            billingService.payInvoice("inv-999");
        });

        assertEquals("Payment registry failed", exception.getMessage());
        verify(invoiceRepository, times(1)).findByInvoiceId("inv-999");
        verify(invoiceRepository, never()).save(any());
    }

    @Test
    void createReservedAllocation_ShouldSaveAllocation() {
        when(reservedAllocationRepository.save(any(ReservedAllocation.class))).thenReturn(reservedAllocation);

        billingService.createReservedAllocation(reservedAllocation);

        verify(reservedAllocationRepository, times(1)).save(reservedAllocation);
    }
}