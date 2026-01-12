import React, { useState, useEffect } from 'react';
import api from '../api';
import { Container, Button, Table, Badge, Alert, Spinner, Modal, Form, Row, Col, Card } from 'react-bootstrap';

function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: ''
  });

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity)
      };

      await api.post('/products', productData);
      setShowCreateModal(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Failed to create product');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity)
      };

      await api.put(`/products/${editingProduct.id}`, productData);
      setShowCreateModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status?status=${newStatus}`);
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stockQuantity: ''
    });
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stockQuantity: product.stockQuantity.toString()
    });
    setShowCreateModal(true);
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

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading admin data...</p>
      </div>
    );
  }

  return (
    <Container fluid className="py-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', minHeight: '100vh', color: '#2c3e50' }}>
      <Container>
        {/* Header Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-dark mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
            ⚙️ Admin Panel
          </h1>
          <p className="lead text-muted mb-4">
            Manage products and orders with full administrative control
          </p>

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="bg-primary bg-opacity-10 text-primary border-0 shadow-lg">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                  <h4 className="mb-1">{products.length}</h4>
                  <small>Total Products</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-info bg-opacity-10 text-info border-0 shadow-lg">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                  <h4 className="mb-1">{orders.length}</h4>
                  <small>Total Orders</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-success bg-opacity-10 text-success border-0 shadow-lg">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                  <h4 className="mb-1">${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}</h4>
                  <small>Total Revenue</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-warning bg-opacity-10 text-warning border-0 shadow-lg">
                <Card.Body className="text-center py-3">
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                  <h4 className="mb-1">{orders.filter(order => order.status === 'DELIVERED').length}</h4>
                  <small>Completed Orders</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        {error && (
          <Alert variant="danger" className="shadow-lg mb-4 border-0">
            <Alert.Heading>❌ Error</Alert.Heading>
            <p className="mb-0">{error}</p>
          </Alert>
        )}

        {/* Navigation Tabs */}
        <Card className="bg-white bg-opacity-75 border-0 shadow-lg mb-4">
          <Card.Body className="py-3">
            <div className="d-flex justify-content-center">
              <Button
                variant={activeTab === 'products' ? 'primary' : 'outline-primary'}
                className="me-3 px-4 py-2"
                onClick={() => setActiveTab('products')}
                style={{
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
              >
                📦 Manage Products
              </Button>
              <Button
                variant={activeTab === 'orders' ? 'primary' : 'outline-primary'}
                className="px-4 py-2"
                onClick={() => setActiveTab('orders')}
                style={{
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
              >
                📋 Manage Orders
              </Button>
            </div>
          </Card.Body>
        </Card>

      {/* Products Management */}
      {activeTab === 'products' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Products Management</h4>
            <Button variant="success" onClick={() => setShowCreateModal(true)}>
              Add New Product
            </Button>
          </div>

          <Table responsive striped bordered hover>
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td className="text-truncate" style={{ maxWidth: '200px' }}>
                    {product.description}
                  </td>
                  <td className="fw-bold text-success">${product.price}</td>
                  <td>
                    <Badge bg={product.stockQuantity > 10 ? 'success' : product.stockQuantity > 0 ? 'warning' : 'danger'}>
                      {product.stockQuantity}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => openEditModal(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Orders Management */}
      {activeTab === 'orders' && (
        <div>
          <h4 className="mb-3">Orders Management</h4>

          <Table responsive striped bordered hover>
            <thead className="table-dark">
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Items</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.userId}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>
                    <Badge bg={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="fw-bold text-success">${order.totalAmount}</td>
                  <td>{order.items?.length || 0}</td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      style={{ width: 'auto' }}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </Form.Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Create/Edit Product Modal */}
      <Modal show={showCreateModal} onHide={() => {
        setShowCreateModal(false);
        setEditingProduct(null);
        resetForm();
      }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? 'Edit Product' : 'Create New Product'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => {
                setShowCreateModal(false);
                setEditingProduct(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      </Container>
    </Container>
  );
}

export default AdminPanel;
