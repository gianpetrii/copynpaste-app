# CopyNPaste App

## Descripción del proyecto

**Portapapeles universal** en la web: guardar textos, enlaces y archivos, organizarlos, sincronizarlos entre dispositivos y ofrecer planes de uso con pagos vía **Mercado Pago** y backend Firebase.

## Problema que resuelve

El portapapeles del sistema y las notas rápidas no cruzan de forma fiable entre PC y móvil ni se comparten con control: esta app resuelve acceso multi-dispositivo, historial útil y opciones de pago para quien necesita más capacidad o uso profesional.

## Stack

- Next.js, React, TypeScript, Tailwind / Radix  
- Firebase (Auth, Firestore, Storage), Mercado Pago  
- Capacitor 8 (apps nativas iOS / Android)

## Requisitos

- Node.js 22 LTS (`fnm use` lee `.nvmrc`)
- Proyecto Firebase y credenciales de Mercado Pago si usás pagos  
- **iOS nativo:** Xcode, CocoaPods, cuenta Apple Developer

## Instalación (desarrollo web)

```bash
npm install
npm run dev
```

Scripts destacados: `build`, `start`, `lint`, `build:capacitor`, `cap:ios`, `cap:android`, `firebase:deploy`, `firebase:rules`.

## Deploy web (Vercel)

La app web y las API routes se publican en **Vercel** (push a la rama conectada o deploy manual desde el dashboard).

Firebase se usa solo para **Auth, Firestore y Storage** — no para hosting.

## Instalar como app (hoy)

| Plataforma | Cómo | Estado |
|------------|------|--------|
| **Web / Mac / Windows** | PWA: Chrome → “Instalar app” (prompt en la app) | ✅ Listo |
| **iPhone (Safari)** | PWA: Compartir → “Añadir a pantalla de inicio” (banner en la app) | ✅ Listo |
| **iPhone (App Store)** | App nativa Capacitor + Xcode | 🚧 En curso |
| **Android** | App nativa Capacitor (proyecto en `android/`) | 📋 Backlog |
| **Mac / Windows nativo** | PWA hoy; wrapper nativo más adelante | 📋 Backlog |

La app nativa usa build estático (`out/`) y llama a las APIs en la URL de producción (`NEXT_PUBLIC_BASE_URL` → Vercel).

## Roadmap multiplataforma

Objetivo final: **misma experiencia en Mac, iPhone, Android y Windows**.

- ✅ Web responsive + PWA (manifest, service worker, instalación)
- ✅ Capacitor: iOS + Android, biometría, push, share, haptics
- 🚧 **iPhone App Store** — build, firma, prueba en dispositivo, Archive
- 📋 Android (Play Store) — proyecto Capacitor listo en `android/`
- 📋 Windows — PWA instalable / empaquetado nativo (Electron o Tauri)
- 📋 macOS — App nativa Capacitor / Electron para Mac App Store

## Roadmap de features

### Plataformas nativas
- 📋 **Widget iOS** — widget de pantalla de inicio que muestra los últimos ítems del portapapeles y permite copiar con un tap, sin abrir la app (WidgetKit / Capacitor plugin)
- 📋 **Widget Android** — widget equivalente para la pantalla de inicio de Android (Glance / AppWidget)
- 📋 **App Mac nativa** — app standalone para macOS (menú bar icon + ventana principal) con sincronización en tiempo real con el resto de dispositivos
- 📋 **App Android** — publicación en Play Store del proyecto Capacitor existente
- 📋 **App Windows** — cliente nativo (PWA empaquetada o Electron) para Windows

### Funcionalidades
- 📋 **Historial sincronizado en tiempo real** — push automático de nuevos ítems entre dispositivos conectados
- 📋 **Ítems protegidos** — ítems con autenticación biométrica antes de mostrar el contenido (contraseñas, datos sensibles)
- 📋 **Atajos de teclado globales** — hotkey de sistema para abrir la app y pegar el último ítem copiado

## iOS — próximos pasos (desarrollo)

Orden recomendado para validar cambios:

```bash
# 1. Web: animaciones y UI en dev
npm run dev

# 2. Web: build de producción
npm run build

# 3. Nativo: build estático + sync a ios/
npm run build:capacitor

# 4. Abrir Xcode (proyecto CopyNPaste)
npm run cap:ios
```

