import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';

const API_BASE_URL = 'http://localhost:8087/api';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/products`);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading products...</span>
        </Spinner>
        <p className="mt-2">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={fetchProducts}>
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Product Catalog</h2>
        <Button variant="primary" onClick={fetchProducts}>
          Refresh
        </Button>
      </div>

      {products.length === 0 ? (
        <Alert variant="info">
          <Alert.Heading>No Products Available</Alert.Heading>
          <p>No products are currently available in the catalog.</p>
        </Alert>
      ) : (
        <Row>
          {products.map((product) => (
            <Col key={product.id} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="text-truncate">{product.name}</Card.Title>
                  <Card.Text className="flex-grow-1">
                    {product.description}
                  </Card.Text>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="text-success mb-0">${product.price}</h5>
                      <Badge bg={product.stockQuantity > 10 ? 'success' : product.stockQuantity > 0 ? 'warning' : 'danger'}>
                        {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                      </Badge>
                    </div>
                    <small className="text-muted">ID: {product.id}</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div className="mt-4 text-muted">
        <small>
          Total products: {products.length} |
          In stock: {products.filter(p => p.stockQuantity > 0).length} |
          Out of stock: {products.filter(p => p.stockQuantity === 0).length}
        </small>
      </div>
    </Container>
  );
}

export default ProductList;
