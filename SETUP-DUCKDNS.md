# MS Manager - DuckDNS & Docker Configuration Guide

## 📋 Pasos para configurar HTTPS con DuckDNS

### 1. Configurar DuckDNS Token
Edita el archivo `.env` y reemplaza `REPLACE_WITH_YOUR_DUCKDNS_TOKEN` con tu token real:

```bash
nano .env
```

Obtén tu token desde: https://www.duckdns.org/

### 2. Abrir puertos en el firewall
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

### 3. Dar permisos de ejecución a los scripts
```bash
chmod +x init-ssl.sh
chmod +x update-duckdns.sh
```

### 4. Ejecutar el script de inicialización SSL
```bash
./init-ssl.sh
```

Este script:
- Actualiza tu IP en DuckDNS
- Solicita certificados SSL de Let's Encrypt
- Configura todo automáticamente

### 5. Iniciar todos los servicios
```bash
docker compose up -d
```

### 6. Verificar que todo funciona
```bash
docker compose ps
docker compose logs -f frontend
```

Accede a: https://msmanager.duckdns.org

## 🔄 Actualización automática de DuckDNS

Si tu IP pública cambia frecuentemente, configura un cron job:

```bash
crontab -e
```

Agrega esta línea para actualizar cada 5 minutos:
```
*/5 * * * * /home/leo/servers/msmanager/update-duckdns.sh >> /home/leo/servers/msmanager/duckdns.log 2>&1
```

## 🔧 Comandos útiles

### Ver logs
```bash
docker compose logs -f
docker compose logs -f frontend
docker compose logs -f backend
```

### Reiniciar servicios
```bash
docker compose restart
```

### Detener servicios
```bash
docker compose down
```

### Renovar certificado manualmente
```bash
docker compose run --rm certbot renew
docker compose restart frontend
```

## ⚠️ Solución de problemas

### Error "Connection refused"
- Verifica que los puertos 80 y 443 estén abiertos
- Confirma que el dominio apunta a tu IP: `nslookup msmanager.duckdns.org`

### Error "Certificate not found"
- Ejecuta de nuevo: `./init-ssl.sh`
- Verifica que DuckDNS está actualizado

### Error "Too many requests"
- Let's Encrypt tiene límite de 5 certificados por dominio por semana
- Espera antes de reintentar o usa el modo staging para pruebas

## 📱 Configurar OAuth (Google/Facebook)

1. **Google Cloud Console**: https://console.cloud.google.com/
   - Agrega URL autorizada: `https://msmanager.duckdns.org`
   - Agrega URI de redirección: `https://msmanager.duckdns.org/api/auth/google/callback`

2. **Facebook Developers**: https://developers.facebook.com/
   - Agrega URL del sitio: `https://msmanager.duckdns.org`
   - Agrega URI de redirección OAuth: `https://msmanager.duckdns.org/api/auth/facebook/callback`

3. Actualiza `.env` con tus credenciales de OAuth

## 🎮 ¡Listo!

Tu juego MS Manager ahora está disponible en:
**https://msmanager.duckdns.org**
