'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
import { Badge } from '@/src/components/ui/badge';
import { 
  MessageCircle, 
  Bold, 
  Italic, 
  Link, 
  Code, 
  List, 
  Image, 
  Eye, 
  Edit,
  Send
} from 'lucide-react';

interface AnswerFormProps {
  questionId: string;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  initialContent?: string;
  isEditing?: boolean;
}

export function AnswerForm({ 
  questionId, 
  onSubmit, 
  onCancel, 
  placeholder = "Escribe tu respuesta aquí...",
  initialContent = "",
  isEditing = false 
}: AnswerFormProps) {
  const [content, setContent] = useState(initialContent);
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(content);
      if (!isEditing) {
        setContent('');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertFormatting = (format: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        newText = `**${selectedText || 'texto en negrita'}**`;
        cursorOffset = selectedText ? 0 : -2;
        break;
      case 'italic':
        newText = `*${selectedText || 'texto en cursiva'}*`;
        cursorOffset = selectedText ? 0 : -1;
        break;
      case 'code':
        if (selectedText.includes('\n')) {
          newText = `\`\`\`\n${selectedText || 'código aquí'}\n\`\`\``;
          cursorOffset = selectedText ? 0 : -4;
        } else {
          newText = `\`${selectedText || 'código'}\``;
          cursorOffset = selectedText ? 0 : -1;
        }
        break;
      case 'link':
        newText = `[${selectedText || 'texto del enlace'}](url)`;
        cursorOffset = selectedText ? -5 : -4;
        break;
      case 'list':
        newText = `\n- ${selectedText || 'elemento de lista'}`;
        cursorOffset = selectedText ? 0 : 0;
        break;
      case 'image':
        newText = `![${selectedText || 'descripción'}](url_de_imagen)`;
        cursorOffset = selectedText ? -17 : -16;
        break;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);

    // Set cursor position after formatting
    setTimeout(() => {
      const newCursorPos = start + newText.length + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const renderPreview = (text: string) => {
    // Simple markdown-like rendering for preview
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-2 rounded overflow-x-auto"><code>$1</code></pre>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/((<li>.*<\/li>\s*)+)/g, '<ul class="list-disc list-inside">$1</ul>')
      .replace(/\n/g, '<br>');
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            {isEditing ? 'Editar Respuesta' : 'Tu Respuesta'}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
              className={isPreview ? 'bg-purple-100 text-purple-700' : ''}
            >
              {isPreview ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isPreview ? 'Editar' : 'Vista Previa'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isPreview ? (
          <>
            {/* Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-1 mb-3 p-2 bg-gray-50 rounded-lg border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('bold')}
                className="p-2 h-8"
                title="Negrita"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('italic')}
                className="p-2 h-8"
                title="Cursiva"
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('code')}
                className="p-2 h-8"
                title="Código"
              >
                <Code className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('link')}
                className="p-2 h-8"
                title="Enlace"
              >
                <Link className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('list')}
                className="p-2 h-8"
                title="Lista"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('image')}
                className="p-2 h-8"
                title="Imagen"
              >
                <Image className="w-4 h-4" />
              </Button>
              
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Markdown soportado
                </Badge>
              </div>
            </div>

            {/* Text Editor */}
            <Textarea
              placeholder={`${placeholder}\n\nConsejos:\n• Sé específico y detallado\n• Proporciona ejemplos cuando sea posible\n• Usa formato Markdown para mejor legibilidad\n• Incluye pasos claros si es una explicación`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="mb-4 font-mono text-sm"
            />
          </>
        ) : (
          /* Preview Mode */
          <div className="mb-4">
            <div className="bg-gray-50 p-3 rounded-lg border mb-2">
              <p className="text-sm text-gray-600 mb-2 font-medium">Vista Previa:</p>
            </div>
            <div 
              className="min-h-[200px] p-4 border rounded-lg bg-white prose max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: content ? renderPreview(content) : '<p class="text-gray-400 italic">Escribe algo para ver la vista previa...</p>' 
              }}
            />
          </div>
        )}

        {/* Character Count and Guidelines */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            <span className={content.length > 50 ? 'text-green-600' : 'text-orange-500'}>
              {content.length} caracteres
            </span>
            {content.length < 50 && (
              <span className="ml-2 text-orange-500">
                (mínimo 50 caracteres para una respuesta útil)
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400">
            Ctrl+Enter para enviar
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-blue-800 font-medium mb-1">Consejos para una buena respuesta:</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Responde directamente a la pregunta</li>
            <li>• Proporciona explicaciones paso a paso</li>
            <li>• Incluye ejemplos prácticos cuando sea posible</li>
            <li>• Cita fuentes confiables si es necesario</li>
            <li>• Sé respetuoso y constructivo</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            )}
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={!content.trim() || content.length < 10 || isSubmitting}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enviando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                {isEditing ? 'Guardar Cambios' : 'Publicar Respuesta'}
              </div>
            )}
          </Button>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700">Atajos de teclado</summary>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div><kbd className="bg-gray-100 px-1 rounded">Ctrl+B</kbd> Negrita</div>
              <div><kbd className="bg-gray-100 px-1 rounded">Ctrl+I</kbd> Cursiva</div>
              <div><kbd className="bg-gray-100 px-1 rounded">Ctrl+K</kbd> Enlace</div>
              <div><kbd className="bg-gray-100 px-1 rounded">Ctrl+Enter</kbd> Enviar</div>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}