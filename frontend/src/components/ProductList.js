import React, { useState, useEffect } from 'react';
import api from '../api';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';

function ProductList({ authTrigger }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // Only fetch if we haven't fetched yet and there's a token
    if (!hasFetched && localStorage.getItem('kc_token')) {
      fetchProducts();
      setHasFetched(true);
    }
  }, [hasFetched, authTrigger]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
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
    <Container fluid className="py-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', minHeight: '100vh', color: '#2c3e50' }}>
      <Container>
        {/* Header Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-dark mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
            🛍️ Product Catalog
          </h1>
          <p className="lead text-muted mb-4">
            Discover our premium collection of products
          </p>

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="bg-primary bg-opacity-10 text-primary border-0 shadow-lg">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                  <h4 className="mb-1">{products.length}</h4>
                  <small>Total Products</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="bg-success bg-opacity-10 text-success border-0 shadow-lg">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                  <h4 className="mb-1">{products.filter(p => p.stockQuantity > 0).length}</h4>
                  <small>In Stock</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="bg-info bg-opacity-10 text-info border-0 shadow-lg">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                  <h4 className="mb-1">${products.reduce((sum, p) => sum + p.price, 0).toFixed(2)}</h4>
                  <small>Total Value</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Button
            variant="light"
            size="lg"
            onClick={fetchProducts}
            className="shadow-lg"
            style={{ borderRadius: '25px', padding: '12px 30px' }}
          >
            🔄 Refresh Catalog
          </Button>
        </div>

        {products.length === 0 ? (
          <Card className="bg-white bg-opacity-75 text-dark border-0 shadow-lg">
            <Card.Body className="text-center py-5">
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: '0.5' }}>📭</div>
              <h3>No Products Available</h3>
              <p className="text-muted">Our catalog is currently being updated. Please check back later.</p>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {products.map((product, index) => (
              <Col key={product.id} md={6} lg={4} xl={3} className="mb-4">
                <Card
                  className="h-100 border-0 shadow-lg position-relative overflow-hidden"
                  style={{
                    background: 'white',
                    transition: 'all 0.3s ease',
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                    borderRadius: '15px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Product Image Placeholder */}
                  <div
                    className="position-relative overflow-hidden"
                    style={{
                      height: '200px',
                      background: `linear-gradient(45deg, ${
                        product.stockQuantity > 10 ? '#28a745' :
                        product.stockQuantity > 0 ? '#ffc107' : '#dc3545'
                      }, ${
                        product.stockQuantity > 10 ? '#20c997' :
                        product.stockQuantity > 0 ? '#fd7e14' : '#6c757d'
                      })`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{
                      fontSize: '4rem',
                      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                      animation: 'pulse 2s infinite'
                    }}>
                      {product.stockQuantity > 10 ? '📦' :
                       product.stockQuantity > 0 ? '📦' : '🚫'}
                    </span>

                    {/* Stock Badge */}
                    <Badge
                      className="position-absolute top-0 end-0 m-3 fs-6 px-3 py-2"
                      bg={product.stockQuantity > 10 ? 'success' : product.stockQuantity > 0 ? 'warning' : 'danger'}
                      style={{ borderRadius: '20px', fontWeight: 'bold' }}
                    >
                      {product.stockQuantity > 0 ? `${product.stockQuantity} left` : 'Out of stock'}
                    </Badge>
                  </div>

                  <Card.Body className="d-flex flex-column p-4">
                    <Card.Title className="fw-bold text-truncate mb-2" style={{ fontSize: '1.1rem', color: '#2c3e50' }}>
                      {product.name}
                    </Card.Title>

                    <Card.Text className="text-muted mb-3" style={{ flex: '1', lineHeight: '1.5' }}>
                      {product.description.length > 100
                        ? `${product.description.substring(0, 100)}...`
                        : product.description
                      }
                    </Card.Text>

                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <h4 className="text-success fw-bold mb-0">${product.price}</h4>
                          <small className="text-muted">per unit</small>
                        </div>
                        <small className="text-muted fw-bold">ID: {product.id}</small>
                      </div>
                    </div>
                  </Card.Body>

                  {/* Hover Overlay */}
                  <div
                    className="position-absolute top-0 left-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{
                      background: 'rgba(0,0,0,0.8)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      borderRadius: '15px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                  >
                    <Button
                      variant="light"
                      size="lg"
                      style={{ borderRadius: '25px', padding: '10px 25px' }}
                    >
                      👁️ View Details
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Footer Stats */}
        {products.length > 0 && (
          <Card className="bg-white bg-opacity-75 text-dark border-0 shadow-lg mt-5">
            <Card.Body className="text-center py-4">
              <Row>
                <Col md={3}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                  <h5>{products.length}</h5>
                  <small className="text-muted">Total Products</small>
                </Col>
                <Col md={3}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                  <h5>{products.filter(p => p.stockQuantity > 0).length}</h5>
                  <small className="text-muted">In Stock</small>
                </Col>
                <Col md={3}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚫</div>
                  <h5>{products.filter(p => p.stockQuantity === 0).length}</h5>
                  <small className="text-muted">Out of Stock</small>
                </Col>
                <Col md={3}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                  <h5>${products.reduce((sum, p) => sum + p.price, 0).toFixed(2)}</h5>
                  <small className="text-muted">Total Value</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}
      </Container>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </Container>
  );
}

export default ProductList;
