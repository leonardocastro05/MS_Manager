#!/bin/bash

# ===================================================
# MS Manager - SSL Certificate Initialization Script
# ===================================================
# Este script configura los certificados SSL de Let's Encrypt
# para usar tu dominio de DuckDNS con HTTPS
# ===================================================

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}MS Manager - Inicialización SSL${NC}"
echo -e "${GREEN}========================================${NC}"

# Cargar variables de entorno
if [ ! -f .env ]; then
    echo -e "${RED}Error: Archivo .env no encontrado${NC}"
    exit 1
fi

source .env

if ! command -v openssl >/dev/null 2>&1; then
    echo -e "${RED}Error: openssl no está instalado${NC}"
    echo -e "${YELLOW}Instálalo con: sudo apt install openssl${NC}"
    exit 1
fi

# Verificar variables requeridas
if [ -z "$DOMAIN" ] || [ -z "$SSL_EMAIL" ]; then
    echo -e "${RED}Error: DOMAIN y SSL_EMAIL deben estar configurados en .env${NC}"
    exit 1
fi

if [ "$DUCKDNS_TOKEN" = "REPLACE_WITH_YOUR_DUCKDNS_TOKEN" ]; then
    echo -e "${RED}Error: Por favor configura tu DUCKDNS_TOKEN en el archivo .env${NC}"
    echo -e "${YELLOW}Obtén tu token desde: https://www.duckdns.org/${NC}"
    exit 1
fi

echo -e "${YELLOW}Dominio: ${DOMAIN}${NC}"
echo -e "${YELLOW}Email: ${SSL_EMAIL}${NC}"
echo ""

# Generar nginx.conf desde plantilla usando el dominio
if [ ! -f ./nginx/nginx.conf.template ]; then
    echo -e "${RED}Error: Archivo nginx/nginx.conf.template no encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}[0/6] Generando configuración de Nginx para ${DOMAIN}...${NC}"
sed "s/__DOMAIN__/${DOMAIN}/g" ./nginx/nginx.conf.template > ./nginx/nginx.conf

# Actualizar DuckDNS con la IP actual
echo -e "${GREEN}[1/5] Actualizando DuckDNS con IP actual...${NC}"
RESPONSE=$(curl -s "https://www.duckdns.org/update?domains=${DOMAIN%%.*}&token=${DUCKDNS_TOKEN}&ip=")
if [ "$RESPONSE" = "OK" ]; then
    echo -e "${GREEN}✓ DuckDNS actualizado correctamente${NC}"
else
    echo -e "${RED}✗ Error actualizando DuckDNS: $RESPONSE${NC}"
    echo -e "${YELLOW}Verifica que tu token sea correcto${NC}"
    exit 1
fi

# Crear directorios para certificados si no existen
echo -e "${GREEN}[2/6] Creando directorios...${NC}"
mkdir -p ./certbot/conf
mkdir -p ./certbot/www
mkdir -p ./certbot/conf/live/${DOMAIN}

# Crear certificado dummy para que Nginx pueda iniciar con SSL antes de emitir el certificado real
if [ ! -f "./certbot/conf/live/${DOMAIN}/fullchain.pem" ] || [ ! -f "./certbot/conf/live/${DOMAIN}/privkey.pem" ]; then
    echo -e "${GREEN}[3/6] Generando certificado temporal (dummy)...${NC}"
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout ./certbot/conf/live/${DOMAIN}/privkey.pem \
        -out ./certbot/conf/live/${DOMAIN}/fullchain.pem \
        -subj "/CN=${DOMAIN}" >/dev/null 2>&1
else
    echo -e "${GREEN}[3/6] Certificado existente detectado, omitiendo dummy...${NC}"
fi

# Detener contenedores si están corriendo
echo -e "${GREEN}[4/6] Deteniendo contenedores existentes...${NC}"
docker compose down 2>/dev/null || true

# Crear un servidor temporal de Nginx para validación
echo -e "${GREEN}[5/6] Iniciando servidor temporal para validación ACME...${NC}"
docker compose up -d frontend

# Esperar a que Nginx esté listo
echo "Esperando a que Nginx inicie..."
sleep 5

# Solicitar certificado SSL
echo -e "${GREEN}[6/6] Solicitando certificado SSL de Let's Encrypt...${NC}"
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email ${SSL_EMAIL} \
    --agree-tos \
    --no-eff-email \
    -d ${DOMAIN}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Recargando Nginx con certificado real...${NC}"
    docker compose restart frontend

    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ ¡Certificado SSL obtenido con éxito!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Ahora inicia todos los servicios (incluyendo renovación):${NC}"
    echo -e "${GREEN}docker compose up -d${NC}"
    echo ""
    echo -e "${YELLOW}Tu aplicación estará disponible en:${NC}"
    echo -e "${GREEN}https://${DOMAIN}${NC}"
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}✗ Error obteniendo certificado SSL${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Posibles causas:${NC}"
    echo "1. El puerto 80 no está abierto en tu firewall"
    echo "2. El dominio no apunta a tu IP pública"
    echo "3. Ya has solicitado demasiados certificados (límite de Let's Encrypt)"
    echo ""
    echo -e "${YELLOW}Verifica:${NC}"
    echo "- Abre el puerto 80 y 443: sudo ufw allow 80/tcp && sudo ufw allow 443/tcp"
    echo "- Verifica tu IP: curl ifconfig.me"
    echo "- Verifica DNS: nslookup ${DOMAIN}"
    exit 1
fi
