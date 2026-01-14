# Développement d'une Application Micro-Services Sécurisée

**Spring Boot – React – Keycloak**

## 1. Contexte du Projet

Ce mini-projet a pour objectif de concevoir et développer une application web moderne basée sur une architecture micro-services sécurisée. L'application permettra la gestion des produits et des commandes d'une entreprise, tout en respectant les standards industriels en matière de sécurité, modularité, conteneurisation et DevSecOps.

L'application implémente une architecture de micro-services avec authentification centralisée via Keycloak, communication sécurisée entre services, et une approche DevSecOps complète incluant analyse statique, scanning des vulnérabilités et tests automatisés.

## 2. Architecture Générale Attendue

L'architecture de l'application est composée des éléments suivants :

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │  Service        │
│   (React)       │────►│   (Spring      │◄──►│  Discovery      │
│                 │    │   Cloud Gateway)│    │  (Eureka)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                 ┌────────────┼────────────┐
                 │            │            │
        ┌────────▼────────┐  ┌▼──────────┐ │
        │ Product Service │  │ Command   │ │
        │   (Spring Boot) │  │ Service   │ │
        └─────────────────┘  └───────────┘ │
                 │                 │       │
                 ▼                 ▼       │
        ┌─────────────────┐  ┌────────────▼┐
        │ Product DB      │  │ Order DB    │
        │ (PostgreSQL)    │  │ (PostgreSQL)│
        └─────────────────┘  └─────────────┘

