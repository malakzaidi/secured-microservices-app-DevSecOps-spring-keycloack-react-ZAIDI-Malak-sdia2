import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Keycloak from 'keycloak-js';
import { Container, Navbar, Nav, Button, Spinner, Alert } from 'react-bootstrap';
import ProductList from './components/ProductList';
import OrderList from './components/OrderList';
import OrderForm from './components/OrderForm';
import AdminPanel from './components/AdminPanel';
import HomePage from './components/HomePage';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [keycloakInstance, setKeycloakInstance] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authTrigger, setAuthTrigger] = useState(0);
  const keycloakInitialized = useRef(false);

  useEffect(() => {
    if (keycloakInitialized.current) return;
    keycloakInitialized.current = true;

    console.log('Initializing Keycloak...');
    
    // Configuration object
    const keycloakConfig = {
      url: 'http://localhost:8180',
      realm: 'microservices-realm',
      clientId: 'microservices-client'
    };

    const keycloak = new Keycloak(keycloakConfig);

    keycloak.init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
      // Use S256 for PKCE which is standard for modern Keycloak
      pkceMethod: 'S256',
      // Ensure the redirect URI matches your frontend port
      redirectUri: window.location.origin,
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
    }).then(authenticated => {
      console.log('Keycloak initialized. Authenticated:', authenticated);
      setAuthenticated(authenticated);
      setKeycloakInstance(keycloak);

      if (authenticated) {
        localStorage.setItem('kc_token', keycloak.token);
        const roles = keycloak.tokenParsed?.realm_access?.roles || [];
        setUserRoles(roles);
        setAuthTrigger(prev => prev + 1);
      }
      setLoading(false);
    }).catch(err => {
      console.error('Keycloak initialization failed details:', err);
      // Provide more descriptive error messages
      let errorMessage = 'Failed to initialize authentication.';
      if (!window.navigator.onLine) {
        errorMessage += ' Please check your internet connection.';
      } else {
        errorMessage += ' Ensure Keycloak is running at ' + keycloakConfig.url + ' and CORS is configured.';
      }
      setError(errorMessage);
      setLoading(false);
    });

    // Event Listeners
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(70).then(refreshed => {
        if (refreshed) localStorage.setItem('kc_token', keycloak.token);
      }).catch(() => {
        localStorage.removeItem('kc_token');
        setAuthenticated(false);
      });
    };

  }, []);

  const handleLogin = () => {
    if (keycloakInstance) {
      keycloakInstance.login();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kc_token');
    if (keycloakInstance) {
      keycloakInstance.logout({ redirectUri: window.location.origin });
    }
  };

  const isAdmin = () => userRoles.includes('ADMIN');
  const isClient = () => userRoles.includes('CLIENT');

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Connecting to Authentication Server...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Connection Error</Alert.Heading>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            <strong>Troubleshooting steps:</strong>
            <ul>
              <li>Verify Keycloak is running: <code>docker ps</code></li>
              <li>Check if you can access <a href="http://localhost:8180" target="_blank" rel="noreferrer">Keycloak Console</a></li>
              <li>Run the diagnostic script: <code>./diagnose-keycloak.sh</code></li>
            </ul>
          </p>
        </Alert>
      </Container>
    );
  }

  if (!authenticated) {
    return <HomePage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="App" style={{ fontFamily: 'Lora, serif' }}>
        <Navbar
          expand="lg"
          className="shadow-sm"
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e9ecef',
            padding: '1rem 0'
          }}
        >
          <Container>
            <Navbar.Brand
              as={Link}
              to="/"
              style={{
                fontFamily: 'Lora, serif',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#2c3e50'
              }}
            >
              Microservices E-commerce
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/products" style={{ fontFamily: 'Lora, serif', fontWeight: '500', color: '#2c3e50' }}>Products</Nav.Link>
                {isClient() && <Nav.Link as={Link} to="/orders" style={{ fontFamily: 'Lora, serif', fontWeight: '500', color: '#2c3e50' }}>My Orders</Nav.Link>}
                {isAdmin() && <Nav.Link as={Link} to="/admin" style={{ fontFamily: 'Lora, serif', fontWeight: '500', color: '#2c3e50' }}>Admin Panel</Nav.Link>}
              </Nav>
              <Nav>
                <Navbar.Text className="me-3" style={{ fontFamily: 'Lora, serif', color: '#6c757d' }}>
                  Signed in as: <strong style={{ color: '#2c3e50' }}>{keycloakInstance?.tokenParsed?.preferred_username}</strong>
                </Navbar.Text>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleLogout}
                  style={{
                    fontFamily: 'Lora, serif',
                    fontWeight: '500',
                    borderRadius: '25px',
                    border: '2px solid #3498db'
                  }}
                >
                  Logout
                </Button>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container>
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/products" element={<ProductList authTrigger={authTrigger} />} />
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
