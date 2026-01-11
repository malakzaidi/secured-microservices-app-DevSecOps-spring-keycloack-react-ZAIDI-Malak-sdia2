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
  const [authTrigger, setAuthTrigger] = useState(0); // Trigger for components to refetch data
  const keycloakInitialized = useRef(false);

  useEffect(() => {
    // Check for error parameters in URL
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (error) {
      console.error('Keycloak authentication error:', error, errorDescription);
      setError(`Authentication failed: ${errorDescription || error}`);
      setLoading(false);
      // Clear the error from URL
      window.history.replaceState(null, null, window.location.pathname);
      return;
    }

    // Prevent multiple initializations
    if (keycloakInitialized.current) {
      return;
    }

    keycloakInitialized.current = true;

    const keycloak = new Keycloak({
      url: 'http://localhost:8180',
      realm: 'microservices-realm',
      clientId: 'microservices-client'
    });

    keycloak.init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      redirectUri: window.location.origin,
      responseMode: 'query',
      pkceMethod: 'S256'
    }).then(authenticated => {
      setAuthenticated(authenticated);
      setKeycloakInstance(keycloak);

      if (!authenticated) {
        // Not authenticated, redirect to login
        keycloak.login();
        return;
      }

      if (authenticated) {
        // Store token in localStorage
        localStorage.setItem('kc_token', keycloak.token);

        // Extract roles from token
        const token = keycloak.tokenParsed;
        const roles = token?.realm_access?.roles || [];
        setUserRoles(roles);

        // Trigger data fetching in components
        setAuthTrigger(prev => prev + 1);

        console.log('User authenticated:', token.preferred_username);
        console.log('User roles:', roles);
      } else {
        // Clear token if not authenticated
        localStorage.removeItem('kc_token');
        setUserRoles([]);
        setAuthTrigger(0);
      }

      setLoading(false);
    }).catch(error => {
      console.error('Keycloak initialization failed:', error);
      setError('Failed to initialize authentication');
      setLoading(false);
    });

    // Set up token refresh
    keycloak.onTokenExpired = () => {
      console.log('Token expired, refreshing...');
      keycloak.updateToken(70).then((refreshed) => {
        if (refreshed) {
          localStorage.setItem('kc_token', keycloak.token);
          console.log('Token refreshed');
        }
      }).catch(() => {
        console.log('Failed to refresh token');
        // Instead of logout, just clear token and let user re-authenticate
        localStorage.removeItem('kc_token');
        setAuthenticated(false);
        setUserRoles([]);
      });
    };

    // Handle authentication success
    keycloak.onAuthSuccess = () => {
      console.log('Authentication successful');
    };

    // Handle authentication error
    keycloak.onAuthError = (errorData) => {
      console.error('Authentication error:', errorData);
    };

    // Handle authentication refresh success
    keycloak.onAuthRefreshSuccess = () => {
      console.log('Token refresh successful');
      localStorage.setItem('kc_token', keycloak.token);
    };

    // Handle authentication refresh error
    keycloak.onAuthRefreshError = () => {
      console.log('Token refresh failed');
      localStorage.removeItem('kc_token');
      setAuthenticated(false);
      setUserRoles([]);
    };

    // Cleanup function to reset the flag if component unmounts
    return () => {
      keycloakInitialized.current = false;
    };
  }, []);

  const handleLogin = () => {
    if (keycloakInstance) {
      keycloakInstance.login({
        redirectUri: 'http://localhost:3002'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kc_token');
    if (keycloakInstance) {
      keycloakInstance.logout();
    }
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

  // With login-required, this should never be reached
  // But keeping it as a fallback
  if (!authenticated) {
    return (
      <Container className="mt-5">
        <Alert variant="info">
          <Alert.Heading>Redirecting to Login...</Alert.Heading>
          <p>You should be automatically redirected to the login page.</p>
          <p>If not, please check that Keycloak is running on http://localhost:8180</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Router>
      <div className="App">
        {/* Modern Navbar with Gradient */}
        <Navbar
          expand="lg"
          className="shadow-lg mb-4"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backdropFilter: 'blur(10px)',
            borderBottom: 'none'
          }}
          variant="dark"
        >
          <Container fluid>
            <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center" style={{ fontSize: '1.5rem' }}>
              <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>🏪</span>
              Microservices E-commerce
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />

            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link
                  as={Link}
                  to="/products"
                  className="mx-2 px-3 py-2 rounded-pill"
                  style={{ transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  🛍️ Products
                </Nav.Link>

                {isClient() && (
                  <>
                    <Nav.Link
                      as={Link}
                      to="/orders"
                      className="mx-2 px-3 py-2 rounded-pill"
                      style={{ transition: 'all 0.3s ease' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      📋 My Orders
                    </Nav.Link>
                    <Nav.Link
                      as={Link}
                      to="/create-order"
                      className="mx-2 px-3 py-2 rounded-pill bg-success bg-opacity-25 text-white fw-bold"
                      style={{ transition: 'all 0.3s ease' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(25, 135, 84, 0.4)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(25, 135, 84, 0.25)'}
                    >
                      ➕ Create Order
                    </Nav.Link>
                  </>
                )}

                {isAdmin() && (
                  <Nav.Link
                    as={Link}
                    to="/admin"
                    className="mx-2 px-3 py-2 rounded-pill bg-danger bg-opacity-25 text-white fw-bold"
                    style={{ transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.4)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.25)'}
                  >
                    ⚙️ Admin Panel
                  </Nav.Link>
                )}
              </Nav>

              {/* User Profile Section */}
              <Nav className="ms-auto align-items-center">
                <div className="d-flex align-items-center bg-white bg-opacity-10 rounded-pill px-3 py-2 me-3">
                  <div className="d-flex align-items-center me-2">
                    <span style={{ fontSize: '1.5rem' }}>
                      {isAdmin() ? '👑' : isClient() ? '👤' : '👤'}
                    </span>
                  </div>
                  <div className="text-white">
                    <small className="d-block fw-bold">
                      {keycloakInstance?.tokenParsed?.preferred_username || 'User'}
                    </small>
                    <small className="d-flex align-items-center">
                      {isAdmin() && (
                        <span className="badge bg-danger me-1" style={{ fontSize: '0.7rem' }}>ADMIN</span>
                      )}
                      {isClient() && (
                        <span className="badge bg-success" style={{ fontSize: '0.7rem' }}>CLIENT</span>
                      )}
                    </small>
                  </div>
                </div>

                <Button
                  variant="outline-light"
                  onClick={handleLogout}
                  className="rounded-pill px-4 fw-bold"
                  style={{ transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    e.target.style.borderColor = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                  }}
                >
                  🚪 Logout
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
