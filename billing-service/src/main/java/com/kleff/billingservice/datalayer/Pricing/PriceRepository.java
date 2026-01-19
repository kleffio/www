package com.kleff.billingservice.datalayer.Pricing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PriceRepository extends JpaRepository<Price, String> {
    public Price findByMetric(String metric);
}
