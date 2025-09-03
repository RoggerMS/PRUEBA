'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
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

  // Extract hashtags from text
  const extractHashtags = useCallback((text: string): string[] => {
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1)) : [];
  }, []);

  // Extract mentions from text
  const extractMentions = useCallback((text: string): string[] => {
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
    if (!composer.text.trim() && composer.media.length === 0) {
      toast.error('Agrega contenido o media para publicar');
      return;
    }

    setComposerSubmitting(true);

    try {
      await createPost.mutateAsync({
        text: composer.text.trim(),
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
            Apunte
          </Button>
          <Button
            variant="ghost"
            className="flex-1 text-gray-600 hover:bg-gray-100"
            onClick={() => openModal('question')}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Pregunta
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
            Foto/Video
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
        <DialogContent className="w-[95vw] sm:max-w-[600px] md:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="flex items-center">
            <DialogTitle className="text-xl font-semibold">Crear publicación</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header del modal con avatar */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <img 
                  src={session.user?.image || '/default-avatar.png'} 
                  alt={session.user?.name || 'Usuario'}
                  className="rounded-full"
                />
              </Avatar>
              <div>
                <p className="font-medium text-sm">{session.user?.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={composer.activeTab === 'post' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setComposerTab('post')}
                      className="text-xs"
                    >
                      Post
                    </Button>
                    <Button
                      type="button"
                      variant={composer.activeTab === 'note' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setComposerTab('note')}
                      className="text-xs"
                    >
                      Apunte
                    </Button>
                    <Button
                      type="button"
                      variant={composer.activeTab === 'question' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setComposerTab('question')}
                      className="text-xs"
                    >
                      Pregunta
                    </Button>
                  </div>
                  
                  {/* Visibility selector */}
                  <Select value={composer.visibility} onValueChange={(value: VisibilityLevel) => setComposerVisibility(value)}>
                    <SelectTrigger className="w-32 h-8">
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
                onChange={(e) => handleTextChange(e.target.value)}
                className="min-h-[120px] resize-none border-0 focus-visible:ring-0 text-base"
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
                <div className="grid grid-cols-2 gap-2">
                  {composer.media.map((file, index) => (
                    <div key={index} className="relative group">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Video className="h-8 w-8 text-gray-400" />
                          <span className="ml-2 text-sm text-gray-600">{file.name}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeComposerMedia(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-1 hover:bg-gray-100"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Fotos/Videos
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-1 hover:bg-gray-100"
                  onClick={() => {
                    setComposerTab('note');
                    textareaRef.current?.focus();
                  }}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Apuntes
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-1 hover:bg-gray-100"
                  onClick={() => {
                    setComposerTab('question');
                    textareaRef.current?.focus();
                  }}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Preguntas
                </Button>
              </div>
            </div>

            {/* Botón de publicar */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={(!composer.text.trim() && composer.media.length === 0) || composer.isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 px-8"
              >
                {composer.isSubmitting ? 'Publicando...' : 'Publicar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}