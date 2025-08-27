'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, X, Image as ImageIcon, FileText, HelpCircle, Send, Loader2, Globe, Users, Lock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

type PostType = 'text' | 'question' | 'note' | 'image';

interface CreatePostProps {
  onPostCreated?: (post: any) => void;
}

interface Post {
  id: string;
  type: 'text' | 'question' | 'note' | 'image';
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    verified: boolean;
    career: string;
  };
  content: string;
  title?: string;
  tags: string[];
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  imageUrl?: string;
  visibility: 'public' | 'followers' | 'private';
  publishToFeed?: boolean;
}

type VisibilityOption = {
  value: 'public' | 'followers' | 'private';
  label: string;
  icon: React.ReactNode;
  description: string;
};

const visibilityOptions: VisibilityOption[] = [
  {
    value: 'public',
    label: 'Público',
    icon: <Globe className="w-4 h-4" />,
    description: 'Visible para todos los usuarios'
  },
  {
    value: 'followers',
    label: 'Seguidores',
    icon: <Users className="w-4 h-4" />,
    description: 'Solo visible para tus seguidores'
  },
  {
    value: 'private',
    label: 'Privado',
    icon: <Lock className="w-4 h-4" />,
    description: 'Solo visible para ti'
  }
];

const postTypes = [
  {
    value: 'text' as PostType,
    label: 'Publicación',
    icon: '💭',
    description: 'Comparte tus pensamientos'
  },
  {
    value: 'question' as PostType,
    label: 'Pregunta',
    icon: '❓',
    description: 'Haz una pregunta al foro'
  },
  {
    value: 'note' as PostType,
    label: 'Apunte',
    icon: '📝',
    description: 'Comparte material de estudio'
  },
  {
    value: 'image' as PostType,
    label: 'Imagen',
    icon: '🖼️',
    description: 'Sube una imagen'
  }
];

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [postType, setPostType] = useState<PostType>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [publishToFeed, setPublishToFeed] = useState(true);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 5) {
      setTags([...tags, currentTag.trim().toLowerCase()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentTag.trim()) {
        handleAddTag();
      }
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('El contenido no puede estar vacío');
      return;
    }

    if (postType === 'question' && !title.trim()) {
      toast.error('Las preguntas deben tener un título');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implementar llamada a la API
      const newPost: Post = {
        id: Date.now().toString(),
        type: postType,
        author: {
          id: session?.user?.id || '1',
          name: session?.user?.name || 'Usuario',
          username: session?.user?.email?.split('@')[0] || 'usuario',
          avatar: session?.user?.image || undefined,
          verified: false,
          career: 'Mi Carrera'
        },
        title: title.trim() || undefined,
        content: content.trim(),
        tags,
        createdAt: 'ahora',
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isBookmarked: false,
        visibility,
        publishToFeed
      };

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      onPostCreated?.(newPost);
      
      // Reset form
      setTitle('');
      setContent('');
      setTags([]);
      setCurrentTag('');
      setIsExpanded(false);
      setPostType('text');
      setVisibility('public');
      setPublishToFeed(true);
      
      toast.success('¡Publicación creada exitosamente!');
    } catch (error) {
      toast.error('Error al crear la publicación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPostType = postTypes.find(type => type.value === postType);

  if (!isExpanded) {
    return (
      <Card className="mb-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setIsExpanded(true)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || 'Usuario'} />
              <AvatarFallback>
                {session?.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-muted rounded-full px-4 py-3 text-muted-foreground">
              ¿Qué quieres compartir hoy?
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || 'Usuario'} />
              <AvatarFallback>
                {session?.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{session?.user?.name || 'Usuario'}</p>
              <p className="text-sm text-muted-foreground">@{session?.user?.email?.split('@')[0] || 'usuario'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Post Type Selector */}
          <Select value={postType} onValueChange={(value: PostType) => setPostType(value)}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <div className="flex items-center space-x-2">
                  <span>{selectedPostType?.icon}</span>
                  <span>{selectedPostType?.label}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {postTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center space-x-2">
                    <span>{type.icon}</span>
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Title (for questions and notes) */}
          {(postType === 'question' || postType === 'note') && (
            <Input
              placeholder={postType === 'question' ? 'Escribe tu pregunta...' : 'Título del apunte...'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold"
            />
          )}

          {/* Content */}
          <Textarea
            placeholder={
              postType === 'question'
                ? 'Describe tu pregunta en detalle...'
                : postType === 'note'
                ? 'Describe tu apunte...'
                : '¿Qué quieres compartir?'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none"
          />

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Agregar etiqueta (máx. 5)"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={tags.length >= 5}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!currentTag.trim() || tags.length >= 5}
              >
                Agregar
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Privacy and Visibility Options */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Visibilidad</span>
              </div>
              <Select value={visibility} onValueChange={(value: 'public' | 'followers' | 'private') => setVisibility(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        {option.icon}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(postType === 'note' || postType === 'question') && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    {postType === 'note' ? 'Publicar apunte en el feed' : 'Publicar pregunta en el feed'}
                  </span>
                </div>
                <Button
                  variant={publishToFeed ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPublishToFeed(!publishToFeed)}
                >
                  {publishToFeed ? 'Sí' : 'No'}
                </Button>
              </div>
            )}

            <div className="text-xs text-gray-500">
              {visibilityOptions.find(opt => opt.value === visibility)?.description}
              {(postType === 'note' || postType === 'question') && !publishToFeed && (
                <span className="block mt-1">
                  Este {postType === 'note' ? 'apunte' : 'pregunta'} solo estará disponible en la sección correspondiente.
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Tipo:</span>
              <Badge variant="outline" className="text-xs">
                {selectedPostType?.icon} {selectedPostType?.label}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsExpanded(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting || (postType === 'question' && !title.trim())}
                className="bg-crunevo-600 hover:bg-crunevo-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{publishToFeed ? 'Publicando...' : 'Guardando...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>{publishToFeed ? 'Publicar' : 'Guardar'}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
