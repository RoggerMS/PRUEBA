'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Download,
  Share2,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image,
  File,
  User,
  Calendar,
  Eye,
  Star,
  Send,
  LoaderIcon
} from 'lucide-react';
import { useNote, useLikeNote, useAddComment, useDownloadNote } from '@/hooks/useNotes';
import { toast } from 'sonner';

interface Note {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  career: string;
  category: string;
  tags: string[];
  price: number;
  rating: number;
  downloads: number;
  views: number;
  createdAt: string;
  files: {
    id: string;
    name: string;
    type: 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'image' | 'other';
    url: string;
    pages?: number;
  }[];
  comments: {
    id: string;
    user: {
      name: string;
      avatar: string;
    };
    content: string;
    rating: number;
    createdAt: string;
  }[];
}

interface NotesViewerProps {
  noteId: string;
  onClose: () => void;
}

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500" />;
    case 'docx':
      return <FileText className="w-5 h-5 text-blue-500" />;
    case 'pptx':
      return <FileText className="w-5 h-5 text-orange-500" />;
    case 'xlsx':
      return <FileText className="w-5 h-5 text-green-500" />;
    case 'image':
      return <Image className="w-5 h-5 text-purple-500" />;
    default:
      return <File className="w-5 h-5 text-gray-500" />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export function NotesViewer({ noteId, onClose }: NotesViewerProps) {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  
  const { data: note, isLoading, error } = useNote(noteId);
  const likeNoteMutation = useLikeNote();
  const addCommentMutation = useAddComment();
  const downloadNoteMutation = useDownloadNote();

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 flex items-center gap-3">
          <LoaderIcon className="w-6 h-6 animate-spin" />
          <span>Loading note...</span>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Error loading note</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  const currentFile = note.files[currentFileIndex];
  const totalPages = currentFile?.pages || 1;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevFile = () => {
    setCurrentFileIndex(prev => Math.max(prev - 1, 0));
    setCurrentPage(1);
  };

  const handleNextFile = () => {
    setCurrentFileIndex(prev => Math.min(prev + 1, note.files.length - 1));
    setCurrentPage(1);
  };

  const handleDownload = () => {
    downloadNoteMutation.mutate(noteId);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    likeNoteMutation.mutate({ noteId, liked: !newLikedState }, {
      onError: () => {
        setIsLiked(!newLikedState);
      }
    });
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) {
      toast.error('Escribe un comentario');
      return;
    }
    
    addCommentMutation.mutate({
      noteId,
      content: newComment,
      rating: newRating
    }, {
      onSuccess: () => {
        setNewComment('');
        setNewRating(5);
        toast.success('Comment added successfully!');
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full h-full max-w-7xl mx-auto p-4 flex gap-4">
        {/* Main Viewer */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getFileIcon(currentFile?.type)}
                <span className="font-medium">{currentFile?.name}</span>
              </div>
              {note.files.length > 1 && (
                <Badge variant="secondary">
                  {currentFileIndex + 1} de {note.files.length}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* File Navigation */}
              {note.files.length > 1 && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handlePrevFile}
                    disabled={currentFileIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNextFile}
                    disabled={currentFileIndex === note.files.length - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
              
              {/* Zoom Controls */}
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-2">{zoom}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              {/* Rotate */}
              <Button variant="outline" size="sm" onClick={handleRotate}>
                <RotateCw className="w-4 h-4" />
              </Button>
              
              {/* Actions */}
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button 
                variant={isLiked ? "default" : "outline"} 
                size="sm" 
                onClick={handleLike}
                className={isLiked ? "bg-red-500 hover:bg-red-600" : ""}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Document Viewer */}
            <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden">
              <div 
                className="bg-white shadow-lg transition-transform duration-200"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center'
                }}
              >
                {currentFile?.type === 'image' ? (
                  <img 
                    src={currentFile.url} 
                    alt={currentFile.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-[600px] h-[800px] bg-white border flex items-center justify-center">
                    <div className="text-center">
                      {getFileIcon(currentFile?.type)}
                      <p className="mt-2 text-gray-600">Vista previa del documento</p>
                      <p className="text-sm text-gray-500">{currentFile?.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Page Navigation */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-3 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium">
                  Página {currentPage} de {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Sidebar */}
        <Card className="w-80 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">{note.title}</CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 space-y-4">
            {/* Author Info */}
            <div className="flex items-center gap-3">
              <img 
                src={note.author.avatar} 
                alt={note.author.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{note.author.name}</span>
                  {note.author.verified && (
                    <Badge variant="secondary" className="text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{note.career}</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{note.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4 text-gray-500" />
                <span>{note.downloads}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-gray-500" />
                <span>{note.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{formatDate(note.createdAt)}</span>
              </div>
            </div>
            
            {/* Description */}
            {note.description && (
              <div>
                <h4 className="font-medium mb-2">Descripción</h4>
                <p className="text-sm text-gray-600">{note.description}</p>
              </div>
            )}
            
            {/* Category and Tags */}
            <div>
              <h4 className="font-medium mb-2">Categoría</h4>
              <Badge variant="outline">{note.category}</Badge>
            </div>
            
            {note.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Etiquetas</h4>
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Price */}
            <div>
              <h4 className="font-medium mb-2">Precio</h4>
              <div className="text-lg font-bold text-purple-600">
                {note.price === 0 ? 'Gratis' : `${note.price} Crolars`}
              </div>
            </div>
            
            {/* Comments Toggle */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {showComments ? 'Ocultar' : 'Ver'} Comentarios ({note.comments.length})
            </Button>
            
            {/* Comments Section */}
            {showComments && (
              <div className="space-y-4">
                {/* Add Comment */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Tu calificación:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewRating(star)}
                          className={`w-4 h-4 ${star <= newRating ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          <Star className="w-full h-full fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe tu comentario..."
                    rows={3}
                  />
                  <Button 
                    onClick={handleSubmitComment}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Comentario
                  </Button>
                </div>
                
                {/* Comments List */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {note.comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <img 
                          src={comment.user.avatar} 
                          alt={comment.user.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm font-medium">{comment.user.name}</span>
                        <div className="flex gap-0.5 ml-auto">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`w-3 h-3 ${star <= comment.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{comment.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
