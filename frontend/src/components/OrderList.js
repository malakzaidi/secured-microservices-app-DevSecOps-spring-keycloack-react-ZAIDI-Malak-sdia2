import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner, Modal, InputGroup, Form, Toast, ToastContainer } from 'react-bootstrap';

const API_BASE_URL = 'http://localhost:8087/api';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // Filter orders based on search term and status
    let filtered = orders;

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/orders/my-orders`);
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading orders...</span>
        </Spinner>
        <p className="mt-2">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={fetchOrders}>
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <Container fluid className="py-4" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', minHeight: '100vh' }}>
      <Container>
        {/* Header Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            📋 My Orders
          </h1>
          <p className="lead text-white-50 mb-4">
            Track and manage your order history
          </p>

          {/* Search and Filter */}
          <Row className="mb-4 justify-content-center">
            <Col md={6} lg={4} className="mb-3">
              <InputGroup className="shadow-lg">
                <InputGroup.Text className="bg-white border-0">
                  <span style={{ fontSize: '1.2rem' }}>🔍</span>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 bg-white"
                />
              </InputGroup>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="shadow-lg bg-white border-0"
                style={{ height: '50px', fontSize: '1.1rem' }}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="bg-white bg-opacity-10 text-white border-0 shadow">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem' }}>📦</div>
                  <h4 className="mb-1">{orders.length}</h4>
                  <small>Total Orders</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-white bg-opacity-10 text-white border-0 shadow">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem' }}>⏳</div>
                  <h4 className="mb-1">{orders.filter(o => o.status === 'PENDING').length}</h4>
                  <small>Pending</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-white bg-opacity-10 text-white border-0 shadow">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem' }}>🚚</div>
                  <h4 className="mb-1">{orders.filter(o => ['SHIPPED', 'DELIVERED'].includes(o.status)).length}</h4>
                  <small>In Transit</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-white bg-opacity-10 text-white border-0 shadow">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem' }}>✅</div>
                  <h4 className="mb-1">{orders.filter(o => o.status === 'DELIVERED').length}</h4>
                  <small>Delivered</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="light" size="lg" className="mb-3" />
            <h5 className="text-white">Loading your orders...</h5>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="danger" className="shadow-lg">
            <Alert.Heading>❌ Oops! Something went wrong</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={fetchOrders}>
              🔄 Try Again
            </Button>
          </Alert>
        )}

        {/* Orders Grid */}
        {!loading && !error && (
          <>
            {filteredOrders.length === 0 ? (
              <Card className="bg-white shadow-lg text-center py-5">
                <Card.Body>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                  <h3 className="text-muted mb-3">
                    {searchTerm || statusFilter !== 'ALL' ? 'No orders found' : 'No Orders Yet'}
                  </h3>
                  <p className="text-muted mb-4">
                    {searchTerm || statusFilter !== 'ALL'
                      ? 'Try adjusting your search or filter criteria'
                      : "You haven't placed any orders yet. Start shopping now!"
                    }
                  </p>
                  {(searchTerm || statusFilter !== 'ALL') && (
                    <div className="mb-3">
                      <Button
                        variant="outline-primary"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('ALL');
                        }}
                        className="me-2"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="primary"
                    size="lg"
                    href="#products"
                    disabled={loading}
                  >
                    🛍️ Start Shopping
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="text-white mb-0">
                    Showing {filteredOrders.length} of {orders.length} orders
                  </h5>
                  <Button
                    variant="light"
                    onClick={fetchOrders}
                    disabled={loading}
                  >
                    🔄 Refresh
                  </Button>
                </div>

                <Row>
                  {filteredOrders.map((order, index) => (
                    <Col key={order.id} xl={4} lg={6} className="mb-4">
                      <Card
                        className="h-100 shadow-lg border-0 overflow-hidden"
                        style={{
                          background: 'white',
                          transition: 'all 0.3s ease',
                          animation: `slideInLeft 0.5s ease-out ${index * 0.1}s both`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-5px)';
                          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
                        }}
                      >
                        {/* Status Header */}
                        <div
                          className="position-relative"
                          style={{
                            height: '80px',
                            background: `linear-gradient(45deg, ${
                              order.status === 'DELIVERED' ? '#28a745' :
                              order.status === 'SHIPPED' ? '#007bff' :
                              order.status === 'CONFIRMED' ? '#17a2b8' :
                              order.status === 'PENDING' ? '#ffc107' :
                              '#dc3545'
                            }, ${
                              order.status === 'DELIVERED' ? '#20c997' :
                              order.status === 'SHIPPED' ? '#0056b3' :
                              order.status === 'CONFIRMED' ? '#138496' :
                              order.status === 'PENDING' ? '#e0a800' :
                              '#c82333'
                            })`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <div className="text-center text-white">
                            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
                              {order.status === 'DELIVERED' ? '✅' :
                               order.status === 'SHIPPED' ? '🚚' :
                               order.status === 'CONFIRMED' ? '📋' :
                               order.status === 'PENDING' ? '⏳' : '❌'}
                            </div>
                            <Badge bg="light" text="dark" className="fw-bold">
                              {order.status}
                            </Badge>
                          </div>
                        </div>

                        <Card.Body className="d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h5 className="mb-1">Order #{order.id}</h5>
                              <small className="text-muted">
                                {formatDate(order.orderDate)}
                              </small>
                            </div>
                            <h4 className="text-success fw-bold mb-0">
                              ${order.totalAmount}
                            </h4>
                          </div>

                          <div className="mb-3">
                            <div className="d-flex justify-content-between text-muted small">
                              <span>Items: {order.items?.length || 0}</span>
                              <span>User ID: {order.userId}</span>
                            </div>
                          </div>

                          <Button
                            variant="outline-primary"
                            className="w-100 mt-auto"
                            onClick={() => handleViewDetails(order)}
                            style={{ transition: 'all 0.2s ease' }}
                          >
                            👁️ View Details
                          </Button>
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

      {/* Order Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="d-flex align-items-center">
            <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>📋</span>
            Order Details #{selectedOrder?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedOrder && (
            <div>
              {/* Order Summary Cards */}
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
                      <h6 className="text-muted mb-1">Order Date</h6>
                      <p className="mb-0 fw-bold">{formatDate(selectedOrder.orderDate)}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {selectedOrder.status === 'DELIVERED' ? '✅' :
                         selectedOrder.status === 'SHIPPED' ? '🚚' :
                         selectedOrder.status === 'CONFIRMED' ? '📋' :
                         selectedOrder.status === 'PENDING' ? '⏳' : '❌'}
                      </div>
                      <h6 className="text-muted mb-1">Status</h6>
                      <Badge bg={getStatusBadgeVariant(selectedOrder.status)} className="fs-6 px-3 py-2">
                        {selectedOrder.status}
                      </Badge>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Additional Info */}
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h6 className="text-muted mb-1">👤 User ID</h6>
                      <p className="mb-0 fw-bold">{selectedOrder.userId}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h6 className="text-muted mb-1">💰 Total Amount</h6>
                      <p className="mb-0 fw-bold text-success fs-5">${selectedOrder.totalAmount}</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Order Items */}
              <h5 className="mb-3 d-flex align-items-center">
                <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🛒</span>
                Order Items ({selectedOrder.items?.length || 0})
              </h5>

              <div className="mb-3">
                {selectedOrder.items?.map((item, index) => (
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

              {/* Total Summary */}
              <Card className="border-success shadow-lg" style={{ borderWidth: '2px' }}>
                <Card.Body className="text-center py-4">
                  <h4 className="text-success mb-0">
                    💰 Grand Total: ${selectedOrder.totalAmount}
                  </h4>
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowDetails(false);
              showToastMessage('Order details viewed successfully!');
            }}
          >
            👍 Got it
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
          <Toast.Header>
            <span style={{ fontSize: '1.2rem' }}>📋</span>
            <strong className="me-auto ms-2">Order Update</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </Container>
  );
}

export default OrderList;
