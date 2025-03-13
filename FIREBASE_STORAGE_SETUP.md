# Configuración de Firebase Storage para Copy & Paste App

Este documento explica cómo configurar Firebase Storage para permitir a los usuarios subir y almacenar archivos en la aplicación Copy & Paste.

## Requisitos previos

- Tener una cuenta de Firebase
- Tener un proyecto de Firebase creado
- Tener configurada la autenticación de Firebase
- Tener configurada Firestore Database

## Pasos para configurar Firebase Storage

### 1. Habilitar Firebase Storage en la consola de Firebase

1. Ve a la [consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en "Storage"
4. Haz clic en "Comenzar"
5. Selecciona la ubicación de almacenamiento (preferiblemente la misma región que Firestore)
6. Acepta las reglas de seguridad predeterminadas por ahora (las modificaremos más adelante)

### 2. Configurar las reglas de seguridad de Storage

1. En la consola de Firebase, ve a la sección "Storage"
2. Haz clic en la pestaña "Reglas"
3. Reemplaza las reglas existentes con las siguientes:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow users to read and write only their own files
    match /files/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default deny all
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

4. Haz clic en "Publicar"

### 3. Actualizar firebase.json

Asegúrate de que tu archivo `firebase.json` incluya la configuración de Storage:

```json
{
  "hosting": {
    // ... configuración existente
  },
  "firestore": {
    // ... configuración existente
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### 4. Límites y consideraciones

- **Tamaño máximo de archivo**: Por defecto, Firebase Storage permite subir archivos de hasta 5GB.
- **Cuota gratuita**: Firebase ofrece 5GB de almacenamiento y 1GB de descargas diarias en el plan gratuito (Spark).
- **Costos**: Si superas la cuota gratuita, se te cobrará según el [plan de precios de Firebase](https://firebase.google.com/pricing).

### 5. Pruebas y verificación

Para verificar que la configuración funciona correctamente:

1. Inicia sesión en la aplicación
2. Intenta subir un archivo pequeño (como una imagen)
3. Verifica que el archivo se haya subido correctamente y se pueda visualizar/descargar
4. Verifica en la consola de Firebase (sección Storage) que el archivo aparezca en la estructura de carpetas correcta (`files/{userId}/...`)

## Solución de problemas comunes

### Error de CORS

Si encuentras errores de CORS al intentar descargar archivos, asegúrate de configurar las reglas CORS para tu bucket:

1. Instala la CLI de Firebase si aún no lo has hecho: `npm install -g firebase-tools`
2. Inicia sesión: `firebase login`
3. Crea un archivo `cors.json` con el siguiente contenido:
```json
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```
4. Ejecuta el siguiente comando (reemplaza `<BUCKET_NAME>` con el nombre de tu bucket):
```
gsutil cors set cors.json gs://<BUCKET_NAME>
```

### Error de permisos

Si los usuarios no pueden subir o descargar archivos, verifica:

1. Que las reglas de seguridad estén correctamente configuradas
2. Que los usuarios estén autenticados antes de intentar subir/descargar
3. Que la estructura de carpetas en Storage coincida con la esperada en las reglas (`files/{userId}/...`)

## Recursos adicionales

- [Documentación oficial de Firebase Storage](https://firebase.google.com/docs/storage)
- [Guía de seguridad de Firebase Storage](https://firebase.google.com/docs/storage/security)
- [Ejemplos de reglas de seguridad](https://firebase.google.com/docs/storage/security/start) 