import { useState, useEffect } from 'react';
import type { Metric, SiteContent } from '../types';

interface AboutProps {
  metrics: Metric[];
  content: SiteContent;
}

export default function About({ metrics, content }: AboutProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  let testimonials: any[] = [];
  try {
    if (content['about.testimonials']) {
      testimonials = JSON.parse(content['about.testimonials']);
    } else {
      testimonials = [{
        text: content['about.quote'] || content['about.quote_text'],
        author: content['about.quote_author'] || content['about.quote_name'],
        role: content['about.quote_role'],
        image: content['about.quote_image']
      }];
    }
  } catch(e) {}

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section id="esencia" className="bg-white pt-16 sm:pt-20 lg:pt-32 pb-12 sm:pb-16 lg:pb-24 overflow-hidden">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Header Tag */}
        <div className="px-5 sm:px-8 lg:px-12 flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#872075] text-white text-[11px] sm:text-[12px] font-semibold flex items-center justify-center shrink-0">
            1
          </div>
          <div className="text-[12px] sm:text-[13px] font-medium border border-[#872075] rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-[#872075]">
            Nuestra Esencia
          </div>
        </div>

        {/* Main Title */}
        <h2 className="px-5 sm:px-8 lg:px-12 font-medium leading-[1.12] tracking-[-0.02em] text-gray-900 text-[clamp(1.5rem,4vw,3.2rem)] mb-12 sm:mb-16 lg:mb-28" dangerouslySetInnerHTML={{ __html: content['about.section_title'] }} />

        <div className="px-5 sm:px-8 lg:px-12">
          
          {/* PREMIUM HISTORY SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_45%] gap-16 lg:gap-24 mb-32">
            <div className="flex flex-col gap-8 order-2 lg:order-1">
               <p className="text-[18px] sm:text-[22px] leading-[1.5] text-gray-900 font-medium tracking-tight" dangerouslySetInnerHTML={{ __html: content['about.history_lead'] }} />
               <div className="h-px w-full bg-gray-200 my-4"></div>
               <div className="flex flex-col gap-6 text-[15px] sm:text-[16px] leading-[1.8] text-gray-600 font-normal">
                  <p dangerouslySetInnerHTML={{ __html: content['about.history_p1'] }} />
                  <p dangerouslySetInnerHTML={{ __html: content['about.history_p2'] }} />
                  <p dangerouslySetInnerHTML={{ __html: content['about.history_p3'] }} />
                  <p dangerouslySetInnerHTML={{ __html: content['about.history_p4'] }} />
               </div>
            </div>
            
            {/* Elegant Image Composition */}
            <div className="relative order-1 lg:order-2">
               <div className="w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-xl overflow-hidden relative">
                  <img 
                    src={content['about.image_main']} 
                    alt="Imagen principal de la fundación" 
                    className="w-full h-full object-cover"
                  />
               </div>
               {/* Floating overlap image */}
               <div className="absolute -bottom-12 -left-8 sm:-left-12 w-2/3 sm:w-1/2 lg:w-2/3 aspect-[4/3] bg-white p-3 sm:p-4 rounded-xl shadow-2xl hidden sm:block">
                  <img 
                    src={content['about.image_floating']} 
                    alt="Imagen complementaria" 
                    className="w-full h-full object-cover rounded-lg"
                  />
               </div>
            </div>
          </div>

          {/* PREMIUM MISIÓN Y VISIÓN (Sticky Sidebar Layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-[30%_1fr] gap-12 lg:gap-24 mb-32 pt-24 border-t border-gray-200">
            <div className="lg:sticky lg:top-32 self-start">
               <h3 className="text-3xl sm:text-4xl font-medium text-gray-900 tracking-[-0.02em]">Nuestro <br className="hidden lg:block"/>Propósito</h3>
               <div className="w-12 h-[2px] bg-[#872075] mt-6"></div>
            </div>
            <div className="flex flex-col gap-20">
               <div>
                 <div className="flex items-center gap-4 mb-6">
                   <span className="text-sm font-semibold tracking-widest uppercase text-[#872075]">01 / Misión</span>
                 </div>
                 <h4 className="text-xl sm:text-2xl font-medium text-gray-900 mb-6 leading-tight">
                   {content['about.mission_title']}
                 </h4>
                 <p className="text-[16px] sm:text-[18px] leading-[1.8] text-gray-600 font-normal">
                   {content['about.mission_body']}
                 </p>
               </div>
               <div>
                 <div className="flex items-center gap-4 mb-6">
                   <span className="text-sm font-semibold tracking-widest uppercase text-[#872075]">02 / Visión</span>
                 </div>
                 <h4 className="text-xl sm:text-2xl font-medium text-gray-900 mb-6 leading-tight">
                   {content['about.vision_title']}
                 </h4>
                 <p className="text-[16px] sm:text-[18px] leading-[1.8] text-gray-600 font-normal">
                   {content['about.vision_body']}
                 </p>
               </div>
            </div>
          </div>

          {/* IMPACT METRICS */}
          <div id="impacto" className="pt-24 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-6">
              <h3 className="text-3xl sm:text-4xl font-medium text-gray-900 tracking-[-0.02em]">Impacto Real</h3>
              <p className="text-gray-500 max-w-sm text-sm font-normal">
                Métricas que reflejan el alcance de nuestro trabajo y el compromiso con cada vida que tocamos.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-12 gap-y-16">
              {metrics.map((metric) => (
                <div key={metric.id} className="flex flex-col gap-4 border-l border-gray-200 pl-6">
                  <span className="text-5xl sm:text-6xl font-normal text-[#872075] tracking-tight">{metric.value}</span>
                  <span className="text-[15px] font-medium text-gray-900 uppercase tracking-wide">{metric.label}</span>
                  {metric.description && (
                    <p className="text-sm text-gray-500 font-normal leading-relaxed">
                      {metric.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Premium Quote Section */}
            <div className="mt-16 sm:mt-24 relative max-w-4xl mx-auto overflow-hidden px-4">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((t, i) => (
                  <div key={i} className="w-full shrink-0 flex flex-col items-center text-center px-4">
                    <p className="text-xl sm:text-3xl font-medium text-gray-900 leading-[1.4] tracking-[-0.01em] mb-8">
                      "{t.text}"
                    </p>
                    <div className="flex items-center gap-4">
                      {t.image && (
                        <div className="w-14 h-14 rounded-full overflow-hidden shrink-0">
                          <img src={t.image} alt={t.author || 'Testimonio'} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 tracking-wide uppercase text-sm">{t.author}</p>
                        <p className="text-sm text-gray-500 font-light">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {testimonials.length > 1 && (
                <div className="flex justify-center gap-3 mt-8">
                  {testimonials.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentTestimonial(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${currentTestimonial === i ? 'bg-[#872075]' : 'bg-gray-300 hover:bg-gray-400'}`}
                      aria-label={`Ver testimonio ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
