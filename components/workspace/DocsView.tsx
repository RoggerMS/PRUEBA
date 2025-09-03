'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Edit3, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface DocsPage {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

interface DocsViewProps {
  blockId: string;
}

export function DocsView({ blockId }: DocsViewProps) {
  const [pages, setPages] = useState<DocsPage[]>([]);
  const [currentPage, setCurrentPage] = useState<DocsPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  // Fetch pages
  const fetchPages = useCallback(async () => {
    try {
      const response = await fetch(`/api/workspace/docs/pages?blockId=${blockId}`);
      if (!response.ok) throw new Error('Failed to fetch pages');

      const data = await response.json();
      setPages(data.pages);

      // Set current page to first page if none selected
      setCurrentPage(prev => prev ?? data.pages[0] ?? null);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [blockId]);

  // Create new page
  const createPage = async () => {
    if (!newPageTitle.trim()) return;
    
    try {
      const response = await fetch('/api/workspace/docs/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPageTitle.trim(),
          content: '',
          blockId,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create page');
      
      const data = await response.json();
      setPages(prev => [...prev, data.page]);
      setCurrentPage(data.page);
      setNewPageTitle('');
      setIsCreating(false);
      toast.success('Página creada exitosamente');
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error('Error al crear la página');
    }
  };

  // Update page
  const updatePage = async () => {
    if (!currentPage) return;
    
    try {
      const response = await fetch(`/api/workspace/docs/pages/${currentPage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update page');
      
      const data = await response.json();
      setPages(prev => prev.map(p => p.id === data.page.id ? data.page : p));
      setCurrentPage(data.page);
      setIsEditing(false);
      toast.success('Página actualizada exitosamente');
    } catch (error) {
      console.error('Error updating page:', error);
      toast.error('Error al actualizar la página');
    }
  };

  // Delete page
  const deletePage = async (pageId: string) => {
    try {
      const response = await fetch(`/api/workspace/docs/pages/${pageId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete page');
      
      setPages(prev => prev.filter(p => p.id !== pageId));
      
      // If deleted page was current, select first remaining page
      if (currentPage?.id === pageId) {
        const remainingPages = pages.filter(p => p.id !== pageId);
        setCurrentPage(remainingPages[0] || null);
      }
      
      toast.success('Página eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Error al eliminar la página');
    }
  };

  // Start editing
  const startEditing = () => {
    if (!currentPage) return;
    setEditTitle(currentPage.title);
    setEditContent(currentPage.content);
    setIsEditing(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
  };

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Pages Tabs */}
      <div className="flex items-center gap-1 p-2 border-b bg-white/50 overflow-x-auto">
        {pages.map((page) => (
          <Button
            key={page.id}
            variant={currentPage?.id === page.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentPage(page)}
            className="flex-shrink-0 text-xs h-7"
          >
            <FileText className="w-3 h-3 mr-1" />
            {page.title}
            {pages.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deletePage(page.id);
                }}
                className="ml-1 h-4 w-4 p-0 text-red-500 hover:text-red-700"
              >
                <X className="w-2 h-2" />
              </Button>
            )}
          </Button>
        ))}
        
        {/* Add Page Button */}
        {!isCreating && pages.length < 20 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="flex-shrink-0 text-xs h-7"
          >
            <Plus className="w-3 h-3" />
          </Button>
        )}
        
        {/* Create Page Input */}
        {isCreating && (
          <div className="flex items-center gap-1">
            <Input
              type="text"
              placeholder="Título de página"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createPage()}
              className="h-7 text-xs w-32"
              maxLength={50}
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={createPage}
              disabled={!newPageTitle.trim()}
              className="h-7 w-7 p-0"
            >
              <Save className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCreating(false);
                setNewPageTitle('');
              }}
              className="h-7 w-7 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Page Content */}
      {currentPage ? (
        <div className="flex-1 flex flex-col">
          {/* Page Header */}
          <div className="flex items-center justify-between p-3 border-b bg-white/50">
            {isEditing ? (
              <Input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="font-medium text-sm"
                maxLength={100}
              />
            ) : (
              <h3 className="font-medium text-sm truncate">{currentPage.title}</h3>
            )}
            
            <div className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={updatePage}
                    className="h-6 w-6 p-0"
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelEditing}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startEditing}
                  className="h-6 w-6 p-0"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 p-3">
            {isEditing ? (
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Escribe el contenido de tu página..."
                className="w-full h-full resize-none text-sm"
              />
            ) : (
              <div className="w-full h-full">
                {currentPage.content ? (
                  <div className="text-sm whitespace-pre-wrap">
                    {currentPage.content}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm italic">
                    Esta página está vacía. Haz clic en editar para agregar contenido.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-6 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <h3 className="font-medium mb-2">Sin páginas</h3>
            <p className="text-sm text-gray-600 mb-4">
              Crea tu primera página para comenzar
            </p>
            <Button onClick={() => setIsCreating(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Página
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}