┌─────────────────┐
│   Keycloak      │
│   (Auth/OIDC)   │
└─────────────────┘
```

### Composants Principaux

- **Frontend Web (React)** : Interface utilisateur sécurisée avec authentification Keycloak
- **API Gateway** : Point d'entrée unique, routage et sécurité centralisée
- **Service Discovery (Eureka)** : Enregistrement et découverte dynamique des services
- **Micro-service Produit** : Gestion du catalogue produits
- **Micro-service Commande** : Gestion des commandes clients
- **Keycloak** : Serveur d'authentification et d'autorisation OAuth2/OIDC
- **Bases de données** : PostgreSQL distinctes pour chaque domaine métier

### Contraintes Architecturales

- **Accès direct interdit** : Toutes les requêtes frontend doivent transiter par l'API Gateway
- **Services indépendants** : Aucun couplage direct entre micro-services
- **Sécurité de bout en bout** : Authentification et autorisation sur tous les niveaux
- **Communication sécurisée** : mTLS entre services, JWT propagé

## 3. Frontend Web (React)

Le frontend React fournit une interface utilisateur sécurisée et adaptée aux rôles utilisateur.

### Fonctionnalités Principales

- **Authentification Keycloak** : Connexion via OAuth2 / OpenID Connect
- **Gestion des Tokens JWT** : Session utilisateur avec tokens JWT
- **Catalogue Produits** : Affichage et navigation dans le catalogue
- **Gestion des Commandes** :
  - Création de nouvelles commandes
  - Consultation des commandes personnelles
  - Suivi du statut des commandes
- **Interface Adaptative** : Adaptation selon le rôle (ADMIN/CLIENT)
- **Communication Sécurisée** : Toutes les requêtes passent par l'API Gateway
- **Gestion des Erreurs** : Gestion des erreurs 401 (non autorisé) et 403 (interdit)

### Technologies Frontend

- **React 18** : Framework UI moderne
- **Keycloak JS** : Bibliothèque d'authentification client
- **React Router** : Navigation SPA
- **Bootstrap 5** : Framework CSS responsive
- **Axios** : Client HTTP pour les appels API

### Structure Frontend

```
frontend/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── silent-check-sso.html
├── src/
│   ├── components/
│   │   ├── AdminPanel.js
│   │   ├── HomePage.js
│   │   ├── OrderForm.js
│   │   ├── OrderList.js
│   │   └── ProductList.js
│   ├── api.js
│   ├── App.js
│   └── index.js
└── package.json
```

## 4. Micro-service Produit (Spring Boot)

Le micro-service Produit est responsable de la gestion complète du catalogue des produits.

### Fonctionnalités Métier

- **Ajouter un Produit** (Rôle: ADMIN)
- **Modifier un Produit** (Rôle: ADMIN)
- **Supprimer un Produit** (Rôle: ADMIN)
- **Lister les Produits** (Rôles: ADMIN, CLIENT)
- **Consulter un Produit par ID** (Rôles: ADMIN, CLIENT)

### Modèle de Données Produit

Chaque produit contient les attributs suivants :
- **Identifiant** : ID unique (auto-généré)
- **Nom** : Nom du produit
- **Description** : Description détaillée
- **Prix** : Prix unitaire (double)
- **Quantité en Stock** : Stock disponible (integer)

### APIs Produit

```java
// Exemples d'endpoints
GET    /api/products          // Liste tous les produits
GET    /api/products/{id}     // Détail d'un produit
POST   /api/products          // Créer un produit (ADMIN)
PUT    /api/products/{id}     // Modifier un produit (ADMIN)
DELETE /api/products/{id}     // Supprimer un produit (ADMIN)
```

### Contrôles d'Accès

- **ADMIN** : Accès complet (CRUD)
- **CLIENT** : Lecture seule (GET operations)

## 5. Micro-service Commande (Spring Boot)

Le micro-service Commande gère l'ensemble du processus de commande client.

### Fonctionnalités Métier

- **Créer une Commande** (Rôle: CLIENT)
- **Consulter ses Commandes** (Rôle: CLIENT)
- **Lister toutes les Commandes** (Rôle: ADMIN)
- **Calcul Automatique du Montant** : Calcul du total basé sur les produits
- **Validation du Stock** : Vérification de la disponibilité avant validation

### Modèle de Données Commande

Une commande contient :
- **Identifiant** : ID unique (auto-généré)
- **Date de Commande** : Timestamp de création
- **Statut** : État de la commande (EN_COURS, CONFIRMEE, LIVREE, ANNULEE)
- **Montant Total** : Total calculé automatiquement
- **Liste des Produits Commandés** :
  - ID Produit
  - Quantité commandée
  - Prix unitaire

### Règles Métier

- **Vérification de Stock** : Avant validation, vérifier que tous les produits sont disponibles
- **Calcul du Total** : Prix unitaire × Quantité pour chaque item
- **Propagation du Stock** : Mise à jour automatique du stock après commande
- **Gestion des Erreurs** : Produit inexistant, stock insuffisant, etc.

### APIs Commande

```java
// Exemples d'endpoints
POST   /api/orders           // Créer une commande (CLIENT)
GET    /api/orders           // Lister ses commandes (CLIENT) / Toutes (ADMIN)
GET    /api/orders/{id}      // Détail d'une commande
```

### Contrôles d'Accès

- **CLIENT** : Créer et consulter ses propres commandes
- **ADMIN** : Consulter toutes les commandes du système

## 6. Communication Inter-Services

La communication entre micro-services respecte les principes REST et sécurité.

### Principes de Communication

- **Communication REST** : HTTP/HTTPS entre services
- **Propagation du Token JWT** : Token utilisateur transmis dans les headers
- **Gestion d'Erreurs Métier** :
  - Produit inexistant (404)
  - Stock insuffisant (409)
  - Erreurs de validation (400)

### Exemple de Communication

Le micro-service Commande appelle le micro-service Produit pour :
- Vérifier la disponibilité des produits
- Récupérer les détails des produits (prix, nom)
- Mettre à jour le stock après commande validée

```java
// Exemple d'appel inter-service
RestTemplate restTemplate = new RestTemplate();
HttpHeaders headers = new HttpHeaders();
headers.set("Authorization", "Bearer " + jwtToken);

ProductDTO product = restTemplate.exchange(
    "http://product-service/api/products/{id}",
    HttpMethod.GET,
    new HttpEntity<>(headers),
    ProductDTO.class,
    productId
).getBody();
```

### Sécurité Inter-Services

- **mTLS** : Authentification mutuelle par certificats
- **JWT Forwarding** : Propagation du contexte utilisateur
- **Timeouts** : Gestion des timeouts inter-services
- **Circuit Breaker** : Résilience (non implémenté actuellement)

## 7. Sécurité avec Keycloak (Obligatoire)

La sécurité constitue un axe central du projet et est entièrement gérée par Keycloak.

### Rôles et Autorisations

- **ADMIN** : Accès complet à la gestion produits et commandes
- **CLIENT** : Accès limité aux consultations et création de commandes

### Configuration Keycloak

- **Realm** : `microservices-realm`
- **Client ID** : `microservices-client`
- **Grant Type** : Authorization Code + PKCE
- **Redirect URIs** : `http://localhost:3000/*`

