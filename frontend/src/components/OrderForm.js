import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Button, Card, Row, Col, Badge, Alert, Spinner, Modal } from 'react-bootstrap';

const API_BASE_URL = 'http://localhost:8087/api';

function OrderForm() {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/products`);
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

      const response = await axios.post(`${API_BASE_URL}/orders`, orderRequest);
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
    <Container>
      <h2 className="mb-4">Create New Order</h2>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Row>
        {/* Products List */}
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Available Products</h5>
            </Card.Header>
            <Card.Body>
              {products.length === 0 ? (
                <Alert variant="info">No products available in stock.</Alert>
              ) : (
                <Row>
                  {products.map((product) => (
                    <Col key={product.id} md={6} className="mb-3">
                      <Card className="h-100">
                        <Card.Body>
                          <Card.Title className="text-truncate">{product.name}</Card.Title>
                          <Card.Text className="small">{product.description}</Card.Text>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong className="text-success">${product.price}</strong>
                              <br />
                              <small className="text-muted">
                                Stock: {product.stockQuantity}
                              </small>
                            </div>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => addToOrder(product)}
                              disabled={selectedItems.some(item => item.productId === product.id && item.quantity >= product.stockQuantity)}
                            >
                              Add to Order
                            </Button>
                          </div>
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
        <Col md={4}>
          <Card className="sticky-top">
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              {selectedItems.length === 0 ? (
                <p className="text-muted">No items in your order yet.</p>
              ) : (
                <>
                  {selectedItems.map((item) => (
                    <div key={item.productId} className="d-flex justify-content-between align-items-center mb-2">
                      <div className="flex-grow-1">
                        <small className="d-block text-truncate">{item.productName}</small>
                        <small className="text-muted">${item.price} each</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <Badge bg="secondary" className="me-2">{item.quantity}</Badge>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeFromOrder(item.productId)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}

                  <hr />
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>Total:</strong>
                    <strong className="text-success">${calculateTotal().toFixed(2)}</strong>
                  </div>

                  <Button
                    variant="success"
                    className="w-100 mt-3"
                    onClick={handleSubmit}
                    disabled={submitting || selectedItems.length === 0}
                  >
                    {submitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Creating Order...
                      </>
                    ) : (
                      'Create Order'
                    )}
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-success">Order Created Successfully! 🎉</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {createdOrder && (
            <div>
              <Alert variant="success">
                <h5>Order #{createdOrder.id}</h5>
                <p className="mb-1"><strong>Total Amount:</strong> ${createdOrder.totalAmount}</p>
                <p className="mb-1"><strong>Status:</strong> {createdOrder.status}</p>
                <p className="mb-0"><strong>Items:</strong> {createdOrder.items?.length || 0}</p>
              </Alert>

              <h6>Order Items:</h6>
              <ul>
                {createdOrder.items?.map((item, index) => (
                  <li key={index}>
                    {item.productName} - Quantity: {item.quantity} - ${item.price} each
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSuccessModal(false)}>
            Close
          </Button>
          <Button variant="primary" href="#orders">
            View My Orders
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default OrderForm;
