import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white py-20 px-5 sm:px-8 lg:px-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-[#872075] transition-colors uppercase tracking-wide mb-12">
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-8">Términos de Servicio</h1>
        
        <div className="prose prose-lg text-gray-600">
          <p className="mb-6">
            Bienvenido al sitio web de la Fundación Mujer eres Libre. Al acceder y utilizar este sitio, usted acepta estar sujeto a los siguientes Términos de Servicio. Si no está de acuerdo con estos términos, le rogamos no utilizar nuestra plataforma.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">1. Uso del Sitio Web</h2>
          <p className="mb-6">
            Este sitio web tiene como propósito informar sobre nuestra labor social, facilitar la recolección de donaciones y fomentar la participación ciudadana. Usted acepta utilizar el sitio únicamente para fines lícitos y de manera que no infrinja los derechos de terceros.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">2. Donaciones</h2>
          <p className="mb-6">
            Las donaciones realizadas a la Fundación son procesadas de manera segura a través de los canales proporcionados. La Fundación Mujer eres Libre se compromete a utilizar dichos fondos en total concordancia con nuestra misión de apoyar a mujeres y familias vulnerables.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">3. Propiedad Intelectual</h2>
          <p className="mb-6">
            Todo el contenido de este sitio web, incluyendo textos, gráficos, logotipos, imágenes y material audiovisual, es propiedad de la Fundación Mujer eres Libre o de sus respectivos creadores, y está protegido por las leyes de propiedad intelectual y derechos de autor de Colombia e internacionales.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">4. Exención de Responsabilidad</h2>
          <p className="mb-6">
            La Fundación no se hace responsable de daños o perjuicios derivados del uso de este sitio web, incluyendo interrupciones técnicas o posibles fallas. Toda la información provista es a modo informativo.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">5. Legislación Aplicable</h2>
          <p className="mb-6">
            Estos términos se rigen e interpretan de acuerdo con las leyes de la República de Colombia. Cualquier disputa derivada del uso del sitio web será sometida a la jurisdicción de los tribunales competentes en Colombia.
          </p>

          <p className="mt-12 text-sm text-gray-500 italic">
            Última actualización: Junio de 2026
          </p>
        </div>
      </div>
    </div>
  );
}
