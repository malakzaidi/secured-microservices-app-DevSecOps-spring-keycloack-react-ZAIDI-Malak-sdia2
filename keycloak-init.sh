#!/bin/bash
# Script to configure Keycloak CSP settings

echo "Waiting for Keycloak to be ready..."
until curl -f http://localhost:8180/realms/master >/dev/null 2>&1; do
    sleep 2
done

echo "Keycloak is ready. Configuring CSP..."

# Login and get admin token
TOKEN=$(curl -s -X POST http://localhost:8180/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

if [ -z "$TOKEN" ]; then
    echo "Failed to get admin token"
    exit 1
fi

echo "Admin token obtained. Configuring CSP..."

# Disable CSP for the realm
curl -X PUT http://localhost:8180/admin/realms/microservices-realm \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "browserSecurityHeaders": {
      "contentSecurityPolicy": {
        "enabled": false,
        "value": ""
      }
    }
  }'

# Also try to configure CORS
curl -X PUT http://localhost:8180/admin/realms/microservices-realm \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "corsPolicy": {
      "enabled": true,
      "allowedOrigins": ["*"],
      "allowedMethods": ["*"],
      "allowedHeaders": ["*"]
    }
  }'

echo "CSP configuration completed."