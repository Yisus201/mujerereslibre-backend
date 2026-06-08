import { useState, useEffect } from 'react';
import { ArrowRight, Clock, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from 'shaders/react';

import type { SiteContent } from '../types';
import { formatWhatsAppUrl } from '../utils/whatsapp';

const TextRoll = ({ text }: { text: string }) => (
  <div className="h-[20px] overflow-hidden flex flex-col">
    <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-[50%]">
      <span className="h-[20px] flex items-center">{text}</span>
      <span className="h-[20px] flex items-center">{text}</span>
    </div>
  </div>
);

interface HeroProps {
  content: SiteContent;
  onOpenVolunteer: () => void;
}

const NAV_LINKS = [
  { name: 'Esencia', href: '/esencia' },
  { name: 'Impacto', href: '/impacto' },
  { name: 'Servicios', href: '/servicios' },
  { name: 'Galería', href: '/galeria' },
  { name: 'Noticias', href: '/noticias' },
  { name: 'Contacto', href: '/contacto' }
];

export default function Hero({ content, onOpenVolunteer }: HeroProps) {
  const [time, setTime] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const formatter = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setTime(formatter.format(new Date()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Background Shader */}
      <Shader className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <Swirl colorA="#FAFAFA" colorB="#FFFFFF" detail={1.7} />
        <ChromaFlow baseColor="#ffffff" downColor="#872075" leftColor="#A3298D" rightColor="#69185A" upColor="#872075" momentum={13} radius={3.5} />
        <FlutedGlass aberration={0.61} angle={31} frequency={8} highlight={0.12} highlightSoftness={0} lightAngle={-90} refraction={4} shape="rounded" softness={1} speed={0.15} />
        <FilmGrain strength={0.05} />
      </Shader>

      {/* Navigation */}
      <div className="relative z-20 w-full max-w-[1440px] mx-auto p-2 sm:p-3">
        <nav className="bg-white rounded-full p-[5px] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#872075] rounded-full flex items-center justify-center shrink-0 overflow-hidden">
              {content['brand.logo_url'] ? (
                <img src={content['brand.logo_url']} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-[10px] sm:text-[11px] font-bold tracking-tight">{content['brand.initials']}</span>
              )}
            </div>
            <div className="hidden md:flex items-center gap-6">
                {NAV_LINKS.map((link) => (
                <Link key={link.name} to={link.href} className="text-[14px] text-gray-900 hover:text-[#872075] transition-colors duration-300 font-medium">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <span className="text-[13px] text-gray-600 hidden lg:block">Transformando vidas desde la compasión</span>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-gray-600" />
              <span className="text-[13px] text-gray-600">{time} en Colombia</span>
            </div>
            <a
              href={formatWhatsAppUrl(content['footer.whatsapp'], content['hero.donate_msg'])}
              target={content['footer.whatsapp'] ? '_blank' : undefined}
              rel={content['footer.whatsapp'] ? 'noopener noreferrer' : undefined}
              className="group bg-[#872075] hover:bg-[#6a195c] text-white text-[13px] font-medium rounded-full pl-5 pr-2 py-2 flex items-center gap-3 transition-colors"
            >
              <TextRoll text={content['hero.btn_primary']} />
              <div className="w-6 h-6 bg-white text-[#872075] rounded-full flex items-center justify-center shrink-0">
                <ArrowRight size={14} className="transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45" />
              </div>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white mr-1"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={16} />
          </button>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute bottom-0 left-0 right-0 mx-3 mb-3 bg-white rounded-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col p-6 ${isMenuOpen ? 'translate-y-0' : 'translate-y-[120%]'}`}>
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1">
              <Clock size={14} className="text-gray-600" />
              <span className="text-[13px] text-gray-600">{time} en Colombia</span>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-900">
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-4 mb-8">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.name} 
                to={link.href} 
                onClick={() => setIsMenuOpen(false)}
                className="text-[28px] sm:text-[32px] font-medium text-gray-900 leading-tight hover:text-[#872075] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <a
              href={formatWhatsAppUrl(content['footer.whatsapp'], content['hero.donate_msg'])}
              target={content['footer.whatsapp'] ? '_blank' : undefined}
              rel={content['footer.whatsapp'] ? 'noopener noreferrer' : undefined}
              onClick={() => setIsMenuOpen(false)}
              className="bg-[#872075] text-white text-[15px] font-medium rounded-full py-4 flex items-center justify-center gap-2 w-full"
            >
              {content['hero.btn_primary']}
              <ArrowRight size={16} />
            </a>
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                onOpenVolunteer();
              }}
              className="border border-[#872075] text-[#872075] bg-white text-[15px] font-medium rounded-full py-4 flex items-center justify-center gap-2 w-full hover:bg-gray-50"
            >
              {content['hero.btn_secondary']}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="flex-1" />
      <div className="relative z-20 w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pb-14 sm:pb-16 lg:pb-20 flex flex-col justify-end">
        <p className="text-[13px] sm:text-[14px] text-[#872075] tracking-wide mb-5 sm:mb-8 uppercase font-semibold">{content['hero.tagline']}</p>
        
        <h1 className="font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 text-[clamp(1.75rem,7vw,4.2rem)] sm:text-[clamp(2.5rem,5vw,4.2rem)]" dangerouslySetInnerHTML={{ __html: content['hero.title'] }} />

        <p className="mt-6 text-[16px] sm:text-[18px] text-gray-700 max-w-2xl leading-relaxed">
          {content['hero.description']}
        </p>

        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
          <a
            href={formatWhatsAppUrl(content['footer.whatsapp'], content['hero.donate_msg'])}
            target={content['footer.whatsapp'] ? '_blank' : undefined}
            rel={content['footer.whatsapp'] ? 'noopener noreferrer' : undefined}
            className="group bg-[#872075] hover:bg-[#6a195c] text-white text-[13px] sm:text-[14px] font-medium rounded-full pl-5 sm:pl-6 pr-2 py-2 flex items-center gap-4 transition-colors duration-300"
          >
            <TextRoll text={content['hero.btn_primary']} />
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white text-[#872075] rounded-full flex items-center justify-center shrink-0">
              <ArrowRight size={16} className="transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45" />
            </div>
          </a>

          <button 
            onClick={onOpenVolunteer}
            className="group bg-white hover:bg-gray-50 border border-[#872075] text-[#872075] text-[13px] sm:text-[14px] font-medium rounded-full pl-5 sm:pl-6 pr-2 py-2 flex items-center gap-4 transition-colors duration-300 shadow-sm"
          >
            <TextRoll text={content['hero.btn_secondary']} />
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#872075] text-white rounded-full flex items-center justify-center shrink-0">
              <ArrowRight size={16} className="transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
