#!/bin/bash

# Create certificates for mTLS between microservices

echo "Creating certificates for mTLS..."

# Create directory for certificates
mkdir -p certificates

cd certificates

# Generate CA private key
openssl genrsa -out ca-key.pem 4096

# Generate CA certificate
openssl req -new -x509 -days 365 -key ca-key.pem -sha256 -out ca-cert.pem -subj "/C=MA/ST=Casablanca/L=Casablanca/O=Security/OU=DevOps/CN=security-root-ca"

# Generate server private key
openssl genrsa -out server-key.pem 2048

# Generate server certificate signing request
openssl req -subj "/C=MA/ST=Casablanca/L=Casablanca/O=Security/OU=DevOps/CN=localhost" -new -key server-key.pem -out server.csr

# Generate server certificate
openssl x509 -req -days 365 -in server.csr -CA ca-cert.pem -CAkey ca-key.pem -out server-cert.pem -sha256 -CAcreateserial

# Generate client private key
openssl genrsa -out client-key.pem 2048

# Generate client certificate signing request
openssl req -subj "/C=MA/ST=Casablanca/L=Casablanca/O=Security/OU=DevOps/CN=client" -new -key client-key.pem -out client.csr

# Generate client certificate
openssl x509 -req -days 365 -in client.csr -CA ca-cert.pem -CAkey ca-key.pem -out client-cert.pem -sha256 -CAcreateserial

# Create PKCS12 keystore for server
openssl pkcs12 -export -in server-cert.pem -inkey server-key.pem -out server-keystore.p12 -name server -CAfile ca-cert.pem -caname root -password pass:changeit

# Create PKCS12 truststore
keytool -import -alias ca -file ca-cert.pem -keystore truststore.p12 -storepass changeit -noprompt

echo "Certificates created successfully!"
echo ""
echo "Generated files:"
echo "  ca-cert.pem          - CA certificate"
echo "  server-cert.pem      - Server certificate"
echo "  server-key.pem       - Server private key"
echo "  client-cert.pem      - Client certificate"
echo "  client-key.pem       - Client private key"
echo "  server-keystore.p12  - Server keystore (password: changeit)"
echo "  truststore.p12       - Truststore (password: changeit)"
echo ""
echo "To enable mTLS, add these properties to your application.properties:"
echo "  server.ssl.key-store=classpath:certificates/server-keystore.p12"
echo "  server.ssl.key-store-password=changeit"
echo "  server.ssl.key-store-type=PKCS12"
echo "  server.ssl.trust-store=classpath:certificates/truststore.p12"
echo "  server.ssl.trust-store-password=changeit"
echo "  server.ssl.trust-store-type=PKCS12"
echo "  server.ssl.client-auth=need"