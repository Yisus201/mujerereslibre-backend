import { useState, useEffect } from 'react';
import Hero from './components/Hero';
import About from './components/About';
import CaseStudies from './components/CaseStudies';
import Footer from './components/Footer';
import VolunteerModal from './components/VolunteerModal';
import AdminPanel from './components/AdminPanel';
import Gallery from './components/Gallery';
import News from './components/News';
import NewsPopup from './components/NewsPopup';
import type { Metric, ServiceCard, SiteContent } from './types';

const DEFAULT_METRICS: Metric[] = [
  { id: 1, value: "+5k", label: "Mujeres Apoyadas", description: "Han recuperado su dignidad y autonomía a través de nuestros programas integrales." },
  { id: 2, value: "+10k", label: "Familias Impactadas", description: "Generando un cambio social desde el núcleo de la sociedad hacia la comunidad." },
  { id: 3, value: "05", label: "Áreas de Servicio", description: "Acompañamiento en salud, educación, vivienda, cultura y obras sociales." }
];

const DEFAULT_SERVICES: ServiceCard[] = [
  {
    id: 1,
    title: "Educación y Capacitación",
    number: "01",
    description: "Creación de centros educativos (desde educación formal e informal hasta educación superior). Realización de seminarios, talleres y capacitación en seguridad social. Gestión de becas para estudios universitarios.",
    image_url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2000&auto=format&fit=crop",
    is_full_width: true
  },
  {
    id: 2,
    title: "Salud y Asistencia Social",
    number: "02",
    description: "Prestación de servicios de salud mediante profesionales adscritos. Establecimiento de centros de asistencia médica y de conciliación gratuita.",
    image_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2000&auto=format&fit=crop",
    is_full_width: false
  },
  {
    id: 3,
    title: "Desarrollo y Vivienda",
    number: "03",
    description: "Gestión y ejecución de proyectos de vivienda de interés social. Proyectos para la generación de empleo en pequeñas y medianas empresas.",
    image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2000&auto=format&fit=crop",
    is_full_width: false
  },
  {
    id: 4,
    title: "Comunicación y Cultura",
    number: "04",
    description: "Creación de medios de comunicación con fundamento educativo. Promoción de actividades recreativas y culturales.",
    image_url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2000&auto=format&fit=crop",
    is_full_width: false
  },
  {
    id: 5,
    title: "Contratos y Convenios",
    number: "05",
    description: "Celebración de contratos de obras civiles y administración de educación pública con entes nacionales e internacionales.",
    image_url: "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?q=80&w=2000&auto=format&fit=crop",
    is_full_width: false
  }
];

