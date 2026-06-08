import { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, ChevronLeft, Loader2, Upload, Edit, Eye, EyeOff } from 'lucide-react';
import type { Album, Article, Category } from '../types';

interface AdminGalleryTabProps {
  token: string | null;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

export default function AdminGalleryTab({ token, showNotification }: AdminGalleryTabProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);

  const fetchAlbums = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://mujerereslibre-backend.onrender.com/api/gallery');
      const data = await res.json();
      setAlbums(data);
      if (activeAlbum) {
        setActiveAlbum(data.find((a: Album) => a.id === activeAlbum.id) || null);
      }
    } catch (e) {
      console.error(e);
      showNotification('Error al cargar álbumes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch('https://mujerereslibre-backend.onrender.com/api/news');
      const cats: Category[] = await res.json();
      setArticles(cats.flatMap(c => c.articles));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAlbums();
    fetchArticles();
  }, []);

  // form states for new album
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCover, setNewCover] = useState('');
  const [newLinkedArticleId, setNewLinkedArticleId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const startEditAlbum = (album: Album) => {
    setEditingAlbum(album);
    setNewTitle(album.title);
    setNewDate(album.date);
    setNewCover(album.coverImage);
    setNewLinkedArticleId(album.linked_article_id || null);
  };

  const resetForm = () => {
    setNewTitle(''); setNewDate(''); setNewCover(''); setNewLinkedArticleId(null);
  };

  const cancelEdit = () => {
    setEditingAlbum(null);
    resetForm();
  };

  const handleToggleHideAlbum = async (album: Album) => {
    try {
      const res = await fetch(`https://mujerereslibre-backend.onrender.com/api/gallery/${album.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...album, is_hidden: !album.is_hidden })
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
      await fetchAlbums();
      showNotification('Álbum actualizado.', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Error al actualizar', 'error');
    }
  };

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
    const fullUrl = data.url.startsWith('/uploads/') ? `https://mujerereslibre-backend.onrender.com${data.url}` : data.url;
    return fullUrl;
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate || !newCover) return showNotification('Completa todos los campos', 'error');
    setIsCreating(true);
    try {
      const url = editingAlbum ? `/api/gallery/${editingAlbum.id}` : `/api/gallery`;
      const method = editingAlbum ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle, date: newDate, coverImage: newCover, is_hidden: editingAlbum ? editingAlbum.is_hidden : false, linked_article_id: newLinkedArticleId })
      });
      if (!res.ok) throw new Error('Error al guardar álbum');
      await fetchAlbums();
      setEditingAlbum(null);
      resetForm();
      showNotification(editingAlbum ? 'Álbum actualizado.' : 'Álbum creado.', 'success');
    } catch (e: any) {
      console.error(e);
      showNotification(e.message || 'Error al guardar álbum.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAlbum = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar este álbum y todas sus fotos?')) return;
    try {
      await fetch(`https://mujerereslibre-backend.onrender.com/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchAlbums();
      showNotification('Álbum eliminado.', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Error al eliminar', 'error');
    }
  };

  // ... photo management inside activeAlbum
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !activeAlbum) return;
    setIsUploadingPhoto(true);
    try {
      const url = await handleImageUpload(e.target.files[0]);
      const res = await fetch(`https://mujerereslibre-backend.onrender.com/api/gallery/${activeAlbum.id}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url })
      });
      if (!res.ok) throw new Error('Error al añadir foto');
      await fetchAlbums();
      showNotification('Foto añadida.', 'success');
    } catch (err: any) {
      showNotification('Error al añadir foto: ' + err.message, 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('¿Eliminar foto?')) return;
    try {
      await fetch(`https://mujerereslibre-backend.onrender.com/api/gallery/photos/${photoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchAlbums();
      showNotification('Foto eliminada.', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Error al eliminar foto.', 'error');
    }
  };

  if (activeAlbum) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setActiveAlbum(null)} className="flex items-center gap-2 text-gray-500 hover:text-[#872075] transition-colors font-medium">
            <ChevronLeft size={20} />
            Volver a Álbumes
          </button>
          <div className="relative">
            <input type="file" id="upload-photo" className="hidden" accept="image/*" onChange={handleAddPhoto} disabled={isUploadingPhoto} />
            <label htmlFor="upload-photo" className="bg-[#872075] text-white px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 cursor-pointer hover:bg-[#6a195c] transition-colors opacity-100 disabled:opacity-50">
              {isUploadingPhoto ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Añadir Foto
            </label>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{activeAlbum.title}</h2>
          <p className="text-gray-500">{activeAlbum.date} • {activeAlbum.photos.length} fotos</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activeAlbum.photos.map(photo => (
            <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              <button 
                onClick={() => handleDeletePhoto(photo.id)}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {activeAlbum.photos.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
              No hay fotos en este álbum.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Create form */}
      <form onSubmit={handleCreateAlbum} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{editingAlbum ? 'Editar Álbum' : 'Crear Nuevo Álbum'}</h3>
          {editingAlbum && (
            <button type="button" onClick={cancelEdit} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Cancelar edición</button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Título</label>
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#872075] focus:ring-1 focus:ring-[#872075]" placeholder="Ej. Entrega de kits" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha (Texto)</label>
            <input type="text" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#872075] focus:ring-1 focus:ring-[#872075]" placeholder="Ej. Marzo 2025" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Noticia Relacionada (Opcional)</label>
            <select value={newLinkedArticleId || ''} onChange={e => setNewLinkedArticleId(e.target.value ? Number(e.target.value) : null)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#872075] focus:ring-1 focus:ring-[#872075]">
              <option value="">Ninguna</option>
              {articles.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Portada</label>
            <div className="flex gap-2">
              <input type="url" value={newCover} onChange={e => setNewCover(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#872075] focus:ring-1 focus:ring-[#872075]" placeholder="URL de la imagen" required />
              <label className="shrink-0 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center transition-colors">
                <Upload size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                  if (e.target.files?.[0]) {
                    const url = await handleImageUpload(e.target.files[0]);
                    setNewCover(url);
                  }
                }} />
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <button type="submit" disabled={isCreating} className="bg-[#872075] text-white px-6 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-[#6a195c] transition-colors disabled:opacity-50">
            {isCreating ? <Loader2 size={16} className="animate-spin" /> : (editingAlbum ? <Edit size={16} /> : <Plus size={16} />)}
            {editingAlbum ? 'Guardar Cambios' : 'Crear Álbum'}
          </button>
        </div>
      </form>

      {/* List of albums */}
      <div className="flex-1 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#872075]" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map(album => (
              <div key={album.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
                <div className="aspect-[4/3] bg-gray-100 relative cursor-pointer" onClick={() => setActiveAlbum(album)}>
                  <img src={album.coverImage} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2">
                      <ImageIcon size={16} /> Ver {album.photos.length} fotos
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1 truncate flex items-center gap-2">
                    {album.title}
                    {album.is_hidden && <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">Oculto</span>}
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">{album.date}</p>
                  
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleHideAlbum(album)} className="flex-1 py-1.5 flex items-center justify-center gap-1.5 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
                      {album.is_hidden ? <><Eye size={14} /> Mostrar</> : <><EyeOff size={14} /> Ocultar</>}
                    </button>
                    <button onClick={() => startEditAlbum(album)} className="flex-1 py-1.5 flex items-center justify-center gap-1.5 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-[#872075] hover:border-[#872075]/30 transition-colors text-xs font-medium">
                      <Edit size={14} /> Editar
                    </button>
                    <button onClick={() => handleDeleteAlbum(album.id)} className="flex-1 py-1.5 flex items-center justify-center gap-1.5 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors text-xs font-medium">
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {albums.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No hay álbumes creados. Crea el primero arriba.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
