'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreVertical, Edit3, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

interface KanbanColumn {
  id: string;
  name: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  cards: KanbanCard[];
}

interface KanbanViewProps {
  blockId: string;
}

export function KanbanView({ blockId }: KanbanViewProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editColumnName, setEditColumnName] = useState('');
  const [creatingCardInColumn, setCreatingCardInColumn] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editCardTitle, setEditCardTitle] = useState('');
  const [editCardDescription, setEditCardDescription] = useState('');

  // Fetch columns
  const fetchColumns = async () => {
    try {
      const response = await fetch(`/api/workspace/kanban/columns?blockId=${blockId}`);
      if (!response.ok) throw new Error('Failed to fetch columns');
      
      const data = await response.json();
      setColumns(data.columns);
    } catch (error) {
      console.error('Error fetching columns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create column
  const createColumn = async () => {
    if (!newColumnName.trim()) return;
    
    try {
      const response = await fetch('/api/workspace/kanban/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newColumnName.trim(),
          blockId,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create column');
      
      const data = await response.json();
      setColumns(prev => [...prev, { ...data.column, cards: [] }]);
      setNewColumnName('');
      setIsCreatingColumn(false);
      toast.success('Columna creada exitosamente');
    } catch (error) {
      console.error('Error creating column:', error);
      toast.error('Error al crear la columna');
    }
  };

  // Update column
  const updateColumn = async (columnId: string) => {
    try {
      const response = await fetch(`/api/workspace/kanban/columns/${columnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editColumnName.trim(),
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update column');
      
      const data = await response.json();
      setColumns(prev => prev.map(col => 
        col.id === columnId ? { ...col, name: data.column.name } : col
      ));
      setEditingColumn(null);
      setEditColumnName('');
      toast.success('Columna actualizada exitosamente');
    } catch (error) {
      console.error('Error updating column:', error);
      toast.error('Error al actualizar la columna');
    }
  };

  // Delete column
  const deleteColumn = async (columnId: string) => {
    try {
      const response = await fetch(`/api/workspace/kanban/columns/${columnId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete column');
      
      setColumns(prev => prev.filter(col => col.id !== columnId));
      toast.success('Columna eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting column:', error);
      toast.error('Error al eliminar la columna');
    }
  };

  // Create card
  const createCard = async (columnId: string) => {
    if (!newCardTitle.trim()) return;
    
    try {
      const response = await fetch('/api/workspace/kanban/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCardTitle.trim(),
          description: newCardDescription.trim(),
          columnId,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create card');
      
      const data = await response.json();
      setColumns(prev => prev.map(col => 
        col.id === columnId 
          ? { ...col, cards: [...col.cards, data.card] }
          : col
      ));
      setNewCardTitle('');
      setNewCardDescription('');
      setCreatingCardInColumn(null);
      toast.success('Tarjeta creada exitosamente');
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error('Error al crear la tarjeta');
    }
  };

  // Update card
  const updateCard = async (cardId: string, columnId: string) => {
    try {
      const response = await fetch(`/api/workspace/kanban/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editCardTitle.trim(),
          description: editCardDescription.trim(),
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update card');
      
      const data = await response.json();
      setColumns(prev => prev.map(col => 
        col.id === columnId 
          ? { 
              ...col, 
              cards: col.cards.map(card => 
                card.id === cardId ? data.card : card
              )
            }
          : col
      ));
      setEditingCard(null);
      setEditCardTitle('');
      setEditCardDescription('');
      toast.success('Tarjeta actualizada exitosamente');
    } catch (error) {
      console.error('Error updating card:', error);
      toast.error('Error al actualizar la tarjeta');
    }
  };

  // Delete card
  const deleteCard = async (cardId: string, columnId: string) => {
    try {
      const response = await fetch(`/api/workspace/kanban/cards/${cardId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete card');
      
      setColumns(prev => prev.map(col => 
        col.id === columnId 
          ? { ...col, cards: col.cards.filter(card => card.id !== cardId) }
          : col
      ));
      toast.success('Tarjeta eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Error al eliminar la tarjeta');
    }
  };

  // Start editing column
  const startEditingColumn = (column: KanbanColumn) => {
    setEditingColumn(column.id);
    setEditColumnName(column.name);
  };

  // Start editing card
  const startEditingCard = (card: KanbanCard) => {
    setEditingCard(card.id);
    setEditCardTitle(card.title);
    setEditCardDescription(card.description);
  };

  useEffect(() => {
    fetchColumns();
  }, [blockId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-white/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Tablero Kanban</span>
          <Badge variant="secondary" className="text-xs">
            {columns.reduce((total, col) => total + col.cards.length, 0)} tarjetas
          </Badge>
        </div>
        
        {!isCreatingColumn && columns.length < 10 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreatingColumn(true)}
            className="h-6 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Columna
          </Button>
        )}
      </div>

      {/* Columns */}
      <div className="flex-1 flex gap-3 p-3 overflow-x-auto">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-64">
            <Card className="h-full flex flex-col">
              {/* Column Header */}
              <div className="p-3 border-b bg-gray-50">
                {editingColumn === column.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="text"
                      value={editColumnName}
                      onChange={(e) => setEditColumnName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && updateColumn(column.id)}
                      className="text-sm font-medium"
                      maxLength={50}
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateColumn(column.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Save className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingColumn(null);
                        setEditColumnName('');
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{column.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {column.cards.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingColumn(column)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      {columns.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteColumn(column.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {column.cards.map((card) => (
                  <Card key={card.id} className="p-3">
                    {editingCard === card.id ? (
                      <div className="space-y-2">
                        <Input
                          type="text"
                          value={editCardTitle}
                          onChange={(e) => setEditCardTitle(e.target.value)}
                          placeholder="Título de la tarjeta"
                          className="text-sm font-medium"
                          maxLength={100}
                        />
                        <Textarea
                          value={editCardDescription}
                          onChange={(e) => setEditCardDescription(e.target.value)}
                          placeholder="Descripción (opcional)"
                          className="text-xs resize-none"
                          rows={2}
                        />
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateCard(card.id, column.id)}
                            className="h-6 text-xs"
                          >
                            Guardar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCard(null);
                              setEditCardTitle('');
                              setEditCardDescription('');
                            }}
                            className="h-6 text-xs"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-medium truncate">{card.title}</h4>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingCard(card)}
                              className="h-4 w-4 p-0"
                            >
                              <Edit3 className="w-2 h-2" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCard(card.id, column.id)}
                              className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-2 h-2" />
                            </Button>
                          </div>
                        </div>
                        {card.description && (
                          <p className="text-xs text-gray-600 truncate">
                            {card.description}
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                ))}

                {/* Add Card */}
                {creatingCardInColumn === column.id ? (
                  <Card className="p-3">
                    <div className="space-y-2">
                      <Input
                        type="text"
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        placeholder="Título de la tarjeta"
                        className="text-sm"
                        maxLength={100}
                        autoFocus
                      />
                      <Textarea
                        value={newCardDescription}
                        onChange={(e) => setNewCardDescription(e.target.value)}
                        placeholder="Descripción (opcional)"
                        className="text-xs resize-none"
                        rows={2}
                      />
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => createCard(column.id)}
                          disabled={!newCardTitle.trim()}
                          className="h-6 text-xs"
                        >
                          Crear
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCreatingCardInColumn(null);
                            setNewCardTitle('');
                            setNewCardDescription('');
                          }}
                          className="h-6 text-xs"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  column.cards.length < 50 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCreatingCardInColumn(column.id)}
                      className="w-full h-8 text-xs border-dashed border-2"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Agregar tarjeta
                    </Button>
                  )
                )}
              </div>
            </Card>
          </div>
        ))}

        {/* Add Column */}
        {isCreatingColumn && (
          <div className="flex-shrink-0 w-64">
            <Card className="p-3">
              <div className="space-y-2">
                <Input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createColumn()}
                  placeholder="Nombre de la columna"
                  className="text-sm"
                  maxLength={50}
                  autoFocus
                />
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={createColumn}
                    disabled={!newColumnName.trim()}
                    className="h-6 text-xs"
                  >
                    Crear
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCreatingColumn(false);
                      setNewColumnName('');
                    }}
                    className="h-6 text-xs"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {columns.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium mb-2">Sin columnas</h3>
              <p className="text-sm text-gray-600 mb-4">
                Crea tu primera columna para comenzar
              </p>
              <Button onClick={() => setIsCreatingColumn(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Columna
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}