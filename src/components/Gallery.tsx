import { useState, useEffect } from 'react';
import type { Album } from '../types';
import { ArrowLeft, ArrowRight, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryProps {
  onAlbumChange?: (isViewing: boolean) => void;
  previewMode?: boolean;
}

export default function Gallery({ onAlbumChange, previewMode = false }: GalleryProps) {
  const [activeAlbumId, setActiveAlbumId] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingOpenAlbumId, setPendingOpenAlbumId] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://mujerereslibre-backend.onrender.com/api/gallery')
      .then(res => res.json())
      .then(data => {
        setAlbums(data.filter((a: Album) => !a.is_hidden));
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching gallery:", err);
        setIsLoading(false);
      });
  }, []);

  const activeAlbum = albums.find(a => a.id === activeAlbumId);

  useEffect(() => {
    if (onAlbumChange) {
      onAlbumChange(activeAlbum !== undefined);
      if (activeAlbum) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [activeAlbum, onAlbumChange]);

  useEffect(() => {
    const handleOpenAlbum = (e: CustomEvent) => {
      const albumId = e.detail;
      if (albums.length > 0) {
        setActiveAlbumId(albumId);
      } else {
        setPendingOpenAlbumId(albumId);
      }
    };
    window.addEventListener('open-album', handleOpenAlbum as EventListener);
    return () => window.removeEventListener('open-album', handleOpenAlbum as EventListener);
  }, [albums]);

  useEffect(() => {
    if (albums.length > 0 && pendingOpenAlbumId !== null) {
      setActiveAlbumId(pendingOpenAlbumId);
      setPendingOpenAlbumId(null);
    }
  }, [albums, pendingOpenAlbumId]);

  // Handle keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null || !activeAlbum) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') {
        setLightboxIndex(prev => prev !== null && prev > 0 ? prev - 1 : activeAlbum.photos.length - 1);
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex(prev => prev !== null && prev < activeAlbum.photos.length - 1 ? prev + 1 : 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, activeAlbum]);

  return (
    <section className={!activeAlbum ? "py-24 bg-gray-50 border-t border-gray-100" : "pt-12 pb-24 bg-gray-50 min-h-screen"} id="galeria">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        {!activeAlbum && (
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-[#872075] uppercase mb-3">
              Nuestra Galería
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight max-w-2xl">
              Momentos que <span className="text-[#872075]">Transforman</span>
            </h3>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl leading-relaxed">
              Un recorrido visual por las vidas que hemos tocado y los eventos que han marcado nuestra historia de compasión y servicio.
            </p>
          </div>
        )}

        {!activeAlbum ? (
          <>
            {!previewMode && (
              <div className="mb-8">
                <a href="#" className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-[#872075] transition-colors uppercase tracking-wide">
                  <ArrowLeft size={16} /> Volver al Inicio
                </a>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-[#872075] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (previewMode ? albums.slice(0, 3) : albums).map((album) => (
                <div 
                  key={album.id}
                  onClick={() => setActiveAlbumId(album.id)}
                  className="group cursor-pointer flex flex-col"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-sm mb-6">
                    <img 
                      src={album.coverImage} 
                      alt={album.title}
                      className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full text-xs font-medium border border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                        <ImageIcon size={14} />
                        <span>{album.photos.length} Fotos</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex flex-col gap-2 border-b border-gray-200 pb-5 mb-5">
                      <div className="flex items-center gap-2 text-[12px] uppercase tracking-widest text-[#872075] font-semibold">
                        {album.date}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-medium text-gray-900 tracking-tight group-hover:text-[#872075] transition-colors duration-300">
                        {album.title}
                      </h3>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-[13px] font-semibold text-[#872075] tracking-wide uppercase inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                        Ver álbum <ArrowLeft size={16} className="rotate-180" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {previewMode && albums.length > 0 && (
              <div className="mt-16 text-center">
                <a 
                  href="#galeria" 
                  className="inline-flex items-center justify-center bg-white text-[#872075] border-2 border-[#872075] w-14 h-14 rounded-full hover:bg-[#872075] hover:text-white transition-all shadow-sm"
                  title="Ver toda la galería"
                >
                  <ArrowRight size={24} />
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-between border-b border-gray-200 pb-6">
              <div>
                <button 
                  onClick={() => setActiveAlbumId(null)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#872075] transition-colors mb-2"
                >
                  <ArrowLeft size={16} /> Volver a los álbumes
                </button>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{activeAlbum.title}</h3>
                <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
                  {activeAlbum.date}
                </p>
              </div>
            </div>

            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {activeAlbum.photos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  onClick={() => setLightboxIndex(index)}
                  className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <img 
                    src={photo.url} 
                    alt="Gallery item"
                    className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/30 text-white transform scale-90 group-hover:scale-100 transition-all duration-300">
                      <ImageIcon size={24} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {activeAlbum.linked_article_id && (
              <div className="mt-12 flex justify-center">
                <button 
                  onClick={() => {
                    setActiveAlbumId(null);
                    window.location.hash = '#noticias';
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('open-article', { detail: activeAlbum.linked_article_id }));
                    }, 100);
                  }}
                  className="text-[#872075] hover:text-[#6a195c] font-semibold text-sm uppercase tracking-wide transition-colors flex items-center gap-2 group"
                >
                  Ver Noticia Relacionada <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox / Pantalla Completa */}
      {lightboxIndex !== null && activeAlbum && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <button 
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white transition-colors z-50 bg-black/20 hover:bg-black/40 rounded-full p-2 backdrop-blur-sm"
          >
            <X size={32} />
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(prev => prev !== null && prev > 0 ? prev - 1 : activeAlbum.photos.length - 1);
            }}
            className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all z-50 hover:scale-110 bg-black/20 hover:bg-black/40 rounded-full p-2 backdrop-blur-sm"
          >
            <ChevronLeft size={40} />
          </button>
          
          <img 
            src={activeAlbum.photos[lightboxIndex].url} 
            alt="Fullscreen view"
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
          />
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(prev => prev !== null && prev < activeAlbum.photos.length - 1 ? prev + 1 : 0);
            }}
            className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all z-50 hover:scale-110 bg-black/20 hover:bg-black/40 rounded-full p-2 backdrop-blur-sm"
          >
            <ChevronRight size={40} />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium tracking-widest bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
            {lightboxIndex + 1} / {activeAlbum.photos.length}
          </div>
        </div>
      )}
    </section>
  );
}
