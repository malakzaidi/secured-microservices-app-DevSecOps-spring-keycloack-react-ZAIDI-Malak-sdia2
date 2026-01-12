package org.security.productservice.controller;

import org.security.productservice.dto.ProductDTO;
import org.security.productservice.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@RestController
@RequestMapping("/products")
@Tag(name = "Product Service", description = "API for managing products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    // @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')") // Temporarily disabled for testing
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        logUserAccess("GET /products");
        List<ProductDTO> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')") // Temporarily disabled for testing
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        logUserAccess("GET /api/products/" + id);
        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO productDTO) {
        logUserAccess("POST /api/products");
        try {
            ProductDTO createdProduct = productService.createProduct(productDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody ProductDTO productDTO) {
        logUserAccess("PUT /api/products/" + id);
        try {
            ProductDTO updatedProduct = productService.updateProduct(id, productDTO);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        logUserAccess("DELETE /api/products/" + id);
        try {
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/reserve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Boolean> checkAndReserveStock(@PathVariable Long id, @RequestParam Integer quantity) {
        logUserAccess("POST /api/products/" + id + "/reserve?quantity=" + quantity);
        boolean success = productService.checkAndReserveStock(id, quantity);
        return ResponseEntity.ok(success);
    }

    private void logUserAccess(String endpoint) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            String username = authentication.getName();
            System.out.println("User: " + username + " accessed: " + endpoint);
        }
    }
}