Dependencias nativas (solo la primera vez o tras cambiar plugins):

```bash
cd ios/App && pod install && cd ../..
```

En Xcode deberías ver el proyecto **CopyNPaste** (scheme `CopyNPaste`). Team de Apple Developer → conectar iPhone → Run. Para publicar: Product → Archive → App Store Connect.

> Capacitor sigue esperando `App.xcodeproj` y `App.xcworkspace` por convención; en este repo son symlinks al proyecto real `CopyNPaste.*`.

Variables necesarias en `.env.local`: `NEXT_PUBLIC_BASE_URL` apuntando al deploy en Vercel (ej. `https://copynpaste.app` o `https://copynpaste-app.vercel.app`).

## Flujo de pagos — Mercado Pago

### Cómo funciona

El flujo es browser-based (estilo Netflix/Spotify): el usuario selecciona un plan → se crea una PreApproval en MP → se redirige al checkout de MP → MP redirige de vuelta a `/subscription/success` o `/subscription/failure`. La suscripción también se activa automáticamente por webhook cuando MP confirma el pago.

```
Usuario → /pricing → SubscriptionModal
  → POST /api/mercadopago/create-subscription
    → Genera subscriptionId único (usado tanto en Firestore como en MP external_reference)
    → Crea PreApproval en MP con notification_url y back_url
    → Crea doc en Firestore con status: pending
  → Redirect a MP init_point (checkout de MP)
    → Usuario completa el pago en MP
  → MP redirige a /subscription/success?subscription_id=...
    → activateSubscription() → status: active, user.plan actualizado
  → MP también envía webhook a /api/mercadopago/webhook
    → Activa o cancela la suscripción como respaldo
```

### Testing con sandbox de Mercado Pago

**Prerequisitos:**
- Cuenta en [developers.mercadopago.com](https://developers.mercadopago.com)
- Credenciales TEST en `.env.local` (ya configuradas: `TEST-...`)
- App corriendo en Vercel o con ngrok para recibir webhooks

**Pasos:**

1. **Ir a `/pricing`** y elegir un plan Premium o Enterprise
2. En el modal, hacer click en "Continuar"
3. Se abre el checkout de MP → usar tarjeta de prueba:
   - Número: `5031 7557 3453 0604`
   - Vencimiento: cualquier fecha futura
   - CVV: `123`
   - Nombre: `APRO` (para aprobar) o `OTHE` (para rechazar)
4. Completar el pago → MP redirige a `/subscription/success`
5. Verificar en Firestore que el doc en `subscriptions/` tiene `status: active` y que el user tiene `plan: premium`

**Tarjetas de prueba completas:** [https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards)

### Testing de webhooks en desarrollo local

Para recibir webhooks de MP en local se necesita un túnel:

```bash
# Instalar ngrok (una vez)
brew install ngrok

# Exponer el servidor local
ngrok http 3000
```

Copiar la URL HTTPS de ngrok y actualizar en `.env.local`:
```
NEXT_PUBLIC_BASE_URL=https://abc123.ngrok.io
```

Reiniciar el servidor. Los webhooks de MP llegarán a `https://abc123.ngrok.io/api/mercadopago/webhook`.

### Variables de entorno para pagos

| Variable | Descripción |
|----------|-------------|
| `MERCADOPAGO_ACCESS_TOKEN` | Token privado (empieza con `TEST-` en sandbox, `APP_USR-` en producción) |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Clave pública (empieza con `TEST-` en sandbox) |
| `NEXT_PUBLIC_BASE_URL` | URL base de la app (callbacks de MP apuntan aquí) |

### Pasar a producción

1. Crear credenciales de producción en el panel de MP
2. Reemplazar `MERCADOPAGO_ACCESS_TOKEN` y `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` con los valores `APP_USR-...`
3. Configurar `NEXT_PUBLIC_BASE_URL` con el dominio final
4. En el panel de MP, registrar la URL del webhook: `https://tudominio.com/api/mercadopago/webhook`

## Variables de entorno

Configurá `.env.local` con `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_BASE_URL` (Capacitor) y las claves de Mercado Pago. Ver `ENV_SETUP.md`.
