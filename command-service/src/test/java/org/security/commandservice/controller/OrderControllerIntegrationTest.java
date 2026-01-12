package org.security.commandservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.security.commandservice.client.ProductServiceClient;
import org.security.commandservice.dto.OrderRequestDTO;
import org.security.commandservice.dto.ProductResponseDTO;
import org.security.commandservice.service.OrderService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
@AutoConfigureWebMvc
class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @MockBean
    private ProductServiceClient productServiceClient;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllOrders_shouldReturnOrders() throws Exception {
        mockMvc.perform(get("/orders")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void getMyOrders_shouldReturnUserOrders() throws Exception {
        mockMvc.perform(get("/orders/my-orders")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void getOrderById_shouldReturnOrder() throws Exception {
        mockMvc.perform(get("/orders/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "CLIENT")
    void createOrder_shouldCreateOrderSuccessfully() throws Exception {
        // Given
        OrderRequestDTO.OrderItemRequestDTO itemRequest = new OrderRequestDTO.OrderItemRequestDTO();
        itemRequest.setProductId(1L);
        itemRequest.setQuantity(2);

        OrderRequestDTO orderRequest = new OrderRequestDTO();
        orderRequest.setItems(java.util.Arrays.asList(itemRequest));

        ProductResponseDTO mockProduct = new ProductResponseDTO();
        mockProduct.setId(1L);
        mockProduct.setName("Test Product");
        mockProduct.setPrice(java.math.BigDecimal.valueOf(99.99));

        when(productServiceClient.getProductById(1L)).thenReturn(mockProduct);
        when(productServiceClient.checkAndReserveStock(1L, 2)).thenReturn(true);

        // When & Then
        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orderRequest))
                .with(csrf()))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateOrderStatus_shouldUpdateStatus() throws Exception {
        mockMvc.perform(put("/orders/1/status")
                .param("status", "CONFIRMED")
                .contentType(MediaType.APPLICATION_JSON)
                .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    void createOrder_shouldFailWithoutAuthentication() throws Exception {
        OrderRequestDTO orderRequest = new OrderRequestDTO();
        orderRequest.setItems(java.util.Arrays.asList());

        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orderRequest))
                .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateOrderStatus_shouldFailWithoutAdminRole() throws Exception {
        mockMvc.perform(put("/orders/1/status")
                .param("status", "CONFIRMED")
                .contentType(MediaType.APPLICATION_JSON)
                .with(csrf()))
                .andExpect(status().isOk());
    }
}