### Authentification Frontend

```javascript
// Exemple d'intégration Keycloak JS
const keycloak = new Keycloak({
    url: 'http://localhost:8180',
    realm: 'microservices-realm',
    clientId: 'microservices-client'
});

keycloak.init({ onLoad: 'login-required' })
    .then(authenticated => {
        if (authenticated) {
            // Token disponible dans keycloak.token
            axios.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`;
        }
    });
```

### Autorisation Backend

Chaque micro-service valide les tokens JWT et applique les règles RBAC :

```java
// Exemple de sécurisation endpoint
@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/products")
public ProductDTO createProduct(@RequestBody ProductDTO product) {
    return productService.createProduct(product);
}
```

### Niveaux de Sécurité

1. **API Gateway** : Validation des tokens et routage
2. **Micro-Services** : Autorisation fine-grained par endpoint
3. **Base de Données** : Accès sécurisé avec comptes dédiés

## 8. API Gateway (Spring Cloud Gateway)

L'API Gateway constitue le point d'entrée unique de l'application.

### Responsabilités

- **Point d'Entrée Unique** : Toutes les requêtes frontend passent par ici
- **Validation JWT** : Vérification des tokens avant routage
- **Routage Dynamique** : Redirection vers les micro-services appropriés
- **Sécurité Centralisée** : Application des règles de sécurité communes
- **Pas de Logique Métier** : Aucune logique applicative

### Configuration Routage

```yaml
# Exemple de configuration routes
spring:
  cloud:
    gateway:
      routes:
      - id: product-service
        uri: lb://product-service
        predicates:
        - Path=/api/products/**
        filters:
        - RewritePath=/api/products/(?<path>.*), /${path}
      - id: command-service
        uri: lb://command-service
        predicates:
        - Path=/api/orders/**
        filters:
        - RewritePath=/api/orders/(?<path>.*), /${path}
```

### Filtres de Sécurité

- **Authentication Filter** : Validation des tokens JWT
- **Authorization Filter** : Vérification des rôles utilisateur
- **Rate Limiting** : Limitation du nombre de requêtes (non implémenté)
- **Logging Filter** : Journalisation des accès

## 9. Gestion des Données

La gestion des données respecte strictement les principes micro-services.

### Bases de Données Distinctes

- **Base Produit** (`product_db`) : Catalogue des produits
- **Base Commande** (`order_db`) : Commandes et détails de commandes

### Configuration PostgreSQL

```sql
-- Base produit
CREATE DATABASE product_db;
CREATE USER product_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE product_db TO product_user;

-- Base commande
CREATE DATABASE order_db;
CREATE USER order_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE order_db TO order_user;
```

### Principes de Données

- **Aucun Partage** : Pas d'accès direct entre bases
- **Comptes Sécurisés** : Utilisateurs dédiés par service
- **Migration Automatique** : Scripts SQL pour initialisation
- **Isolation** : Chaque service gère ses propres schémas

## 10. Conteneurisation (Docker)

Toute la plateforme est entièrement conteneurisée avec Docker.

### Images Docker

Chaque composant possède son propre Dockerfile :

- **Frontend React** : Build multi-stage avec nginx
- **API Gateway** : Image Java avec JRE optimisé
- **Micro-service Produit** : Image Java Spring Boot
- **Micro-service Commande** : Image Java Spring Boot
- **Service Discovery** : Image Java Eureka
- **Keycloak** : Image officielle Quay.io
- **PostgreSQL** : Images officielles

### Docker Compose

```yaml
version: '3.8'
services:
  postgres-product:
    image: postgres:15
    environment:
      POSTGRES_DB: product_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5435:5432"

  postgres-order:
    image: postgres:15
    environment:
      POSTGRES_DB: order_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5436:5432"

  keycloak:
    image: quay.io/keycloak/keycloak:21.1.2
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    ports:
      - "8180:8080"
    command: start-dev
```

### Variables d'Environnement

Configuration externalisée via variables :
- `POSTGRES_USER` / `POSTGRES_PASSWORD` : Accès bases de données
- `KEYCLOAK_ADMIN` / `KEYCLOAK_ADMIN_PASSWORD` : Administration Keycloak
- `SONAR_TOKEN` : Analyse de code

## 11. DevSecOps (Obligatoire)

Le projet intègre une démarche DevSecOps complète.

### Outils de Sécurité

- **OWASP Dependency-Check** : Analyse des vulnérabilités dans les dépendances
- **SonarQube** : Analyse statique du code, détection des code smells
- **Trivy** : Scanning des vulnérabilités dans les images Docker
- **Tests Unitaires** : Couverture de code avec JaCoCo

### Pipeline DevSecOps

Script automatisé `devsecops/run-devsecops.sh` :

```bash
#!/bin/bash
# 1. Analyse des dépendances (OWASP)
# 2. Build et tests
# 3. Analyse SonarQube
# 4. Build des images Docker
# 5. Scan des images (Trivy)
# 6. Génération rapport de sécurité
```

### Corrections Appliquées

- **Dépendances** : Mise à jour des versions vulnérables
- **Code** : Correction des problèmes détectés par SonarQube
- **Images** : Reconstruction après corrections
- **Tests** : Amélioration de la couverture

### Métriques DevSecOps

- **Tests** : Plus de 80% de couverture
- **Vulnérabilités** : Zéro vulnérabilité critique
- **Code Quality** : Note A sur SonarQube
- **Security Headers** : Configuration complète

## 12. Journalisation et Traçabilité

Journalisation complète pour le debugging et la surveillance.

### Logs Applicatifs

- **Accès APIs** : Chaque requête loggée avec utilisateur
- **Erreurs** : Stack traces détaillées
- **Actions Métier** : Création commande, modification produit

### Format des Logs

```json
{
  "timestamp": "2024-01-14T10:30:00Z",
  "level": "INFO",
  "user": "user123",
  "service": "command-service",
  "method": "POST",
  "endpoint": "/api/orders",
  "message": "Order created successfully",
  "orderId": "12345"
}
```

### Fichiers de Logs

- `logs/product-service.log`
- `logs/command-service.log`
- `logs/gateway-service.log`
- `logs/discovery-service.log`

### Traçabilité

- **Utilisateur** : Identification dans tous les logs
- **Session** : Correlation via JWT
- **Actions** : Historique complet des opérations
- **Erreurs** : Contexte complet pour debugging

## Prérequis

- **Java 21** ou version supérieure
- **Maven 3.6+**
- **Docker & Docker Compose**
- **Node.js 16+** (pour le développement frontend)
- **Git**

## Installation et Configuration

### 1. Clonage du Dépôt
```bash
git clone <repository-url>
cd security-of-ds-project
```

### 2. Génération des Certificats SSL
```bash
# Génération des certificats CA et services
./create-certificates.sh

# Vérification de la création
ls -la certificates/
```

### 3. Démarrage des Services d'Infrastructure
```bash
# Démarrage des bases de données et Keycloak
docker-compose up -d postgres-product postgres-order keycloak
```

### 4. Configuration Keycloak
Keycloak est initialisé automatiquement via le script `keycloak-init.sh`.

Credentials par défaut :
- **Username** : admin
- **Password** : admin
- **Realm** : microservices-realm

### 5. Build de Tous les Services
```bash
# Build de tous les services Spring Boot
mvn clean install -DskipTests
```

### 6. Démarrage des Micro-services
```bash
# Démarrage dans l'ordre : discovery -> gateway -> product/command
java -jar discovery-service/target/discovery-service-*.jar &
java -jar gateway-service/target/gateway-service-*.jar &
java -jar product-service/target/product-service-*.jar &
java -jar command-service/target/command-service-*.jar &
```

### 7. Configuration du Frontend (Optionnel)
```bash
cd frontend
npm install
npm start
```

## Exécution de l'Application

### Mode Développement
Pour le développement local avec sécurité désactivée :

```bash
# Démarrage de l'infrastructure
docker-compose up -d

# Démarrage des services (sécurité désactivée dans application.properties)
mvn spring-boot:run -pl discovery-service &
mvn spring-boot:run -pl gateway-service &
mvn spring-boot:run -pl product-service &
mvn spring-boot:run -pl command-service &
```

### Mode Production
```bash
# Démarrage de tous les services avec sécurité complète
docker-compose up -d
mvn spring-boot:run
```

### Points d'Accès

- **Frontend** : http://localhost:3000
- **API Gateway** : http://localhost:8087
- **Keycloak** : http://localhost:8180
- **Tableau de Bord Discovery** : http://localhost:8761
- **Swagger Produit** : http://localhost:8083/swagger-ui.html
- **Swagger Commande** : http://localhost:8084/swagger-ui.html

## Documentation API

Chaque service expose une documentation OpenAPI/Swagger :

- **Service Produit** : `GET /api/products` - Gestion du catalogue
- **Service Commande** : `POST /api/orders` - Traitement des commandes
- **API Gateway** : Route toutes les requêtes `/api/**` vers les services appropriés

Exemples d'appels API :
```bash
# Récupérer les produits
curl -H "Authorization: Bearer <jwt-token>" \
     http://localhost:8087/api/products

# Créer une commande
curl -X POST -H "Authorization: Bearer <jwt-token>" \
     -H "Content-Type: application/json" \
     -d '{"items":[{"productId":1,"quantity":2}]}' \
     http://localhost:8087/api/orders
```

## Configuration

### Variables d'Environnement
```bash
# Base de données
POSTGRES_USER=user
POSTGRES_PASSWORD=password

# Keycloak
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# DevSecOps
SONAR_HOST_URL=http://localhost:9000
SONAR_TOKEN=votre_token_sonar
```

### Profils Spring
- **default** : Configuration production
- **test** : Configuration de test (sécurité désactivée)
- **docker** : Configuration environnement Docker

## Pipeline DevSecOps

Exécutez des vérifications complètes de sécurité et qualité :

```bash
# Exécuter le pipeline DevSecOps complet
./devsecops/run-devsecops.sh

# Définir le token SonarQube si nécessaire
export SONAR_TOKEN=votre_token
./devsecops/run-devsecops.sh
```

### Composants du Pipeline

1. **Analyse des Dépendances** : OWASP Dependency-Check pour les bibliothèques vulnérables
2. **Qualité du Code** : Analyse SonarQube pour les code smells et bugs
3. **Tests Unitaires** : Exécution automatisée des tests
4. **Scan des Conteneurs** : Trivy pour la vulnérabilité des images Docker
5. **Rapport de Sécurité** : Évaluation de sécurité consolidée

Les rapports sont générés dans le répertoire `reports/`.

## Directives de Développement

### Style de Code
- Suivre les bonnes pratiques Spring Boot
- Utiliser Lombok pour réduire le code boilerplate
- Implémenter des tests unitaires complets
- Documenter les APIs avec les annotations OpenAPI

### Bonnes Pratiques de Sécurité
- Ne jamais commiter les certificats ou secrets
- Utiliser les variables d'environnement pour les données sensibles
- Implémenter une validation d'entrée appropriée
- Suivre le principe du moindre privilège

### Tests
```bash
# Exécuter tous les tests
mvn test

# Exécuter les tests d'un service spécifique
mvn test -pl product-service

# Générer les rapports de couverture
mvn jacoco:report
```

### Journalisation
Les logs applicatifs sont écrits dans le répertoire `logs/` :
- `product-service.log`
- `command-service.log`
- `gateway-service.log`
- `discovery-service.log`

## Contribution

1. Fork le dépôt
2. Créer une branche de fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Commiter vos changements (`git commit -m 'Add some amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

### Directives de Contribution
- S'assurer que tous les tests passent
- Exécuter le pipeline DevSecOps avant soumission
- Mettre à jour la documentation pour les nouvelles fonctionnalités
- Suivre le style de code existant

## Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.

## Support

Pour les questions ou problèmes :
- Ouvrir une issue sur GitHub
- Vérifier les rapports DevSecOps pour les problèmes de sécurité
- Examiner les logs des services pour le dépannage

## Améliorations Futures

- Implémentation complète du Config Service
- Ajout d'un service mesh (Istio)
- Implémentation du tracing distribué (Jaeger)
- Ajout de monitoring et alertes (Prometheus/Grafana)
- Implémentation de rate limiting API
- Ajout de tests end-to-end
- Orchestration de conteneurs avec Kubernetes
