#!/bin/bash

echo "🔧 Configuration CSP Keycloak..."

# Attendre que Keycloak soit prêt
echo "⏳ Attente de Keycloak..."
until curl -f http://localhost:8180/realms/master >/dev/null 2>&1; do
    sleep 2
    echo "En attente..."
done

echo "✅ Keycloak prêt. Configuration CSP..."

# Obtenir le token admin
TOKEN=$(curl -s -X POST http://localhost:8180/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Échec obtention token admin"
    exit 1
fi

echo "🔑 Token admin obtenu"

# Désactiver CSP pour le realm microservices-realm et configurer le thème
echo "🚫 Désactivation CSP et configuration thème..."
curl -s -X PUT http://localhost:8180/admin/realms/microservices-realm \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "browserSecurityHeaders": {
      "contentSecurityPolicy": {
        "enabled": false
      }
    },
    "loginTheme": "my-theme"
  }'

# Configurer CORS
echo "🌐 Configuration CORS..."
curl -s -X PUT http://localhost:8180/admin/realms/microservices-realm \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "corsPolicy": {
      "enabled": true,
      "allowedOrigins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "*"],
      "allowedMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "*"],
      "allowedHeaders": ["*"],
      "exposedHeaders": ["*"]
    }
  }'

echo "✅ CSP désactivé et CORS configuré !"
echo "🎉 Problème résolu - Testez maintenant : http://localhost:3002"