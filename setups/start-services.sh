#!/bin/bash

# Script de démarrage complet des microservices
# Assure-toi que PostgreSQL est configuré avec le script setup-postgresql.sql

echo "🚀 Démarrage des Microservices - Application e-commerce sécurisée"
echo "================================================================="

# Fonction pour attendre qu'un service soit prêt
wait_for_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    echo "⏳ Attente du démarrage de $service_name..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo "✅ $service_name est prêt !"
            return 0
        fi
        echo "   Tentative $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done

    echo "❌ Timeout: $service_name ne répond pas"
    return 1
}

# 1. Démarrer Eureka Discovery Service
echo ""
echo "1️⃣ Démarrage d'Eureka Discovery Service..."
cd discovery-service || exit 1
mvn spring-boot:run > ../logs/discovery-service.log 2>&1 &
DISCOVERY_PID=$!
cd ..
echo "   PID: $DISCOVERY_PID"

# Attendre qu'Eureka soit prêt
wait_for_service "Eureka Discovery" "http://localhost:8761"

# 2. Démarrer Product Service
echo ""
echo "2️⃣ Démarrage du Product Service..."
cd product-service || exit 1
mvn spring-boot:run > ../logs/product-service.log 2>&1 &
PRODUCT_PID=$!
cd ..
echo "   PID: $PRODUCT_PID"

# Attendre que Product Service soit prêt
wait_for_service "Product Service" "http://localhost:8083/api/products"

# 3. Démarrer Command Service
echo ""
echo "3️⃣ Démarrage du Command Service..."
cd command-service || exit 1
mvn spring-boot:run > ../logs/command-service.log 2>&1 &
COMMAND_PID=$!
cd ..
echo "   PID: $COMMAND_PID"

# Attendre que Command Service soit prêt
wait_for_service "Command Service" "http://localhost:8082/api/orders"

# 4. Démarrer API Gateway
echo ""
echo "4️⃣ Démarrage de l'API Gateway..."
cd gateway-service || exit 1
mvn spring-boot:run > ../logs/gateway-service.log 2>&1 &
GATEWAY_PID=$!
cd ..
echo "   PID: $GATEWAY_PID"

# Attendre que Gateway soit prêt
wait_for_service "API Gateway" "http://localhost:8080/api/products"

echo ""
echo "🎉 TOUS LES SERVICES SONT DÉMARRÉS !"
echo "====================================="
echo ""
echo "📊 URLs des services :"
echo "   🔍 Eureka Dashboard    : http://localhost:8761"
echo "   🛍️  Product Service     : http://localhost:8083"
echo "   📦 Command Service     : http://localhost:8082"
echo "   🚪 API Gateway         : http://localhost:8080"
echo ""
echo "📚 Documentation Swagger :"
echo "   🛍️  Product APIs        : http://localhost:8083/swagger-ui.html"
echo "   📦 Command APIs        : http://localhost:8082/swagger-ui.html"
echo ""
echo "🧪 Tests rapides :"
echo "   📋 Lister produits     : curl http://localhost:8080/api/products"
echo "   📋 Lister commandes    : curl http://localhost:8080/api/orders"
echo ""
echo "💾 PIDs des processus :"
echo "   Discovery: $DISCOVERY_PID"
echo "   Product:   $PRODUCT_PID"
echo "   Command:   $COMMAND_PID"
echo "   Gateway:   $GATEWAY_PID"
echo ""
echo "🛑 Pour arrêter : ./stop-services.sh"
echo ""
echo "📝 Logs disponibles dans le dossier logs/"

# Créer le dossier logs s'il n'existe pas
mkdir -p logs
