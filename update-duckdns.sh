#!/bin/bash

# ===================================================
# MS Manager - DuckDNS IP Update Script
# ===================================================
# Este script actualiza tu IP en DuckDNS
# Se puede ejecutar manualmente o con un cron job
# ===================================================

# Cargar variables de entorno
if [ -f /home/leo/servers/msmanager/.env ]; then
    source /home/leo/servers/msmanager/.env
elif [ -f .env ]; then
    source .env
else
    echo "Error: Archivo .env no encontrado"
    exit 1
fi

# Extraer solo el subdominio (msmanager de msmanager.duckdns.org)
SUBDOMAIN=${DOMAIN%%.*}

# Actualizar DuckDNS
echo "Actualizando DuckDNS para ${DOMAIN}..."
RESPONSE=$(curl -s "https://www.duckdns.org/update?domains=${SUBDOMAIN}&token=${DUCKDNS_TOKEN}&ip=")

if [ "$RESPONSE" = "OK" ]; then
    echo "$(date): DuckDNS actualizado correctamente para ${DOMAIN}"
    exit 0
else
    echo "$(date): Error actualizando DuckDNS: $RESPONSE"
    exit 1
fi
