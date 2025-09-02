'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff,
  Trash2,
  Flag,
  RotateCcw,
  Calendar,
  User,
  MessageSquare,
  Heart,
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Content {
  id: string;
  type: 'post' | 'comment';
  content: string;
  status: 'active' | 'hidden' | 'deleted' | 'flagged';
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    email: string;
  };
  likesCount?: number;
  commentsCount?: number;
  reportsCount?: number;
  moderatorNotes?: string;
  post?: {
    id: string;
    title: string;
  };
}

interface ContentFilters {
  type?: 'post' | 'comment';
  status?: 'active' | 'hidden' | 'deleted' | 'flagged';
  search?: string;
  authorId?: string;
  sortBy: 'createdAt' | 'updatedAt' | 'reports' | 'likes';
  sortOrder: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

const ContentManagement: React.FC = () => {
  const { loading } = useAdmin();
  const [content, setContent] = useState<Content[]>([]);
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [filters, setFilters] = useState<ContentFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showModerationDialog, setShowModerationDialog] = useState(false);
  const [moderationAction, setModerationAction] = useState<{
    type: 'single' | 'bulk';
    action: string;
    contentId?: string;
    contentIds?: string[];
  } | null>(null);
  const [moderationNotes, setModerationNotes] = useState('');
  const [moderationReason, setModerationReason] = useState('');

