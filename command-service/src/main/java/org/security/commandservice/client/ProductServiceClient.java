package org.security.commandservice.client;

import org.security.commandservice.dto.ProductResponseDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "product-service")
public interface ProductServiceClient {

    @GetMapping("/api/products/{id}")
    @CircuitBreaker(name = "product-service", fallbackMethod = "getProductByIdFallback")
    @Retry(name = "product-service")
    ProductResponseDTO getProductById(@PathVariable("id") Long id);

    @PostMapping("/api/products/{id}/reserve")
    @CircuitBreaker(name = "product-service", fallbackMethod = "checkAndReserveStockFallback")
    @Retry(name = "product-service")
    Boolean checkAndReserveStock(@PathVariable("id") Long id, @RequestParam Integer quantity);

    // Fallback methods
    default ProductResponseDTO getProductByIdFallback(Long id, Throwable throwable) {
        System.err.println("Circuit breaker triggered for getProductById: " + throwable.getMessage());
        return null; // Return null to indicate service unavailable
    }

    default Boolean checkAndReserveStockFallback(Long id, Integer quantity, Throwable throwable) {
        System.err.println("Circuit breaker triggered for checkAndReserveStock: " + throwable.getMessage());
        return false; // Return false to indicate operation failed
    }
}