const DEFAULT_CONTENT: SiteContent = {
  "brand.initials": "MEL",
  "brand.name": "Mujer eres libre",
  "brand.logo_url": "",
  "hero.tagline": "Fundación Mujer eres Libre",
  "hero.title": "Mujer, eres libre. Ayúdanos a enderezar el camino de miles de familias.",
  "hero.description": "Nuestra misión es brindar esperanza, restaurar la dignidad y trabajar con total transparencia para que cada ser humano pueda levantarse con autonomía.",
  "hero.btn_primary": "Dona Ahora y Transforma una Vida",
  "hero.btn_secondary": "Únete como Voluntario",
  "about.section_title": "Un mandato de compasión y libertad para quienes más lo necesitan.",
  "about.history_lead": "La historia de nuestra fundación no comienza en una oficina, ni en un escritorio; nace en la quietud de un encuentro sagrado. Fruto de un ayuno de tres días de búsqueda espiritual, el propósito de esta obra fue revelado no como un proyecto humano, sino como un mandato de compasión y libertad.",
  "about.history_p1": "Durante aquel tiempo de silencio y oración, el corazón recibió un mensaje a través del Evangelio de Lucas 13:11. La Escritura describe a una mujer que, durante dieciocho largos años, vivió encorvada por un espíritu de enfermedad que le impedía levantar la mirada al cielo. Su realidad era el peso agobiante de la opresión, el dolor físico y el cansancio del alma.",
  "about.history_p2": "Sin embargo, el relato cobra una fuerza transformadora cuando el Maestro, al verla, no pasa de largo. Él la llama y pronuncia las palabras que hoy dan nombre y vida a nuestra institución: “Mujer, eres libre”. En ese instante, lo que estaba encorvado se enderezó y lo que estaba cautivo recuperó su dignidad.",
  "about.history_p3": "Esa revelación fue el espejo donde vimos reflejada la realidad de miles de mujeres en nuestro tiempo. Comprendimos que, al igual que aquella mujer de la sinagoga, muchas hoy caminan por la vida \"encorvadas\" bajo el peso de las carencias, la violencia, la frustración y el olvido. Viven atadas a circunstancias que les impiden reconocer su propio valor y potencial.",
  "about.history_p4": "Nuestra esencia es entrar en el escenario de la dificultad para ofrecer una mano extendida. Queremos ser el instrumento que ayude a cada mujer, a cada niño y a cada familia a soltar las cargas que les oprimen, permitiéndoles sanar el dolor y transformar la tristeza en un propósito de vida.",
  "about.image_main": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2000&auto=format&fit=crop",
  "about.image_floating": "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2000&auto=format&fit=crop",
  "about.mission_title": "Transformar la vida de quienes caminan bajo el peso de la vulnerabilidad.",
  "about.mission_body": "La Fundación Mujer eres Libre se ha creado para transformar la vida de mujeres, niños y familias que caminan bajo el peso de la vulnerabilidad y la opresión. Nuestra misión es brindar un acompañamiento integral en salud, educación y desarrollo social, permitiendo que cada ser humano sane su pasado, recupere su dignidad y se levante con autonomía hacia un futuro lleno de esperanza.",
  "about.vision_title": "Un futuro donde nadie viva con el alma encorvada por las carencias.",
  "about.vision_body": "Proyectamos un futuro donde ninguna mujer tenga que vivir con el alma encorvada por las carencias o la tristeza. La Fundación Mujer eres Libre se visualiza como el motor de cambio que habrá ayudado a miles de familias a enderezar su camino y levantar la mirada hacia nuevas oportunidades. Seremos una institución que, a través de la educación y el servicio integral, habrá sembrado libertad y justicia social en cada territorio donde nuestra voz sea escuchada.",
  "about.quote_text": "Llegué encorvada por la tristeza y las dificultades. Hoy puedo levantar la mirada con esperanza; encontré una familia que me ayudó a enderezar mi camino.",
  "about.quote_name": "María C.",
  "about.quote_role": "Beneficiaria del programa",
  "about.quote_image": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop",
  "footer.cta_title": "Sé parte del cambio.",
  "footer.email": "contacto@mujerereslibre.org",
  "footer.address": "Calle 8 Carrera 4# 3-79",
  "footer.phone1": "3006255869",
  "footer.phone2": "3003036068",
  "footer.url_facebook": "#",
  "footer.url_instagram": "#",
  "footer.url_twitter": "#",
  "footer.brand_description": "Un mandato de compasión y libertad. Ayudando a mujeres, niños y familias a sanar su dolor y caminar en la plenitud de su libertad.",
  "volunteer.title": "Únete como Voluntario",
  "volunteer.description": "Forma parte del cambio. Comparte tu tiempo y talento en nuestras áreas de servicio para transformar vidas.",
  "volunteer.areas": "Educación y Capacitación,Salud y Asistencia Social,Desarrollo y Vivienda,Comunicación y Cultura,Obras Sociales"
};

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#');
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  const [metrics, setMetrics] = useState<Metric[]>(DEFAULT_METRICS);
  const [services, setServices] = useState<ServiceCard[]>(DEFAULT_SERVICES);
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [isReadingArticle, setIsReadingArticle] = useState(false);
  const [isViewingGallery, setIsViewingGallery] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#');
    };
    window.addEventListener('hashchange', handleHashChange);
    
    // Fetch initial data
    Promise.all([
      fetch('/api/metrics').then(r => r.json()).catch(() => null),
      fetch('/api/services').then(r => r.json()).catch(() => null),
      fetch('/api/content').then(r => r.json()).catch(() => null)
    ]).then(([metricsData, servicesData, contentData]) => {
      if (metricsData) setMetrics(metricsData);
      if (servicesData) setServices(servicesData);
      if (contentData) setContent(contentData);
    });

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (currentPath === '#admin') {
    return <AdminPanel />;
  }

  const isFullNewsView = currentPath === '#noticias';
  const isFullGalleryView = currentPath === '#galeria';
  const isIsolatedView = isReadingArticle || isViewingGallery || isFullNewsView || isFullGalleryView;

  return (
    <div className="min-h-screen bg-white">
      {!isIsolatedView && (
        <>
          <Hero content={content} onOpenVolunteer={() => setIsVolunteerOpen(true)} />
          <About content={content} metrics={metrics} />
          <CaseStudies services={services} />
        </>
      )}
      
      {/* Only show Gallery if not reading an article or viewing full news */}
      {(!isReadingArticle && !isFullNewsView) && (
        <Gallery onAlbumChange={setIsViewingGallery} previewMode={!isFullGalleryView && !isIsolatedView} />
      )}
      
      {/* Only show News if not viewing an album or viewing full gallery */}
      {(!isViewingGallery && !isFullGalleryView) && (
        <News onArticleChange={setIsReadingArticle} previewMode={!isFullNewsView && !isIsolatedView} />
      )}
      
      <Footer content={content} />
      
      <VolunteerModal 
        isOpen={isVolunteerOpen} 
        onClose={() => setIsVolunteerOpen(false)}
        content={content}
      />

      {/* News popup — only shown on main landing, not in isolated views or admin */}
      {!isIsolatedView && <NewsPopup />}
    </div>
  );
}
