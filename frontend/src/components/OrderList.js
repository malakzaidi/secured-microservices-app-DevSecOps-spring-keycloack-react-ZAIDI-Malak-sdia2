import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Badge, Button, Alert, Spinner, Modal } from 'react-bootstrap';

const API_BASE_URL = 'http://localhost:8087/api';

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
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Orders</h2>
        <Button variant="primary" onClick={fetchOrders}>
          Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <Alert variant="info">
          <Alert.Heading>No Orders Found</Alert.Heading>
          <p>You haven't placed any orders yet.</p>
          <Button variant="primary" href="#create-order">
            Create Your First Order
          </Button>
        </Alert>
      ) : (
        <>
          <Table responsive striped bordered hover>
            <thead className="table-dark">
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Items</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>
                    <Badge bg={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="fw-bold text-success">${order.totalAmount}</td>
                  <td>{order.items?.length || 0} item(s)</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="mt-3 text-muted">
            <small>
              Total orders: {orders.length} |
              Pending: {orders.filter(o => o.status === 'PENDING').length} |
              Delivered: {orders.filter(o => o.status === 'DELIVERED').length}
            </small>
          </div>
        </>
      )}

      {/* Order Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Order Date:</strong> {formatDate(selectedOrder.orderDate)}
                </div>
                <div className="col-md-6">
                  <strong>Status:</strong>{' '}
                  <Badge bg={getStatusBadgeVariant(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>User ID:</strong> {selectedOrder.userId}
                </div>
                <div className="col-md-6">
                  <strong>Total Amount:</strong>{' '}
                  <span className="fw-bold text-success">${selectedOrder.totalAmount}</span>
                </div>
              </div>

              <h5 className="mt-4 mb-3">Order Items</h5>
              <Table striped bordered>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price}</td>
                      <td className="fw-bold">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end fw-bold">Total:</td>
                    <td className="fw-bold text-success">${selectedOrder.totalAmount}</td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default OrderList;
