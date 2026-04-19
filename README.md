# CopyNPaste App

## Descripción del proyecto

**Portapapeles universal** en la web: guardar textos, enlaces y archivos, organizarlos, sincronizarlos entre dispositivos y ofrecer planes de uso con pagos vía **Mercado Pago** y backend Firebase.

## Problema que resuelve

El portapapeles del sistema y las notas rápidas no cruzan de forma fiable entre PC y móvil ni se comparten con control: esta app resuelve acceso multi-dispositivo, historial útil y opciones de pago para quien necesita más capacidad o uso profesional.

## Stack

- Next.js, React, TypeScript, Tailwind / Radix  
- Firebase (Auth, Firestore, Storage), Mercado Pago  

## Requisitos

- Node.js LTS  
- Proyecto Firebase y credenciales de Mercado Pago si usás pagos  

## Instalación

```bash
npm install
npm run dev
```

Scripts destacados: `build`, `start`, `lint`, `firebase:deploy`, `firebase:rules`, `deploy`.

## Variables de entorno

Configurá `.env.local` con `NEXT_PUBLIC_FIREBASE_*` y las claves de Mercado Pago / URLs que exija el código (buscá `process.env` en el proyecto).
