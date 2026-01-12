import React from 'react';
import { Container, Row, Col, Button, Navbar, Nav } from 'react-bootstrap';

function HomePage({ onLogin }) {
  return (
    <div style={{ fontFamily: 'Lora, serif', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Navigation Bar */}
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
            href="#"
            style={{
              fontFamily: 'Lora, serif',
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#2c3e50'
            }}
          >
            Microservices E-commerce
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Button
                variant="outline-primary"
                className="px-4 py-2"
                style={{
                  fontFamily: 'Lora, serif',
                  fontWeight: '500',
                  borderRadius: '25px',
                  border: '2px solid #3498db'
                }}
                onClick={onLogin}
              >
                Login
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '120px 0 100px 0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.1)',
            zIndex: 1
          }}
        ></div>
        <Container style={{ position: 'relative', zIndex: 2 }}>
          <Row className="align-items-center">
            <Col lg={8}>
              <h1
                style={{
                  fontFamily: 'Lora, serif',
                  fontSize: '3.5rem',
                  fontWeight: '700',
                  lineHeight: '1.2',
                  marginBottom: '1.5rem'
                }}
              >
                Microservices E-commerce
                <br />
                <span style={{ fontWeight: '400' }}>Management Platform</span>
              </h1>
              <p
                style={{
                  fontSize: '1.3rem',
                  lineHeight: '1.6',
                  marginBottom: '2.5rem',
                  opacity: '0.9'
                }}
              >
                Complete product catalog and order management system built with Spring Boot microservices,
                React frontend, and Keycloak security. Enterprise-grade architecture with OAuth2/OpenID Connect
                authentication and role-based access control.
              </p>
              <div>
                <Button
                  size="lg"
                  style={{
                    fontFamily: 'Lora, serif',
                    fontWeight: '600',
                    padding: '15px 40px',
                    fontSize: '1.1rem',
                    borderRadius: '30px',
                    backgroundColor: 'white',
                    color: '#667eea',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={onLogin}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                  }}
                >
                  Access Platform
                </Button>
              </div>
            </Col>
            <Col lg={4} className="text-center">
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '3rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3
                  style={{
                    fontFamily: 'Lora, serif',
                    fontWeight: '600',
                    marginBottom: '1rem'
                  }}
                >
                  Enterprise Ready
                </h3>
                <p style={{ fontSize: '0.95rem', opacity: '0.8', lineHeight: '1.5' }}>
                  Built with industry-standard security practices and scalable architecture
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0', backgroundColor: '#ffffff' }}>
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2
                style={{
                  fontFamily: 'Lora, serif',
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#2c3e50',
                  marginBottom: '1rem'
                }}
              >
                Advanced Platform Features
              </h2>
              <p
                style={{
                  fontSize: '1.1rem',
                  color: '#6c757d',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}
              >
                Comprehensive product and order management with enterprise-grade security
              </p>
            </Col>
          </Row>

          <Row>
            <Col md={6} lg={3} className="mb-4">
              <div
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '15px',
                  padding: '2rem',
                  textAlign: 'center',
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#3498db',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 3H8C6.89543 3 6 3.89543 6 5V7H18V5C18 3.89543 17.1046 3 16 3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h5
                  style={{
                    fontFamily: 'Lora, serif',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '1rem'
                  }}
                >
                  Product Management
                </h5>
                <p style={{ color: '#6c757d', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Complete CRUD operations for product catalog management with real-time inventory tracking
                </p>
              </div>
            </Col>

            <Col md={6} lg={3} className="mb-4">
              <div
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '15px',
                  padding: '2rem',
                  textAlign: 'center',
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#e74c3c',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2"/>
                  </svg>
                </div>
                <h5
                  style={{
                    fontFamily: 'Lora, serif',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '1rem'
                  }}
                >
                  Order Processing
                </h5>
                <p style={{ color: '#6c757d', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Automated order creation with stock validation and real-time total calculations
                </p>
              </div>
            </Col>

            <Col md={6} lg={3} className="mb-4">
              <div
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '15px',
                  padding: '2rem',
                  textAlign: 'center',
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#27ae60',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 5V3C16 2.44772 15.5523 2 15 2H9C8.44772 2 8 2.44772 8 3V5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h5
                  style={{
                    fontFamily: 'Lora, serif',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '1rem'
                  }}
                >
                  Role-Based Access
                </h5>
                <p style={{ color: '#6c757d', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Granular permissions with separate interfaces for administrators and clients
                </p>
              </div>
            </Col>

            <Col md={6} lg={3} className="mb-4">
              <div
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '15px',
                  padding: '2rem',
                  textAlign: 'center',
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#f39c12',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h5
                  style={{
                    fontFamily: 'Lora, serif',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '1rem'
                  }}
                >
                  Microservices
                </h5>
                <p style={{ color: '#6c757d', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Scalable architecture with independent services communicating via secure APIs
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#2c3e50', color: 'white', padding: '40px 0' }}>
        <Container>
          <Row className="text-center">
            <Col>
              <h4
                style={{
                  fontFamily: 'Lora, serif',
                  fontWeight: '600',
                  marginBottom: '1rem'
                }}
              >
                Microservices E-commerce Platform
              </h4>
              <p style={{ opacity: '0.8', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Built with Spring Boot, React, and Keycloak for enterprise-grade security and performance.
                <br />
                Advanced DevSecOps practices ensure reliability and security at scale.
              </p>
              <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '2rem 0' }} />
              <small style={{ opacity: '0.6' }}>
                © 2024 Secure Microservices E-commerce. All rights reserved.
              </small>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}

export default HomePage;
