import { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Eraser } from 'lucide-react';

interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (!editorRef.current.contains(document.activeElement)) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const exec = (command: string, val: string | undefined = undefined) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML || '');
  };

  const handleLink = () => {
    const url = prompt('Ingresa la URL del enlace:');
    if (url) exec('createLink', url);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 bg-gray-50 p-2">
        <button type="button" onClick={() => exec('bold')} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors" title="Negrita"><Bold size={16}/></button>
        <button type="button" onClick={() => exec('italic')} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors" title="Cursiva"><Italic size={16}/></button>
        <button type="button" onClick={() => exec('underline')} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors" title="Subrayado"><Underline size={16}/></button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={() => exec('insertUnorderedList')} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors" title="Viñetas"><List size={16}/></button>
        <button type="button" onClick={() => exec('insertOrderedList')} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors" title="Lista numerada"><ListOrdered size={16}/></button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={handleLink} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors" title="Enlace"><LinkIcon size={16}/></button>
        <button type="button" onClick={() => exec('removeFormat')} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors" title="Limpiar formato"><Eraser size={16}/></button>
      </div>
      <div 
        ref={editorRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        className="p-4 min-h-[160px] outline-none text-sm text-gray-800 prose prose-sm max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
        data-placeholder={placeholder}
      />
    </div>
  );
}
