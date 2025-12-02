package org.example;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.reactive.function.client.WebClient;

@SpringBootApplication
public class KleffMetricsApplication {

    public static void main(String[] args) {
        SpringApplication.run(KleffMetricsApplication.class, args);
    }

    @Bean
    public WebClient webClient(@Value("${prometheus.url}") String prometheusUrl) {
        System.out.println("\n✅ Kleff Metrics Backend Started!");
        System.out.println("📊 Prometheus URL: " + prometheusUrl);
        System.out.println("📍 API Endpoints: http://localhost:8080/api/metrics/*\n");

        return WebClient.builder()
                .baseUrl(prometheusUrl)
                .build();
    }
}


