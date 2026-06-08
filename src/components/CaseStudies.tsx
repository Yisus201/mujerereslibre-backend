import { ArrowRight } from 'lucide-react';
import type { ServiceCard } from '../types';

interface CaseStudiesProps {
  services: ServiceCard[];
}

export default function CaseStudies({ services }: CaseStudiesProps) {
  return (
    <section id="servicios" className="bg-[#FAFAFA] pt-16 sm:pt-20 lg:pt-32 pb-16 sm:pb-20 lg:pb-32">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Header Tag */}
        <div className="px-5 sm:px-8 lg:px-12 flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#872075] text-white text-[11px] sm:text-[12px] font-semibold flex items-center justify-center shrink-0">
            2
          </div>
          <div className="text-[12px] sm:text-[13px] font-medium border border-[#872075] rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-[#872075]">
            Nuestros Servicios
          </div>
        </div>

        {/* Title */}
        <div className="px-5 sm:px-8 lg:px-12 flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 sm:mb-24 gap-8">
          <h2 className="font-medium leading-[1.05] tracking-[-0.03em] text-gray-900 text-[clamp(2.5rem,6vw,5rem)] max-w-3xl">
            Áreas de Acción
          </h2>
          <p className="text-[16px] sm:text-[18px] text-gray-600 font-normal leading-[1.8] max-w-md lg:pb-4">
            Acompañamiento integral para sanar el pasado, recuperar la dignidad y levantarse con autonomía hacia un futuro lleno de esperanza.
          </p>
        </div>

        {/* Premium Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-20 gap-x-8 lg:gap-x-12 px-5 sm:px-8 lg:px-12">
          {services.map((service, index) => {
            const isFullWidth = service.is_full_width || index === 0;
            if (isFullWidth) {
              return (
                <div key={service.id} className="lg:col-span-2 flex flex-col gap-8 group cursor-pointer">
                  <div className="relative w-full aspect-[4/3] lg:aspect-[21/9] overflow-hidden rounded-sm">
                    <img 
                      src={service.image_url} 
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700"></div>
                  </div>
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-12">
                    <div className="flex flex-col w-full lg:w-1/2">
                      <div className="flex items-center gap-6 border-b border-gray-200 pb-5 mb-5">
                        <span className="text-sm font-semibold tracking-[0.2em] uppercase text-[#872075]">{service.number}</span>
                        <h3 className="text-3xl sm:text-4xl font-medium text-gray-900 tracking-tight group-hover:text-[#872075] transition-colors duration-300">{service.title}</h3>
                      </div>
                    </div>
                    <div className="w-full lg:w-1/2 flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
                      <p className="text-[15px] sm:text-[16px] text-gray-600 font-normal leading-[1.8] max-w-md">
                        {service.description}
                      </p>
                      <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center shrink-0 group-hover:bg-[#872075] group-hover:border-[#872075] group-hover:text-white transition-all duration-300">
                        <ArrowRight size={20} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={service.id} className="flex flex-col gap-6 group cursor-pointer">
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-sm">
                    <img 
                      src={service.image_url} 
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-5 border-b border-gray-200 pb-5 mb-5 mt-2">
                      <span className="text-sm font-semibold tracking-[0.2em] uppercase text-[#872075]">{service.number}</span>
                      <h3 className="text-2xl sm:text-3xl font-medium text-gray-900 tracking-tight group-hover:text-[#872075] transition-colors duration-300">{service.title}</h3>
                    </div>
                    <div className="flex justify-between items-end gap-6">
                      <p className="text-[15px] sm:text-[16px] text-gray-600 font-normal leading-[1.8]">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    </section>
  );
}
