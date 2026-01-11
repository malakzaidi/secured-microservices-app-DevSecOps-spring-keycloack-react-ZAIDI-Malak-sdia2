package org.security.commandservice.service;

import org.security.commandservice.client.ProductServiceClient;
import org.security.commandservice.dto.OrderDTO;
import org.security.commandservice.dto.OrderItemDTO;
import org.security.commandservice.dto.OrderRequestDTO;
import org.security.commandservice.dto.ProductResponseDTO;
import org.security.commandservice.model.Order;
import org.security.commandservice.model.OrderItem;
import org.security.commandservice.repository.OrderRepository;
import org.security.commandservice.repository.OrderItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductServiceClient productServiceClient;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository, ProductServiceClient productServiceClient) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productServiceClient = productServiceClient;
    }

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getOrdersByUser(String userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        return convertToDTO(order);
    }

    @Transactional
    public OrderDTO createOrder(OrderRequestDTO orderRequest, String userId) {
        // Validate products and calculate total
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = orderRequest.getItems().stream()
                .map(item -> {
                    // Call product service to get product details and check stock
                    ProductInfo productInfo = getProductInfo(item.getProductId());
                    if (productInfo == null) {
                        throw new RuntimeException("Product not found: " + item.getProductId());
                    }

                    // Check and reserve stock via product service
                    boolean stockReserved = reserveProductStock(item.getProductId(), item.getQuantity());
                    if (!stockReserved) {
                        throw new RuntimeException("Insufficient stock for product: " + productInfo.getName());
                    }

                    OrderItem orderItem = new OrderItem();
                    orderItem.setProductId(item.getProductId());
                    orderItem.setQuantity(item.getQuantity());
                    orderItem.setPrice(productInfo.getPrice());
                    orderItem.setProductName(productInfo.getName());

                    return orderItem;
                })
                .collect(Collectors.toList());

        // Calculate total
        for (OrderItem item : orderItems) {
            totalAmount = totalAmount.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        // Create order
        Order order = new Order();
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setTotalAmount(totalAmount);
        order.setUserId(userId);
        order.setOrderItems(orderItems);

        // Set order reference in items
        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }

        Order savedOrder = orderRepository.save(order);
        return convertToDTO(savedOrder);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(orderStatus);
            Order updatedOrder = orderRepository.save(order);
            return convertToDTO(updatedOrder);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
    }

    private ProductInfo getProductInfo(Long productId) {
        try {
            ProductResponseDTO product = productServiceClient.getProductById(productId);
            return new ProductInfo(product.getName(), product.getPrice());
        } catch (Exception e) {
            return null;
        }
    }

    private boolean reserveProductStock(Long productId, Integer quantity) {
        try {
            return productServiceClient.checkAndReserveStock(productId, quantity);
        } catch (Exception e) {
            return false;
        }
    }

    private OrderDTO convertToDTO(Order order) {
        List<OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                .map(item -> new OrderItemDTO(
                        item.getId(),
                        item.getProductId(),
                        item.getProductName(),
                        item.getQuantity(),
                        item.getPrice()
                ))
                .collect(Collectors.toList());

        return new OrderDTO(
                order.getId(),
                order.getOrderDate(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getUserId(),
                itemDTOs
        );
    }

    // Inner class for product information (would be a DTO in real implementation)
    private static class ProductInfo {
        private String name;
        private BigDecimal price;

        public ProductInfo(String name, BigDecimal price) {
            this.name = name;
            this.price = price;
        }

        public String getName() { return name; }
        public BigDecimal getPrice() { return price; }
    }
}
