'use client';

import { useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Video, 
  HelpCircle, 
  FileText, 
  Globe, 
  Users, 
  Lock, 
  X,
  Upload,
  Hash,
  Sparkles,
  Camera,
  Film
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FeedKind, VisibilityLevel, CreatePostData } from '@/types/feed';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ComposerProps {
  className?: string;
}

const POST_TYPES = [
  {
    id: 'post' as FeedKind,
    label: 'Post',
    icon: MessageSquare,
    description: 'Comparte tus pensamientos'
  },
  {
    id: 'photo' as FeedKind,
    label: 'Foto/Video',
    icon: ImageIcon,
    description: 'Sube imágenes o videos'
  },
  {
    id: 'question' as FeedKind,
    label: 'Pregunta',
    icon: HelpCircle,
    description: 'Haz una pregunta'
  },
  {
    id: 'note' as FeedKind,
    label: 'Apunte',
    icon: FileText,
    description: 'Comparte tus apuntes'
  }
];

const VISIBILITY_OPTIONS = [
  {
    value: 'public' as VisibilityLevel,
    label: 'Público',
    icon: Globe,
    description: 'Visible para todos'
  },
  {
    value: 'university' as VisibilityLevel,
    label: 'Universidad',
    icon: Users,
    description: 'Solo tu universidad'
  },
  {
    value: 'followers' as VisibilityLevel,
    label: 'Seguidores',
    icon: Users,
    description: 'Solo tus seguidores'
  }
];

