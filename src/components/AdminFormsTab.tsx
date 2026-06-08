import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, List, Table, Loader2 } from 'lucide-react';
import type { CustomForm, CustomFormField, CustomFormSubmission } from '../types';

interface AdminFormsTabProps {
  token: string | null;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

export default function AdminFormsTab({ token, showNotification }: AdminFormsTabProps) {
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for Builder
  const [editingForm, setEditingForm] = useState<CustomForm | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formFields, setFormFields] = useState<Partial<CustomFormField>[]>([]);

  // States for Submissions
  const [viewingSubmissionsFormId, setViewingSubmissionsFormId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<CustomFormSubmission[]>([]);

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://mujerereslibre-backend.onrender.com/api/forms');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setForms(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      showNotification('Error al cargar formularios', 'error');
      setForms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const openCreate = () => {
    setEditingForm(null);
    setFormTitle('');
    setFormDesc('');
    setFormFields([]);
    setIsCreating(true);
  };

  const openEdit = (f: CustomForm) => {
    setEditingForm(f);
    setFormTitle(f.title);
    setFormDesc(f.description || '');
    setFormFields(f.fields);
    setIsCreating(true);
  };

  const closeBuilder = () => {
    setIsCreating(false);
    setEditingForm(null);
  };

  const addField = () => {
    setFormFields([...formFields, { label: '', field_type: 'text', required: false }]);
  };

  const updateField = (index: number, key: keyof CustomFormField, value: any) => {
    const updated = [...formFields];
    updated[index] = { ...updated[index], [key]: value };
    setFormFields(updated);
  };

  const removeField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const handleSaveForm = async () => {
    if (!formTitle) return showNotification('El título es obligatorio', 'error');
    if (formFields.length === 0) return showNotification('Debes agregar al menos un campo', 'error');
    
    // Validate fields
    for (const f of formFields) {
      if (!f.label) return showNotification('Todos los campos deben tener una etiqueta', 'error');
    }

    try {
      const payload = {
        title: formTitle,
        description: formDesc,
        is_active: true,
        fields: formFields.map(f => ({
          label: f.label,
          field_type: f.field_type,
          required: f.required || false,
          options: f.options || null
        }))
      };

      const url = editingForm ? `/api/forms/${editingForm.id}` : '/api/forms';
      const method = editingForm ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Error al guardar formulario');
      showNotification(editingForm ? 'Formulario actualizado' : 'Formulario creado', 'success');
      closeBuilder();
      fetchForms();
    } catch (e: any) {
      showNotification(e.message, 'error');
    }
  };

  const handleDeleteForm = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar este formulario y todas sus respuestas?')) return;
    try {
      await fetch(`https://mujerereslibre-backend.onrender.com/api/forms/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      showNotification('Formulario eliminado', 'success');
      fetchForms();
    } catch (e: any) {
      showNotification(e.message, 'error');
    }
  };

  const openSubmissions = async (formId: number) => {
    setViewingSubmissionsFormId(formId);
    setSubmissions([]);
    try {
      const res = await fetch(`https://mujerereslibre-backend.onrender.com/api/forms/${formId}/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSubmissions(await res.json());
    } catch (e: any) {
      showNotification('Error al cargar respuestas: ' + e.message, 'error');
    }
  };

  if (viewingSubmissionsFormId) {
    const activeForm = forms.find(f => f.id === viewingSubmissionsFormId);
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Respuestas: {activeForm?.title}</h2>
          <button onClick={() => setViewingSubmissionsFormId(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <X size={16} /> Volver
          </button>
        </div>
        
        {submissions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
            No hay respuestas para este formulario todavía.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="p-4">Fecha</th>
                  {(activeForm?.fields || []).map(f => (
                    <th key={f.id} className="p-4">{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map(sub => {
                  const data = JSON.parse(sub.data || '{}');
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-500 whitespace-nowrap">
                        {new Date(sub.created_at).toLocaleString()}
                      </td>
                      {(activeForm?.fields || []).map(f => (
                        <td key={f.id} className="p-4 text-gray-900">{data[f.label] || '-'}</td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="flex flex-col h-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{editingForm ? 'Editar Formulario' : 'Nuevo Formulario'}</h2>
          <div className="flex gap-3">
            <button onClick={closeBuilder} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSaveForm} className="px-4 py-2 bg-[#872075] text-white rounded-lg hover:bg-[#6a195c] flex items-center gap-2">
              <Save size={16} /> Guardar
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título del Formulario</label>
              <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#872075] focus:border-transparent outline-none" placeholder="Ej. Inscripción Taller de Liderazgo" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#872075] focus:border-transparent outline-none" placeholder="Breve descripción o instrucciones para el usuario..." rows={3}></textarea>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Campos del Formulario</h3>
          
          {formFields.map((field, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
              <button onClick={() => removeField(idx)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={18} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Pregunta / Etiqueta</label>
                  <input type="text" value={field.label || ''} onChange={e => updateField(idx, 'label', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded bg-white outline-none focus:border-[#872075]" placeholder="Ej. Nombre completo" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Respuesta</label>
                  <select value={field.field_type || 'text'} onChange={e => updateField(idx, 'field_type', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded bg-white outline-none focus:border-[#872075]">
                    <option value="text">Texto corto</option>
                    <option value="textarea">Texto largo (Párrafo)</option>
                    <option value="email">Correo electrónico</option>
                    <option value="select">Opciones múltiples (Desplegable)</option>
                  </select>
                </div>
              </div>

              {field.field_type === 'select' && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Opciones (separadas por coma)</label>
                  <input type="text" value={field.options || ''} onChange={e => updateField(idx, 'options', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded bg-white outline-none focus:border-[#872075]" placeholder="Ej. Opción 1, Opción 2, Opción 3" />
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <input type="checkbox" id={`req-${idx}`} checked={field.required || false} onChange={e => updateField(idx, 'required', e.target.checked)} className="w-4 h-4 text-[#872075] focus:ring-[#872075] border-gray-300 rounded" />
                <label htmlFor={`req-${idx}`} className="text-sm text-gray-700">Respuesta obligatoria</label>
              </div>
            </div>
          ))}

          <button onClick={addField} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-[#872075] hover:text-[#872075] transition-colors flex items-center justify-center gap-2">
            <Plus size={20} /> Añadir un nuevo campo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Formularios y Convocatorias</h2>
          <p className="text-gray-500">Crea formularios personalizados para vincular a tus noticias y recopilar datos.</p>
        </div>
        <button onClick={openCreate} className="bg-[#872075] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#6a195c] transition-colors flex items-center gap-2">
          <Plus size={20} /> Crear Formulario
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={40} className="animate-spin text-[#872075]" />
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200">
          <List size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay formularios</h3>
          <p className="text-gray-500 mb-6">Aún no has creado ningún formulario.</p>
          <button onClick={openCreate} className="text-[#872075] font-semibold hover:underline">¡Crea el primero ahora!</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map(form => (
            <div key={form.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">{form.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${form.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {form.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {form.description && <p className="text-sm text-gray-500 line-clamp-2 mb-4">{form.description}</p>}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <List size={16} /> {(form.fields || []).length} campos
                </div>
              </div>
              <div className="bg-gray-50 border-t border-gray-200 p-3 flex justify-between">
                <button onClick={() => openSubmissions(form.id)} className="text-[#872075] hover:bg-[#872075]/10 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                  <Table size={16} /> Respuestas
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(form)} className="p-2 text-gray-500 hover:text-[#872075] hover:bg-white rounded-lg transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDeleteForm(form.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-white rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
