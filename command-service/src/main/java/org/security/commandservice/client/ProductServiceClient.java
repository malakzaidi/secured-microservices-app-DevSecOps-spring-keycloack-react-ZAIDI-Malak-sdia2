package org.security.commandservice.client;

import org.security.commandservice.dto.ProductResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "product-service")
public interface ProductServiceClient {

    @GetMapping("/api/products/{id}")
    ProductResponseDTO getProductById(@PathVariable("id") Long id);

    @PostMapping("/api/products/{id}/reserve")
    Boolean checkAndReserveStock(@PathVariable("id") Long id, @RequestParam Integer quantity);
}
