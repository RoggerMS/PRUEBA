'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Share2, 
  Download, 
  Star, 
  Eye, 
  MessageCircle, 
  Flag, 
  FileText, 
  Image, 
  Video, 
  File,
  X,
  Send,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  description: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    career: string;
    level: number;
    points: number;
  };
  category: string;
  career: string;
  tags: string[];
  price: number;
  isFree: boolean;
  rating: number;
  downloads: number;
  views: number;
  createdAt: string;
  files: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  liked: boolean;
}

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  liked: boolean;
}

interface NotesViewerProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: (noteId: string) => void;
  onDownload: (noteId: string) => void;
}

const mockComments: Comment[] = [
  {
    id: '1',
    author: {
      id: 'user1',
      name: 'María González',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20student%20avatar&image_size=square'
    },
    content: 'Excelentes apuntes, muy bien organizados y fáciles de entender. Me ayudaron mucho para el examen.',
    createdAt: '2024-01-15T10:30:00Z',
    likes: 5,
    liked: false
  },
  {
    id: '2',
    author: {
      id: 'user2',
      name: 'Carlos Rodríguez',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20male%20student%20avatar&image_size=square'
    },
    content: '¿Podrías subir más apuntes sobre este tema? Están muy completos.',
    createdAt: '2024-01-14T15:45:00Z',
    likes: 2,
    liked: true
  }
];

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return FileText;
    case 'image':
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return Image;
    case 'video':
    case 'mp4':
    case 'avi':
    case 'mov':
      return Video;
    default:
      return File;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function NotesViewer({ note, isOpen, onClose, onLike, onDownload }: NotesViewerProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'comments'>('overview');

  if (!note) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: note.title,
        text: note.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleReport = () => {
    // Implementar reporte
    console.log('Reportar nota:', note.id);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: {
          id: 'current-user',
          name: 'Usuario Actual',
          avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar&image_size=square'
        },
        content: newComment,
        createdAt: new Date().toISOString(),
        likes: 0,
        liked: false
      };
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    }
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            liked: !comment.liked,
            likes: comment.liked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                {note.title}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={note.author.avatar} />
                    <AvatarFallback>{note.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{note.author.name}</span>
                  <Badge variant="outline" className="text-xs">
                    Nivel {note.author.level}
                  </Badge>
                </div>
                <span>•</span>
                <span>{formatDate(note.createdAt)}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Action Buttons */}
        <div className="flex items-center justify-between py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant={note.liked ? "default" : "outline"}
              size="sm"
              onClick={() => onLike(note.id)}
              className={note.liked ? "bg-red-500 hover:bg-red-600" : ""}
            >
              <Heart className={`w-4 h-4 mr-1 ${note.liked ? 'fill-current' : ''}`} />
              Me gusta
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-1" />
              Compartir
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDownload(note.id)}
              className="bg-green-50 hover:bg-green-100 text-green-700"
            >
              <Download className="w-4 h-4 mr-1" />
              Descargar
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{note.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>{note.downloads}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{note.rating.toFixed(1)}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReport}>
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b flex-shrink-0">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Descripción
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'files'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('files')}
          >
            Archivos ({note.files.length})
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'comments'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('comments')}
          >
            Comentarios ({comments.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-700 leading-relaxed">{note.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {note.category}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {note.career}
                </Badge>
                {note.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {!note.isFree && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-800">Precio</h4>
                      <p className="text-2xl font-bold text-green-600">
                        ${note.price.toLocaleString()} COP
                      </p>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Comprar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-4">
              {note.files.map((file) => {
                const IconComponent = getFileIcon(file.type);
                return (
                  <Card key={file.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-8 h-8 text-gray-500" />
                          <div>
                            <h4 className="font-medium text-gray-900">{file.name}</h4>
                            <p className="text-sm text-gray-500">
                              {file.type.toUpperCase()} • {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Descargar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-6">
              {/* Add Comment */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escribe un comentario..."
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        size="sm"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Comentar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.author.avatar} />
                          <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {comment.author.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{comment.content}</p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikeComment(comment.id)}
                              className={comment.liked ? "text-blue-600" : "text-gray-500"}
                            >
                              <ThumbsUp className={`w-4 h-4 mr-1 ${comment.liked ? 'fill-current' : ''}`} />
                              {comment.likes}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}