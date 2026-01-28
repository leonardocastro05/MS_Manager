# 🛒 Sistema de Compras Simuladas - MS Manager

## ✅ Estado Actual: MODO DEMOSTRACIÓN

El sistema de compra de coins está implementado en **modo simulado** para desarrollo y testing. 

### 🎮 ¿Cómo funcionan las compras simuladas?

1. **Usuario hace clic** en un paquete de coins en la tienda
2. **Aparece una confirmación** indicando que es una compra simulada
3. **Los coins se añaden inmediatamente** a la cuenta del usuario
4. **No se realiza ningún cargo real** - Todo es simulado

### 🪙 Paquetes de Coins Disponibles

| Paquete | Coins | Precio (Simulado) |
|---------|-------|-------------------|
| Básico | 5 🪙 | 1,99€ |
| Popular | 12 🪙 | 4,99€ |
| Valor | 18 🪙 | 7,99€ |
| Gran Valor | 30 🪙 | 12,99€ |
| Mejor Oferta | 50 🪙 | 19,99€ |
| Premium | 80 🪙 | 29,99€ |

### 💻 Implementación Técnica

#### Backend
- **Endpoint**: `POST /api/online/shop/buy-coins-simulated`
- **Archivo**: `database/routes/online.js`
- **Función**: Añade coins instantáneamente sin verificar pago

```javascript
// El endpoint recibe el packageId y añade los coins directamente
router.post('/shop/buy-coins-simulated', auth, async (req, res) => {
    // Busca el paquete
    const package_ = SHOP_CONFIG.coinPackages.find(p => p.id === packageId);
    
    // Añade coins al usuario
    user.gameData.online.coins += package_.coins;
    await user.save();
    
    // Devuelve éxito con el nuevo balance
    return { success: true, newBalance: { coins: user.gameData.online.coins } };
});
```

#### Frontend - Tiendas Implementadas

##### 1️⃣ Tienda Online (online.html)
- **Archivo JS**: `frontend/js/online.js`
- **Función**: `buyCoinPackage(packageId)`
- **Ubicación**: Sección "Tienda" en el modo online
- **Estado**: ✅ Implementado y funcionando

##### 2️⃣ Tienda de Liga (league.html)
- **Archivo JS**: `frontend/js/league.js`
- **Función**: `buyCoinPackage(packageId)` y `buyMoneyPackage(packageId)`
- **Ubicación**: Sección "Tienda" dentro de cada liga
- **Estado**: ✅ Implementado y funcionando
- **Características adicionales**:
  - Compra de coins (simulado)
  - Compra de dinero del juego con coins (funcional)
  - Sistema de tabs para organizar productos

##### 3️⃣ Dashboard Principal (dashboard.html)
- **Archivo JS**: `frontend/js/dashboard.js`
- **Ubicación**: Menú "Tienda" (aún no implementada la vista)
- **Estado**: ⏳ Pendiente - Preparado para implementación futura
- **Notas**: Código comentado con referencias a la implementación

#### Características de Implementación
- **Confirmación clara**: Muestra aviso de que es una compra simulada
- **Actualización automática**: El balance de coins se actualiza en tiempo real
- **Notificaciones**: Toast/mensaje de éxito tras cada compra
- **Banner de advertencia**: Visible en todas las tiendas implementadas

### 🔒 ¿Cuándo activar pagos reales?

Cuando la web esté lista para producción, deberás:

1. **Configurar Stripe** (ver [PAYMENT_SETUP.md](PAYMENT_SETUP.md))
   - Crear cuenta en https://stripe.com
   - Obtener API keys
   - Configurar webhooks

2. **Cambiar el endpoint** en el frontend
   ```javascript
   // Cambiar de:
   const response = await fetch(`${this.API_URL}/online/shop/buy-coins-simulated`, ...);
   
   // A:
   const response = await fetch(`${this.API_URL}/online/shop/create-checkout`, ...);
   ```

3. **Descomentar código de Stripe** en el backend
   - En `database/routes/online.js`, línea ~1010
   - Descomenta el código de integración con Stripe

4. **Configurar variables de entorno**
   ```env
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
   FRONTEND_URL=https://tu-dominio.com
   ```

5. **Quitar el aviso de demo** en `frontend/online.html`
   - Elimina el banner morado que dice "MODO DEMOSTRACIÓN"

### 🧪 Testing del Sistema Simulado

Para probar el sistema de compra simulado:

```bash
# 1. Iniciar el servidor
cd database
npm run dev

# 2. Abrir en el navegador
http://localhost:5000

# 3. Probar las diferentes tiendas:

## A) Tienda Online
http://localhost:5000/online.html
- Ir a la sección "Tienda"
- Hacer clic en cualquier paquete de coins
- Confirmar la compra simulada
- Verificar que los coins se añaden al balance

## B) Tienda de Liga
http://localhost:5000/league.html?id=<league_id>
- Ir a la sección "Tienda"
- Tab "🪙 Coins": Probar compra de coins (simulado)
- Tab "💵 Dinero": Probar compra de dinero con coins (funcional)
- Verificar actualizaciones de balance

## C) Dashboard (Pendiente)
http://localhost:5000/dashboard.html
- El menú "Tienda" muestra mensaje de "Próximamente"
- La implementación está preparada para cuando se active
```

### 📊 Uso de Coins

Los usuarios pueden usar los coins para:

1. **Comprar dinero del juego** (presupuesto)
   - 5M = 5 coins
   - 10M = 8 coins
   - 30M = 15 coins

2. **Comprar cambio de nombre** (próximamente)
3. **Comprar skins especiales** (próximamente)
4. **Entrar en ligas premium** (próximamente)

### ⚠️ Importante

- **NO uses el endpoint simulado en producción**
- **SIEMPRE muestra un aviso** cuando uses compras simuladas
- **Los usuarios deben saber** que no se están haciendo cargos reales
- **Cambia a Stripe** antes de lanzar la web públicamente

### 📝 Notas Adicionales

- El sistema simulado guarda los cambios en la base de datos real
- Los coins añadidos mediante compra simulada son persistentes
- Para resetear coins de un usuario, usa MongoDB Compass o el shell de Mongo

```javascript
// Resetear coins de un usuario en MongoDB
db.users.updateOne(
    { username: "nombre_usuario" },
    { $set: { "gameData.online.coins": 0 } }
)
```

---

## 🎯 Próximos Pasos

1. ✅ Sistema de compra simulado implementado
2. ⏳ Configurar Stripe para pagos reales
3. ⏳ Implementar webhooks de confirmación de pago
4. ⏳ Testing de pagos reales en modo test de Stripe
5. ⏳ Lanzamiento a producción con pagos reales

---

**Última actualización**: Enero 2026
