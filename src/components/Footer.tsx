import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SiteContent } from '../types';
import { formatWhatsAppUrl } from '../utils/whatsapp';

interface FooterProps {
  content: SiteContent;
}

export default function Footer({ content }: FooterProps) {
  return (
    <footer id="contacto" className="bg-[#0a0a0a] text-white pt-24 sm:pt-32 pb-8 sm:pb-12 px-5 sm:px-8 lg:px-12 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Giant CTA Section */}
        <div className="mb-24 sm:mb-32">
          <h2
            className="text-[clamp(3rem,8vw,8rem)] font-medium leading-[0.9] tracking-[-0.04em] mb-12 sm:mb-16"
            style={{
              display: 'inline-block',
              padding: '0.05em 0.02em 0.15em',
              background: 'linear-gradient(135deg, #ffffff 0%, #e8c8f0 20%, #c070d0 38%, #872075 54%, #a830a0 70%, #d4a8e0 85%, #ffffff 100%)',
              backgroundSize: '250% 250%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              animation: 'liquid-glass-shimmer 9s ease-in-out infinite',
            }}
            dangerouslySetInnerHTML={{ __html: content['footer.cta_title'] }}
          />

          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 items-start sm:items-center">
            <a href={`mailto:${content['footer.email']}`} className="text-xl sm:text-3xl font-normal hover:text-[#872075] transition-colors border-b border-white/20 pb-2">
              {content['footer.email']}
            </a>
            <a 
              href={formatWhatsAppUrl(content['footer.whatsapp'], content['hero.donate_msg'])}
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white hover:bg-[#872075] text-[#0a0a0a] hover:text-white rounded-full px-8 py-4 font-medium transition-colors duration-300 flex items-center gap-3 group inline-flex"
            >
              Hacer una Donación
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Info & Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20 sm:mb-24 border-t border-white/10 pt-16 sm:pt-20">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                {content['brand.logo_url'] ? (
                  <img src={content['brand.logo_url']} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#872075] text-[12px] font-bold tracking-tight">{content['brand.initials']}</span>
                )}
              </div>
              <span className="text-xl font-medium tracking-tight">{content['brand.name']}</span>
            </div>
            <p className="text-gray-400 text-[15px] leading-[1.8] max-w-sm font-normal">
              {content['footer.brand_description']}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-semibold mb-2">Secciones</h4>
            <Link to="/esencia" className="text-gray-300 hover:text-white transition-colors text-[15px] font-normal">Nuestra Esencia</Link>
            <Link to="/impacto" className="text-gray-300 hover:text-white transition-colors text-[15px] font-normal">Impacto Social</Link>
            <Link to="/servicios" className="text-gray-300 hover:text-white transition-colors text-[15px] font-normal">Áreas de Servicio</Link>
            <Link to="/galeria" className="text-gray-300 hover:text-white transition-colors text-[15px] font-normal">Galería</Link>
            <Link to="/noticias" className="text-gray-300 hover:text-white transition-colors text-[15px] font-normal">Noticias</Link>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-5">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-2">Contacto</h4>
            <p className="text-gray-300 text-[15px] font-normal">{content['footer.address']}</p>
            <p className="text-gray-300 text-[15px] font-normal">{content['footer.phone1']}</p>
            <p className="text-gray-300 text-[15px] font-normal">{content['footer.phone2']}</p>
            {content['footer.whatsapp'] && (
              <a
                href={formatWhatsAppUrl(content['footer.whatsapp'], content['hero.donate_msg'])}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#25D366] transition-colors text-[15px] font-normal flex items-center gap-3"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            )}
          </div>

          {/* Social */}
          <div className="flex flex-col gap-5">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-2">Redes</h4>
            <a href={content['footer.url_facebook']} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#872075] transition-colors text-[15px] font-normal flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              Facebook
            </a>
            <a href={content['footer.url_instagram']} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#872075] transition-colors text-[15px] font-normal flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              Instagram
            </a>
            <a href={content['footer.url_twitter']} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#872075] transition-colors text-[15px] font-normal flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
              X / Twitter
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-[13px] font-normal text-gray-500 pt-8 border-t border-white/10">
          <p>© {new Date().getFullYear()} Fundación Mujer eres libre. Todos los derechos reservados.</p>
          <div className="flex flex-wrap justify-center gap-8">
            <Link to="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <Link to="/terminos" className="hover:text-white transition-colors">Términos de Servicio</Link>
            <a href="/#admin" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Panel Administrativo</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
