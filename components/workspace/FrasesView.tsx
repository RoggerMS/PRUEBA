'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Quote, Edit3, Trash2, Save, X, Heart, Star } from 'lucide-react';
import { toast } from 'sonner';

interface FrasesItem {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface FrasesViewProps {
  blockId: string;
}

export function FrasesView({ blockId }: FrasesViewProps) {
  const [items, setItems] = useState<FrasesItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Fetch items
  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch(`/api/workspace/frases/items?blockId=${blockId}`);
      if (!response.ok) throw new Error('Failed to fetch items');

      const data = await response.json();
      setItems(data.items);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [blockId]);

  // Create item
  const createItem = async () => {
    if (!newContent.trim()) return;
    
    try {
      const response = await fetch('/api/workspace/frases/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newContent.trim(),
          blockId,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create item');
      
      const data = await response.json();
      setItems(prev => [data.item, ...prev]);
      setNewContent('');
      setIsCreating(false);
      toast.success('Frase agregada exitosamente');
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Error al agregar la frase');
    }
  };

  // Update item
  const updateItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/workspace/frases/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update item');
      
      const data = await response.json();
      setItems(prev => prev.map(item => 
        item.id === itemId ? data.item : item
      ));
      setEditingItem(null);
      setEditContent('');
      toast.success('Frase actualizada exitosamente');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Error al actualizar la frase');
    }
  };



  // Delete item
  const deleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/workspace/frases/items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete item');
      
      setItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Frase eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error al eliminar la frase');
    }
  };

  // Start editing
  const startEditing = (item: FrasesItem) => {
    setEditingItem(item.id);
    setEditContent(item.content);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingItem(null);
    setEditContent('');
  };

  // Filter items
  const filteredItems = items;

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-white/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Frases Inspiradoras</span>
          <Badge variant="secondary" className="text-xs">
            {items.length}/200
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {!isCreating && items.length < 200 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreating(true)}
              className="h-6 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Frase
            </Button>
          )}
        </div>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="p-3 border-b bg-purple-50">
          <Card className="p-3">
            <div className="space-y-2">
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Escribe una frase inspiradora..."
                className="text-sm resize-none"
                rows={3}
                maxLength={500}
                autoFocus
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {newContent.length}/500 caracteres
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={createItem}
                    disabled={!newContent.trim()}
                    className="h-6 text-xs"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Guardar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCreating(false);
                      setNewContent('');
                    }}
                    className="h-6 text-xs"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
            {editingItem === item.id ? (
              <div className="space-y-3">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="text-sm resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {editContent.length}/500 caracteres
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateItem(item.id)}
                      disabled={!editContent.trim()}
                      className="h-6 text-xs"
                    >
                      Guardar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEditing}
                      className="h-6 text-xs"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-3">
                  <Quote className="w-4 h-4 text-purple-500 flex-shrink-0 mt-1" />
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(item)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <blockquote className="text-sm leading-relaxed mb-3 pl-4 border-l-2 border-purple-200">
                  {item.content}
                </blockquote>
                
                <div className="flex items-center justify-end">
                  <span className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </Card>
        ))}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <Card className="p-6 text-center">
              <Quote className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <h3 className="font-medium mb-2">Sin frases</h3>
              <p className="text-sm text-gray-600 mb-4">
                Agrega tu primera frase inspiradora
              </p>
              <Button onClick={() => setIsCreating(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Frase
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}