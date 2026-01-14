-- Script SQL pour configurer PostgreSQL pour le projet microservices
-- À exécuter en tant que superutilisateur PostgreSQL

-- Créer les utilisateurs
CREATE USER productuser WITH PASSWORD 'productpass';
CREATE USER commanduser WITH PASSWORD 'commandpass';

-- Créer les bases de données
CREATE DATABASE productdb OWNER productuser;
CREATE DATABASE commanddb OWNER commanduser;

-- Donner les permissions complètes
GRANT ALL PRIVILEGES ON DATABASE productdb TO productuser;
GRANT ALL PRIVILEGES ON DATABASE commanddb TO commanduser;

-- Vérifier la création
\l
\du

-- Instructions pour l'utilisateur :
-- 1. Se connecter à PostgreSQL : sudo -u postgres psql
-- 2. Exécuter ce script : \i /chemin/vers/setup-postgresql.sql
-- 3. Ou copier-coller les commandes ci-dessus