  // Load content
  const loadContent = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.authorId) params.append('authorId', filters.authorId);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`/api/admin/content?${params}`);
      const data = await response.json();

      if (response.ok) {
        setContent(data.content);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || 'Error al cargar contenido');
      }
    } catch (error) {
      toast.error('Error al cargar contenido');
    } finally {
      setIsLoading(false);
    }
  };

  // Update content status
  const updateContent = async (contentId: string, contentType: string, updates: any) => {
    try {
      const response = await fetch(`/api/admin/content?id=${contentId}&type=${contentType}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Contenido actualizado exitosamente');
        loadContent();
      } else {
        toast.error(data.error || 'Error al actualizar contenido');
      }
    } catch (error) {
      toast.error('Error al actualizar contenido');
    }
  };

  // Bulk actions
  const performBulkAction = async (action: string, contentIds: string[], reason?: string, notes?: string) => {
    try {
      const response = await fetch('/api/admin/content/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          contentIds,
          reason,
          notes
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Acción ${action} completada exitosamente`);
        setSelectedContent([]);
        loadContent();
      } else {
        toast.error(data.error || 'Error al realizar acción');
      }
    } catch (error) {
      toast.error('Error al realizar acción');
    }
  };

  // Delete content permanently
  const deleteContent = async (contentId: string, contentType: string) => {
    try {
      const response = await fetch(`/api/admin/content?id=${contentId}&type=${contentType}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Contenido eliminado permanentemente');
        loadContent();
      } else {
        toast.error(data.error || 'Error al eliminar contenido');
      }
    } catch (error) {
      toast.error('Error al eliminar contenido');
    }
  };

  // Handle moderation action
  const handleModerationAction = () => {
    if (!moderationAction) return;

    if (moderationAction.type === 'single' && moderationAction.contentId) {
      const content = getContentById(moderationAction.contentId);
      if (content) {
        if (moderationAction.action === 'delete') {
          deleteContent(moderationAction.contentId, content.type);
        } else {
          const status = getStatusFromAction(moderationAction.action);
          updateContent(moderationAction.contentId, content.type, {
            status,
            moderatorNotes: moderationNotes,
            flagReason: moderationReason
          });
        }
      }
    } else if (moderationAction.type === 'bulk' && moderationAction.contentIds) {
      performBulkAction(
        moderationAction.action,
        moderationAction.contentIds,
        moderationReason,
        moderationNotes
      );
    }

    setShowModerationDialog(false);
    setModerationAction(null);
    setModerationNotes('');
    setModerationReason('');
  };

  // Helper functions
  const getContentById = (id: string) => {
    return content.find(c => c.id === id);
  };

  const getStatusFromAction = (action: string) => {
    switch (action) {
      case 'hide': return 'hidden';
      case 'flag': return 'flagged';
      case 'restore': return 'active';
      default: return 'active';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      hidden: 'secondary',
      deleted: 'destructive',
      flagged: 'outline'
    };
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {status === 'active' ? 'Activo' :
         status === 'hidden' ? 'Oculto' :
         status === 'deleted' ? 'Eliminado' :
         status === 'flagged' ? 'Marcado' : status}
      </Badge>
    );
  };

  const getContentPreview = (content: Content) => {
    const maxLength = 100;
    const text = content.content || '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Export content
  const exportContent = () => {
    const csvContent = [
      ['ID', 'Tipo', 'Autor', 'Estado', 'Contenido', 'Reportes', 'Fecha Creación'].join(','),
      ...content.map(c => [
        c.id,
        c.type,
        c.author.username,
        c.status,
        `"${c.content.replace(/"/g, '""')}"`,
        c.reportsCount || 0,
        format(new Date(c.createdAt), 'yyyy-MM-dd HH:mm:ss')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadContent();
  }, [filters, pagination.page]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Contenido</h2>
          <p className="text-muted-foreground">
            Administra posts, comentarios y contenido del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportContent}
            disabled={content.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button
            variant="outline"
            onClick={loadContent}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contenido..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => 
                  setFilters({ ...filters, type: value === 'all' ? undefined : value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="comment">Comentarios</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => 
                  setFilters({ ...filters, status: value === 'all' ? undefined : value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="hidden">Oculto</SelectItem>
                  <SelectItem value="flagged">Marcado</SelectItem>
                  <SelectItem value="deleted">Eliminado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Ordenar por</Label>
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-');
                  setFilters({ ...filters, sortBy: sortBy as any, sortOrder: sortOrder as any });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Más reciente</SelectItem>
                  <SelectItem value="createdAt-asc">Más antiguo</SelectItem>
                  <SelectItem value="reports-desc">Más reportes</SelectItem>
                  <SelectItem value="likes-desc">Más likes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedContent.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedContent.length} elemento(s) seleccionado(s)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setModerationAction({
                      type: 'bulk',
                      action: 'hide',
                      contentIds: selectedContent
                    });
                    setShowModerationDialog(true);
                  }}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Ocultar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setModerationAction({
                      type: 'bulk',
                      action: 'flag',
                      contentIds: selectedContent
                    });
                    setShowModerationDialog(true);
                  }}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Marcar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setModerationAction({
                      type: 'bulk',
                      action: 'restore',
                      contentIds: selectedContent
                    });
                    setShowModerationDialog(true);
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contenido ({pagination.total})</CardTitle>
          <CardDescription>
            Lista de todo el contenido del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedContent.length === content.length && content.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedContent(content.map(c => `${c.type}:${c.id}`));
                        } else {
                          setSelectedContent([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contenido</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Estadísticas</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Cargando contenido...
                    </TableCell>
                  </TableRow>
                ) : content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No se encontró contenido
                    </TableCell>
                  </TableRow>
                ) : (
                  content.map((item) => {
                    const contentKey = `${item.type}:${item.id}`;
                    return (
                      <TableRow key={contentKey}>
                        <TableCell>
                          <Checkbox
                            checked={selectedContent.includes(contentKey)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedContent([...selectedContent, contentKey]);
                              } else {
                                setSelectedContent(selectedContent.filter(id => id !== contentKey));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.type === 'post' ? 'Post' : 'Comentario'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="space-y-1">
                            <p className="text-sm">{getContentPreview(item)}</p>
                            {item.type === 'comment' && item.post && (
                              <p className="text-xs text-muted-foreground">
                                En: {item.post.title}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.author.avatar && (
                              <img
                                src={item.author.avatar}
                                alt={item.author.name}
                                className="h-6 w-6 rounded-full"
                              />
                            )}
                            <div>
                              <p className="text-sm font-medium">{item.author.name}</p>
                              <p className="text-xs text-muted-foreground">@{item.author.username}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(item.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            {item.likesCount !== undefined && (
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {item.likesCount}
                              </div>
                            )}
                            {item.commentsCount !== undefined && (
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {item.commentsCount}
                              </div>
                            )}
                            {item.reportsCount !== undefined && item.reportsCount > 0 && (
                              <div className="flex items-center gap-1 text-red-600">
                                <AlertTriangle className="h-3 w-3" />
                                {item.reportsCount}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{format(new Date(item.createdAt), 'dd/MM/yyyy')}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(item.createdAt), 'HH:mm')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              {item.status === 'active' && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setModerationAction({
                                      type: 'single',
                                      action: 'hide',
                                      contentId: item.id
                                    });
                                    setShowModerationDialog(true);
                                  }}
                                >
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Ocultar
                                </DropdownMenuItem>
                              )}
                              
                              {item.status !== 'active' && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setModerationAction({
                                      type: 'single',
                                      action: 'restore',
                                      contentId: item.id
                                    });
                                    setShowModerationDialog(true);
                                  }}
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Restaurar
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuItem
                                onClick={() => {
                                  setModerationAction({
                                    type: 'single',
                                    action: 'flag',
                                    contentId: item.id
                                  });
                                  setShowModerationDialog(true);
                                }}
                              >
                                <Flag className="h-4 w-4 mr-2" />
                                Marcar
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem
                                onClick={() => {
                                  if (confirm('¿Estás seguro de que quieres eliminar este contenido permanentemente?')) {
                                    deleteContent(item.id, item.type);
                                  }
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} resultados
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Moderation Dialog */}
      <Dialog open={showModerationDialog} onOpenChange={setShowModerationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acción de Moderación</DialogTitle>
            <DialogDescription>
              {moderationAction?.type === 'bulk'
                ? `Realizar acción en ${moderationAction.contentIds?.length} elementos`
                : 'Realizar acción en el contenido seleccionado'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Razón</Label>
              <Input
                id="reason"
                placeholder="Razón de la acción..."
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas del moderador</Label>
              <Textarea
                id="notes"
                placeholder="Notas adicionales..."
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModerationDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleModerationAction}>
              Confirmar Acción
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentManagement;