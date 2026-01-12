package org.security.productservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.security.productservice.dto.ProductDTO;
import org.security.productservice.model.Product;
import org.security.productservice.repository.ProductRepository;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;
    private ProductDTO testProductDTO;

    @BeforeEach
    void setUp() {
        testProduct = new Product();
        testProduct.setId(1L);
        testProduct.setName("Test Product");
        testProduct.setDescription("Test Description");
        testProduct.setPrice(BigDecimal.valueOf(99.99));
        testProduct.setStockQuantity(10);

        testProductDTO = new ProductDTO();
        testProductDTO.setName("Test Product");
        testProductDTO.setDescription("Test Description");
        testProductDTO.setPrice(BigDecimal.valueOf(99.99));
        testProductDTO.setStockQuantity(10);
    }

    @Test
    void getAllProducts_ShouldReturnAllProducts() {
        // Given
        List<Product> products = Arrays.asList(testProduct);
        when(productRepository.findAll()).thenReturn(products);

        // When
        List<ProductDTO> result = productService.getAllProducts();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Product");
        verify(productRepository).findAll();
    }

    @Test
    void getProductById_ExistingId_ShouldReturnProduct() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // When
        ProductDTO result = productService.getProductById(1L);

        // Then
        assertThat(result.getName()).isEqualTo("Test Product");
        verify(productRepository).findById(1L);
    }

    @Test
    void getProductById_NonExistingId_ShouldThrowException() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> productService.getProductById(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Product not found with id: 1");
    }

    @Test
    void createProduct_ValidData_ShouldCreateProduct() {
        // Given
        Product savedProduct = new Product();
        savedProduct.setId(1L);
        savedProduct.setName("Test Product");
        savedProduct.setDescription("Test Description");
        savedProduct.setPrice(BigDecimal.valueOf(99.99));
        savedProduct.setStockQuantity(10);

        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        // When
        ProductDTO result = productService.createProduct(testProductDTO);

        // Then
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Test Product");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void updateProduct_ExistingId_ShouldUpdateProduct() {
        // Given
        Product existingProduct = new Product();
        existingProduct.setId(1L);
        existingProduct.setName("Old Name");
        existingProduct.setDescription("Old Description");
        existingProduct.setPrice(BigDecimal.valueOf(50.00));
        existingProduct.setStockQuantity(5);

        Product updatedProduct = new Product();
        updatedProduct.setId(1L);
        updatedProduct.setName("Updated Product");
        updatedProduct.setDescription("Updated Description");
        updatedProduct.setPrice(BigDecimal.valueOf(99.99));
        updatedProduct.setStockQuantity(10);

        when(productRepository.findById(1L)).thenReturn(Optional.of(existingProduct));
        when(productRepository.save(any(Product.class))).thenReturn(updatedProduct);

        // When
        ProductDTO result = productService.updateProduct(1L, testProductDTO);

        // Then
        assertThat(result.getName()).isEqualTo("Updated Product");
        assertThat(result.getPrice()).isEqualTo(99.99);
        verify(productRepository).findById(1L);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void updateProduct_NonExistingId_ShouldThrowException() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> productService.updateProduct(1L, testProductDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Product not found with id: 1");
    }

    @Test
    void deleteProduct_ExistingId_ShouldDeleteProduct() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // When
        productService.deleteProduct(1L);

        // Then
        verify(productRepository).findById(1L);
        verify(productRepository).delete(testProduct);
    }

    @Test
    void deleteProduct_NonExistingId_ShouldThrowException() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> productService.deleteProduct(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Product not found with id: 1");
    }

    @Test
    void checkAndReserveStock_SufficientStock_ShouldReturnTrue() {
        // Given
        testProduct.setStockQuantity(10);
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // When
        boolean result = productService.checkAndReserveStock(1L, 5);

        // Then
        assertThat(result).isTrue();
        assertThat(testProduct.getStockQuantity()).isEqualTo(5); // Stock reduced
        verify(productRepository).findById(1L);
        verify(productRepository).save(testProduct);
    }

    @Test
    void checkAndReserveStock_InsufficientStock_ShouldReturnFalse() {
        // Given
        testProduct.setStockQuantity(3);
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // When
        boolean result = productService.checkAndReserveStock(1L, 5);

        // Then
        assertThat(result).isFalse();
        assertThat(testProduct.getStockQuantity()).isEqualTo(3); // Stock unchanged
        verify(productRepository).findById(1L);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void checkAndReserveStock_NonExistingProduct_ShouldReturnFalse() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // When
        boolean result = productService.checkAndReserveStock(1L, 5);

        // Then
        assertThat(result).isFalse();
        verify(productRepository).findById(1L);
        verify(productRepository, never()).save(any(Product.class));
    }
}
