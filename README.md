# 📋 CopyNPaste - Tu Portapapeles Universal

CopyNPaste es una aplicación web completa que funciona como tu portapapeles universal, permitiéndote guardar, organizar y acceder a tu información importante desde cualquier dispositivo. Sincroniza textos, enlaces y archivos de forma segura con funcionalidades avanzadas de organización.

## ✨ Features

### 📝 Gestión Completa de Contenido
- Guardar textos, enlaces y archivos de cualquier tipo
- Organización con favoritos y categorías
- Búsqueda rápida por contenido y tipo
- Sincronización automática entre dispositivos

### 📱 Experiencia PWA Optimizada
- Aplicación web progresiva (PWA) instalable
- Funciona offline con sincronización automática
- Interfaz responsive optimizada para móvil y desktop
- Acceso rápido desde cualquier dispositivo

### 🔐 Seguridad y Privacidad
- Autenticación segura con Firebase Auth
- Datos encriptados y privados por usuario
- Control total sobre tu información personal
- Eliminación completa de cuenta disponible

### 📋 Funcionalidades de Portapapeles
- Detección automática de contenido pegado
- Soporte para imágenes desde portapapeles
- Organización automática por tipo de contenido
- Acceso rápido a elementos frecuentemente usados

### 💰 Sistema de Suscripciones
- Plan gratuito con funcionalidades básicas
- Planes premium con características avanzadas
- Integración con MercadoPago para pagos seguros
- Gestión flexible de suscripciones

### 🌐 Compartir y Exportar
- Compartir elementos específicos con otros usuarios
- Exportar datos en múltiples formatos
- Sincronización en tiempo real
- Acceso desde múltiples dispositivos simultáneamente

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Payments**: MercadoPago integration
- **PWA**: Service Worker, offline functionality

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Authentication, Firestore, and Storage enabled
- MercadoPago account for payment processing

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/copynpaste-app.git
   cd copynpaste-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with your configuration:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Firebase Admin (for account deletion)
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   
   # MercadoPago
   MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_token
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗺️ Current Status & Future Enhancements

### ✅ **Completed Features**
- Core clipboard functionality with text, links, and files
- User authentication and secure data storage
- PWA implementation with offline capabilities
- Subscription system with MercadoPago integration
- Responsive design optimized for all devices
- Advanced search and organization features
- Image paste from clipboard functionality

### 🔧 **Technical Improvements in Progress**
- Performance optimizations
- Enhanced offline synchronization
- Bug fixes and stability improvements
- Security enhancements
- Code refactoring and optimization

### 💡 **Potential Future Enhancements**
- Advanced collaboration features
- API integrations with popular tools
- Enhanced mobile app experience
- Advanced analytics and insights
- Team workspace functionality

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for productivity enthusiasts**