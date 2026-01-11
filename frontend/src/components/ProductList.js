import React, { useState, useEffect } from 'react';
import api from '../api';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, InputGroup, Form, Toast, ToastContainer } from 'react-bootstrap';

function ProductList({ authTrigger }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    // Only fetch if we haven't fetched yet and there's a token
    if (!hasFetched && localStorage.getItem('kc_token')) {
      fetchProducts();
      setHasFetched(true);
    }
  }, [hasFetched, authTrigger]);

  useEffect(() => {
    // Filter products based on search term
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

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

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
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
    <Container fluid className="py-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      <Container>
        {/* Header Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            🛍️ Product Catalog
          </h1>
          <p className="lead text-white-50 mb-4">
            Discover our amazing collection of products
          </p>

          {/* Search Bar */}
          <div className="row justify-content-center mb-4">
            <div className="col-md-6">
              <InputGroup className="shadow-lg">
                <InputGroup.Text className="bg-white border-0">
                  <span style={{ fontSize: '1.2rem' }}>🔍</span>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 bg-white"
                  style={{ fontSize: '1.1rem', padding: '0.75rem' }}
                />
              </InputGroup>
            </div>
          </div>

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="bg-white bg-opacity-10 text-white border-0 shadow">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem' }}>📦</div>
                  <h4 className="mb-1">{products.length}</h4>
                  <small>Total Products</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="bg-white bg-opacity-10 text-white border-0 shadow">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem' }}>✅</div>
                  <h4 className="mb-1">{products.filter(p => p.stockQuantity > 0).length}</h4>
                  <small>In Stock</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="bg-white bg-opacity-10 text-white border-0 shadow">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem' }}>💰</div>
                  <h4 className="mb-1">
                    ${products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0).toFixed(2)}
                  </h4>
                  <small>Total Value</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="light" size="lg" className="mb-3" />
            <h5 className="text-white">Loading amazing products...</h5>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="danger" className="shadow-lg">
            <Alert.Heading>❌ Oops! Something went wrong</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={fetchProducts}>
              🔄 Try Again
            </Button>
          </Alert>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {filteredProducts.length === 0 ? (
              <Card className="bg-white shadow-lg text-center py-5">
                <Card.Body>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
                  <h3 className="text-muted mb-3">
                    {searchTerm ? 'No products found' : 'No Products Available'}
                  </h3>
                  <p className="text-muted mb-4">
                    {searchTerm
                      ? `No products match your search "${searchTerm}"`
                      : 'No products are currently available in the catalog.'
                    }
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline-primary"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </Button>
                  )}
                </Card.Body>
              </Card>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="text-white mb-0">
                    Showing {filteredProducts.length} of {products.length} products
                  </h5>
                  <Button
                    variant="light"
                    onClick={fetchProducts}
                    disabled={loading}
                  >
                    🔄 Refresh
                  </Button>
                </div>

                <Row>
                  {filteredProducts.map((product, index) => (
                    <Col key={product.id} xl={3} lg={4} md={6} className="mb-4">
                      <Card
                        className="h-100 shadow-lg border-0 position-relative overflow-hidden"
                        style={{
                          background: 'white',
                          transition: 'all 0.3s ease',
                          animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-10px)';
                          e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
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
                          <span style={{ fontSize: '4rem', filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}>
                            {product.stockQuantity > 10 ? '📦' :
                             product.stockQuantity > 0 ? '📦' : '🚫'}
                          </span>

                          {/* Stock Badge */}
                          <Badge
                            className="position-absolute top-0 end-0 m-2"
                            bg={product.stockQuantity > 10 ? 'success' : product.stockQuantity > 0 ? 'warning' : 'danger'}
                          >
                            {product.stockQuantity > 0 ? `${product.stockQuantity} left` : 'Out of stock'}
                          </Badge>
                        </div>

                        <Card.Body className="d-flex flex-column">
                          <Card.Title className="fw-bold text-truncate mb-2" style={{ fontSize: '1.1rem' }}>
                            {product.name}
                          </Card.Title>

                          <Card.Text className="text-muted small mb-3" style={{ flex: '1' }}>
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
                              <small className="text-muted">ID: {product.id}</small>
                            </div>

                            <Button
                              variant={product.stockQuantity > 0 ? "primary" : "secondary"}
                              className="w-100"
                              disabled={product.stockQuantity === 0}
                              onClick={() => showToastMessage(
                                product.stockQuantity > 0
                                  ? `Added ${product.name} to cart!`
                                  : 'This product is out of stock'
                              )}
                              style={{ transition: 'all 0.2s ease' }}
                            >
                              {product.stockQuantity > 0 ? '🛒 Add to Cart' : '🚫 Out of Stock'}
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </>
            )}
          </>
        )}
      </Container>

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
          <Toast.Header>
            <span style={{ fontSize: '1.2rem' }}>🛒</span>
            <strong className="me-auto ms-2">Cart Update</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

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
      `}</style>
    </Container>
  );
}

export default ProductList;
