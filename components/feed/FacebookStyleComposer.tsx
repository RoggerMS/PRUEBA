'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ImageIcon,
  FileTextIcon,
  SmileIcon,
  Camera,
  BookOpen,
  HelpCircle,
  X,
  Globe,
  Users,
  Lock,
  Hash,
  AtSign,
  Video,
  GraduationCap,
  FileIcon,
  Trash2
} from 'lucide-react';
import { useCreatePost } from '@/hooks/useFeed';
import { useComposer, useComposerActions } from '@/store/feedStore';
import { VisibilityLevel } from '@/types/feed';

export function FacebookStyleComposer() {
  const { data: session } = useSession();
  const createPost = useCreatePost();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Store state
  const composer = useComposer();
  const {
    setComposerOpen,
    setComposerTab,
    setComposerText,
    setComposerMedia,
    addComposerMedia,
    removeComposerMedia,
    setComposerVisibility,
    setComposerHashtags,
    addComposerHashtag,
    removeComposerHashtag,
    setComposerSubmitting,
    resetComposer
  } = useComposerActions();
  
  // Local state for mentions and hashtag detection
  const [mentions, setMentions] = useState<string[]>([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  const trimmedText = typeof composer.text === 'string' ? composer.text.trim() : '';

  // Extract hashtags from text safely
  const extractHashtags = useCallback((text: string): string[] => {
    if (typeof text !== 'string') return [];
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1)) : [];
  }, []);

  // Extract mentions from text safely
  const extractMentions = useCallback((text: string): string[] => {
    if (typeof text !== 'string') return [];
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(mention => mention.slice(1)) : [];
  }, []);

  // Handle text change with hashtag and mention detection
  const handleTextChange = useCallback((value: string) => {
    setComposerText(value);
    
    // Extract and update hashtags
    const hashtags = extractHashtags(value);
    setComposerHashtags(hashtags);
    
    // Extract and update mentions
    const newMentions = extractMentions(value);
    setMentions(newMentions);
    
    // Check for mention suggestions
    const textarea = textareaRef.current;
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const textBeforeCursor = value.slice(0, cursorPos);
      const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);
      
      if (mentionMatch) {
        setMentionQuery(mentionMatch[1]);
        setShowMentionSuggestions(true);
        setCursorPosition(cursorPos);
      } else {
        setShowMentionSuggestions(false);
        setMentionQuery('');
      }
    }
  }, [setComposerText, setComposerHashtags, extractHashtags, extractMentions]);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      
      if (!isValidType) {
        toast.error(`${file.name} no es un tipo de archivo válido`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name} es demasiado grande (máximo 50MB)`);
        return false;
      }
      
      return true;
    });
    
    validFiles.forEach(file => addComposerMedia(file));
    
    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  }, [addComposerMedia]);

  // Get visibility icon and label
  const getVisibilityConfig = (visibility: VisibilityLevel) => {
    switch (visibility) {
      case 'public':
        return { icon: Globe, label: 'Público', description: 'Cualquiera puede ver' };
      case 'friends':
        return { icon: Users, label: 'Amigos', description: 'Solo amigos' };
      case 'university':
        return { icon: GraduationCap, label: 'Universidad', description: 'Solo tu universidad' };
      case 'private':
        return { icon: Lock, label: 'Privado', description: 'Solo tú' };
      default:
        return { icon: Globe, label: 'Público', description: 'Cualquiera puede ver' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedText && composer.media.length === 0) {
      toast.error('Agrega contenido o media para publicar');
      return;
    }

    setComposerSubmitting(true);

    try {
      await createPost.mutateAsync({
        text: trimmedText,
        kind: composer.activeTab,
        visibility: composer.visibility,
        hashtags: composer.hashtags,
        media: composer.media
      });

      resetComposer();
      setMentions([]);
      toast.success('Post publicado exitosamente');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Error al publicar el post');
    } finally {
      setComposerSubmitting(false);
    }
  };

  const openModal = (tab?: 'post' | 'note' | 'question') => {
    if (tab) {
      setComposerTab(tab);
    }
    setComposerOpen(true);
  };

  const closeModal = () => {
    setComposerOpen(false);
    // Don't reset composer immediately to allow for accidental closes
  };

  if (!session) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <p>Inicia sesión para compartir con la comunidad</p>
          <Button className="mt-2" variant="outline">
            Iniciar Sesión
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* Input inicial estilo Facebook */}
      <Card className="p-4 mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <img 
              src={session.user?.image || '/default-avatar.png'} 
              alt={session.user?.name || 'Usuario'}
              className="rounded-full"
            />
          </Avatar>
          <div 
            className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-3 cursor-pointer transition-colors"
            onClick={openModal}
          >
            <span className="text-gray-600">¿Qué estás pensando?</span>
          </div>
        </div>
        
        {/* Botones de opciones rápidas */}
        <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
          <Button
            variant="ghost"
            className="flex-1 text-gray-600 hover:bg-gray-100"
            onClick={() => openModal('note')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Apunte 📘
          </Button>
          <Button
            variant="ghost"
            className="flex-1 text-gray-600 hover:bg-gray-100"
            onClick={() => openModal('question')}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Pregunta ❓
          </Button>
          <Button
            variant="ghost"
            className="flex-1 text-gray-600 hover:bg-gray-100"
            onClick={() => {
              openModal();
              setTimeout(() => fileInputRef.current?.click(), 100);
            }}
          >
            <Camera className="h-4 w-4 mr-2" />
            Foto/Video 🖼️
          </Button>
        </div>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Modal de creación */}
      <Dialog
        open={composer.isOpen}
        onOpenChange={(open) => {
          if (open) setComposerOpen(true);
          else closeModal();
        }}
      >
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px] max-w-none max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-3 sm:pb-4">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                <AvatarImage src={session?.user?.image || ''} />
                <AvatarFallback className="text-xs sm:text-sm">{session?.user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <span className="text-sm sm:text-base">Crear publicación</span>
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Header del modal con avatar */}
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                <img 
                  src={session.user?.image || '/default-avatar.png'} 
                  alt={session.user?.name || 'Usuario'}
                  className="rounded-full"
                />
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{session.user?.name}</p>
                
                {/* Tabs - Stack on mobile */}
                <div className="mt-2 space-y-2 sm:space-y-0">
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <Button
                      type="button"
                      variant={composer.activeTab === 'post' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setComposerTab('post')}
                      className="text-xs px-2 py-1 h-7 sm:h-8 sm:px-3"
                    >
                      💬 Post
                    </Button>
                    <Button
                      type="button"
                      variant={composer.activeTab === 'note' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setComposerTab('note')}
                      className="text-xs px-2 py-1 h-7 sm:h-8 sm:px-3"
                    >
                      📚 Apunte
                    </Button>
                    <Button
                      type="button"
                      variant={composer.activeTab === 'question' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setComposerTab('question')}
                      className="text-xs px-2 py-1 h-7 sm:h-8 sm:px-3"
                    >
                      ❓ Pregunta
                    </Button>
                  </div>
                  
                  {/* Visibility selector - Full width on mobile */}
                  <Select value={composer.visibility} onValueChange={(value: VisibilityLevel) => setComposerVisibility(value)}>
                    <SelectTrigger className="w-full sm:w-32 h-8">
                      <SelectValue>
                        <div className="flex items-center space-x-1">
                          {(() => {
                            const config = getVisibilityConfig(composer.visibility);
                            const Icon = config.icon;
                            return (
                              <>
                                <Icon className="h-3 w-3" />
                                <span className="text-xs">{config.label}</span>
                              </>
                            );
                          })()} 
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Público</div>
                            <div className="text-xs text-gray-500">Cualquiera puede ver</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="friends">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Amigos</div>
                            <div className="text-xs text-gray-500">Solo amigos</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="university">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Universidad</div>
                            <div className="text-xs text-gray-500">Solo tu universidad</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center space-x-2">
                          <Lock className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Privado</div>
                            <div className="text-xs text-gray-500">Solo tú</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Área de texto principal */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder={`¿Qué quieres ${composer.activeTab === 'note' ? 'enseñar' : composer.activeTab === 'question' ? 'preguntar' : 'compartir'}?`}
                value={composer.text}
                // Pass only the textarea value to avoid runtime type errors
                onChange={(e) => handleTextChange(e.target.value)}
                className="min-h-[100px] sm:min-h-[120px] resize-none border-0 focus-visible:ring-0 text-sm sm:text-base"
                maxLength={2000}
              />
              
              {/* Mention suggestions */}
              {showMentionSuggestions && mentionQuery && (
                <div className="absolute z-10 bg-white border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                  <div className="p-2 text-sm text-gray-500">Mencionar usuarios (funcionalidad próximamente)</div>
                </div>
              )}
            </div>

            {/* Hashtags display */}
            {composer.hashtags.length > 0 && (
              <div className="mt-3">
                <div className="text-sm text-gray-600 mb-2">Hashtags:</div>
                <div className="flex flex-wrap gap-1">
                  {composer.hashtags.map((hashtag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{hashtag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Media preview */}
            {composer.media.length > 0 && (
              <div className="mt-3">
                <div className="text-sm text-gray-600 mb-2">Archivos adjuntos:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {composer.media.map((file, index) => (
                    <div key={index} className="relative group">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-full h-20 sm:h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-20 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center p-2">
                          <Video className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 flex-shrink-0" />
                          <span className="ml-2 text-xs sm:text-sm text-gray-600 truncate">{file.name}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeComposerMedia(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-75 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contador de caracteres */}
            <div className="text-right text-sm text-gray-500">
              {composer.text.length}/2000
            </div>

            {/* Sección "Agregar a tu publicación" */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3 text-gray-700">
                Agregar a tu publicación
              </h3>
              <div className="grid grid-cols-2 sm:flex sm:space-x-2 gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="flex-1 hover:bg-gray-100 h-9 sm:h-8 text-xs sm:text-sm"
                  onClick={() => {
                    const textarea = textareaRef.current;
                    if (textarea) {
                      const cursorPos = textarea.selectionStart;
                      const newText = composer.text.slice(0, cursorPos) + '😊' + composer.text.slice(cursorPos);
                      setComposerText(newText);
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(cursorPos + 2, cursorPos + 2);
                      }, 0);
                    }
                  }}
                >
                  <SmileIcon className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Emoji 🙂</span>
                  <span className="sm:hidden">😊</span>
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="flex-1 hover:bg-gray-100 h-9 sm:h-8 text-xs sm:text-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Fotos/Videos 📷</span>
                  <span className="sm:hidden">Foto</span>
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="flex-1 hover:bg-gray-100 h-9 sm:h-8 text-xs sm:text-sm"
                  onClick={() => {
                    setComposerTab('note');
                    textareaRef.current?.focus();
                  }}
                >
                  <BookOpen className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Apuntes 📘</span>
                  <span className="sm:hidden">Nota</span>
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="flex-1 hover:bg-gray-100 h-9 sm:h-8 text-xs sm:text-sm"
                  onClick={() => {
                    setComposerTab('question');
                    textareaRef.current?.focus();
                  }}
                >
                  <HelpCircle className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Preguntas ❓</span>
                  <span className="sm:hidden">?</span>
                </Button>
              </div>
            </div>

            {/* Botón de publicar */}
            <div className="flex justify-end mt-4 pt-3 border-t">
              <Button
                type="submit"
                disabled={(!trimmedText && composer.media.length === 0) || composer.isSubmitting}
                className="px-4 sm:px-6 w-full sm:w-auto h-10 sm:h-9 text-sm font-medium bg-blue-600 hover:bg-blue-700"
              >
                {composer.isSubmitting ? (
                  <>
                    <span className="hidden sm:inline">Publicando...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  'Publicar'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}