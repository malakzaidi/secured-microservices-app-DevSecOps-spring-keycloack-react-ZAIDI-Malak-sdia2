#!/bin/bash

echo "🔧 Initialisation du realm Keycloak..."

# Attendre que Keycloak soit prêt
echo "⏳ Attente du démarrage de Keycloak..."
while ! curl -s http://localhost:8180 > /dev/null; do
  sleep 2
done

echo "✅ Keycloak est prêt !"

# Obtenir le token d'admin
echo "🔑 Obtention du token d'administration..."
TOKEN=$(curl -s -X POST http://localhost:8180/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin&grant_type=password&client_id=admin-cli" | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Erreur : Impossible d'obtenir le token d'admin"
  exit 1
fi

echo "✅ Token obtenu avec succès"

# Vérifier si le realm existe déjà
REALM_EXISTS=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8180/admin/realms/microservices-realm | jq -r '.realm')

if [ "$REALM_EXISTS" = "microservices-realm" ]; then
  echo "ℹ️ Le realm 'microservices-realm' existe déjà. Aucune action nécessaire."
  echo ""
  echo "🎯 Comptes de test disponibles :"
  echo "👑 Admin    : admin / admin123 (rôle ADMIN)"
  echo "👤 Client   : client / client123 (rôle CLIENT)"
  echo ""
  echo "🌐 URLs disponibles :"
  echo "🔐 Keycloak Admin : http://localhost:8180"
  echo "⚛️  Frontend React : http://localhost:3002"
  exit 0
fi

echo "❌ Le realm n'a pas été importé automatiquement. Création manuelle..."

# Supprimer le realm s'il existe déjà
echo "🗑️ Suppression du realm existant microservices-realm si présent..."
curl -s -X DELETE http://localhost:8180/admin/realms/microservices-realm \
  -H "Authorization: Bearer $TOKEN"

# Créer le realm microservices-realm
echo "🏛️ Création du realm microservices-realm..."
RESPONSE=$(curl -s -X POST http://localhost:8180/admin/realms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "realm": "microservices-realm",
    "enabled": true,
    "registrationAllowed": false,
    "loginWithEmailAllowed": true,
    "duplicateEmailsAllowed": false,
    "resetPasswordAllowed": true,
    "editUsernameAllowed": false,
    "bruteForceProtected": true
  }')
echo "Response: $RESPONSE"

# Créer les rôles
echo "👥 Création des rôles ADMIN et CLIENT..."
curl -s -X POST http://localhost:8180/admin/realms/microservices-realm/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ADMIN",
    "description": "Administrator role with full access"
  }'

curl -s -X POST http://localhost:8180/admin/realms/microservices-realm/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CLIENT",
    "description": "Client role with limited access"
  }'

# Créer le client microservices-client
echo "📱 Création du client microservices-client..."
curl -s -X POST http://localhost:8180/admin/realms/microservices-realm/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "microservices-client",
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
      "pkce.code.challenge.method": "S256"
    }
  }'

# Créer l'utilisateur admin
echo "👑 Création de l'utilisateur admin..."
curl -s -X POST http://localhost:8180/admin/realms/microservices-realm/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "enabled": true,
    "emailVerified": true,
    "firstName": "Admin",
    "lastName": "User",
    "credentials": [{
      "type": "password",
      "value": "admin123",
      "temporary": false
    }],
    "realmRoles": ["ADMIN"]
  }'

# Créer l'utilisateur client
echo "👤 Création de l'utilisateur client..."
curl -s -X POST http://localhost:8180/admin/realms/microservices-realm/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "client",
    "enabled": true,
    "emailVerified": true,
    "firstName": "Client",
    "lastName": "User",
    "credentials": [{
      "type": "password",
      "value": "client123",
      "temporary": false
    }],
    "realmRoles": ["CLIENT"]
  }'

echo "🎉 Configuration de Keycloak terminée avec succès !"
echo ""
echo "📋 Comptes de test créés :"
echo "👑 Admin    : admin / admin123 (rôle ADMIN)"
echo "👤 Client   : client / client123 (rôle CLIENT)"
echo ""
echo "🌐 URLs disponibles :"
echo "🔐 Keycloak Admin : http://localhost:8180"
echo "⚛️  Frontend React : http://localhost:3002"