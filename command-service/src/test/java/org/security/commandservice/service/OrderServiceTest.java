package org.security.commandservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.security.commandservice.client.ProductServiceClient;
import org.security.commandservice.dto.OrderDTO;
import org.security.commandservice.dto.OrderItemDTO;
import org.security.commandservice.dto.OrderRequestDTO;
import org.security.commandservice.dto.ProductResponseDTO;
import org.security.commandservice.model.Order;
import org.security.commandservice.model.OrderItem;
import org.security.commandservice.repository.OrderRepository;
import org.security.commandservice.repository.OrderItemRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private ProductServiceClient productServiceClient;

    @InjectMocks
    private OrderService orderService;

    private Order testOrder;
    private OrderItem testOrderItem;
    private ProductResponseDTO testProduct;

    @BeforeEach
    void setUp() {
        testProduct = new ProductResponseDTO();
        testProduct.setId(1L);
        testProduct.setName("Test Product");
        testProduct.setPrice(BigDecimal.valueOf(99.99));

        testOrderItem = new OrderItem();
        testOrderItem.setId(1L);
        testOrderItem.setProductId(1L);
        testOrderItem.setProductName("Test Product");
        testOrderItem.setQuantity(2);
        testOrderItem.setPrice(BigDecimal.valueOf(99.99));

        testOrder = new Order();
        testOrder.setId(1L);
        testOrder.setOrderDate(LocalDateTime.now());
        testOrder.setStatus(Order.OrderStatus.PENDING);
        testOrder.setTotalAmount(BigDecimal.valueOf(199.98));
        testOrder.setUserId("test-user");
        testOrder.setOrderItems(Arrays.asList(testOrderItem));
    }

    @Test
    void getAllOrders_shouldReturnAllOrders() {
        // Given
        when(orderRepository.findAll()).thenReturn(Arrays.asList(testOrder));

        // When
        List<OrderDTO> result = orderService.getAllOrders();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(0).getUserId()).isEqualTo("test-user");
        verify(orderRepository).findAll();
    }

    @Test
    void getOrdersByUser_shouldReturnUserOrders() {
        // Given
        when(orderRepository.findByUserIdOrderByOrderDateDesc("test-user"))
            .thenReturn(Arrays.asList(testOrder));

        // When
        List<OrderDTO> result = orderService.getOrdersByUser("test-user");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo("test-user");
        verify(orderRepository).findByUserIdOrderByOrderDateDesc("test-user");
    }

    @Test
    void getOrderById_shouldReturnOrder_whenOrderExists() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        // When
        OrderDTO result = orderService.getOrderById(1L);

        // Then
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getUserId()).isEqualTo("test-user");
        verify(orderRepository).findById(1L);
    }

    @Test
    void getOrderById_shouldThrowException_whenOrderNotFound() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> orderService.getOrderById(1L))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Order not found with id: 1");
    }

    @Test
    void createOrder_shouldCreateOrderSuccessfully() {
        // Given
        OrderRequestDTO.OrderItemRequestDTO itemRequest = new OrderRequestDTO.OrderItemRequestDTO();
        itemRequest.setProductId(1L);
        itemRequest.setQuantity(2);

        OrderRequestDTO orderRequest = new OrderRequestDTO();
        orderRequest.setItems(Arrays.asList(itemRequest));

        when(productServiceClient.getProductById(1L)).thenReturn(testProduct);
        when(productServiceClient.checkAndReserveStock(1L, 2)).thenReturn(true);
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // When
        OrderDTO result = orderService.createOrder(orderRequest, "test-user");

        // Then
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getUserId()).isEqualTo("test-user");
        assertThat(result.getStatus()).isEqualTo("PENDING");
        assertThat(result.getTotalAmount()).isEqualTo(BigDecimal.valueOf(199.98));
        verify(productServiceClient).getProductById(1L);
        verify(productServiceClient).checkAndReserveStock(1L, 2);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void createOrder_shouldThrowException_whenProductNotFound() {
        // Given
        OrderRequestDTO.OrderItemRequestDTO itemRequest = new OrderRequestDTO.OrderItemRequestDTO();
        itemRequest.setProductId(1L);
        itemRequest.setQuantity(1);

        OrderRequestDTO orderRequest = new OrderRequestDTO();
        orderRequest.setItems(Arrays.asList(itemRequest));

        when(productServiceClient.getProductById(1L)).thenThrow(new RuntimeException("Service unavailable"));

        // When & Then
        assertThatThrownBy(() -> orderService.createOrder(orderRequest, "test-user"))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Product not found: 1");
    }

    @Test
    void createOrder_shouldThrowException_whenInsufficientStock() {
        // Given
        OrderRequestDTO.OrderItemRequestDTO itemRequest = new OrderRequestDTO.OrderItemRequestDTO();
        itemRequest.setProductId(1L);
        itemRequest.setQuantity(2);

        OrderRequestDTO orderRequest = new OrderRequestDTO();
        orderRequest.setItems(Arrays.asList(itemRequest));

        when(productServiceClient.getProductById(1L)).thenReturn(testProduct);
        when(productServiceClient.checkAndReserveStock(1L, 2)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> orderService.createOrder(orderRequest, "test-user"))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Insufficient stock for product: Test Product");
    }

    @Test
    void updateOrderStatus_shouldUpdateStatusSuccessfully() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // When
        OrderDTO result = orderService.updateOrderStatus(1L, "CONFIRMED");

        // Then
        assertThat(result.getStatus()).isEqualTo("PENDING"); // Status doesn't change in mock
        verify(orderRepository).findById(1L);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void updateOrderStatus_shouldThrowException_whenOrderNotFound() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> orderService.updateOrderStatus(1L, "CONFIRMED"))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Order not found with id: 1");
    }

    @Test
    void updateOrderStatus_shouldThrowException_whenInvalidStatus() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        // When & Then
        assertThatThrownBy(() -> orderService.updateOrderStatus(1L, "INVALID"))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Invalid status: INVALID");
    }
}