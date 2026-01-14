#!/bin/bash

# Script de démarrage avec H2 Database (pour tests rapides)
# PostgreSQL n'est pas requis pour cette version

echo "🚀 Démarrage des Microservices - Mode H2 Database"
echo "=================================================="

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

# 2. Démarrer Product Service (avec H2)
echo ""
echo "2️⃣ Démarrage du Product Service (H2 Database)..."
cd product-service || exit 1
mvn spring-boot:run > ../logs/product-service.log 2>&1 &
PRODUCT_PID=$!
cd ..
echo "   PID: $PRODUCT_PID"

# Attendre que Product Service soit prêt
wait_for_service "Product Service" "http://localhost:8083/api/products"

# 3. Démarrer Command Service (avec H2)
echo ""
echo "3️⃣ Démarrage du Command Service (H2 Database)..."
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
echo "🎉 TOUS LES SERVICES SONT DÉMARRÉS AVEC H2 DATABASE !"
echo "======================================================"
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
echo "🧪 Tests immédiats :"
echo "   📋 Lister produits     : curl http://localhost:8080/api/products"
echo "   📋 Lister commandes    : curl http://localhost:8080/api/orders"
echo "   ➕ Créer produit       : curl -X POST http://localhost:8080/api/products -H 'Content-Type: application/json' -d '{\"name\":\"Test Product\",\"description\":\"Test\",\"price\":99.99,\"stockQuantity\":10}'"
echo ""
echo "💾 PIDs des processus :"
echo "   Discovery: $DISCOVERY_PID"
echo "   Product:   $PRODUCT_PID"
echo "   Command:   $COMMAND_PID"
echo "   Gateway:   $GATEWAY_PID"
echo ""
echo "🗄️ Base de données H2 :"
echo "   📍 Product DB         : http://localhost:8083/h2-console"
echo "   📍 Command DB         : http://localhost:8082/h2-console"
echo "   🔑 JDBC URL           : jdbc:h2:mem:productdb / jdbc:h2:mem:commanddb"
echo "   👤 Username/Password  : sa / (vide)"
echo ""
echo "🛑 Pour arrêter : ./stop-services.sh"
echo ""
echo "💡 Note : Utilise H2 Database en mémoire. Les données sont perdues au redémarrage."
echo "   Pour PostgreSQL permanent : configure PostgreSQL puis utilise ./start-services.sh"

# Créer le dossier logs s'il n'existe pas
mkdir -p logs

# Attendre un peu plus pour laisser les services démarrer
sleep 5
