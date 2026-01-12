#!/bin/bash

echo "🔍 Diagnostic Keycloak..."
echo "========================"

# Check if Keycloak is running
echo ""
echo "1. Vérification si Keycloak fonctionne..."
if curl -s http://localhost:8180 > /dev/null; then
    echo "✅ Keycloak répond sur http://localhost:8180"
else
    echo "❌ Keycloak ne répond pas sur http://localhost:8180"
    echo "   Vérifiez avec: docker ps | grep keycloak"
    exit 1
fi

# Check realm
echo ""
echo "2. Vérification du realm microservices-realm..."
REALM_RESPONSE=$(curl -s http://localhost:8180/realms/microservices-realm)
if echo "$REALM_RESPONSE" | grep -q "realm.*microservices-realm"; then
    echo "✅ Realm microservices-realm existe"
else
    echo "❌ Realm microservices-realm n'existe pas ou est mal configuré"
    echo "   Réponse: $REALM_RESPONSE"
fi

# Check client
echo ""
echo "3. Vérification du client microservices-client..."
TOKEN=$(curl -s -X POST http://localhost:8180/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin&grant_type=password&client_id=admin-cli" | jq -r '.access_token')

CLIENTS=$(curl -s http://localhost:8180/admin/realms/microservices-realm/clients \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[].clientId')

if echo "$CLIENTS" | grep -q "microservices-client"; then
    echo "✅ Client microservices-client existe"
else
    echo "❌ Client microservices-client n'existe pas"
    echo "   Clients trouvés: $CLIENTS"
fi

# Check users
echo ""
echo "4. Vérification des utilisateurs..."
USERS=$(curl -s http://localhost:8180/admin/realms/microservices-realm/users \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[].username')

echo "Utilisateurs trouvés: $USERS"

# Check CORS
echo ""
echo "5. Vérification CORS..."
CORS_HEADERS=$(curl -s -I http://localhost:8180/realms/microservices-realm | grep -i "access-control")
if [ -n "$CORS_HEADERS" ]; then
    echo "✅ Headers CORS présents:"
    echo "$CORS_HEADERS"
else
    echo "❌ Aucun header CORS trouvé"
fi

# Check CSP
echo ""
echo "6. Vérification CSP..."
CSP_HEADERS=$(curl -s -I http://localhost:8180/realms/microservices-realm | grep -i "content-security-policy")
if [ -z "$CSP_HEADERS" ]; then
    echo "✅ Aucun header CSP trouvé (CSP désactivé)"
else
    echo "❌ Header CSP trouvé:"
    echo "$CSP_HEADERS"
fi

echo ""
echo "🎯 Diagnostic terminé. Si des problèmes persistent:"
echo "   - Accédez à http://localhost:8180 pour vérifier l'admin console"
echo "   - Vérifiez les logs: docker logs keycloak"
echo "   - Redémarrez Keycloak: docker restart keycloak"