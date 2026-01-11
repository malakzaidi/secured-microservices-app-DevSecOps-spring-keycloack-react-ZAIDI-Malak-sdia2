#!/bin/bash

# Script d'arrêt de tous les microservices

echo "🛑 Arrêt des Microservices..."
echo "============================"

# Fonction pour tuer un processus
kill_process() {
    local pid=$1
    local service_name=$2

    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        echo "Arrêt de $service_name (PID: $pid)..."
        kill "$pid"
        sleep 2

        # Vérifier si le processus est toujours en cours
        if kill -0 "$pid" 2>/dev/null; then
            echo "Forçage de l'arrêt de $service_name..."
            kill -9 "$pid"
        fi

        echo "✅ $service_name arrêté"
    else
        echo "⚠️  $service_name déjà arrêté ou PID invalide"
    fi
}

# Tuer tous les processus Java (Spring Boot)
echo "Arrêt de tous les processus Spring Boot..."
pkill -f "spring-boot:run" 2>/dev/null

# Nettoyer les processus restants sur les ports utilisés
echo "Nettoyage des ports utilisés..."
for port in 8761 8080 8082 8083; do
    pid=$(lsof -ti :$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo "Arrêt du processus sur le port $port (PID: $pid)"
        kill -9 "$pid" 2>/dev/null
    fi
done

echo ""
echo "✅ Tous les services ont été arrêtés !"
echo "======================================"
echo ""
echo "💡 Pour redémarrer : ./start-services.sh"
