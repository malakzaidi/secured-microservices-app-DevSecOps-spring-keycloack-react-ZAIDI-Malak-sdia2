import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Keycloak from 'keycloak-js';
import { Container, Navbar, Nav, Button, Spinner, Alert, Row, Col, Card } from 'react-bootstrap';
import ProductList from './components/ProductList';
import OrderList from './components/OrderList';
import OrderForm from './components/OrderForm';
import AdminPanel from './components/AdminPanel';
import HomePage from './components/HomePage';

// Configuration Keycloak
const keycloak = new Keycloak({
  url: 'http://localhost:8180',
  realm: 'microservices-realm',
  clientId: 'microservices-client'
});

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [keycloakInstance, setKeycloakInstance] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    keycloak.init({
      onLoad: 'check-sso',
      checkLoginIframe: false
    }).then(authenticated => {
      setAuthenticated(authenticated);
      setKeycloakInstance(keycloak);

      if (authenticated) {
        // Extract roles from token
        const token = keycloak.tokenParsed;
        const roles = token?.realm_access?.roles || [];
        setUserRoles(roles);

        console.log('User authenticated:', token.preferred_username);
        console.log('User roles:', roles);
      }

      setLoading(false);
    }).catch(error => {
      console.error('Keycloak initialization failed:', error);
      setError('Failed to initialize authentication');
      setLoading(false);
    });
  }, []);

  const handleLogin = () => {
    setShowLogin(true);
    keycloak.login({
      redirectUri: window.location.origin
    });
  };

  const handleLogout = () => {
    keycloak.logout();
  };

  const isAdmin = () => userRoles.includes('ADMIN');
  const isClient = () => userRoles.includes('CLIENT');

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>Initializing authentication...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Authentication Error</Alert.Heading>
          <p>{error}</p>
          <p>Please make sure Keycloak is running on http://localhost:8180</p>
        </Alert>
      </Container>
    );
  }

  if (!authenticated) {
    return <HomePage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="App">
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand href="#home">Microservices E-commerce</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="#products">Products</Nav.Link>
                {isClient() && <Nav.Link href="#orders">My Orders</Nav.Link>}
                {isClient() && <Nav.Link href="#create-order">Create Order</Nav.Link>}
                {isAdmin() && <Nav.Link href="#admin">Admin Panel</Nav.Link>}
              </Nav>
              <Nav>
                <Navbar.Text className="me-3">
                  Welcome, {keycloakInstance?.tokenParsed?.preferred_username}!
                  {isAdmin() && <span className="badge bg-danger ms-2">ADMIN</span>}
                  {isClient() && <span className="badge bg-success ms-2">CLIENT</span>}
                </Navbar.Text>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container>
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/products" element={<ProductList />} />
            {isClient() && <Route path="/orders" element={<OrderList />} />}
            {isClient() && <Route path="/create-order" element={<OrderForm />} />}
            {isAdmin() && <Route path="/admin" element={<AdminPanel />} />}
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
