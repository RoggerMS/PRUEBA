'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ImageIcon,
  FileTextIcon,
  SmileIcon,
  Camera,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { useCreatePost } from '@/hooks/useFeed';
import { toast } from 'sonner';

export function FacebookStyleComposer() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'note' | 'question'>('text');
  const createPost = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createPost.mutateAsync({
        content: content.trim(),
        type: postType,
        visibility: 'public',
        tags: []
      });
      
      setContent('');
      setPostType('text');
      setIsModalOpen(false);
      toast.success('Post publicado exitosamente');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Error al publicar el post');
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setContent('');
    setPostType('text');
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
            onClick={() => {
              setPostType('note');
              openModal();
            }}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Apunte 📘
          </Button>
          <Button
            variant="ghost"
            className="flex-1 text-gray-600 hover:bg-gray-100"
            onClick={() => {
              setPostType('question');
              openModal();
            }}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Pregunta ❓
          </Button>
          <Button
            variant="ghost"
            className="flex-1 text-gray-600 hover:bg-gray-100"
            onClick={openModal}
          >
            <Camera className="h-4 w-4 mr-2" />
            Foto/Video 🖼️
          </Button>
        </div>
      </Card>

      {/* Modal de creación */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (open) setIsModalOpen(true);
          else closeModal();
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
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
                <div className="flex space-x-2 mt-1">
                  <Button
                    type="button"
                    variant={postType === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPostType('text')}
                    className="text-xs"
                  >
                    💬 Post
                  </Button>
                  <Button
                    type="button"
                    variant={postType === 'note' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPostType('note')}
                    className="text-xs"
                  >
                    📚 Apunte
                  </Button>
                  <Button
                    type="button"
                    variant={postType === 'question' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPostType('question')}
                    className="text-xs"
                  >
                    ❓ Pregunta
                  </Button>
                </div>
              </div>
            </div>

            {/* Área de texto principal */}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="¿Qué estás pensando?"
              className="min-h-[120px] resize-none border-0 focus:ring-0 text-lg p-0"
              maxLength={500}
            />

            {/* Contador de caracteres */}
            <div className="text-right text-sm text-gray-500">
              {content.length}/500
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
                >
                  <SmileIcon className="h-4 w-4 mr-2" />
                  Emoji 🙂
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="flex-1 hover:bg-gray-100"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Fotos/Videos 📷
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="flex-1 hover:bg-gray-100"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Apuntes 📘
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="flex-1 hover:bg-gray-100"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Preguntas ❓
                </Button>
              </div>
            </div>

            {/* Botón de publicar */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!content.trim() || createPost.isPending}
                className="bg-blue-600 hover:bg-blue-700 px-8"
              >
                {createPost.isPending ? 'Publicando...' : 'Publicar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}