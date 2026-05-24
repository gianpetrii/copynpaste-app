import LegalPageLayout from '@/components/legal/legal-page-layout';

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Política de Privacidad" lastUpdated="23 de mayo de 2026">
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Introducción</h2>
        <p>
          CopyNPaste (&quot;nosotros&quot;) respeta tu privacidad. Esta política describe qué datos
          recopilamos, cómo los usamos y tus derechos. El responsable del tratamiento de datos es
          Gianluca Petri.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Datos que recopilamos</h2>
        <p className="mb-2">Recopilamos los siguientes tipos de información:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Datos de cuenta:</strong> email, nombre de display, foto de perfil (si usás Google).</li>
          <li><strong>Contenido:</strong> textos, URLs y archivos que guardás en el portapapeles.</li>
          <li><strong>Datos de dispositivo:</strong> identificador de dispositivo para gestionar límites de plan.</li>
          <li><strong>Datos de pago:</strong> procesados por MercadoPago; no almacenamos números de tarjeta.</li>
          <li><strong>Datos técnicos:</strong> logs de uso, tipo de dispositivo y sistema operativo.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Cómo usamos tus datos</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Proveer y mantener el Servicio, incluyendo sincronización entre dispositivos.</li>
          <li>Gestionar tu suscripción y procesar pagos a través de MercadoPago.</li>
          <li>Enviar notificaciones relacionadas con el servicio (si las activás).</li>
          <li>Mejorar la seguridad y detectar uso abusivo.</li>
          <li>Cumplir obligaciones legales.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Servicios de terceros</h2>
        <p className="mb-2">Utilizamos los siguientes proveedores:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Firebase (Google):</strong> autenticación, base de datos y almacenamiento de archivos.</li>
          <li><strong>MercadoPago:</strong> procesamiento de pagos y suscripciones.</li>
          <li><strong>Firebase Cloud Messaging:</strong> notificaciones push (solo si las activás).</li>
        </ul>
        <p className="mt-2">
          Cada proveedor tiene su propia política de privacidad. Te recomendamos revisarlas.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Almacenamiento y seguridad</h2>
        <p>
          Tus datos se almacenan en servidores de Google Cloud (Firebase) con cifrado en tránsito
          (HTTPS/TLS) y en reposo. Implementamos controles de acceso basados en autenticación de
          usuario. Ningún sistema es 100% seguro, pero tomamos medidas razonables para proteger tu información.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Retención de datos</h2>
        <p>
          Conservamos tus datos mientras tu cuenta esté activa. Al eliminar tu cuenta, borramos
          permanentemente tu contenido, archivos, dispositivos registrados e historial de suscripción
          en un plazo razonable. Algunos registros de facturación pueden conservarse por obligaciones legales.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Tus derechos</h2>
        <p className="mb-2">Tenés derecho a:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Acceder a los datos personales que tenemos sobre vos.</li>
          <li>Corregir datos inexactos desde la configuración de cuenta.</li>
          <li>Eliminar tu cuenta y todos tus datos desde la app.</li>
          <li>Retirar el consentimiento para notificaciones push en cualquier momento.</li>
          <li>Presentar una reclamación ante la autoridad de protección de datos de Argentina (AAIP).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Cookies y almacenamiento local</h2>
        <p>
          Utilizamos almacenamiento local del navegador para preferencias (tema claro/oscuro, estado
          de sesión) y cookies de autenticación de Firebase. No usamos cookies de seguimiento publicitario.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Menores de edad</h2>
        <p>
          El Servicio no está dirigido a menores de 13 años. No recopilamos intencionalmente datos
          de menores. Si detectamos una cuenta de un menor, la eliminaremos.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Cambios a esta política</h2>
        <p>
          Podemos actualizar esta política ocasionalmente. Te notificaremos cambios significativos
          por email o mediante un aviso en la app. El uso continuado del Servicio implica aceptación
          de los cambios.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Contacto</h2>
        <p>
          Para consultas sobre privacidad:{' '}
          <a href="mailto:support@copynpaste.app" className="text-blue-600 hover:underline">
            support@copynpaste.app
          </a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
