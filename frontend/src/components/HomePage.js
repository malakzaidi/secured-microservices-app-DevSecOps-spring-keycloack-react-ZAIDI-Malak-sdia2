import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Jumbotron } from 'react-bootstrap';

function HomePage({ onLogin }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="app-container">
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="display-4 fw-bold mb-3">
                🛒 Application Micro-services E-commerce
              </h1>
              <p className="lead mb-4">
                Plateforme moderne de gestion des produits et commandes basée sur une architecture micro-services sécurisée
              </p>
              <Button
                variant="light"
                size="lg"
                className="me-3"
                onClick={() => setShowDetails(!showDetails)}
              >
                📋 En savoir plus
              </Button>
              <Button
                variant="outline-light"
                size="lg"
                onClick={onLogin}
              >
                🔐 Se connecter
              </Button>
            </Col>
            <Col lg={4} className="text-center">
              <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center"
                   style={{ width: '120px', height: '120px' }}>
                <span style={{ fontSize: '3rem' }}>🏪</span>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Details Section */}
      {showDetails && (
        <Container className="py-5">
          <Row className="mb-4">
            <Col>
              <h2 className="text-center mb-4">🎯 Objectif du Projet</h2>
              <Alert variant="info" className="text-center">
                <h5>Concevoir et développer une application web moderne basée sur une architecture micro-services sécurisée</h5>
                <p className="mb-0">
                  L'application permettra la gestion des produits et des commandes d'une entreprise,
                  tout en respectant les standards industriels en matière de sécurité, modularité, conteneurisation et DevSecOps.
                </p>
              </Alert>
            </Col>
          </Row>

          {/* Architecture */}
          <Row className="mb-4">
            <Col>
              <h3 className="text-center mb-4">🏗️ Architecture Générale</h3>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6} lg={3} className="mb-4">
              <Card className="h-100 text-center shadow-sm">
                <Card.Body>
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: '60px', height: '60px' }}>
                    <span style={{ fontSize: '1.5rem' }}>⚛️</span>
                  </div>
                  <Card.Title>Frontend React</Card.Title>
                  <Card.Text>
                    Interface utilisateur sécurisée avec authentification Keycloak et adaptation selon les rôles utilisateur.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3} className="mb-4">
              <Card className="h-100 text-center shadow-sm">
                <Card.Body>
                  <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: '60px', height: '60px' }}>
                    <span style={{ fontSize: '1.5rem' }}>🚪</span>
                  </div>
                  <Card.Title>API Gateway</Card.Title>
                  <Card.Text>
                    Point d'entrée unique pour le frontend React avec validation des tokens JWT et routage intelligent.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3} className="mb-4">
              <Card className="h-100 text-center shadow-sm">
                <Card.Body>
                  <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: '60px', height: '60px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📦</span>
                  </div>
                  <Card.Title>Micro-service Produit</Card.Title>
                  <Card.Text>
                    Gestion complète du catalogue des produits avec opérations CRUD pour les administrateurs.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3} className="mb-4">
              <Card className="h-100 text-center shadow-sm">
                <Card.Body>
                  <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: '60px', height: '60px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📋</span>
                  </div>
                  <Card.Title>Micro-service Commande</Card.Title>
                  <Card.Text>
                    Gestion des commandes clients avec calcul automatique des montants et vérification des stocks.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Fonctionnalités */}
          <Row className="mb-4">
            <Col>
              <h3 className="text-center mb-4">✨ Fonctionnalités Principales</h3>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header className="bg-danger text-white">
                  <h5 className="mb-0">👑 Rôle ADMINISTRATEUR</h5>
                </Card.Header>
                <Card.Body>
                  <ul className="list-unstyled">
                    <li>✅ Ajouter un produit</li>
                    <li>✅ Modifier un produit</li>
                    <li>✅ Supprimer un produit</li>
                    <li>✅ Lister tous les produits</li>
                    <li>✅ Consulter un produit par identifiant</li>
                    <li>✅ Lister toutes les commandes</li>
                    <li>✅ Gestion complète des stocks</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-4">
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">👤 Rôle CLIENT</h5>
                </Card.Header>
                <Card.Body>
                  <ul className="list-unstyled">
                    <li>✅ Afficher le catalogue des produits</li>
                    <li>✅ Créer une commande</li>
                    <li>✅ Consulter ses propres commandes</li>
                    <li>✅ Calcul automatique du montant total</li>
                    <li>✅ Vérification de disponibilité des stocks</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Sécurité */}
          <Row className="mb-4">
            <Col>
              <h3 className="text-center mb-4">🔒 Sécurité avec Keycloak</h3>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={4} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: '50px', height: '50px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🔑</span>
                  </div>
                  <h6>OAuth2 / OpenID Connect</h6>
                  <small className="text-muted">Authentification standardisée et sécurisée</small>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: '50px', height: '50px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🎫</span>
                  </div>
                  <h6>JWT Tokens</h6>
                  <small className="text-muted">Gestion de session sécurisée</small>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: '50px', height: '50px' }}>
                    <span style={{ fontSize: '1.2rem' }}>👥</span>
                  </div>
                  <h6>Gestion des Rôles</h6>
                  <small className="text-muted">ADMIN et CLIENT avec autorisations granulaires</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Communication */}
          <Row className="mb-4">
            <Col>
              <h3 className="text-center mb-4">🔄 Communication Inter-services</h3>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Body>
                  <h6 className="text-center mb-3">📡 REST Communication</h6>
                  <p className="mb-2">
                    <strong>Micro-service Commande → Micro-service Produit:</strong>
                  </p>
                  <ul className="small">
                    <li>Vérification de disponibilité des produits</li>
                    <li>Réservation du stock lors de la création de commande</li>
                    <li>Propagation du token JWT pour l'autorisation</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card>
                <Card.Body>
                  <h6 className="text-center mb-3">🚨 Gestion d'Erreurs</h6>
                  <p className="mb-2">
                    <strong>Erreurs métier gérées:</strong>
                  </p>
                  <ul className="small">
                    <li>Produit inexistant</li>
                    <li>Stock insuffisant</li>
                    <li>Autorisation non accordée</li>
                    <li>Token JWT invalide ou expiré</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Technologies */}
          <Row className="mb-4">
            <Col>
              <h3 className="text-center mb-4">🛠️ Technologies Utilisées</h3>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col>
              <div className="text-center">
                <span className="badge bg-primary me-2 p-2">Spring Boot</span>
                <span className="badge bg-success me-2 p-2">React</span>
                <span className="badge bg-info me-2 p-2">Keycloak</span>
                <span className="badge bg-warning text-dark me-2 p-2">PostgreSQL</span>
                <span className="badge bg-danger me-2 p-2">Docker</span>
                <span className="badge bg-secondary me-2 p-2">JWT</span>
                <span className="badge bg-dark me-2 p-2">OAuth2</span>
                <span className="badge bg-light text-dark me-2 p-2">OpenFeign</span>
                <span className="badge bg-primary me-2 p-2">Spring Cloud Gateway</span>
                <span className="badge bg-success me-2 p-2">Eureka</span>
              </div>
            </Col>
          </Row>

          {/* DevSecOps */}
          <Row className="mb-4">
            <Col>
              <h3 className="text-center mb-4">🔍 DevSecOps Intégré</h3>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={3} className="mb-3">
              <Card className="text-center">
                <Card.Body>
                  <h6 className="text-primary">📊 SonarQube</h6>
                  <small>Analyse statique du code</small>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3} className="mb-3">
              <Card className="text-center">
                <Card.Body>
                  <h6 className="text-success">🔍 OWASP</h6>
                  <small>Analyse des dépendances</small>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3} className="mb-3">
              <Card className="text-center">
                <Card.Body>
                  <h6 className="text-warning">🐳 Trivy</h6>
                  <small>Scan des images Docker</small>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3} className="mb-3">
              <Card className="text-center">
                <Card.Body>
                  <h6 className="text-danger">🧪 Tests</h6>
                  <small>JUnit + Mockito</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Call to Action */}
          <Row>
            <Col className="text-center">
              <Alert variant="success">
                <h4>🎉 Prêt à découvrir l'application !</h4>
                <p className="mb-3">
                  Cette application démontre une architecture micro-services moderne et sécurisée
                  respectant tous les standards industriels.
                </p>
                <Button variant="success" size="lg" onClick={onLogin}>
                  🚀 Se connecter maintenant
                </Button>
              </Alert>
            </Col>
          </Row>
        </Container>
      )}

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <Container>
          <Row>
            <Col className="text-center">
              <p className="mb-0">
                🏗️ Architecture Micro-services Sécurisée - Projet DevSecOps
              </p>
              <small className="text-muted">
                Application e-commerce moderne avec Spring Boot, React et Keycloak
              </small>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}

export default HomePage;
