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
- 📋 Android Play Store
- 📋 Windows (PWA / empaquetado nativo)
- 📋 macOS (PWA en Safari/Chrome; app nativa opcional)

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

## Variables de entorno

Configurá `.env.local` con `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_BASE_URL` (Capacitor) y las claves de Mercado Pago. Ver `ENV_SETUP.md`.
