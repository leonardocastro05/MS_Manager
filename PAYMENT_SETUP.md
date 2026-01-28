# 💳 Configuración del Sistema de Pagos - MS Manager

## Resumen

Para activar las compras con tarjeta de crédito en MS Manager, necesitas integrar **Stripe**, que es la plataforma de pagos más popular y segura.

## 🔧 Pasos para configurar Stripe

### 1. Crear una cuenta de Stripe

1. Ve a [https://stripe.com](https://stripe.com)
2. Haz clic en "Crear cuenta" o "Sign up"
3. Completa el registro con tu email y datos de empresa
4. **IMPORTANTE**: Deberás verificar tu identidad y datos bancarios

### 2. Obtener las API Keys

1. Una vez registrado, ve al Dashboard de Stripe
2. En el menú izquierdo, busca "Developers" → "API Keys"
3. Encontrarás dos keys:
   - **Publishable Key** (`pk_test_...` o `pk_live_...`) - Para el frontend
   - **Secret Key** (`sk_test_...` o `sk_live_...`) - Para el backend (¡NUNCA la expongas!)

### 3. Configurar tu servidor

#### 3.1 Instalar Stripe en el backend

```bash
cd database
npm install stripe
```

#### 3.2 Crear archivo `.env` con las keys

Crea un archivo `.env` en la carpeta `database/`:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx

# URL del frontend (para redirecciones)
FRONTEND_URL=http://localhost:5000
```

#### 3.3 Activar el código de Stripe

En el archivo `database/routes/online.js`, descomenta el código de Stripe en estas rutas:
- `POST /api/online/shop/create-checkout`
- `POST /api/online/shop/webhook`

### 4. Configurar Webhooks

Los webhooks son esenciales para saber cuándo un pago se ha completado:

1. En el Dashboard de Stripe → "Developers" → "Webhooks"
2. Clic en "Add endpoint"
3. URL del endpoint: `https://tu-dominio.com/api/online/shop/webhook`
4. Selecciona el evento: `checkout.session.completed`
5. Guarda el **Webhook Secret** (`whsec_...`) en tu `.env`

### 5. Flujo de una compra

```
1. Usuario hace clic en "Comprar 50 Coins - 19.99€"
        ↓
2. Frontend llama a POST /api/online/shop/create-checkout
        ↓
3. Backend crea una sesión de Stripe y devuelve URL
        ↓
4. Usuario es redirigido a página de pago de Stripe
        ↓
5. Usuario introduce tarjeta y paga
        ↓
6. Stripe envía webhook a tu servidor
        ↓
7. Backend añade los coins al usuario
        ↓
8. Usuario es redirigido de vuelta a tu app
```

## 💰 Cómo recibes el dinero

1. **Stripe cobra un fee** por cada transacción:
   - Normalmente: 2.9% + 0.30€ por transacción
   - Puede variar según país y volumen

2. **El dinero se acumula** en tu cuenta de Stripe

3. **Payouts automáticos** a tu cuenta bancaria:
   - Stripe te envía el dinero automáticamente
   - Normalmente cada 2-7 días (configurable)
   - Puedes configurar transferencias instantáneas

## 🧪 Modo de Pruebas

Stripe tiene un **modo de pruebas** para desarrollar sin dinero real:

- Las keys de test empiezan por `pk_test_` y `sk_test_`
- Usa tarjetas de prueba: `4242 4242 4242 4242`
- Cualquier fecha futura y CVC funciona

## 🔐 Seguridad

- **NUNCA** expongas la `STRIPE_SECRET_KEY` en el frontend
- **SIEMPRE** verifica los webhooks con el secret
- Usa HTTPS en producción
- Valida los montos en el servidor, no confíes en el frontend

## 📱 Código de ejemplo para el Frontend

```javascript
// En league.js - Método para iniciar compra de coins
async purchaseCoins(packageId) {
    try {
        const response = await fetch(`${this.API_URL}/online/shop/create-checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ packageId })
        });
        
        const data = await response.json();
        
        if (data.success && data.checkoutUrl) {
            // Redirigir a la página de pago de Stripe
            window.location.href = data.checkoutUrl;
        } else {
            this.showToast(data.message || 'Error al iniciar el pago', 'error');
        }
    } catch (error) {
        console.error('Error purchasing coins:', error);
        this.showToast('Error al conectar con el sistema de pagos', 'error');
    }
}
```

## 📊 Panel de administración

Stripe proporciona un dashboard completo donde puedes:
- Ver todas las transacciones
- Gestionar reembolsos
- Ver estadísticas de ventas
- Configurar notificaciones
- Gestionar disputas

## 🌍 Requisitos legales

Según tu país, puede que necesites:
- Registrarte como autónomo o empresa
- Declarar los ingresos a Hacienda
- Cumplir con normativas de consumo (derecho de desistimiento)
- Política de privacidad actualizada
- Términos y condiciones

## 🆘 Soporte

- [Documentación de Stripe](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [API Reference](https://stripe.com/docs/api)

---

## Resumen del Sistema XP implementado

| Posición | XP Ganado |
|----------|-----------|
| P1 (1º)  | 200 XP    |
| P2 - P5  | 150 XP    |
| P6+      | 50 XP     |

### Progresión de niveles (más fácil al principio):

- **Nivel 1-5**: 100-220 XP por nivel
- **Nivel 6-15**: 250-700 XP por nivel  
- **Nivel 16-30**: 750-2200 XP por nivel
- **Nivel 31-50**: 2250+ XP por nivel (más difícil)
