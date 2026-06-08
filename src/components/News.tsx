import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Tag, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Category, Article } from '../types';
import DynamicFormModal from './DynamicFormModal';

interface NewsProps {
  onArticleChange?: (isReading: boolean) => void;
  previewMode?: boolean;
}

export default function News({ onArticleChange, previewMode = false }: NewsProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeArticleId, setActiveArticleId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingOpenArticleId, setPendingOpenArticleId] = useState<number | null>(null);
  
  // Form Modal State
  const [formModalId, setFormModalId] = useState<number | null>(null);
  
  useEffect(() => {
    fetch('https://mujerereslibre-backend.onrender.com/api/news')
      .then(res => res.json())
      .then(data => {
        const visibleCategories = data.map((c: Category) => ({
          ...c,
          articles: c.articles.filter((a: Article) => !(a as any).is_hidden)
        }));
        setCategories(visibleCategories);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching news:", err);
        setIsLoading(false);
      });
  }, []);
  
  // Local state to hold comments for each article
  const [commentsByArticle, setCommentsByArticle] = useState<Record<number, {name: string, text: string, date: string}[]>>({});
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  
  const [copied, setCopied] = useState(false);

  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const activeArticle = activeCategory?.articles.find(a => a.id === activeArticleId);

  useEffect(() => {
    if (onArticleChange) {
      onArticleChange(activeCategory !== undefined);
      if (activeCategory || activeArticle) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [activeCategory, activeArticle, onArticleChange]);

  useEffect(() => {
    const handleOpenArticle = (e: CustomEvent) => {
      const articleId = e.detail;
      if (categories.length > 0) {
        const category = categories.find(c => c.articles.some(a => a.id === articleId));
        if (category) {
          setActiveCategoryId(category.id);
          setActiveArticleId(articleId);
        }
      } else {
        setPendingOpenArticleId(articleId);
      }
    };
    window.addEventListener('open-article', handleOpenArticle as EventListener);
    return () => window.removeEventListener('open-article', handleOpenArticle as EventListener);
  }, [categories]);

  useEffect(() => {
    if (categories.length > 0 && pendingOpenArticleId !== null) {
      const category = categories.find(c => c.articles.some(a => a.id === pendingOpenArticleId));
      if (category) {
        setActiveCategoryId(category.id);
        setActiveArticleId(pendingOpenArticleId);
      }
      setPendingOpenArticleId(null);
    }
  }, [categories, pendingOpenArticleId]);

  const handleShare = async (platform: string) => {
    if (!activeArticle) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Mira este artículo: ${activeArticle.title}`);
    
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error al copiar el enlace', err);
      }
      return;
    }

    let shareUrl = '';
    if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    if (platform === 'linkedin') shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    if (platform === 'whatsapp') shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
    
    if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeArticleId || !newCommentName.trim() || !newCommentText.trim()) return;

    const newComment = {
      name: newCommentName,
      text: newCommentText,
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    setCommentsByArticle(prev => ({
      ...prev,
      [activeArticleId]: [...(prev[activeArticleId] || []), newComment]
    }));

    setNewCommentName('');
    setNewCommentText('');
  };

  const articleComments = activeArticleId ? (commentsByArticle[activeArticleId] || []) : [];

  return (
    <section className={!activeArticle ? "py-24 bg-white" : "pt-12 pb-24 bg-white min-h-screen"} id="noticias">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        {!activeArticle && (
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-[#872075] uppercase mb-3">
              Noticias y Actualidad
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight max-w-2xl">
              Nuestra Voz en la <span className="text-[#872075]">Comunidad</span>
            </h3>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl leading-relaxed">
              Mantente al día con nuestros programas, comunicados y las hermosas historias de superación que nacen en la fundación.
            </p>
          </div>
        )}

        {!activeCategory ? (
          <>
            {!previewMode && (
              <div className="mb-8">
                <Link to="/" className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-[#872075] transition-colors uppercase tracking-wide">
                  <ArrowLeft size={16} /> Volver al Inicio
                </Link>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8 lg:gap-x-12">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-[#872075] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (previewMode ? categories.slice(0, 3) : categories).map((category) => (
              <div 
                key={category.id}
                onClick={() => setActiveCategoryId(category.id)}
                className="group cursor-pointer flex flex-col h-full"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-sm mb-6 shrink-0">
                  <img 
                    src={category.coverImage} 
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full text-white text-xs font-medium border border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                    <Tag size={14} />
                    <span>{category.articles.length} Artículos</span>
                  </div>
                </div>
                
                <div className="flex flex-col flex-1">
                  <div className="flex flex-col gap-3 border-b border-gray-200 pb-5 mb-5 flex-1">
                    <h4 className="text-2xl sm:text-3xl font-medium text-gray-900 tracking-tight group-hover:text-[#872075] transition-colors duration-300">
                      {category.name}
                    </h4>
                    <p className="text-gray-600 text-[15px] leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-[13px] font-semibold text-[#872075] tracking-wide uppercase inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                      Ver publicaciones <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
              ))}
            </div>
            {previewMode && categories.length > 0 && (
              <div className="mt-16 text-center">
                <Link 
                  to="/noticias" 
                  className="inline-flex items-center justify-center bg-white text-[#872075] border-2 border-[#872075] w-14 h-14 rounded-full hover:bg-[#872075] hover:text-white transition-all shadow-sm"
                  title="Ver todas las noticias"
                >
                  <ArrowRight size={24} />
                </Link>
              </div>
            )}
          </>
        ) : !activeArticle ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-between border-b border-gray-200 pb-6">
              <div>
                <button 
                  onClick={() => setActiveCategoryId(null)}
                  className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-[#872075] transition-colors mb-4 uppercase tracking-wide cursor-pointer"
                >
                  <ArrowLeft size={16} /> Volver a categorías
                </button>
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl md:text-5xl font-medium tracking-tight text-gray-900">{activeCategory.name}</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-8 lg:gap-x-12">
              {activeCategory.articles.map((article) => (
                <article 
                  key={article.id} 
                  onClick={() => setActiveArticleId(article.id)}
                  className="group flex flex-col cursor-pointer"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-sm mb-6 shrink-0">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full text-white text-xs font-medium border border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center gap-1.5">
                      {article.date}
                    </div>
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex flex-col gap-3 border-b border-gray-200 pb-5 mb-5 flex-1">
                      <h4 className="text-2xl font-medium text-gray-900 tracking-tight leading-snug group-hover:text-[#872075] transition-colors duration-300">
                        {article.title}
                      </h4>
                      <p className="text-gray-600 text-[15px] leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-[13px] font-semibold text-[#872075] tracking-wide uppercase inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                        Leer más <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-4xl mx-auto">
            <button 
              onClick={() => setActiveArticleId(null)}
              className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-[#872075] transition-colors mb-8 uppercase tracking-wide cursor-pointer"
            >
              <ArrowLeft size={16} /> Volver a {activeCategory.name}
            </button>

            <article>
              <header className="mb-12">
                <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[#872075] font-semibold mb-6">
                  {activeArticle.date}
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-gray-900 tracking-tight leading-[1.1] mb-8">
                  {activeArticle.title}
                </h1>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-y border-gray-200 py-4 mb-8 gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Compartir:</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleShare('whatsapp')} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-[#25D366] transition-colors" title="Compartir en WhatsApp">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                      </button>
                      <button onClick={() => handleShare('facebook')} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-[#1877F2] transition-colors" title="Compartir en Facebook">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                      </button>
                      <button onClick={() => handleShare('twitter')} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-[#1DA1F2] transition-colors" title="Compartir en X / Twitter">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                      </button>
                      <button onClick={() => handleShare('linkedin')} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-[#0A66C2] transition-colors" title="Compartir en LinkedIn">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleShare('copy')} 
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span className="text-green-600">Enlace copiado</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        Copiar enlace
                      </>
                    )}
                  </button>
                </div>

                <div className="relative w-full aspect-[21/9] overflow-hidden rounded-sm mb-12">
                  <img 
                    src={activeArticle.imageUrl} 
                    alt={activeArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </header>

              <div 
                className="prose prose-lg prose-gray max-w-none text-gray-600 leading-relaxed font-normal mb-16"
                dangerouslySetInnerHTML={{ __html: activeArticle.content || '' }}
              />
              
              {activeArticle.linked_album_id && (
                <div className="mb-8 flex justify-center">
                  <button 
                    onClick={() => {
                      setActiveArticleId(null);
                      setActiveCategoryId(null);
                      window.location.hash = '#galeria';
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('open-album', { detail: activeArticle.linked_album_id }));
                      }, 100);
                    }}
                    className="text-[#872075] hover:text-[#6a195c] font-semibold text-sm uppercase tracking-wide transition-colors flex items-center gap-2 group"
                  >
                    Ver Álbum Relacionado <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
              
              {activeArticle.linked_form_id && (
                <div className="mb-16 flex justify-center">
                  <button 
                    onClick={() => setFormModalId(activeArticle.linked_form_id!)}
                    className="bg-[#872075] hover:bg-[#6a195c] text-white px-8 py-3 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-[#872075]/20 group"
                  >
                    <Plus size={18} /> Llenar Formulario / Convocatoria
                  </button>
                </div>
              )}
              
              {/* Comment Section */}
              <div className="border-t border-gray-200 pt-12">
                <h3 className="text-2xl font-medium text-gray-900 mb-8">Comentarios ({articleComments.length})</h3>
                
                <form onSubmit={handleAddComment} className="mb-12 bg-[#FAFAFA] p-6 rounded-sm border border-gray-100">
                  <h4 className="text-[15px] font-semibold text-gray-900 mb-4">Deja un comentario</h4>
                  <div className="flex flex-col gap-4">
                    <input 
                      type="text" 
                      placeholder="Tu nombre" 
                      value={newCommentName}
                      onChange={(e) => setNewCommentName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-sm border border-gray-200 bg-white focus:outline-none focus:border-[#872075] focus:ring-1 focus:ring-[#872075] transition-colors"
                    />
                    <textarea 
                      placeholder="¿Qué opinas sobre este artículo?" 
                      rows={4}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-sm border border-gray-200 bg-white focus:outline-none focus:border-[#872075] focus:ring-1 focus:ring-[#872075] transition-colors resize-none"
                    ></textarea>
                    <button 
                      type="submit"
                      className="self-end bg-[#872075] text-white px-8 py-3 rounded-full text-[14px] font-semibold hover:bg-[#6b195d] transition-colors shadow-lg shadow-[#872075]/20"
                    >
                      Publicar Comentario
                    </button>
                  </div>
                </form>

                <div className="space-y-8">
                  {articleComments.length === 0 ? (
                    <p className="text-gray-500 italic">Sé el primero en comentar.</p>
                  ) : (
                    articleComments.map((comment, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#872075]/10 text-[#872075] flex items-center justify-center font-bold text-xl shrink-0">
                          {comment.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline justify-between mb-1">
                            <h5 className="font-semibold text-gray-900">{comment.name}</h5>
                            <span className="text-xs text-gray-500">{comment.date}</span>
                          </div>
                          <p className="text-gray-600 leading-relaxed text-[15px]">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </article>
          </div>
        )}
      </div>

      {formModalId && (
        <DynamicFormModal formId={formModalId} onClose={() => setFormModalId(null)} />
      )}
    </section>
  );
}
