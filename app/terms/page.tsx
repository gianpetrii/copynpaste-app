import LegalPageLayout from '@/components/legal/legal-page-layout';

export default function TermsPage() {
  return (
    <LegalPageLayout title="Términos de Servicio" lastUpdated="23 de mayo de 2026">
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Aceptación de los términos</h2>
        <p>
          Al acceder o utilizar CopyNPaste (&quot;el Servicio&quot;), aceptás estos Términos de Servicio.
          Si no estás de acuerdo, no utilices el Servicio. El Servicio es operado por Gianluca Petri
          (&quot;nosotros&quot;, &quot;el operador&quot;).
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Descripción del servicio</h2>
        <p>
          CopyNPaste es un portapapeles universal que permite guardar, organizar y sincronizar textos,
          enlaces y archivos entre dispositivos. Ofrecemos un plan gratuito y planes de suscripción
          premium con funcionalidades y límites ampliados.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Cuentas de usuario</h2>
        <p>
          Para utilizar el Servicio necesitás crear una cuenta con un email válido o autenticación
          de Google. Sos responsable de mantener la confidencialidad de tus credenciales y de toda
          actividad que ocurra bajo tu cuenta.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Planes y suscripciones</h2>
        <p className="mb-2">
          Los planes premium se facturan mensualmente a través de MercadoPago. Al suscribirte:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Autorizás el cobro recurrente mensual según el plan elegido.</li>
          <li>Podés cancelar en cualquier momento; el acceso premium continúa hasta el fin del período pagado.</li>
          <li>Los precios están expresados en pesos argentinos (ARS) e incluyen los impuestos aplicables.</li>
          <li>Nos reservamos el derecho de modificar precios con aviso previo de 30 días.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Uso aceptable</h2>
        <p className="mb-2">Te comprometés a no utilizar el Servicio para:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Almacenar contenido ilegal, difamatorio o que infrinja derechos de terceros.</li>
          <li>Distribuir malware, spam o contenido que pueda dañar otros usuarios o sistemas.</li>
          <li>Intentar acceder sin autorización a cuentas o sistemas de terceros.</li>
          <li>Superar los límites de tu plan mediante medios automatizados o abusivos.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Contenido del usuario</h2>
        <p>
          Conservás la propiedad de todo el contenido que subís al Servicio. Nos otorgás una licencia
          limitada para almacenar, procesar y transmitir ese contenido únicamente con el fin de
          prestarte el Servicio. Podés eliminar tu contenido y tu cuenta en cualquier momento desde
          la configuración de cuenta.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Disponibilidad y modificaciones</h2>
        <p>
          Nos esforzamos por mantener el Servicio disponible, pero no garantizamos disponibilidad
          ininterrumpida. Podemos modificar, suspender o discontinuar funcionalidades con aviso
          razonable cuando sea posible.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Limitación de responsabilidad</h2>
        <p>
          El Servicio se proporciona &quot;tal cual&quot;. En la máxima medida permitida por la ley,
          no somos responsables por pérdida de datos, interrupciones del servicio o daños indirectos
          derivados del uso del Servicio. Recomendamos mantener copias de respaldo de información crítica.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Ley aplicable</h2>
        <p>
          Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa será
          sometida a los tribunales competentes de la Ciudad Autónoma de Buenos Aires.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Contacto</h2>
        <p>
          Para consultas sobre estos términos:{' '}
          <a href="mailto:support@copynpaste.app" className="text-blue-600 hover:underline">
            support@copynpaste.app
          </a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
