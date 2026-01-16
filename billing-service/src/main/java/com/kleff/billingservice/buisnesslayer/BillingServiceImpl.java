package com.kleff.billingservice.buisnesslayer;

import com.kleff.billingservice.datalayer.Allocation.ReservedAllocation;
import com.kleff.billingservice.datalayer.Allocation.ReservedAllocationRepository;
import com.kleff.billingservice.datalayer.Invoice.Invoice;
import com.kleff.billingservice.datalayer.Invoice.InvoiceRepository;
import com.kleff.billingservice.datalayer.Invoice.InvoiceStatus;
import com.kleff.billingservice.datalayer.Pricing.Price;
import com.kleff.billingservice.datalayer.Pricing.PriceRepository;
import com.kleff.billingservice.datalayer.Record.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BillingServiceImpl implements BillingService {

    //Initialisation
    private ReservedAllocationRepository reservedAllocationRepository;
    private InvoiceRepository invoiceRepository;
    private UsageRecordRepository usageRecordRepository;
    private PriceRepository priceRepository;
    private double taxes = 1.14975;

    public BillingServiceImpl(
            ReservedAllocationRepository reservedAllocationRepository,
            InvoiceRepository invoiceRepository,
            UsageRecordRepository usageRecordRepository,
            PriceRepository priceRepository
    ) {
        this.reservedAllocationRepository = reservedAllocationRepository;
        this.invoiceRepository = invoiceRepository;
        this.usageRecordRepository = usageRecordRepository;
        this.priceRepository = priceRepository;
    }

    //All the invoice logic


    @Override
    public Invoice createInvoice(Invoice invoice) {
        return invoiceRepository.save(invoice);
    }



    //Usage record logic

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
        } catch (Exception e) {
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


    // Validation for payment
    public long computeOutstandingCents(String invoiceId, String userId) {

        // 1. Find the invoice
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + invoiceId));


//        if (!project.getOwnerUsername().equals(username)) {
//            throw new UnauthorizedException("You don't have permission to pay this invoice");
//        }

        // 3. Verify invoice is payable
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new IllegalArgumentException("Invoice is already paid");
        }

        if (invoice.getStatus() == InvoiceStatus.VOID) {
            throw new IllegalArgumentException("Invoice is cancelled");
        }

        // 4. Calculate outstanding amount (in cents for Stripe)
        long totalCents = (long) (invoice.getTotal()*100);
        long paidCents = (long) (invoice.getTotalPaid()*100);
        long outstandingCents = totalCents - paidCents;

        if (outstandingCents <= 0) {
            throw new IllegalArgumentException("No outstanding balance on this invoice");
        }

        // 5. Optional: Check for minimum amount
        if (outstandingCents < 50) { // Stripe minimum is $0.50
            throw new IllegalArgumentException("Amount too small for payment processing");
        }

        return outstandingCents;
    }


    //Bellow is where the price endpoints will be

    public Price getPrice(String itemId) {
        return priceRepository.findById(itemId).orElse(null);
    }

    // THIS ENDPOINT SHOULD ALWAYS BE RESTRICTED
    public void setPrice(Price price) {
        Price price1 = priceRepository.findByMetric(price.getMetric());
        price1.setPrice(price.getPrice());
        priceRepository.save(price1);
    }

    public Map<String, List<UsageRecord>> getUsageRecordsFromLastMonthGroupedByProject() {
        LocalDateTime startOfLastMonth = LocalDateTime.now()
                .minusMonths(1)
                .withDayOfMonth(1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);

        LocalDateTime startOfThisMonth = LocalDateTime.now()
                .withDayOfMonth(1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);

        // Query all bills from last month
        List<UsageRecord> lastMonthUsageRecords = usageRecordRepository.findByRecordedAtBetween(
                startOfLastMonth,
                startOfThisMonth
        );

//        log.info("Found {} bills from last month", lastMonthUsageRecords.size());

        // Group by project ID
        Map<String, List<UsageRecord>> invoiceItemsByProject = lastMonthUsageRecords.stream()
                .collect(Collectors.groupingBy(UsageRecord::getProjectId));

//        log.info("Bills grouped into {} projects", billsByProject.size());

        return invoiceItemsByProject;
    }

    public Invoice aggregateUsageRecordIntoInvoice(List<UsageRecord> usageRecords) {
        Invoice invoice = new Invoice();
        double CPU = 0;
        double MEMORY = 0;
        double STORAGE = 0;
        for (UsageRecord usageRecord : usageRecords) {
            CPU += usageRecord.getCPU_HOURS();
            MEMORY += usageRecord.getMEMORY_GB_HOURS();
            STORAGE += usageRecord.getSTORAGE_GB();
        }
        invoice.setTotalCPU((CPU * getPrice("CPU_HOURS").getPrice()));
        invoice.setTotalCPU((MEMORY * getPrice("MEMORY_GB_HOURS").getPrice()));
        invoice.setTotalCPU((STORAGE * getPrice("STORAGE_GB").getPrice()));
        invoice.setSubtotal(invoice.getTotalCPU() + invoice.getTotalRAM() + invoice.getTotalSTORAGE());
        invoice.setTaxes(invoice.getSubtotal()*taxes);
        BigDecimal bd = new BigDecimal(Double.toString(invoice.getSubtotal())+invoice.getTaxes());
        double total = bd.setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue();
        invoice.setTotal(total);
        return invoice;
    }


    @Scheduled(cron = "0 0 3 1 * ?")
    @Transactional
    public void CreateMonthlyBills(){
    Map<String, List<UsageRecord>> mappedRecords = getUsageRecordsFromLastMonthGroupedByProject();

    mappedRecords.forEach((projectId, usageRecords) -> {
    aggregateUsageRecordIntoInvoice(usageRecords);
    });



    }
    }




