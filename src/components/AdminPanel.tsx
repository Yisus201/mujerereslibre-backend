import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from 'shaders/react';
import { Menu, X, Loader2, ArrowRight, Users, Briefcase, BarChart2, LogOut, Edit, Trash2, Plus, Search, Globe, Upload, Link, FileText, ChevronDown, Image as ImageIcon, Newspaper } from 'lucide-react';
import type { Metric, ServiceCard, Volunteer, SiteContent } from '../types';
import AdminGalleryTab from './AdminGalleryTab';
import AdminNewsTab from './AdminNewsTab';
import AdminFormsTab from './AdminFormsTab';

interface AdminPanelProps {
  onUpdateData?: () => void;
}

type TabType = 'volunteers' | 'services' | 'metrics' | 'content' | 'gallery' | 'news' | 'forms';
type ContentSectionType = 'brand' | 'hero' | 'about' | 'footer' | 'volunteer';

export default function AdminPanel({ onUpdateData }: AdminPanelProps) {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('admin_token'));
  const [activeTab, setActiveTab] = useState<TabType>('volunteers');
  const [activeContentSection, setActiveContentSection] = useState<ContentSectionType>('brand');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Notification State
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data States
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [content, setContent] = useState<SiteContent>({});
  const [originalContent, setOriginalContent] = useState<SiteContent>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Service Edit Modal States
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<ServiceCard> | null>(null);
  const [serviceFormError, setServiceFormError] = useState('');
  const [isSavingService, setIsSavingService] = useState(false);

  // Image upload states
  type ImageMode = 'url' | 'upload';
  const [imageMode, setImageMode] = useState<ImageMode>('url');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Load backend data if authenticated
  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [volunteersRes, servicesRes, metricsRes, contentRes] = await Promise.all([
        fetch('/api/volunteers', { headers }).then((r) => r.json()),
        fetch('/api/services').then((r) => r.json()),
        fetch('/api/metrics').then((r) => r.json()),
        fetch('/api/content').then((r) => r.json()),
      ]);

      if (Array.isArray(volunteersRes)) setVolunteers(volunteersRes);
      if (Array.isArray(servicesRes)) setServices(servicesRes);
      if (Array.isArray(metricsRes)) setMetrics(metricsRes);
      if (contentRes && typeof contentRes === 'object') {
        setContent(contentRes);
        setOriginalContent(contentRes);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      fetch('/api/content')
        .then(r => r.json())
        .then(data => {
          if (data && typeof data === 'object') {
            setContent(data);
            setOriginalContent(data);
          }
        })
        .catch(console.error);
    } else {
      loadData();
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!email || !password) {
      setAuthError('Por favor completa todos los campos.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Error en inicio de sesión');
      }

      sessionStorage.setItem('admin_token', data.access_token);
      setToken(data.access_token);
    } catch (err: any) {
      setAuthError(err.message || 'Credenciales inválidas.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setToken(null);
  };

  // Metrics update
  const [isSavingMetrics, setIsSavingMetrics] = useState(false);
  const handleMetricChange = (index: number, field: keyof Metric, value: string) => {
    setMetrics((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMetrics(true);
    try {
      const response = await fetch('/api/metrics', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(metrics),
      });

      if (!response.ok) throw new Error('Error al actualizar métricas');
      
      const data = await response.json();
      setMetrics(data);
      if (onUpdateData) onUpdateData(); // update landing page data in background
      showNotification('Métricas actualizadas correctamente.', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Ocurrió un error al guardar las métricas.', 'error');
    } finally {
      setIsSavingMetrics(false);
    }
  };

  // Content update
  const [isSavingContent, setIsSavingContent] = useState(false);
  const handleContentChange = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingContent(true);
    try {
      const updates: Record<string, string | null> = {};
      
      // Check all keys in current content vs original
      const allKeys = new Set([...Object.keys(content), ...Object.keys(originalContent)]);
      allKeys.forEach(key => {
        const currentVal = content[key] ?? '';
        const originalVal = originalContent[key] ?? '';
        if (currentVal !== originalVal) {
          // Send null to delete from DB if cleared, otherwise send the value
          updates[key] = currentVal.trim() === '' ? null : currentVal;
        }
      });
      
      if (Object.keys(updates).length === 0) {
        showNotification('No hay cambios para guardar.', 'error');
        setIsSavingContent(false);
        return;
      }

      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ updates }),
      });
      if (response.status === 401) {
        showNotification('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'error');
        handleLogout();
        return;
      }
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Error ${response.status} al actualizar contenido`);
      }
      
      const refreshResponse = await fetch('/api/content');
      const freshData = await refreshResponse.json();
      setContent(freshData);
      setOriginalContent(freshData);
      if (onUpdateData) onUpdateData();
      showNotification('Contenido actualizado correctamente.', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Ocurrió un error al guardar el contenido.', 'error');
    } finally {
      setIsSavingContent(false);
    }
  };
  
  const handleContentImageUpload = async (key: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!uploadRes.ok) throw new Error('Error al subir imagen');
      const data = await uploadRes.json();
      handleContentChange(key, data.url);
    } catch(err) {
      showNotification('Error al subir la imagen.', 'error');
    }
  };

  let parsedTestimonials: any[] = [];
  try {
    if (content['about.testimonials']) {
      parsedTestimonials = JSON.parse(content['about.testimonials']);
    } else if (content['about.quote_text'] || content['about.quote']) {
      parsedTestimonials = [{
        text: content['about.quote_text'] || content['about.quote'] || '',
        author: content['about.quote_name'] || content['about.quote_author'] || '',
        role: content['about.quote_role'] || '',
        image: content['about.quote_image'] || ''
      }];
    }
  } catch(e) {
    console.error("Error parsing testimonials:", e);
  }

  const handleTestimonialChange = (index: number, field: string, value: string) => {
    const newTestimonials = [...parsedTestimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    handleContentChange('about.testimonials', JSON.stringify(newTestimonials));
  };

  const handleAddTestimonial = () => {
    const newTestimonials = [...parsedTestimonials, { text: '', author: '', role: '', image: '' }];
    handleContentChange('about.testimonials', JSON.stringify(newTestimonials));
  };

  const handleRemoveTestimonial = (index: number) => {
    const newTestimonials = parsedTestimonials.filter((_, i) => i !== index);
    handleContentChange('about.testimonials', JSON.stringify(newTestimonials));
  };
  
  const handleTestimonialImageUpload = async (index: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!uploadRes.ok) throw new Error('Error al subir imagen');
      const data = await uploadRes.json();
      handleTestimonialChange(index, 'image', data.url);
    } catch(err) {
      showNotification('Error al subir la imagen.', 'error');
    }
  };

  // Service Edit/Create Submit
  const handleOpenServiceModal = (service: ServiceCard | null = null) => {
    setServiceFormError('');
    setImageFile(null);
    setImagePreview('');
    setImageMode('url');
    if (service) {
      setEditingService(service);
      setImagePreview(service.image_url || '');
    } else {
      // Create template with next number
      const nextNum = String(services.length + 1).padStart(2, '0');
      setEditingService({
        title: '',
        number: nextNum,
        description: '',
        image_url: '',
        is_full_width: false,
      });
    }
    setIsServiceModalOpen(true);
  };

  const handleImageFileChange = (file: File | null) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.title || !editingService?.description) {
      setServiceFormError('Por favor completa todos los campos.');
      return;
    }

    let finalImageUrl = editingService.image_url || '';

    // If user picked a file, upload it first
    if (imageMode === 'upload' && imageFile) {
      setIsUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });

        if (uploadRes.status === 401) {
          // Session expired — clear it and force re-login
          sessionStorage.removeItem('admin_token');
          setToken(null);
          setServiceFormError('Tu sesión expiró. Por favor inicia sesión de nuevo.');
          setIsUploadingImage(false);
          setIsServiceModalOpen(false);
          return;
        }

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData?.detail || 'Error al subir la imagen');
        }

        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      } catch (err: any) {
        setServiceFormError(err.message || 'Error al subir la imagen. Intenta de nuevo.');
        setIsUploadingImage(false);
        return;
      } finally {
        setIsUploadingImage(false);
      }
    }

    if (!finalImageUrl) {
      setServiceFormError('Por favor agrega una imagen (URL o archivo).');
      return;
    }

    setIsSavingService(true);
    try {
      const serviceData = { ...editingService, image_url: finalImageUrl };
      const isEdit = !!editingService.id;
      const url = isEdit ? `/api/services/${editingService.id}` : '/api/services';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) throw new Error('Error al guardar el servicio');

      await loadData();
      onUpdateData?.();
      setIsServiceModalOpen(false);
      setEditingService(null);
      setImageFile(null);
      setImagePreview('');
    } catch (err) {
      console.error(err);
      setServiceFormError('Ocurrió un error al guardar el servicio.');
    } finally {
      setIsSavingService(false);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este servicio?')) return;

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al eliminar servicio');

      const newServices = services.filter((s) => s.id !== id);
      setServices(newServices);
      if (onUpdateData) onUpdateData();
      showNotification('Servicio eliminado correctamente.', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Error al eliminar el servicio.', 'error');
    }
  };

  const handleDeleteVolunteer = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar a este voluntario del registro?')) return;

    try {
      const response = await fetch(`/api/volunteers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al eliminar voluntario');

      const newVols = volunteers.filter(v => v.id !== id);
      setVolunteers(newVols);
      showNotification('Voluntario eliminado correctamente.', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Error al eliminar el voluntario.', 'error');
    }
  };

  // Filter volunteers based on search
  const filteredVolunteers = volunteers.filter((vol) => {
    const term = searchTerm.toLowerCase();
    return (
      vol.name.toLowerCase().includes(term) ||
      vol.email.toLowerCase().includes(term) ||
      vol.phone.includes(term) ||
      vol.interest.toLowerCase().includes(term) ||
      vol.message.toLowerCase().includes(term)
    );
  });

  // Render Login Screen
  if (!token) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-6 bg-[#FAFAFA] relative overflow-hidden">
        {/* Background Shader */}
        <Shader className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <Swirl colorA="#FAFAFA" colorB="#FFFFFF" detail={1.7} />
          <ChromaFlow baseColor="#ffffff" downColor="#872075" leftColor="#A3298D" rightColor="#69185A" upColor="#872075" momentum={13} radius={3.5} />
          <FlutedGlass aberration={0.61} angle={31} frequency={8} highlight={0.12} highlightSoftness={0} lightAngle={-90} refraction={4} shape="rounded" softness={1} speed={0.15} />
          <FilmGrain strength={0.05} />
        </Shader>

        <div className="relative z-20 w-full max-w-md bg-[#FEFDFE]/10 backdrop-blur-2xl border border-[#FEFDFE]/30 rounded-3xl p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-[#872075] rounded-full flex items-center justify-center text-white font-bold text-sm tracking-tight mb-4 shadow-sm shadow-[#872075]/20 overflow-hidden shrink-0">
              {content['brand.logo_url'] ? (
                <img src={content['brand.logo_url']} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                content['brand.initials'] || 'MEL'
              )}
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight text-center">Panel Administrativo</h2>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-medium text-center">{content['brand.name'] || 'Fundación Mujer eres Libre'}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            <div className="space-y-1">
              <label htmlFor="email" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@mujerereslibre.org"
                className="w-full bg-transparent border-b border-gray-200 py-3 text-[16px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#872075] transition-all duration-300"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-gray-200 py-3 text-[16px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#872075] transition-all duration-300"
              />
            </div>

            {authError && (
              <p className="text-xs font-semibold text-red-500 pl-0.5">{authError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="group w-full bg-[#872075] hover:bg-[#6a195c] disabled:bg-[#872075]/60 text-white text-sm font-semibold rounded-full pl-6 pr-2 py-2.5 flex items-center justify-center gap-4 transition-all duration-300 shadow-md shadow-[#872075]/10 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <span>Iniciando Sesión...</span>
                  <div className="w-6 h-6 bg-white/10 text-white rounded-full flex items-center justify-center shrink-0">
                    <Loader2 size={12} className="animate-spin" />
                  </div>
                </>
              ) : (
                <>
                  <span>Ingresar al Panel</span>
                  <div className="w-6 h-6 bg-white text-[#872075] rounded-full flex items-center justify-center shrink-0 transition-all duration-300">
                    <ArrowRight size={12} className="transition-transform group-hover:-rotate-45 duration-350" />
                  </div>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#872075] transition-colors"
            >
              <Globe size={12} />
              Volver al sitio web
            </a>
          </div>
        </div>
      </main>
    );
  }

  // Render Dashboard Screen
  return (
    <main className="min-h-screen flex relative overflow-hidden">
      {/* Background Shader */}
      <Shader className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Swirl colorA="#FAFAFA" colorB="#FFFFFF" detail={1.7} />
        <ChromaFlow baseColor="#ffffff" downColor="#872075" leftColor="#A3298D" rightColor="#69185A" upColor="#872075" momentum={13} radius={3.5} />
        <FlutedGlass aberration={0.61} angle={31} frequency={8} highlight={0.12} highlightSoftness={0} lightAngle={-90} refraction={4} shape="rounded" softness={1} speed={0.15} />
        <FilmGrain strength={0.05} />
      </Shader>

      {/* Sidebar - Glassmorphism */}
      <aside className={`relative z-20 bg-[#FEFDFE]/20 backdrop-blur-2xl border-r border-[#FEFDFE]/40 flex flex-col justify-between p-4 sm:p-6 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${isSidebarOpen ? 'w-full md:w-64' : 'w-full md:w-[88px]'} shrink-0 md:min-h-screen shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
        <div className="space-y-8">
          {/* Logo / BRAND */}
          <div className={`flex items-center border-b border-white/30 pb-6 transition-all ${isSidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex w-8 h-8 bg-white/60 backdrop-blur-xl border border-white/60 rounded-full items-center justify-center text-[#872075] hover:text-gray-900 hover:bg-white transition-colors shadow-sm cursor-pointer shrink-0"
              title="Contraer/Expandir menú"
            >
              <Menu size={14} />
            </button>
            
            <div className={`bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-[#872075] font-bold text-sm tracking-tight shadow-sm overflow-hidden shrink-0 border border-white/50 transition-all duration-300 ${!isSidebarOpen ? 'hidden' : 'w-10 h-10'}`}>
              {content['brand.logo_url'] ? (
                <img src={content['brand.logo_url']} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                content['brand.initials'] || 'MEL'
              )}
            </div>

            {isSidebarOpen && (
              <div className="overflow-hidden transition-all duration-300 whitespace-nowrap">
                <span className="font-semibold text-[15px] tracking-tight block text-gray-900">{content['brand.name'] || 'Mujer eres Libre'}</span>
                <span className="text-[10px] text-[#872075] uppercase tracking-widest font-semibold block">Administración</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <button
                  onClick={() => {
                    setActiveTab('forms');
                  }}
                  className={`w-full flex items-center gap-3 py-3 rounded-full text-[13px] font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                    activeTab === 'forms' 
                      ? 'bg-white/50 text-[#872075] shadow-sm border border-white/40' 
                      : 'text-gray-600 hover:bg-white/30 hover:text-gray-900 border border-transparent'
                  } ${!isSidebarOpen ? 'justify-center px-0' : 'px-4'}`}
                  title={!isSidebarOpen ? "Formularios" : ""}
                >
                  <FileText size={16} className="shrink-0" />
                  {isSidebarOpen && <span>Formularios</span>}
            </button>
            <div className="h-px bg-white/30 my-1 mx-2"></div>
            <button
              onClick={() => setActiveTab('volunteers')}
              className={`w-full flex items-center gap-3 py-3 rounded-full text-[13px] font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                activeTab === 'volunteers'
                  ? 'bg-white/50 text-[#872075] shadow-sm border border-white/40'
                  : 'text-gray-600 hover:bg-white/30 hover:text-gray-900 border border-transparent'
              } ${!isSidebarOpen ? 'justify-center px-0' : 'px-4'}`}
              title={!isSidebarOpen ? "Voluntarios" : ""}
            >
              <Users size={16} className="shrink-0" />
              {isSidebarOpen && <span>Voluntarios</span>}
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center gap-3 py-3 rounded-full text-[13px] font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-white/50 text-[#872075] shadow-sm border border-white/40'
                  : 'text-gray-600 hover:bg-white/30 hover:text-gray-900 border border-transparent'
              } ${!isSidebarOpen ? 'justify-center px-0' : 'px-4'}`}
              title={!isSidebarOpen ? "Servicios" : ""}
            >
              <Briefcase size={16} className="shrink-0" />
              {isSidebarOpen && <span>Servicios</span>}
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`w-full flex items-center gap-3 py-3 rounded-full text-[13px] font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                activeTab === 'metrics'
                  ? 'bg-white/50 text-[#872075] shadow-sm border border-white/40'
                  : 'text-gray-600 hover:bg-white/30 hover:text-gray-900 border border-transparent'
              } ${!isSidebarOpen ? 'justify-center px-0' : 'px-4'}`}
              title={!isSidebarOpen ? "Métricas" : ""}
            >
              <BarChart2 size={16} className="shrink-0" />
              {isSidebarOpen && <span>Métricas</span>}
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center gap-3 py-3 rounded-full text-[13px] font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-white/50 text-[#872075] shadow-sm border border-white/40'
                  : 'text-gray-600 hover:bg-white/30 hover:text-gray-900 border border-transparent'
              } ${!isSidebarOpen ? 'justify-center px-0' : 'px-4'}`}
              title={!isSidebarOpen ? "Contenido" : ""}
            >
              <FileText size={16} className="shrink-0" />
              {isSidebarOpen && <span>Contenido</span>}
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center gap-3 py-3 rounded-full text-[13px] font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-white/50 text-[#872075] shadow-sm border border-white/40'
                  : 'text-gray-600 hover:bg-white/30 hover:text-gray-900 border border-transparent'
              } ${!isSidebarOpen ? 'justify-center px-0' : 'px-4'}`}
              title={!isSidebarOpen ? "Galería" : ""}
            >
              <ImageIcon size={16} className="shrink-0" />
              {isSidebarOpen && <span>Galería</span>}
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`w-full flex items-center gap-3 py-3 rounded-full text-[13px] font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-white/50 text-[#872075] shadow-sm border border-white/40'
                  : 'text-gray-600 hover:bg-white/30 hover:text-gray-900 border border-transparent'
              } ${!isSidebarOpen ? 'justify-center px-0' : 'px-4'}`}
              title={!isSidebarOpen ? "Noticias" : ""}
            >
              <Newspaper size={16} className="shrink-0" />
              {isSidebarOpen && <span>Noticias</span>}
            </button>
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 md:mt-0 pt-6 border-t border-white/30 flex flex-col gap-4">
          <a
            href="#"
            className={`flex items-center gap-2 py-2 text-xs text-gray-600 hover:text-[#872075] transition-colors ${!isSidebarOpen ? 'justify-center px-0' : 'px-4'}`}
            title={!isSidebarOpen ? "Ver Landing Page" : ""}
          >
            <Globe size={14} className="shrink-0" />
            {isSidebarOpen && <span>Ver Landing Page</span>}
          </a>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 py-2 text-xs text-[#872075] hover:text-white hover:bg-[#872075] rounded-full transition-colors cursor-pointer ${!isSidebarOpen ? 'justify-center px-0' : 'px-4'}`}
            title={!isSidebarOpen ? "Cerrar Sesión" : ""}
          >
            <LogOut size={14} className="shrink-0" />
            {isSidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <section className="relative z-10 flex-1 p-4 sm:p-6 md:p-8 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="bg-[#FEFDFE]/60 backdrop-blur-2xl border border-[#FEFDFE]/50 rounded-3xl p-6 sm:p-10 flex-1 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
          {/* Top Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/60 pb-6 mb-8 shrink-0">
            <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight capitalize">
              {activeTab === 'volunteers' && 'Directorio de Voluntarios'}
              {activeTab === 'services' && 'Gestión de Servicios'}
              {activeTab === 'metrics' && 'Métricas de Impacto'}
              {activeTab === 'content' && 'Contenido del Sitio'}
              {activeTab === 'gallery' && 'Gestión de Galería'}
              {activeTab === 'news' && 'Gestión de Noticias'}
              {activeTab === 'forms' && 'Gestión de Formularios'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {activeTab === 'volunteers' && 'Visualiza y gestiona las solicitudes de los usuarios en tiempo real.'}
              {activeTab === 'services' && 'Administra, edita o agrega áreas de servicio de la landing page.'}
              {activeTab === 'metrics' && 'Configura los indicadores de impacto y logros del sitio.'}
              {activeTab === 'content' && 'Modifica los textos e imágenes principales del sitio.'}
              {activeTab === 'gallery' && 'Sube fotos y administra los álbumes del portal.'}
              {activeTab === 'news' && 'Publica noticias y mantén informada a tu comunidad.'}
              {activeTab === 'forms' && 'Configura los campos y configuraciones de los formularios del sitio.'}
            </p>
          </div>
          {activeTab === 'services' && (
            <button
              onClick={() => handleOpenServiceModal()}
              className="group bg-[#872075] hover:bg-[#6a195c] text-white text-xs font-semibold uppercase tracking-wider rounded-full pl-5 pr-2 py-2 flex items-center gap-3 transition-colors cursor-pointer"
            >
              <span>Nuevo Servicio</span>
              <div className="w-6 h-6 bg-white text-[#872075] rounded-full flex items-center justify-center shrink-0">
                <Plus size={14} />
              </div>
            </button>
          )}
        </header>

        {/* Dynamic Tab Body */}
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="w-full h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 size={32} className="animate-spin text-[#872075]" />
              <span className="text-sm font-medium">Cargando datos del servidor...</span>
            </div>
          ) : (
            <>
              {/* Tab 1: Volunteers */}
              {activeTab === 'volunteers' && (
                <div className="space-y-6">
                  {/* Search Bar */}
                  <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Search size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar voluntario por nombre, email o mensaje..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:border-[#872075] focus:ring-1 focus:ring-[#872075]/10 transition-all shadow-sm"
                    />
                  </div>

                  {/* List / Table */}
                  {filteredVolunteers.length === 0 ? (
                    <div className="w-full bg-white border border-gray-200 rounded-2xl py-16 text-center text-gray-400">
                      <Users size={32} className="mx-auto mb-3 opacity-40 text-gray-400" />
                      <p className="text-sm font-medium">No se encontraron solicitudes de voluntarios.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredVolunteers.map((vol) => (
                        <div
                          key={vol.id}
                          className="bg-white border border-gray-200/70 rounded-2xl p-6 shadow-sm flex flex-col gap-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{vol.name}</h3>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                                <span>Email: {vol.email}</span>
                                <span>Tel: {vol.phone}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-[11px] text-gray-400">
                                {new Date(vol.created_at).toLocaleDateString('es-CO', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <button
                                onClick={() => handleDeleteVolunteer(vol.id!)}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Eliminar voluntario"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Motivación</h4>
                            <p className="text-[14px] text-gray-700 leading-relaxed bg-[#FAFAFA] border border-gray-100 p-4 rounded-xl">
                              {vol.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Services (CRUD) */}
              {activeTab === 'services' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col"
                    >
                      <div className="h-44 relative bg-gray-100 shrink-0">
                        <img
                          src={service.image_url}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#872075] border border-white/50 shadow-sm">
                          Tarjetas {service.number}
                        </div>
                        {service.is_full_width && (
                          <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                            Ancho Completo
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900 text-lg leading-tight">{service.title}</h3>
                          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                            {service.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="p-2 border border-[#872075]/20 text-[#872075] hover:bg-[#872075]/10 rounded-xl transition-colors cursor-pointer"
                            title="Eliminar servicio"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenServiceModal(service)}
                            className="px-4 py-2 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit size={12} />
                            Editar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Metrics */}
              {activeTab === 'metrics' && (
                <form onSubmit={handleSaveMetrics} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm max-w-3xl space-y-8">
                  <div className="space-y-6">
                    {metrics.map((metric, index) => (
                      <div key={metric.id} className="p-6 bg-[#FAFAFA] border border-gray-100 rounded-2xl space-y-4">
                        <h3 className="font-semibold text-[#872075] text-sm uppercase tracking-wider border-b border-gray-200/60 pb-2">
                          Indicador {index + 1}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Valor
                            </label>
                            <input
                              type="text"
                              value={metric.value}
                              onChange={(e) => handleMetricChange(index, 'value', e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#872075]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Etiqueta / Título
                            </label>
                            <input
                              type="text"
                              value={metric.label}
                              onChange={(e) => handleMetricChange(index, 'label', e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#872075]"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Descripción / Detalle
                          </label>
                          <textarea
                            rows={2}
                            value={metric.description || ''}
                            onChange={(e) => handleMetricChange(index, 'description', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#872075] resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-4 border-t border-gray-100 pt-6">
                    <button
                      type="submit"
                      disabled={isSavingMetrics}
                      className="group bg-[#872075] hover:bg-[#6a195c] text-white disabled:bg-[#872075]/60 text-sm font-semibold rounded-full pl-6 pr-2 py-2 flex items-center justify-center gap-4 transition-all duration-300 shadow-md shadow-[#872075]/10 cursor-pointer"
                    >
                      {isSavingMetrics ? (
                        <>
                          <span>Guardando...</span>
                          <div className="w-6 h-6 bg-white/10 text-white rounded-full flex items-center justify-center shrink-0">
                            <Loader2 size={12} className="animate-spin" />
                          </div>
                        </>
                      ) : (
                        <>
                          <span>Guardar Métricas</span>
                          <div className="w-6 h-6 bg-white text-[#872075] rounded-full flex items-center justify-center shrink-0 transition-all duration-300">
                            <ArrowRight size={12} />
                          </div>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 4: Content */}
              {activeTab === 'content' && (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm max-w-4xl overflow-hidden flex flex-col">
                  {/* Content Sub-tabs */}
                  <div className="flex overflow-x-auto border-b border-gray-100 bg-[#FAFAFA]">
                    <button
                      onClick={() => setActiveContentSection('brand')}
                      className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                        activeContentSection === 'brand'
                          ? 'border-[#872075] text-[#872075]'
                          : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Branding y Logo
                    </button>
                    <button
                      onClick={() => setActiveContentSection('hero')}
                      className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                        activeContentSection === 'hero'
                          ? 'border-[#872075] text-[#872075]'
                          : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Hero (Principal)
                    </button>
                    <button
                      onClick={() => setActiveContentSection('about')}
                      className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                        activeContentSection === 'about'
                          ? 'border-[#872075] text-[#872075]'
                          : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Nosotros (Esencia)
                    </button>
                    <button
                      onClick={() => setActiveContentSection('footer')}
                      className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                        activeContentSection === 'footer'
                          ? 'border-[#872075] text-[#872075]'
                          : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Footer y Contacto
                    </button>
                    <button
                      onClick={() => setActiveContentSection('volunteer')}
                      className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                        activeContentSection === 'volunteer'
                          ? 'border-[#872075] text-[#872075]'
                          : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Ajustes Voluntariado
                    </button>
                  </div>

                  <form onSubmit={handleSaveContent} className="p-6 sm:p-8 space-y-8">
                    {/* Branding */}
                    {activeContentSection === 'brand' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Siglas del Logo</label>
                            <input type="text" value={content['brand.initials'] || ''} onChange={(e) => handleContentChange('brand.initials', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nombre de la Marca</label>
                            <input type="text" value={content['brand.name'] || ''} onChange={(e) => handleContentChange('brand.name', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Logo URL (Opcional, reemplaza siglas)</label>
                            {content['brand.logo_url'] && (
                              <div className="mb-3 p-2 bg-gray-50 border border-gray-100 rounded-xl w-fit">
                                <img src={content['brand.logo_url']} alt="Logo Preview" className="h-12 object-contain" />
                              </div>
                            )}
                            <div className="flex gap-2">
                              <input type="text" value={content['brand.logo_url'] || ''} onChange={(e) => handleContentChange('brand.logo_url', e.target.value)} className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" placeholder="https://..." />
                              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 border border-gray-200">
                                <Upload size={14} /> Subir
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                  if (e.target.files?.[0]) handleContentImageUpload('brand.logo_url', e.target.files[0]);
                                }} />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hero */}
                    {activeContentSection === 'hero' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tagline</label>
                            <input type="text" value={content['hero.tagline'] || ''} onChange={(e) => handleContentChange('hero.tagline', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Título Principal (Soporta HTML como &lt;br/&gt;)</label>
                            <textarea rows={2} value={content['hero.title'] || ''} onChange={(e) => handleContentChange('hero.title', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Descripción Corta</label>
                            <textarea rows={2} value={content['hero.description'] || ''} onChange={(e) => handleContentChange('hero.description', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Texto Botón Primario</label>
                            <input type="text" value={content['hero.btn_primary'] || ''} onChange={(e) => handleContentChange('hero.btn_primary', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Texto Botón Secundario</label>
                            <input type="text" value={content['hero.btn_secondary'] || ''} onChange={(e) => handleContentChange('hero.btn_secondary', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mensaje WhatsApp del Botón Donar</label>
                            <input type="text" value={content['hero.donate_msg'] || ''} onChange={(e) => handleContentChange('hero.donate_msg', e.target.value)} placeholder="¡Hola! Quiero hacer una donación a la Fundación..." className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                            <p className="text-[10px] text-gray-400">Este mensaje se envía automáticamente al abrir WhatsApp. Requiere tener configurado el número de WhatsApp en la sección Footer.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* About */}
                    {activeContentSection === 'about' && (
                      <div className="space-y-4">
                        {/* 1. Información General */}
                        <details className="group border border-gray-200 rounded-xl bg-white overflow-hidden" open>
                          <summary className="px-5 py-4 font-semibold text-gray-900 cursor-pointer bg-gray-50 flex items-center justify-between list-none [&::-webkit-details-marker]:hidden select-none hover:bg-gray-100 transition-colors">
                            <span className="text-sm">Información General</span>
                            <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="p-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Título de Sección (Soporta HTML)</label>
                              <textarea rows={2} value={content['about.section_title'] || ''} onChange={(e) => handleContentChange('about.section_title', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Descripción Breve</label>
                              <textarea rows={4} value={content['about.description'] || ''} onChange={(e) => handleContentChange('about.description', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                            </div>
                          </div>
                        </details>

                        {/* 2. Nuestra Historia */}
                        <details className="group border border-gray-200 rounded-xl bg-white overflow-hidden">
                          <summary className="px-5 py-4 font-semibold text-gray-900 cursor-pointer bg-gray-50 flex items-center justify-between list-none [&::-webkit-details-marker]:hidden select-none hover:bg-gray-100 transition-colors">
                            <span className="text-sm">Nuestra Historia</span>
                            <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="p-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Texto Destacado (Lead)</label>
                              <textarea rows={2} value={content['about.history_lead'] || ''} onChange={(e) => handleContentChange('about.history_lead', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Párrafo 1</label>
                              <textarea rows={2} value={content['about.history_p1'] || ''} onChange={(e) => handleContentChange('about.history_p1', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Párrafo 2</label>
                              <textarea rows={2} value={content['about.history_p2'] || ''} onChange={(e) => handleContentChange('about.history_p2', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Párrafo 3</label>
                              <textarea rows={2} value={content['about.history_p3'] || ''} onChange={(e) => handleContentChange('about.history_p3', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Párrafo 4</label>
                              <textarea rows={2} value={content['about.history_p4'] || ''} onChange={(e) => handleContentChange('about.history_p4', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                            </div>
                          </div>
                        </details>

                        {/* 3. Imágenes de la Sección */}
                        <details className="group border border-gray-200 rounded-xl bg-white overflow-hidden">
                          <summary className="px-5 py-4 font-semibold text-gray-900 cursor-pointer bg-gray-50 flex items-center justify-between list-none [&::-webkit-details-marker]:hidden select-none hover:bg-gray-100 transition-colors">
                            <span className="text-sm">Imágenes de la Sección</span>
                            <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="p-5 border-t border-gray-100 space-y-6">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Imagen Principal (URL)</label>
                              {content['about.image_main'] && (
                                <div className="mb-3 p-1 bg-gray-50 border border-gray-100 rounded-xl w-fit">
                                  <img src={content['about.image_main']} alt="Preview" className="h-20 rounded-lg object-cover" />
                                </div>
                              )}
                              <div className="flex gap-2">
                                <input type="text" value={content['about.image_main'] || ''} onChange={(e) => handleContentChange('about.image_main', e.target.value)} className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center border border-gray-200">
                                  <Upload size={14} />
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => { if(e.target.files?.[0]) handleContentImageUpload('about.image_main', e.target.files[0]); }} />
                                </label>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Imagen Flotante (URL)</label>
                              {content['about.image_floating'] && (
                                <div className="mb-3 p-1 bg-gray-50 border border-gray-100 rounded-xl w-fit">
                                  <img src={content['about.image_floating']} alt="Preview" className="h-20 rounded-lg object-cover" />
                                </div>
                              )}
                              <div className="flex gap-2">
                                <input type="text" value={content['about.image_floating'] || ''} onChange={(e) => handleContentChange('about.image_floating', e.target.value)} className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center border border-gray-200">
                                  <Upload size={14} />
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => { if(e.target.files?.[0]) handleContentImageUpload('about.image_floating', e.target.files[0]); }} />
                                </label>
                              </div>
                            </div>
                          </div>
                        </details>

                        {/* 4. Misión y Visión */}
                        <details className="group border border-gray-200 rounded-xl bg-white overflow-hidden">
                          <summary className="px-5 py-4 font-semibold text-gray-900 cursor-pointer bg-gray-50 flex items-center justify-between list-none [&::-webkit-details-marker]:hidden select-none hover:bg-gray-100 transition-colors">
                            <span className="text-sm">Misión y Visión</span>
                            <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="p-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Título Misión</label>
                              <input type="text" value={content['about.mission_title'] || ''} onChange={(e) => handleContentChange('about.mission_title', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Texto Misión</label>
                              <textarea rows={4} value={content['about.mission_body'] || ''} onChange={(e) => handleContentChange('about.mission_body', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Título Visión</label>
                              <input type="text" value={content['about.vision_title'] || ''} onChange={(e) => handleContentChange('about.vision_title', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Texto Visión</label>
                              <textarea rows={4} value={content['about.vision_body'] || ''} onChange={(e) => handleContentChange('about.vision_body', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                            </div>
                          </div>
                        </details>

                        {/* 5. Cita / Testimonio */}
                        <details className="group border border-gray-200 rounded-xl bg-white overflow-hidden">
                          <summary className="px-5 py-4 font-semibold text-gray-900 cursor-pointer bg-gray-50 flex items-center justify-between list-none [&::-webkit-details-marker]:hidden select-none hover:bg-gray-100 transition-colors">
                            <span className="text-sm">Citas / Testimonios</span>
                            <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="p-5 border-t border-gray-100 space-y-6">
                            {parsedTestimonials.map((t, idx) => (
                              <details key={idx} className="group/testimonio relative border border-gray-200 rounded-xl bg-white overflow-hidden" open={idx === 0}>
                                <summary className="px-4 py-3 font-medium text-gray-800 cursor-pointer bg-gray-50 flex items-center justify-between list-none [&::-webkit-details-marker]:hidden select-none hover:bg-gray-100 transition-colors">
                                  <span className="text-sm">Testimonio {idx + 1} {t.author ? `- ${t.author}` : ''}</span>
                                  <div className="flex items-center gap-3">
                                    {parsedTestimonials.length > 1 && (
                                      <button onClick={(e) => { e.preventDefault(); handleRemoveTestimonial(idx); }} className="p-1 text-[#872075] hover:bg-[#872075]/10 rounded transition-colors" title="Eliminar testimonio">
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                    <ChevronDown className="w-4 h-4 text-gray-400 group-open/testimonio:rotate-180 transition-transform" />
                                  </div>
                                </summary>
                                <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1 sm:col-span-2">
                                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cita / Testimonio (Soporta HTML)</label>
                                      <textarea rows={2} value={t.text || ''} onChange={(e) => handleTestimonialChange(idx, 'text', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Autor de la cita</label>
                                      <input type="text" value={t.author || ''} onChange={(e) => handleTestimonialChange(idx, 'author', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rol / Relación</label>
                                      <input type="text" value={t.role || ''} onChange={(e) => handleTestimonialChange(idx, 'role', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                                    </div>
                                    <div className="space-y-1 sm:col-span-2">
                                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Foto del Autor (URL)</label>
                                      {t.image && (
                                        <div className="mb-3 p-1 bg-white border border-gray-200 rounded-full w-fit overflow-hidden shadow-sm">
                                          <img src={t.image} alt="Preview" className="h-12 w-12 rounded-full object-cover" />
                                        </div>
                                      )}
                                      <div className="flex gap-2">
                                        <input type="text" value={t.image || ''} onChange={(e) => handleTestimonialChange(idx, 'image', e.target.value)} className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                                        <label className="cursor-pointer bg-white hover:bg-gray-100 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 border border-gray-200 shadow-sm transition-colors">
                                          <Upload size={14} /> Subir
                                          <input type="file" className="hidden" accept="image/*" onChange={(e) => { if(e.target.files?.[0]) handleTestimonialImageUpload(idx, e.target.files[0]); }} />
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </details>
                            ))}
                            <button onClick={handleAddTestimonial} className="w-full py-3 border border-dashed border-[#872075]/30 rounded-xl text-[#872075] font-semibold text-sm hover:bg-[#872075]/5 flex items-center justify-center gap-2 transition-colors">
                              <Plus size={16} /> Agregar Testimonio
                            </button>
                          </div>
                        </details>
                      </div>
                    )}

                    {/* Footer & Contact */}
                    {activeContentSection === 'footer' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Descripción en Footer</label>
                            <textarea rows={2} value={content['footer.brand_description'] || ''} onChange={(e) => handleContentChange('footer.brand_description', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Título CTA Footer</label>
                            <input type="text" value={content['footer.cta_title'] || ''} onChange={(e) => handleContentChange('footer.cta_title', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Teléfono Principal</label>
                            <input type="text" value={content['footer.phone1'] || ''} onChange={(e) => handleContentChange('footer.phone1', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Teléfono Secundario</label>
                            <input type="text" value={content['footer.phone2'] || ''} onChange={(e) => handleContentChange('footer.phone2', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">WhatsApp (código país + número, ej: 573001234567)</label>
                            <input type="text" value={content['footer.whatsapp'] || ''} onChange={(e) => handleContentChange('footer.whatsapp', e.target.value)} placeholder="573001234567" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email de Contacto</label>
                            <input type="email" value={content['footer.email'] || ''} onChange={(e) => handleContentChange('footer.email', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dirección Física</label>
                            <input type="text" value={content['footer.address'] || ''} onChange={(e) => handleContentChange('footer.address', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Link Facebook</label>
                            <input type="url" value={content['footer.url_facebook'] || ''} onChange={(e) => handleContentChange('footer.url_facebook', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Link Instagram</label>
                            <input type="url" value={content['footer.url_instagram'] || ''} onChange={(e) => handleContentChange('footer.url_instagram', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Link X (Twitter)</label>
                            <input type="url" value={content['footer.url_twitter'] || ''} onChange={(e) => handleContentChange('footer.url_twitter', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Volunteer */}
                    {activeContentSection === 'volunteer' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Título del Formulario (Popup)</label>
                            <input type="text" value={content['volunteer.title'] || ''} onChange={(e) => handleContentChange('volunteer.title', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Descripción del Formulario</label>
                            <textarea rows={3} value={content['volunteer.description'] || ''} onChange={(e) => handleContentChange('volunteer.description', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Áreas de Interés (Separadas por comas)</label>
                            <input type="text" value={content['volunteer.areas'] || ''} onChange={(e) => handleContentChange('volunteer.areas', e.target.value)} placeholder="Ej: Educación y Capacitación, Salud y Asistencia Social, Obras Sociales..." className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#872075] outline-none" />
                            <p className="text-[10px] text-gray-400">Estas serán las opciones que los usuarios podrán seleccionar como interés.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end gap-4 border-t border-gray-100 pt-6">
                      <button
                        type="submit"
                        disabled={isSavingContent}
                        className="group bg-[#872075] hover:bg-[#6a195c] text-white disabled:bg-[#872075]/60 text-sm font-semibold rounded-full pl-6 pr-2 py-2 flex items-center justify-center gap-4 transition-all duration-300 shadow-md shadow-[#872075]/10 cursor-pointer"
                      >
                        {isSavingContent ? (
                          <>
                            <span>Guardando...</span>
                            <div className="w-6 h-6 bg-white/10 text-white rounded-full flex items-center justify-center shrink-0">
                              <Loader2 size={12} className="animate-spin" />
                            </div>
                          </>
                        ) : (
                          <>
                            <span>Guardar {
                              activeContentSection === 'brand' ? 'Branding' :
                              activeContentSection === 'hero' ? 'Hero' :
                              activeContentSection === 'about' ? 'Nosotros' :
                              activeContentSection === 'volunteer' ? 'Voluntariado' : 'Footer'
                            }</span>
                            <div className="w-6 h-6 bg-white text-[#872075] rounded-full flex items-center justify-center shrink-0 transition-all duration-300">
                              <ArrowRight size={12} />
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Tab 5: Gallery */}
              {activeTab === 'gallery' && (
                <AdminGalleryTab token={token} showNotification={showNotification} />
              )}

              {/* Tab 6: News */}
              {activeTab === 'news' && (
                <AdminNewsTab token={token} showNotification={showNotification} />
              )}

              {/* Tab 7: Forms */}
              {activeTab === 'forms' && (
                <AdminFormsTab token={token} showNotification={showNotification} />
              )}
            </>
          )}
        </div>
        </div>
      </section>

      {/* Service CRUD modal */}
      {isServiceModalOpen && editingService && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 py-5 border-b border-gray-200/55 shrink-0">
              <h3 className="text-lg font-medium text-gray-900">
                {editingService.id ? 'Editar Área de Servicio' : 'Nueva Área de Servicio'}
              </h3>
              <button
                onClick={() => {
                  setIsServiceModalOpen(false);
                  setEditingService(null);
                }}
                className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              <form onSubmit={handleSaveService} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_80px] gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      Título del Servicio
                    </label>
                    <input
                      type="text"
                      value={editingService.title || ''}
                      onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                      placeholder="Ej. Obras Sociales Directas"
                      className="w-full bg-transparent border-b border-gray-200 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#872075] transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      Número
                    </label>
                    <input
                      type="text"
                      value={editingService.number || ''}
                      onChange={(e) => setEditingService({ ...editingService, number: e.target.value })}
                      placeholder="06"
                      className="w-full bg-transparent border-b border-gray-200 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#872075] transition-all text-center"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Descripción
                  </label>
                  <textarea
                    rows={4}
                    value={editingService.description || ''}
                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                    placeholder="Describe los alcances y actividades de este servicio de manera detallada..."
                    className="w-full bg-transparent border-b border-gray-200 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#872075] transition-all resize-none"
                  />
                </div>

                {/* Image Section */}
                <div className="space-y-3">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Imagen del Servicio
                  </label>

                  {/* Mode Tabs */}
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        imageMode === 'url'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Link size={11} /> URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        imageMode === 'upload'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Upload size={11} /> Subir Archivo
                    </button>
                  </div>

                  {/* URL mode */}
                  {imageMode === 'url' && (
                    <input
                      type="url"
                      value={editingService.image_url || ''}
                      onChange={(e) => {
                        setEditingService({ ...editingService, image_url: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-transparent border-b border-gray-200 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#872075] transition-all"
                    />
                  )}

                  {/* Upload mode */}
                  {imageMode === 'upload' && (
                    <label
                      htmlFor="image-file-input"
                      className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 hover:border-[#872075] rounded-xl cursor-pointer transition-colors bg-gray-50/50 hover:bg-[#872075]/5"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImageFileChange(file);
                      }}
                    >
                      <Upload size={20} className="text-gray-400 mb-2" />
                      <span className="text-xs font-semibold text-gray-500">
                        {imageFile ? imageFile.name : 'Arrastra o haz clic para seleccionar'}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WEBP, GIF · Max recomendado 5MB</span>
                      <input
                        id="image-file-input"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={(e) => handleImageFileChange(e.target.files?.[0] || null)}
                      />
                    </label>
                  )}

                  {/* Preview */}
                  {imagePreview && (
                    <div className="relative h-32 w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                        onError={() => setImagePreview('')}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setImageFile(null);
                          setEditingService({ ...editingService, image_url: '' });
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="is_full_width"
                    checked={editingService.is_full_width || false}
                    onChange={(e) => setEditingService({ ...editingService, is_full_width: e.target.checked })}
                    className="w-4 h-4 text-[#872075] border-gray-300 rounded focus:ring-[#872075]"
                  />
                  <label htmlFor="is_full_width" className="text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer">
                    Destacar en Ancho Completo
                  </label>
                </div>

                {serviceFormError && (
                  <p className="text-xs font-semibold text-red-500">{serviceFormError}</p>
                )}

                <div className="flex justify-end gap-4 border-t border-gray-100 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsServiceModalOpen(false);
                      setEditingService(null);
                    }}
                    className="py-3 px-6 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 text-sm font-semibold rounded-full transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingService || isUploadingImage}
                    className="group bg-[#872075] hover:bg-[#6a195c] text-white disabled:bg-[#872075]/60 text-sm font-semibold rounded-full pl-6 pr-2 py-2 flex items-center justify-center gap-4 transition-all duration-300 shadow-md shadow-[#872075]/10 cursor-pointer"
                  >
                    {isSavingService || isUploadingImage ? (
                      <>
                        <span>{isUploadingImage ? 'Subiendo imagen...' : 'Guardando...'}</span>
                        <div className="w-6 h-6 bg-white/10 text-white rounded-full flex items-center justify-center shrink-0">
                          <Loader2 size={12} className="animate-spin" />
                        </div>
                      </>
                    ) : (
                      <>
                        <span>Guardar Cambios</span>
                        <div className="w-6 h-6 bg-white text-[#872075] rounded-full flex items-center justify-center shrink-0 transition-all duration-300">
                          <ArrowRight size={12} />
                        </div>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Global Notification Toast */}
      {notification && createPortal(
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border ${
          notification.type === 'success' 
            ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]' 
            : 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]'
        } animate-in fade-in slide-in-from-bottom-4 duration-300`}>
          {notification.type === 'success' ? (
            <div className="w-8 h-8 rounded-full bg-[#dcfce3] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#fee2e2] flex items-center justify-center shrink-0">
              <X size={16} className="text-[#dc2626]" />
            </div>
          )}
          <p className="text-sm font-medium">{notification.message}</p>
        </div>,
        document.body
      )}
    </main>
  );
}

