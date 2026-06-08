import { useState, useEffect } from 'react';
import { X, Loader2, Heart } from 'lucide-react';
import { Shader, ChromaFlow } from 'shaders/react';
import type { CustomForm } from '../types';

interface DynamicFormModalProps {
  formId: number;
  onClose: () => void;
}

export default function DynamicFormModal({ formId, onClose }: DynamicFormModalProps) {
  const [form, setForm] = useState<CustomForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Disable scroll on body when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    fetch(`https://mujerereslibre-backend.onrender.com/api/forms`)
      .then(res => res.json())
      .then(data => {
        const foundForm = data.find((f: CustomForm) => f.id === formId);
        setForm(foundForm || null);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Error al cargar el formulario.');
        setIsLoading(false);
      });
  }, [formId]);

  const handleChange = (fieldLabel: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldLabel]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`https://mujerereslibre-backend.onrender.com/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: JSON.stringify(formData) })
      });

      if (!res.ok) throw new Error('Error al enviar el formulario');
      
      setIsSuccess(true);
    } catch (e: any) {
      setError(e.message || 'Error desconocido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Background with ChromaFlow effect */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        <Shader className="absolute inset-0 w-full h-full">
          <ChromaFlow 
            baseColor="#ffffff" 
            downColor="#872075" 
            leftColor="#A3298D" 
            rightColor="#69185A" 
            upColor="#872075" 
            momentum={13} 
            radius={3.5}
          />
        </Shader>
        {/* Apple liquid glass overlay blur */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-3xl"></div>
      </div>

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg bg-white/70 backdrop-blur-3xl border border-white/50 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-500">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 text-gray-700 transition-colors"
        >
          <X size={16} />
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#872075]" />
            <p className="text-sm font-medium text-gray-600">Cargando formulario...</p>
          </div>
        ) : !form ? (
          <div className="text-center py-12">
            <p className="text-gray-800 font-semibold mb-2">Formulario no encontrado</p>
            <p className="text-gray-500 text-sm">Este formulario ya no está disponible o ha sido eliminado.</p>
          </div>
        ) : isSuccess ? (
          <div className="text-center py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-[#872075]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-[#872075]" fill="currentColor" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">¡Enviado con Éxito!</h3>
            <p className="text-gray-600 mb-8">Hemos recibido tu información. Gracias por contactarnos.</p>
            <button 
              onClick={onClose}
              className="bg-[#872075] text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-[#872075]/20 hover:bg-[#6a195c] transition-all"
            >
              Cerrar Ventana
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 pr-8">
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-3">{form.title}</h2>
              {form.description && (
                <p className="text-gray-600 leading-relaxed text-sm">{form.description}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {form.fields.map(field => (
                <div key={field.id} className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">
                    {field.label} {field.required && <span className="text-[#872075]">*</span>}
                  </label>
                  
                  {field.field_type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      rows={4}
                      onChange={e => handleChange(field.label, e.target.value)}
                      className="w-full bg-white/50 border border-white/40 focus:border-[#872075]/50 focus:bg-white/80 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all resize-none shadow-sm"
                      placeholder="Tu respuesta..."
                    />
                  ) : field.field_type === 'select' ? (
                    <div className="relative">
                      <select
                        required={field.required}
                        onChange={e => handleChange(field.label, e.target.value)}
                        className="w-full bg-white/50 border border-white/40 focus:border-[#872075]/50 focus:bg-white/80 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none transition-all shadow-sm appearance-none"
                      >
                        <option value="">Selecciona una opción...</option>
                        {field.options?.split(',').map(opt => (
                          <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <input
                      type={field.field_type === 'number' ? 'number' : field.field_type === 'email' ? 'email' : 'text'}
                      required={field.required}
                      onChange={e => handleChange(field.label, e.target.value)}
                      className="w-full bg-white/50 border border-white/40 focus:border-[#872075]/50 focus:bg-white/80 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all shadow-sm"
                      placeholder={field.field_type === 'email' ? 'ejemplo@correo.com' : 'Tu respuesta...'}
                    />
                  )}
                </div>
              ))}

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#872075] to-[#6a195c] hover:opacity-90 text-white font-semibold py-4 px-6 rounded-2xl shadow-xl shadow-[#872075]/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Formulario'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
