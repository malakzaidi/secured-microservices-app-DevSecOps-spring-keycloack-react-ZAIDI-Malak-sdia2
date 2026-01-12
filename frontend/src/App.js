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
      pkceMethod: 'S256'
    }).then(authenticated => {
      setAuthenticated(authenticated);
      setKeycloakInstance(keycloak);

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
      }
      // Si pas authentifié, on reste sur la page d'accueil (pas de redirection automatique)

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

  // With check-sso, if not authenticated, keycloak.login() is called above
  // So this condition should not be reached, but kept as fallback
  if (!authenticated) {
    return <HomePage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="App">
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand as={Link} to="/">Microservices E-commerce</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/products">Products</Nav.Link>
                {isClient() && <Nav.Link as={Link} to="/orders">My Orders</Nav.Link>}
                {isClient() && <Nav.Link as={Link} to="/create-order">Create Order</Nav.Link>}
                {isAdmin() && <Nav.Link as={Link} to="/admin">Admin Panel</Nav.Link>}
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
