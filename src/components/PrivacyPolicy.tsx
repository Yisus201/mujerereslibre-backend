import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white py-20 px-5 sm:px-8 lg:px-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-[#872075] transition-colors uppercase tracking-wide mb-12">
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-8">Política de Privacidad</h1>
        
        <div className="prose prose-lg text-gray-600">
          <p className="mb-6">
            En la Fundación Mujer eres Libre, nos tomamos muy en serio la privacidad y seguridad de sus datos personales. Esta Política de Privacidad describe cómo recopilamos, utilizamos, protegemos y compartimos la información obtenida a través de nuestro sitio web.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">1. Información que recopilamos</h2>
          <p className="mb-6">
            Recopilamos información personal que usted nos proporciona voluntariamente al contactarnos, realizar una donación o registrarse como voluntario. Esta información puede incluir, pero no se limita a, su nombre, dirección de correo electrónico, número de teléfono y otra información de contacto.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">2. Uso de la información</h2>
          <p className="mb-6">
            Utilizamos la información que recopilamos para procesar sus donaciones, enviarle actualizaciones sobre nuestra labor, gestionar su participación como voluntario y responder a sus consultas. Nunca venderemos, alquilaremos ni compartiremos sus datos personales con terceros para fines comerciales.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">3. Seguridad de los datos</h2>
          <p className="mb-6">
            Implementamos medidas de seguridad técnicas, administrativas y físicas diseñadas para proteger su información personal contra el acceso, uso o divulgación no autorizados.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">4. Sus derechos</h2>
          <p className="mb-6">
            Usted tiene derecho a solicitar acceso, rectificación, actualización o eliminación de sus datos personales en nuestra base de datos. Para ejercer estos derechos, puede comunicarse con nosotros a través de los canales de contacto provistos en el sitio web.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">5. Modificaciones a la Política</h2>
          <p className="mb-6">
            Nos reservamos el derecho de actualizar o modificar esta Política de Privacidad en cualquier momento. Le notificaremos cualquier cambio importante publicando la nueva política en esta página.
          </p>

          <p className="mt-12 text-sm text-gray-500 italic">
            Última actualización: Junio de 2026
          </p>
        </div>
      </div>
    </div>
  );
}
