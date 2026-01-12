import React, { useState, useEffect } from 'react';
import api from '../api';
import { apiOrder } from '../api';
import { Container, Button, Card, Row, Col, Badge, Alert, Spinner, Modal, InputGroup, Form, ToastContainer, Toast } from 'react-bootstrap';

function OrderForm() {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data.filter(p => p.stockQuantity > 0)); // Only show products in stock
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const addToOrder = (product) => {
    const existingItem = selectedItems.find(item => item.productId === product.id);

    if (existingItem) {
      if (existingItem.quantity < product.stockQuantity) {
        setSelectedItems(selectedItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setError(`Cannot add more ${product.name}. Maximum stock available: ${product.stockQuantity}`);
      }
    } else {
      setSelectedItems([...selectedItems, {
        productId: product.id,
        quantity: 1,
        productName: product.name,
        price: product.price
      }]);
    }
  };

  const removeFromOrder = (productId) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromOrder(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (newQuantity > product.stockQuantity) {
      setError(`Cannot order more than ${product.stockQuantity} of ${product.name}`);
      return;
    }

    setSelectedItems(selectedItems.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      setError('Please add at least one product to your order.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const orderRequest = {
        items: selectedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const response = await apiOrder.post('/orders', orderRequest);
      setCreatedOrder(response.data);
      setShowSuccessModal(true);
      setSelectedItems([]); // Clear the order

    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading products...</p>
      </div>
    );
  }

  return (
    <Container fluid className="py-4" style={{ fontFamily: 'Lora, serif', backgroundColor: '#f8f9fa', minHeight: '100vh', color: '#2c3e50' }}>
      <Container>
        {/* Header Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-dark mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
            🛒 Create New Order
          </h1>
          <p className="lead text-muted mb-4">
            Select products and build your perfect order
          </p>

          {/* Progress Indicator */}
          <div className="mb-4">
            <div className="d-flex justify-content-center align-items-center mb-2">
              <div className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${
                selectedItems.length > 0 ? 'bg-success' : 'bg-secondary'
              }`} style={{ width: '40px', height: '40px' }}>
                <span className="text-white fw-bold">1</span>
              </div>
              <div style={{ width: '100px', height: '2px', backgroundColor: '#dee2e6' }}></div>
              <div className={`rounded-circle d-flex align-items-center justify-content-center mx-2 ${
                selectedItems.length > 0 ? 'bg-primary' : 'bg-secondary'
              }`} style={{ width: '40px', height: '40px' }}>
                <span className="text-white fw-bold">2</span>
              </div>
              <div style={{ width: '100px', height: '2px', backgroundColor: '#dee2e6' }}></div>
              <div className={`rounded-circle d-flex align-items-center justify-content-center ms-2 ${
                submitting ? 'bg-warning' : 'bg-secondary'
              }`} style={{ width: '40px', height: '40px' }}>
                <span className="text-white fw-bold">3</span>
              </div>
            </div>
            <div className="d-flex justify-content-between" style={{ maxWidth: '400px', margin: '0 auto' }}>
              <small className="text-muted">Select Products</small>
              <small className="text-muted">Review Order</small>
              <small className="text-muted">Place Order</small>
            </div>
          </div>

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="bg-white bg-opacity-75 text-dark border-0 shadow">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem' }}>📦</div>
                  <h4 className="mb-1">{filteredProducts.length}</h4>
                  <small>Available Products</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="bg-white bg-opacity-75 text-dark border-0 shadow">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem' }}>🛒</div>
                  <h4 className="mb-1">{selectedItems.length}</h4>
                  <small>Items in Cart</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="bg-white bg-opacity-75 text-dark border-0 shadow">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem' }}>💰</div>
                  <h4 className="mb-1">${calculateTotal().toFixed(2)}</h4>
                  <small>Total Amount</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        {error && (
          <Alert variant="danger" className="shadow-lg mb-4">
            <Alert.Heading>❌ Oops! Something went wrong</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        <Row>
          {/* Products List */}
          <Col lg={8} xl={9}>
            {/* Search Bar */}
            <Card className="mb-4 shadow">
              <Card.Body className="py-3">
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <span style={{ fontSize: '1.2rem' }}>🔍</span>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 bg-light"
                    style={{ fontSize: '1.1rem', padding: '0.75rem' }}
                  />
                  {searchTerm && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => setSearchTerm('')}
                      className="border-0"
                    >
                      ✕
                    </Button>
                  )}
                </InputGroup>
              </Card.Body>
            </Card>

            <Card className="shadow">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🛍️</span>
                  Available Products ({filteredProducts.length})
                </h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Loading products...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <Alert variant="info" className="text-center py-4">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    <h5>{searchTerm ? 'No products found' : 'No products available'}</h5>
                    <p className="mb-0">
                      {searchTerm
                        ? `Try adjusting your search term or clear the search to see all products.`
                        : 'There are currently no products in stock.'
                      }
                    </p>
                    {searchTerm && (
                      <Button
                        variant="outline-primary"
                        className="mt-3"
                        onClick={() => setSearchTerm('')}
                      >
                        Clear Search
                      </Button>
                    )}
                  </Alert>
                ) : (
                  <Row>
                    {filteredProducts.map((product, index) => (
                      <Col key={product.id} md={6} lg={4} className="mb-4">
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
                            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
                          }}
                        >
                          {/* Product Image Placeholder */}
                          <div
                            className="position-relative overflow-hidden"
                            style={{
                              height: '180px',
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
                            <span style={{ fontSize: '3rem', filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}>
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
                              {product.description.length > 80
                                ? `${product.description.substring(0, 80)}...`
                                : product.description
                              }
                            </Card.Text>

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
                              onClick={() => {
                                addToOrder(product);
                                showToastMessage(`Added ${product.name} to your cart!`);
                              }}
                              style={{ transition: 'all 0.2s ease' }}
                            >
                              {product.stockQuantity > 0 ? '🛒 Add to Cart' : '🚫 Out of Stock'}
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Order Summary */}
          <Col lg={4} xl={3}>
            <Card className="sticky-top shadow-lg border-0" style={{ top: '20px' }}>
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🛒</span>
                  Order Summary
                </h5>
              </Card.Header>
              <Card.Body>
                {selectedItems.length === 0 ? (
                  <div className="text-center py-4">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: '0.5' }}>🛒</div>
                    <p className="text-muted mb-3">Your cart is empty</p>
                    <small className="text-muted">Add some products to get started!</small>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      {selectedItems.map((item, index) => (
                        <Card key={item.productId} className="mb-3 border-0 shadow-sm" style={{ animation: `slideInRight 0.3s ease-out ${index * 0.1}s both` }}>
                          <Card.Body className="py-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="flex-grow-1 me-2">
                                <h6 className="mb-1 text-truncate">{item.productName}</h6>
                                <small className="text-muted">${item.price} each</small>
                              </div>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => {
                                  removeFromOrder(item.productId);
                                  showToastMessage(`Removed ${item.productName} from cart`);
                                }}
                                style={{ fontSize: '0.8rem', padding: '0.2rem 0.4rem' }}
                              >
                                ✕
                              </Button>
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  −
                                </Button>
                                <Badge bg="primary" className="me-2 px-3 py-2">{item.quantity}</Badge>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                >
                                  +
                                </Button>
                              </div>
                              <strong className="text-success">
                                ${(item.price * item.quantity).toFixed(2)}
                              </strong>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>

                    <hr className="my-4" />

                    {/* Order Totals */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Shipping:</span>
                        <span className="text-success">FREE</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Tax:</span>
                        <span>${(calculateTotal() * 0.08).toFixed(2)}</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <strong className="fs-5">Total:</strong>
                        <strong className="text-success fs-5">
                          ${(calculateTotal() * 1.08).toFixed(2)}
                        </strong>
                      </div>
                    </div>

                    <Button
                      variant="success"
                      size="lg"
                      className="w-100 fw-bold"
                      onClick={handleSubmit}
                      disabled={submitting || selectedItems.length === 0}
                      style={{ fontSize: '1.1rem', padding: '0.75rem' }}
                    >
                      {submitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Creating Order...
                        </>
                      ) : (
                        <>
                          🛍️ Place Order (${(calculateTotal() * 1.08).toFixed(2)})
                        </>
                      )}
                    </Button>

                    {selectedItems.length > 0 && (
                      <div className="text-center mt-3">
                        <small className="text-muted">
                          {selectedItems.reduce((sum, item) => sum + item.quantity, 0)} items • Secure checkout
                        </small>
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

        {/* Success Modal */}
        <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title className="d-flex align-items-center">
              <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🎉</span>
              Order Created Successfully!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {createdOrder && (
              <div>
                {/* Order Summary Cards */}
                <Row className="mb-4">
                  <Col md={6}>
                    <Card className="text-center border-success shadow">
                      <Card.Body>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                        <h6 className="text-muted mb-1">Order Number</h6>
                        <h4 className="text-success mb-0">#{createdOrder.id}</h4>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="text-center border-success shadow">
                      <Card.Body>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                        <h6 className="text-muted mb-1">Total Amount</h6>
                        <h4 className="text-success mb-0">${createdOrder.totalAmount}</h4>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Order Details */}
                <Card className="mb-4 shadow">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0 d-flex align-items-center">
                      <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>📦</span>
                      Order Details
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-3">
                      <span><strong>Status:</strong></span>
                      <Badge bg="primary" className="fs-6 px-3 py-2">{createdOrder.status}</Badge>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span><strong>Items:</strong></span>
                      <span className="fw-bold">{createdOrder.items?.length || 0} products</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span><strong>Order Date:</strong></span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </Card.Body>
                </Card>

                {/* Order Items */}
                <h6 className="mb-3 d-flex align-items-center">
                  <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🛒</span>
                  Order Items
                </h6>
                <div className="mb-4">
                  {createdOrder.items?.map((item, index) => (
                    <Card key={index} className="mb-3 border-0 shadow-sm">
                      <Card.Body className="py-3">
                        <Row className="align-items-center">
                          <Col md={6}>
                            <h6 className="mb-1">{item.productName}</h6>
                            <small className="text-muted">${item.price} each</small>
                          </Col>
                          <Col md={3} className="text-center">
                            <Badge bg="secondary" className="fs-6 px-3 py-2">
                              Qty: {item.quantity}
                            </Badge>
                          </Col>
                          <Col md={3} className="text-end">
                            <span className="fw-bold text-success fs-5">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>

                {/* Success Message */}
                <Alert variant="success" className="text-center py-4">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                  <h5>Your order has been placed successfully!</h5>
                  <p className="mb-0">You will receive a confirmation email shortly.</p>
                </Alert>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="secondary" onClick={() => setShowSuccessModal(false)}>
              Close
            </Button>
            <Button variant="success" href="#orders" onClick={() => setShowSuccessModal(false)}>
              👁️ View My Orders
            </Button>
            <Button variant="primary" onClick={() => {
              setShowSuccessModal(false);
              setSelectedItems([]);
              showToastMessage('Ready to create another order!');
            }}>
              🛒 Create Another Order
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Toast Notifications */}
        <ToastContainer position="top-end" className="p-3">
          <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
            <Toast.Header>
              <span style={{ fontSize: '1.2rem' }}>🛒</span>
              <strong className="me-auto ms-2">Order Update</strong>
            </Toast.Header>
            <Toast.Body>{toastMessage}</Toast.Body>
          </Toast>
        </ToastContainer>


      </Container>
  );
}

export default OrderForm;
