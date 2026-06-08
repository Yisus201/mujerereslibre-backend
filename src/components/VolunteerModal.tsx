import { useState, useEffect, useRef } from 'react';
import { X, Loader2, ArrowRight } from 'lucide-react';
import type { SiteContent } from '../types';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: SiteContent;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  interest?: string;
  message?: string;
}

const getInterestAreas = (areasStr?: string) => {
  if (!areasStr) {
    return [
      { id: 'educacion', label: 'Educación y Capacitación' },
      { id: 'salud', label: 'Salud y Asistencia Social' },
      { id: 'vivienda', label: 'Desarrollo y Vivienda' },
      { id: 'cultura', label: 'Comunicación y Cultura' },
      { id: 'obras', label: 'Obras Sociales' },
    ];
  }
  return areasStr.split(',').map(area => ({
    id: area.trim().toLowerCase().replace(/\s+/g, '-'),
    label: area.trim()
  }));
};

export default function VolunteerModal({ isOpen, onClose, content }: VolunteerModalProps) {
  const interestAreas = getInterestAreas(content['volunteer.areas']);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    interest: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Handle mounting and unmounting animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        setIsAnimating(true);
        firstInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      document.body.style.overflow = '';
      const timer = setTimeout(() => {
        setShouldRender(false);
        // Reset states on exit
        setFormData({
          name: '',
          email: '',
          phone: '',
          interest: '',
          message: '',
        });
        setErrors({});
        setTouched({});
        setIsSuccess(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const validateField = (name: string, value: string): string => {
    if (!value.trim()) {
      if (name === 'interest') return 'Por favor selecciona un área de interés.';
      return 'Este campo es obligatorio.';
    }

    if (name === 'name' && value.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres.';
    }

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Ingresa un correo electrónico válido.';
      }
    }

    if (name === 'phone') {
      const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
      if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 7) {
        return 'Ingresa un número de teléfono válido (mínimo 7 dígitos).';
      }
    }

    if (name === 'message' && value.trim().length < 10) {
      return 'El mensaje debe tener al menos 10 caracteres.';
    }

    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleInterestSelect = (interestId: string) => {
    setFormData((prev) => ({ ...prev, interest: interestId }));
    setTouched((prev) => ({ ...prev, interest: true }));
    setErrors((prev) => ({ ...prev, interest: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allTouched = {
      name: true,
      email: true,
      phone: true,
      interest: true,
      message: true,
    };
    setTouched(allTouched);

    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof FormState]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      
      fetch('https://mujerereslibre-backend.onrender.com/api/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to submit');
          return res.json();
        })
        .then(() => {
          setIsSubmitting(false);
          setIsSuccess(true);
        })
        .catch((err) => {
          console.error("Error submitting volunteer:", err);
          setErrors((prev) => ({
            ...prev,
            message: 'Ocurrió un error al enviar tu solicitud. Intenta nuevamente.',
          }));
          setIsSubmitting(false);
        });
    } else {
      const firstErrorField = Object.keys(newErrors)[0];
      if (firstErrorField !== 'interest') {
        const el = document.getElementsByName(firstErrorField)[0];
        if (el) (el as HTMLElement).focus();
      }
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
        isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`relative w-full max-w-lg bg-[#FAFAFA]/95 border border-white/60 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300 ease-out transform ${
          isAnimating ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200/55 shrink-0">
          <h3 className="text-xl font-medium tracking-tight text-gray-900">{content['volunteer.title']}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors duration-200"
            aria-label="Cerrar modal"
          >
            <X size={14} className="stroke-[1.5]" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              <p className="text-[14px] text-gray-600 leading-relaxed">
                {content['volunteer.description']}
              </p>

              {/* Nombre completo */}
              <div className="space-y-1">
                <label htmlFor="name" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Nombre Completo
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Tu nombre y apellido"
                  className={`w-full bg-transparent border-b py-3 text-[16px] text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                    errors.name && touched.name
                      ? 'border-red-500/80 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#872075]'
                  }`}
                />
                {errors.name && touched.name && (
                  <p className="text-xs font-medium text-red-500 mt-1 pl-0.5">{errors.name}</p>
                )}
              </div>

              {/* Correo Electrónico */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="correo@ejemplo.com"
                  className={`w-full bg-transparent border-b py-3 text-[16px] text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                    errors.email && touched.email
                      ? 'border-red-500/80 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#872075]'
                  }`}
                />
                {errors.email && touched.email && (
                  <p className="text-xs font-medium text-red-500 mt-1 pl-0.5">{errors.email}</p>
                )}
              </div>

              {/* Teléfono / WhatsApp */}
              <div className="space-y-1">
                <label htmlFor="phone" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej. 300 123 4567"
                  className={`w-full bg-transparent border-b py-3 text-[16px] text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                    errors.phone && touched.phone
                      ? 'border-red-500/80 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#872075]'
                  }`}
                />
                {errors.phone && touched.phone && (
                  <p className="text-xs font-medium text-red-500 mt-1 pl-0.5">{errors.phone}</p>
                )}
              </div>

              {/* Área de Interés */}
              <div className="space-y-3">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Área de Interés
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {interestAreas.map((area) => {
                    const isSelected = formData.interest === area.id;
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => handleInterestSelect(area.id)}
                        className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-full border transition-all duration-300 ${
                          isSelected
                            ? 'bg-[#872075] border-[#872075] text-white font-bold scale-[1.02] shadow-[0_4px_12px_rgba(135,32,117,0.15)]'
                            : 'bg-white/60 hover:bg-white border-gray-200 text-gray-700 hover:text-gray-900 hover:border-gray-300'
                        }`}
                      >
                        {area.label}
                      </button>
                    );
                  })}
                </div>
                {errors.interest && touched.interest && (
                  <p className="text-xs font-medium text-red-500 mt-1 pl-0.5">{errors.interest}</p>
                )}
              </div>

              {/* Mensaje / Motivación */}
              <div className="space-y-1">
                <label htmlFor="message" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  ¿Por qué quieres unirte?
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Cuéntanos brevemente qué te motiva y cómo deseas aportar..."
                  className={`w-full bg-transparent border-b py-3 text-[16px] text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-300 resize-none ${
                    errors.message && touched.message
                      ? 'border-red-500/80 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#872075]'
                  }`}
                />
                {errors.message && touched.message && (
                  <p className="text-xs font-medium text-red-500 mt-1 pl-0.5">{errors.message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-5 pt-4 border-t border-gray-200/55 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-6 border border-gray-200 hover:border-gray-300 hover:bg-black/5 text-gray-700 hover:text-gray-900 text-sm font-semibold rounded-full transition-all duration-200"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group bg-[#872075] hover:bg-[#6a195c] text-white disabled:bg-[#872075]/50 disabled:text-white/60 text-sm font-semibold rounded-full pl-6 pr-2 py-2 flex items-center justify-center gap-4 transition-all duration-300 shadow-md shadow-[#872075]/10 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span>Enviando Solicitud</span>
                      <div className="w-7 h-7 bg-white/10 text-white rounded-full flex items-center justify-center shrink-0">
                        <Loader2 size={14} className="animate-spin" />
                      </div>
                    </>
                  ) : (
                    <>
                      <span>Enviar Solicitud</span>
                      <div className="w-7 h-7 bg-white text-[#872075] rounded-full flex items-center justify-center shrink-0 transition-all duration-300">
                        <ArrowRight size={14} className="transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45" />
                      </div>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Success View */
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center space-y-6">
              <div className="w-12 h-12 rounded-full border border-[#872075]/20 bg-[#872075]/5 flex items-center justify-center text-[#872075] shadow-sm animate-pulse">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="space-y-3">
                <h4 className="text-2xl font-medium text-gray-900 tracking-tight">¡Solicitud Enviada!</h4>
                <p className="text-gray-600 text-[14px] leading-relaxed max-w-xs mx-auto">
                  Hemos registrado tus datos. Muy pronto un miembro de nuestro equipo se pondrá en contacto contigo para dar inicio a este hermoso trayecto.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="group bg-[#872075] hover:bg-[#6a195c] text-white text-sm font-semibold rounded-full px-8 py-3.5 transition-all duration-300 shadow-md shadow-[#872075]/10 cursor-pointer"
              >
                Entendido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
