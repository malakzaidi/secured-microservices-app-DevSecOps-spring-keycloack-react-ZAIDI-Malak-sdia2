-- Schema SQL for Product Service
-- This will be executed automatically by Spring Boot

-- Ensure the schema is clean
DROP TABLE IF EXISTS products CASCADE;

-- Create products table
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    version BIGINT
);

-- Add constraints
ALTER TABLE products ADD CONSTRAINT products_name_unique UNIQUE (name);
ALTER TABLE products ADD CONSTRAINT products_stock_positive CHECK (stock_quantity >= 0);
ALTER TABLE products ADD CONSTRAINT products_price_positive CHECK (price >= 0);
