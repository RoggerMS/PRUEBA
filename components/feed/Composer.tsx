'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, FileTextIcon, LinkIcon, SmileIcon } from 'lucide-react';
import { useCreatePost } from '@/hooks/useFeed';
import { toast } from 'sonner';

export function Composer() {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'note' | 'question'>('text');
  const createPost = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createPost.mutateAsync({
        text: content.trim(),
        kind: postType as 'post' | 'note' | 'question',
        visibility: 'public',
        hashtags: []
      });
      
      setContent('');
      setPostType('text');
      toast.success('Post publicado exitosamente');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Error al publicar el post');
    }
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
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        {/* Header con avatar y selector de tipo */}
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-10 w-10">
            <img 
              src={session.user?.image || '/default-avatar.png'} 
              alt={session.user?.name || 'Usuario'}
              className="rounded-full"
            />
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-sm">
              ¿Qué quieres compartir, {session.user?.name?.split(' ')[0]}?
            </p>
            <div className="flex space-x-2 mt-1">
              <Badge 
                variant={postType === 'text' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setPostType('text')}
              >
                💬 Post
              </Badge>
              <Badge 
                variant={postType === 'note' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setPostType('note')}
              >
                📚 Apunte
              </Badge>
              <Badge 
                variant={postType === 'question' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setPostType('question')}
              >
                ❓ Pregunta
              </Badge>
            </div>
          </div>
        </div>

        {/* Textarea para contenido */}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            postType === 'text' 
              ? '¿Qué está pasando en tu carrera?'
              : postType === 'note'
              ? 'Describe tu apunte y compártelo con la comunidad...'
              : '¿Necesitas ayuda con algo? Haz tu pregunta...'
          }
          className="min-h-[100px] resize-none border-0 focus:ring-0 text-base"
          maxLength={500}
        />

        {/* Contador de caracteres */}
        <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
          <span>{content.length}/500</span>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex space-x-2">
            <Button type="button" variant="ghost" size="sm">
              <ImageIcon className="h-4 w-4 mr-1" />
              Imagen
            </Button>
            <Button type="button" variant="ghost" size="sm">
              <FileTextIcon className="h-4 w-4 mr-1" />
              Archivo
            </Button>
            <Button type="button" variant="ghost" size="sm">
              <LinkIcon className="h-4 w-4 mr-1" />
              Enlace
            </Button>
            <Button type="button" variant="ghost" size="sm">
              <SmileIcon className="h-4 w-4 mr-1" />
              Emoji
            </Button>
          </div>
          
          <Button 
            type="submit" 
            disabled={!content.trim() || createPost.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {createPost.isPending ? 'Publicando...' : 'Publicar'}
          </Button>
        </div>
      </form>
    </Card>
  );
}