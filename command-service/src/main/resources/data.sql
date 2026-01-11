-- Sample data for Command Service
-- This will be executed automatically by Spring Boot
-- Note: This assumes products with IDs 1-10 exist from product-service

-- Insert sample orders (using test user IDs)
INSERT INTO orders (id, order_date, status, total_amount, user_id, version) VALUES
(1, '2024-01-15 10:30:00', 'CONFIRMED', 1799.98, 'test-user-1', 0),
(2, '2024-01-16 14:20:00', 'PENDING', 899.99, 'test-user-2', 0),
(3, '2024-01-17 09:15:00', 'SHIPPED', 2399.97, 'test-user-1', 0),
(4, '2024-01-18 16:45:00', 'DELIVERED', 699.99, 'test-user-3', 0),
(5, '2024-01-19 11:30:00', 'PENDING', 1499.99, 'test-user-2', 0);

-- Insert sample order items
INSERT INTO order_items (id, order_id, product_id, quantity, price, product_name, version) VALUES
(1, 1, 1, 2, 899.99, 'Ordinateur Portable HP', 0),
(2, 2, 2, 1, 1299.99, 'Ordinateur Portable Dell', 0),
(3, 3, 3, 1, 749.99, 'Ordinateur Portable Lenovo', 0),
(4, 3, 4, 1, 1499.99, 'Ordinateur Portable ASUS', 0),
(5, 4, 5, 1, 1199.99, 'Ordinateur Portable Apple MacBook Air', 0),
(6, 5, 6, 1, 1799.99, 'Ordinateur Portable MSI', 0);
