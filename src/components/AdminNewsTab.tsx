import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, ChevronLeft, Loader2, Upload, FileText, Edit, Eye, EyeOff } from 'lucide-react';
import RichEditor from './RichEditor';
import type { Category, Article, Album, CustomForm } from '../types';

interface AdminNewsTabProps {
  token: string | null;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

export default function AdminNewsTab({ token, showNotification }: AdminNewsTabProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://mujerereslibre-backend.onrender.com/api/news');
      const data = await res.json();
      setCategories(data);
      if (activeCategory) {
        setActiveCategory(data.find((c: Category) => c.id === activeCategory.id) || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      const res = await fetch('https://mujerereslibre-backend.onrender.com/api/gallery');
      setAlbums(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchForms = async () => {
    try {
      const res = await fetch('https://mujerereslibre-backend.onrender.com/api/forms');
      setForms(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAlbums();
    fetchForms();
  }, []);

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('https://mujerereslibre-backend.onrender.com/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error('Error al subir imagen');
    const data = await res.json();
    return data.url;
  };

  // Form Category
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatCover, setNewCatCover] = useState('');
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatDesc || !newCatCover) return showNotification('Completa todos los campos', 'error');
    setIsCreatingCat(true);
    try {
      const url = editingCategory ? `/api/news/${editingCategory.id}` : '/api/news';
      const method = editingCategory ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newCatName, description: newCatDesc, coverImage: newCatCover })
      });
      if (!res.ok) throw new Error('Error al guardar categoría');
      setNewCatName(''); setNewCatDesc(''); setNewCatCover('');
      setEditingCategory(null);
      await fetchCategories();
      showNotification(editingCategory ? 'Categoría actualizada.' : 'Categoría creada.', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Error al guardar categoría', 'error');
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta categoría y todas sus noticias?')) return;
    try {
      await fetch(`https://mujerereslibre-backend.onrender.com/api/news/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      await fetchCategories();
      showNotification('Categoría eliminada.', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Error al eliminar categoría', 'error');
    }
  };

  // Form Article
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [artTitle, setArtTitle] = useState('');
  const [artExcerpt, setArtExcerpt] = useState('');
  const [artDate, setArtDate] = useState('');
  const [artImage, setArtImage] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artIsPopup, setArtIsPopup] = useState(false);
  const [artLinkedAlbumId, setArtLinkedAlbumId] = useState<number | null>(null);
  const [artLinkedFormId, setArtLinkedFormId] = useState<number | null>(null);

  const openNewArticleModal = () => {
    setEditingArticle(null);
    setArtTitle(''); setArtExcerpt(''); setArtDate(''); setArtImage(''); setArtContent(''); setArtIsPopup(false); setArtLinkedAlbumId(null); setArtLinkedFormId(null);
    setIsArticleModalOpen(true);
  };

  const openEditArticleModal = (article: Article) => {
    setEditingArticle(article);
    setArtTitle(article.title); setArtExcerpt(article.excerpt); setArtDate(article.date); setArtImage(article.imageUrl); setArtContent(article.content || '');
    setArtIsPopup(article.is_popup || false);
    setArtLinkedAlbumId(article.linked_album_id || null);
    setArtLinkedFormId(article.linked_form_id || null);
    setIsArticleModalOpen(true);
  };

  const handleToggleHideArticle = async (article: Article) => {
    try {
      await fetch(`https://mujerereslibre-backend.onrender.com/api/news/articles/${article.id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...article, is_hidden: !article.is_hidden })
      });
      await fetchCategories();
      showNotification('Visibilidad de noticia actualizada.', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Error al actualizar visibilidad', 'error');
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory) return;
    setIsCreatingArticle(true);
    try {
      const url = editingArticle ? `/api/news/articles/${editingArticle.id}` : `/api/news/${activeCategory.id}/articles`;
      const method = editingArticle ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title: artTitle, excerpt: artExcerpt, date: artDate, imageUrl: artImage, content: artContent, is_hidden: editingArticle ? editingArticle.is_hidden : false, is_popup: artIsPopup, linked_album_id: artLinkedAlbumId, linked_form_id: artLinkedFormId
        })
      });
      if (!res.ok) throw new Error('Error al crear noticia');
      setIsArticleModalOpen(false);
      await fetchCategories();
      showNotification(editingArticle ? 'Noticia actualizada.' : 'Noticia creada.', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Error al guardar noticia', 'error');
    } finally {
      setIsCreatingArticle(false);
    }
  };

  const handleDeleteArticle = async (id: number) => {
    if (!confirm('¿Eliminar noticia?')) return;
    try {
      await fetch(`https://mujerereslibre-backend.onrender.com/api/news/articles/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      await fetchCategories();
      showNotification('Noticia eliminada.', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Error al eliminar noticia', 'error');
    }
  };

  if (activeCategory) {
    return (
      <div className="flex flex-col h-full relative">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setActiveCategory(null)} className="flex items-center gap-2 text-gray-500 hover:text-[#872075] transition-colors font-medium">
            <ChevronLeft size={20} />
            Volver a Categorías
          </button>
          <button onClick={openNewArticleModal} className="bg-[#872075] text-white px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-[#6a195c] transition-colors">
            <Plus size={16} />
            Añadir Noticia
          </button>
        </div>
        
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{activeCategory.name}</h2>
          <p className="text-gray-500">{activeCategory.articles.length} noticias publicadas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCategory.articles.map(article => (
            <div key={article.id} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
              <img src={article.imageUrl} alt="" className="w-24 h-24 object-cover rounded-lg shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 truncate flex items-center gap-2">
                    {article.title}
                    {article.is_hidden && <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Oculto</span>}
                  </h4>
                  <p className="text-xs text-gray-500 mb-1">{article.date}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button onClick={() => handleToggleHideArticle(article)} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-xs font-medium">
                    {article.is_hidden ? <><Eye size={12} /> Mostrar</> : <><EyeOff size={12} /> Ocultar</>}
                  </button>
                  <button onClick={() => openEditArticleModal(article)} className="text-gray-400 hover:text-[#872075] flex items-center gap-1 text-xs font-medium transition-colors">
                    <Edit size={12} /> Editar
                  </button>
                  <button onClick={() => handleDeleteArticle(article.id)} className="text-gray-400 hover:text-gray-800 flex items-center gap-1 text-xs font-medium transition-colors">
                    <Trash2 size={12} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
          {activeCategory.articles.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
              No hay noticias en esta categoría.
            </div>
          )}
        </div>

        {/* Modal New Article */}
        {isArticleModalOpen && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md">
            <div className="bg-white/95 backdrop-blur-3xl rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-white/50">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">{editingArticle ? 'Editar Noticia' : 'Nueva Noticia'}</h3>
              <form onSubmit={handleCreateArticle} className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Título</label>
                    <input type="text" value={artTitle} onChange={e=>setArtTitle(e.target.value)} required className="w-full bg-transparent border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#872075] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Fecha</label>
                    <input type="text" value={artDate} onChange={e=>setArtDate(e.target.value)} required className="w-full bg-transparent border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#872075] outline-none transition-colors" placeholder="Ej. 10 de Marzo, 2025" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Extracto (Corto)</label>
                  <input type="text" value={artExcerpt} onChange={e=>setArtExcerpt(e.target.value)} required className="w-full bg-transparent border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#872075] outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Imagen Principal</label>
                  <div className="flex gap-2">
                    <input type="url" value={artImage} onChange={e=>setArtImage(e.target.value)} required className="flex-1 bg-transparent border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#872075] outline-none transition-colors" placeholder="URL de la imagen" />
                    <label className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-600">
                      <Upload size={16} />
                      <input type="file" className="hidden" accept="image/*" onChange={async (e)=>{
                        if(e.target.files?.[0]) setArtImage(await handleImageUpload(e.target.files[0]));
                      }} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Contenido (Texto)</label>
                  <RichEditor 
                    value={artContent} 
                    onChange={setArtContent} 
                    placeholder="Escribe la noticia aquí..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Álbum Relacionado (Opcional)</label>
                  <select value={artLinkedAlbumId || ''} onChange={e => setArtLinkedAlbumId(e.target.value ? Number(e.target.value) : null)} className="w-full bg-transparent border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#872075] outline-none transition-colors">
                    <option value="">Ninguno</option>
                    {albums.map(a => <option key={a.id} value={a.id}>{a.title} ({a.date})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Formulario / Convocatoria (Opcional)</label>
                  <select value={artLinkedFormId || ''} onChange={e => setArtLinkedFormId(e.target.value ? Number(e.target.value) : null)} className="w-full bg-transparent border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#872075] outline-none transition-colors">
                    <option value="">Ninguno</option>
                    {forms.filter(f => f.is_active).map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                  </select>
                </div>

                {/* Popup toggle */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-dashed border-[#872075]/30 bg-[#872075]/3 cursor-pointer hover:bg-[#872075]/6 transition-colors">
                  <input
                    type="checkbox"
                    checked={artIsPopup}
                    onChange={e => setArtIsPopup(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#872075] rounded"
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">Destacar como anuncio emergente</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Esta noticia aparecerá automáticamente al ingresar a la landing page. Solo una noticia puede estar activa a la vez.</p>
                  </div>
                </label>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsArticleModalOpen(false)} className="px-6 py-2.5 text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200 rounded-full text-sm font-semibold transition-all">Cancelar</button>
                  <button type="submit" disabled={isCreatingArticle} className="bg-[#872075] hover:bg-[#6a195c] text-white px-8 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-[#872075]/20">
                    {isCreatingArticle && <Loader2 size={16} className="animate-spin" />}
                    Guardar Noticia
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Create / Edit form */}
      <form onSubmit={handleCreateCategory} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
        <h3 className="font-semibold text-gray-900 mb-2">{editingCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Ej. Eventos" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Descripción corta</label>
            <input type="text" value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Resumen..." required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Portada</label>
            <div className="flex gap-2">
              <input type="url" value={newCatCover} onChange={e => setNewCatCover(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="URL" required />
              <label className="shrink-0 bg-gray-100 hover:bg-gray-200 border border-gray-300 px-3 py-2 rounded-lg cursor-pointer flex items-center">
                <Upload size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                  if (e.target.files?.[0]) setNewCatCover(await handleImageUpload(e.target.files[0]));
                }} />
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          {editingCategory && (
            <button type="button" onClick={() => {
              setEditingCategory(null);
              setNewCatName(''); setNewCatDesc(''); setNewCatCover('');
            }} className="px-6 py-2 rounded-full font-medium text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              Cancelar
            </button>
          )}
          <button type="submit" disabled={isCreatingCat} className="bg-[#872075] text-white px-6 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-[#6a195c]">
            {isCreatingCat ? <Loader2 size={16} className="animate-spin" /> : (editingCategory ? <Edit size={16} /> : <Plus size={16} />)}
            {editingCategory ? 'Actualizar Categoría' : 'Crear Categoría'}
          </button>
        </div>
      </form>

      {/* List of categories */}
      <div className="flex-1 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#872075]" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[21/9] bg-gray-100 relative cursor-pointer group" onClick={() => setActiveCategory(cat)}>
                  <img src={cat.coverImage} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2">
                      <FileText size={16} /> Administrar Noticias
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{cat.name}</h4>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{cat.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#872075] bg-[#872075]/10 px-2 py-1 rounded-md">{cat.articles.length} noticias</span>
                    <div className="flex gap-1">
                      <button onClick={() => {
                        setEditingCategory(cat);
                        setNewCatName(cat.name);
                        setNewCatDesc(cat.description);
                        setNewCatCover(cat.coverImage);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} className="p-2 text-gray-400 hover:bg-gray-50 hover:text-[#872075] rounded-lg transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No hay categorías. Crea la primera arriba.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
