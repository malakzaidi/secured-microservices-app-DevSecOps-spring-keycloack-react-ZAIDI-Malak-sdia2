import React, { useState, useEffect } from 'react';
import api from '../api';
import { Container, Table, Badge, Button, Alert, Spinner, Modal } from 'react-bootstrap';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/my-orders');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
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
    <Container fluid className="py-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', minHeight: '100vh', color: '#2c3e50' }}>
      <Container>
        {/* Header Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-dark mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
            📋 My Orders
          </h1>
          <p className="lead text-muted mb-4">
            Track and manage your order history
          </p>

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="bg-primary bg-opacity-10 text-primary border-0 shadow-lg">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                  <h4 className="mb-1">{orders.length}</h4>
                  <small>Total Orders</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-info bg-opacity-10 text-info border-0 shadow-lg">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                  <h4 className="mb-1">{orders.reduce((sum, order) => sum + (order.items?.length || 0), 0)}</h4>
                  <small>Total Items</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-success bg-opacity-10 text-success border-0 shadow-lg">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                  <h4 className="mb-1">${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}</h4>
                  <small>Total Spent</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-warning bg-opacity-10 text-warning border-0 shadow-lg">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                  <h4 className="mb-1">{orders.filter(order => order.status === 'DELIVERED').length}</h4>
                  <small>Completed</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Button
            variant="light"
            size="lg"
            onClick={fetchOrders}
            className="shadow-lg"
            style={{ borderRadius: '25px', padding: '12px 30px' }}
          >
            🔄 Refresh Orders
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card className="bg-white bg-opacity-75 text-dark border-0 shadow-lg">
            <Card.Body className="text-center py-5">
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: '0.5' }}>🛒</div>
              <h3>No Orders Found</h3>
              <p className="text-muted mb-4">You haven't placed any orders yet. Start shopping now!</p>
              <Button
                variant="primary"
                size="lg"
                href="#products"
                style={{ borderRadius: '25px', padding: '12px 30px' }}
              >
                🛍️ Start Shopping
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {orders.map((order, index) => (
              <Col key={order.id} lg={6} className="mb-4">
                <Card
                  className="border-0 shadow-lg h-100"
                  style={{
                    background: 'white',
                    borderRadius: '15px',
                    transition: 'all 0.3s ease',
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                  }}
                >
                  <Card.Header className="bg-gradient-primary text-white border-0" style={{
                    background: `linear-gradient(45deg, ${
                      order.status === 'DELIVERED' ? '#28a745' :
                      order.status === 'SHIPPED' ? '#007bff' :
                      order.status === 'CONFIRMED' ? '#17a2b8' :
                      order.status === 'PENDING' ? '#ffc107' : '#dc3545'
                    }, ${
                      order.status === 'DELIVERED' ? '#20c997' :
                      order.status === 'SHIPPED' ? '#0056b3' :
                      order.status === 'CONFIRMED' ? '#138496' :
                      order.status === 'PENDING' ? '#e0a800' : '#bd2130'
                    })`,
                    borderRadius: '15px 15px 0 0 !important'
                  }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Order #{order.id}</h5>
                      <Badge bg="light" text="dark" className="fs-6 px-3 py-2" style={{ borderRadius: '20px' }}>
                        {order.status}
                      </Badge>
                    </div>
                  </Card.Header>

                  <Card.Body className="p-4">
                    <Row className="mb-3">
                      <Col md={6}>
                        <div className="d-flex align-items-center mb-2">
                          <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>📅</span>
                          <div>
                            <small className="text-muted d-block">Order Date</small>
                            <strong>{formatDate(order.orderDate)}</strong>
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="d-flex align-items-center mb-2">
                          <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🛒</span>
                          <div>
                            <small className="text-muted d-block">Items</small>
                            <strong>{order.items?.length || 0} product(s)</strong>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <small className="text-muted d-block">Total Amount</small>
                        <h4 className="text-success mb-0 fw-bold">${order.totalAmount}</h4>
                      </div>
                      <Button
                        variant="outline-primary"
                        onClick={() => handleViewDetails(order)}
                        style={{ borderRadius: '20px' }}
                      >
                        👁️ View Details
                      </Button>
                    </div>

                    {/* Order Status Progress */}
                    <div className="mt-3">
                      <small className="text-muted d-block mb-2">Order Progress</small>
                      <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                        <div
                          className={`progress-bar ${
                            order.status === 'DELIVERED' ? 'bg-success' :
                            order.status === 'SHIPPED' ? 'bg-primary' :
                            order.status === 'CONFIRMED' ? 'bg-info' :
                            order.status === 'PENDING' ? 'bg-warning' : 'bg-danger'
                          }`}
                          style={{
                            width: `${
                              order.status === 'DELIVERED' ? '100' :
                              order.status === 'SHIPPED' ? '75' :
                              order.status === 'CONFIRMED' ? '50' :
                              order.status === 'PENDING' ? '25' : '10'
                            }%`
                          }}
                        ></div>
                      </div>
                      <div className="d-flex justify-content-between mt-1">
                        <small className="text-muted">Ordered</small>
                        <small className="text-muted">Delivered</small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Order Details Modal */}
        <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-primary text-white">
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
                    <Card className="text-center border-primary shadow">
                      <Card.Body>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
                        <h6 className="text-muted mb-1">Order Date</h6>
                        <h5 className="text-primary mb-0">{formatDate(selectedOrder.orderDate)}</h5>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="text-center border-success shadow">
                      <Card.Body>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                        <h6 className="text-muted mb-1">Total Amount</h6>
                        <h5 className="text-success mb-0">${selectedOrder.totalAmount}</h5>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Order Items */}
                <h5 className="mb-4 d-flex align-items-center">
                  <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🛒</span>
                  Order Items
                </h5>
                <div className="mb-4">
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

                {/* Order Status */}
                <Card className="border-0 shadow">
                  <Card.Body className="text-center py-4">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                      {selectedOrder.status === 'DELIVERED' ? '✅' :
                       selectedOrder.status === 'SHIPPED' ? '🚚' :
                       selectedOrder.status === 'CONFIRMED' ? '📋' :
                       selectedOrder.status === 'PENDING' ? '⏳' : '❌'}
                    </div>
                    <h4>Order Status: <Badge bg={getStatusBadgeVariant(selectedOrder.status)} className="fs-6 px-3 py-2">{selectedOrder.status}</Badge></h4>
                    <p className="text-muted mb-0">Your order is being processed</p>
                  </Card.Body>
                </Card>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="secondary" onClick={() => setShowDetails(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
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
      `}</style>
    </Container>
  );
}

export default OrderList;
