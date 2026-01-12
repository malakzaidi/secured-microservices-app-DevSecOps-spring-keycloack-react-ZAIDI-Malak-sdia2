#!/bin/bash

echo "🔧 Désactivation de PKCE pour le client Keycloak..."

# Attendre que Keycloak soit prêt
echo "⏳ Attente du démarrage de Keycloak..."
while ! curl -s http://localhost:8180 > /dev/null; do
  sleep 2
done

echo "✅ Keycloak est prêt !"

# Configuration
KEYCLOAK_URL="http://localhost:8180"
REALM="microservices-realm"
CLIENT_ID="microservices-client"
ADMIN_USER="admin"
ADMIN_PASS="admin"

# Obtenir le token d'admin
echo "🔑 Obtention du token d'administration..."
TOKEN=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${ADMIN_USER}&password=${ADMIN_PASS}&grant_type=password&client_id=admin-cli" | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Erreur : Impossible d'obtenir le token d'admin"
  exit 1
fi

echo "✅ Token obtenu avec succès"

# Obtenir l'ID interne du client
echo "🔍 Recherche du client ${CLIENT_ID}..."
CLIENT_UUID=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM}/clients" \
  -H "Authorization: Bearer ${TOKEN}" | jq -r ".[] | select(.clientId==\"${CLIENT_ID}\") | .id")

if [ "$CLIENT_UUID" = "null" ] || [ -z "$CLIENT_UUID" ]; then
  echo "❌ Erreur : Client ${CLIENT_ID} introuvable dans le realm ${REALM}"
  echo "ℹ️ Assurez-vous que le script setup-keycloak.sh a été exécuté d'abord"
  exit 1
fi

echo "✅ Client trouvé : ${CLIENT_UUID}"

# Mettre à jour le client pour désactiver PKCE
echo "🔧 Désactivation de PKCE pour le client..."
UPDATE_RESPONSE=$(curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${CLIENT_UUID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "'${CLIENT_ID}'",
    "enabled": true,
    "protocol": "openid-connect",
    "publicClient": true,
    "directAccessGrantsEnabled": true,
    "webOrigins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    "redirectUris": ["http://localhost:3000/*", "http://localhost:3001/*", "http://localhost:3002/*"],
    "attributes": {
      "saml.assertion.signature": "false",
      "saml.multivalued.roles": "false",
      "saml.force.post.binding": "false",
      "saml.encrypt": "false",
      "saml.server.signature": "false",
      "saml.server.signature.keyinfo.ext": "false",
      "exclude.session.state.from.auth.response": "false",
      "saml_force_name_id_format": "false",
      "saml.client.signature": "false",
      "tls.client.certificate.bound.access.tokens": "false",
      "saml.authnstatement": "false",
      "display.on.consent.screen": "false",
      "saml.onetimeuse.condition": "false",
      "pkce.enforced": "false"
    }
  }')

if [ -n "$UPDATE_RESPONSE" ]; then
  echo "❌ Erreur lors de la mise à jour : $UPDATE_RESPONSE"
  exit 1
fi

echo "✅ PKCE désactivé avec succès !"
echo ""
echo "🔄 Redémarrez votre application React pour appliquer les changements"
echo ""
echo "📋 Vérification :"
echo "- Frontend React : http://localhost:3002"
echo "- Keycloak Admin : http://localhost:8180 (admin/admin)"