export function Composer({ className }: ComposerProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<FeedKind>('post');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<VisibilityLevel>('public');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostData) => {
      const formData = new FormData();
      formData.append('kind', data.kind);
      formData.append('text', data.text || '');
      formData.append('visibility', data.visibility);
      formData.append('hashtags', JSON.stringify(data.hashtags || []));
      
      // Add files if any
      data.media?.forEach((file, index) => {
        formData.append(`media_${index}`, file);
      });
      
      const response = await fetch('/api/feed', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error creating post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Reset form
      setText('');
      setTitle('');
      setHashtags([]);
      setHashtagInput('');
      setSelectedFiles([]);
      setIsExpanded(false);
      
      // Invalidate feed queries
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      
      toast.success(
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-green-500" />
          <span>¡Post creado exitosamente! 🔥</span>
        </div>,
        {
          description: 'Tu publicación ya está visible en el feed'
        }
      );
    },
    onError: (error: Error) => {
      toast.error(
        <div className="flex items-center space-x-2">
          <X className="w-4 h-4 text-red-500" />
          <span>Error al crear el post</span>
        </div>,
        {
          description: error.message
        }
      );
    }
  });

  const handleSubmit = () => {
    if (!text.trim() && !title.trim()) {
      toast.error('Agrega contenido a tu post');
      return;
    }

    // For questions and notes, include title in the text content
    let finalText = text.trim();
    if ((activeTab === 'question' || activeTab === 'note') && title.trim()) {
      finalText = title.trim() + (text.trim() ? '\n\n' + text.trim() : '');
    }

    const postData: CreatePostData = {
      kind: activeTab,
      text: finalText,
      visibility,
      hashtags: hashtags.length > 0 ? hashtags : undefined,
      media: selectedFiles.length > 0 ? selectedFiles : undefined
    };

    createPostMutation.mutate(postData);
  };

  const addFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isDocument = file.type === 'application/pdf' || 
                        file.type.includes('document') ||
                        file.type.includes('text');
      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for video, 10MB for images
      
      if (!isImage && !isVideo && !isDocument) {
        toast.error('Solo se permiten archivos de imagen, video y documentos');
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`El archivo ${file.name} es demasiado grande`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length !== files.length) {
      toast.error('Algunos archivos no son válidos');
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
    
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} archivo(s) agregado(s)`);
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, [addFiles]);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    toast.success('Archivo eliminado');
  };

  const addHashtag = () => {
    const tag = hashtagInput.trim().toLowerCase().replace(/^#/, '');
    if (tag && !hashtags.includes(tag) && hashtags.length < 10) {
      setHashtags(prev => [...prev, tag]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(prev => prev.filter(t => t !== tag));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  if (!session) {
    return (
      <Card className={cn('p-6 text-center', className)}>
        <p className="text-gray-600">Inicia sesión para crear publicaciones</p>
      </Card>
    );
  }

  return (
    <Card className={cn(`overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-lg border-orange-200' : 'hover:shadow-md'}`, className)}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 ring-2 ring-transparent hover:ring-orange-200 transition-all duration-300">
              <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
              <AvatarFallback className="bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700">
                {session.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{session.user?.name}</p>
              <p className="text-sm text-gray-500">¿Qué quieres compartir?</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FeedKind)}>
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            {POST_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <TabsTrigger
                  key={type.id}
                  value={type.id}
                  className="flex items-center space-x-2 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent px-4 py-3"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Content for each tab */}
          {POST_TYPES.map((type) => (
            <TabsContent key={type.id} value={type.id} className="p-4 space-y-4">
              {/* Title input for questions and notes */}
              {(type.id === 'question' || type.id === 'note') && (
                <Input
                  placeholder={type.id === 'question' ? 'Título de tu pregunta...' : 'Título de tu apunte...'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-medium border-0 px-0 focus-visible:ring-0 placeholder:text-gray-400"
                />
              )}

              {/* Main text area */}
              <Textarea
                placeholder={
                  type.id === 'question' ? 'Describe tu pregunta en detalle...' :
                  type.id === 'note' ? 'Describe tu apunte...' :
                  type.id === 'photo' ? 'Agrega una descripción a tu imagen/video...' :
                  '¿Qué está pasando?'
                }
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (!isExpanded && e.target.value.length > 0) {
                    setIsExpanded(true);
                  }
                }}
                onKeyDown={handleKeyPress}
                onFocus={() => setIsExpanded(true)}
                className="min-h-[100px] resize-none border-0 px-0 focus-visible:ring-0 placeholder:text-gray-400 text-base transition-all duration-200"
              />

              {/* File upload for photo/video and note types */}
              {(type.id === 'photo' || type.id === 'note') && (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={type.id === 'photo' ? 'image/*,video/*' : 'image/*,video/*,.pdf,.doc,.docx,.txt'}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full border-dashed border-2 h-20 rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center ${
                      isDragOver 
                        ? 'border-orange-500 bg-orange-50 scale-105' 
                        : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
                    }`}
                  >
                    {isDragOver ? (
                      <div className="animate-bounce text-center">
                        <Upload className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                        <p className="text-sm text-orange-600 font-medium">¡Suelta los archivos aquí!</p>
                      </div>
                    ) : (
                      <div className="text-center group">
                        <div className="flex items-center justify-center space-x-2 mb-1">
                          <Camera className="w-5 h-5 text-gray-500 group-hover:text-orange-500 transition-colors" />
                          <Film className="w-5 h-5 text-gray-500 group-hover:text-orange-500 transition-colors" />
                        </div>
                        <p className="text-sm text-gray-500 group-hover:text-orange-600 transition-colors">
                          {type.id === 'photo' ? 'Arrastra fotos/videos o haz clic' : 'Arrastra archivos o haz clic'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Imágenes hasta 10MB, videos hasta 50MB
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Selected files */}
                  {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in slide-in-from-bottom-2 duration-300">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group animate-in zoom-in-50 duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 text-sm shadow-sm group-hover:shadow-md transition-all duration-300">
                            {file.type.startsWith('image/') ? (
                              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-2">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            ) : file.type.startsWith('video/') ? (
                              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                                <Video className="w-8 h-8 text-orange-500" />
                              </div>
                            ) : (
                              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                                <FileText className="w-8 h-8 text-orange-500" />
                              </div>
                            )}
                            <p className="font-medium truncate text-xs">{file.name}</p>
                            <p className="text-gray-500 text-xs">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Hashtags */}
              {isExpanded && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Agregar hashtags..."
                      value={hashtagInput}
                      onChange={(e) => setHashtagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                      className="flex-1 border-0 px-0 focus-visible:ring-0 placeholder:text-gray-400"
                    />
                    <Button size="sm" onClick={addHashtag} disabled={!hashtagInput.trim()}>
                      Agregar
                    </Button>
                  </div>
                  
                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeHashtag(tag)}
                            className="ml-1 h-auto p-0 text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              {(isExpanded || text.trim() || title.trim()) && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <Select value={visibility} onValueChange={(value) => setVisibility(value as VisibilityLevel)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIBILITY_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4" />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setText('');
                        setTitle('');
                        setHashtags([]);
                        setHashtagInput('');
                        setSelectedFiles([]);
                        setIsExpanded(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={createPostMutation.isPending || (!text.trim() && !title.trim())}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    >
                      {createPostMutation.isPending ? 'Publicando...' : 'Publicar 🔥'}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}