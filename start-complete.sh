#!/bin/bash

echo "🚀 DÉMARRAGE COMPLET DE L'APPLICATION MICRO-SERVICES"
echo "=================================================="

# Arrêter tous les services existants
echo "🛑 Arrêt des services existants..."
./stop-services.sh
docker-compose down 2>/dev/null
docker-compose -f docker-compose.simple.yml down 2>/dev/null

# Démarrer Keycloak
echo "🔐 Démarrage de Keycloak..."
docker-compose -f docker-compose.simple.yml up -d keycloak

# Attendre que Keycloak soit prêt et le configurer
echo "⚙️ Configuration automatique de Keycloak..."
./setup-keycloak.sh

# Démarrer les services Spring Boot
echo "🔧 Démarrage des micro-services Spring Boot..."
./start-services-h2.sh

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage complet des services..."
sleep 10

# Démarrer le frontend React
echo "⚛️ Démarrage du frontend React..."
cd frontend
npm start &
cd ..

echo ""
echo "🎉 APPLICATION COMPLÈTE DÉMARRÉE AVEC SUCCÈS !"
echo "=============================================="
echo ""
echo "🌐 URLs disponibles :"
echo "🏠 Page d'accueil React : http://localhost:3002"
echo "🔐 Keycloak Admin      : http://localhost:8180"
echo "🚪 API Gateway         : http://localhost:8087"
echo "🏛️  Eureka Discovery    : http://localhost:8761"
echo "📦 Product Swagger      : http://localhost:8083/swagger-ui.html"
echo "📋 Command Swagger      : http://localhost:8082/swagger-ui.html"
echo ""
echo "📋 Comptes de test :"
echo "👑 Admin  : admin / admin123 (rôle ADMIN)"
echo "👤 Client : client / client123 (rôle CLIENT)"
echo ""
echo "🎯 Test complet :"
echo "1. Ouvrir http://localhost:3002"
echo "2. Voir la page d'accueil avec présentation"
echo "3. Cliquer 'Se connecter'"
echo "4. Utiliser admin/admin123 ou client/client123"
echo "5. Explorer l'interface adaptée au rôle"
echo ""
echo "✅ Tout est prêt pour la démonstration !"
