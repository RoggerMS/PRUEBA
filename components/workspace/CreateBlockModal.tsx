'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { FileText, Kanban, MessageSquare } from 'lucide-react';

interface CreateBlockModalProps {
  onCreateBlock: (type: 'DOCS' | 'KANBAN' | 'FRASES', title: string) => void;
}

const BLOCK_TYPES = [
  {
    type: 'DOCS' as const,
    name: 'Documentos',
    description: 'Crea y organiza documentos con páginas múltiples',
    icon: FileText,
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  },
  {
    type: 'KANBAN' as const,
    name: 'Kanban',
    description: 'Organiza tareas con tableros y tarjetas',
    icon: Kanban,
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
  },
  {
    type: 'FRASES' as const,
    name: 'Frases',
    description: 'Colecciona y organiza frases inspiradoras',
    icon: MessageSquare,
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
  },
];

export function CreateBlockModal({ onCreateBlock }: CreateBlockModalProps) {
  const [selectedType, setSelectedType] = useState<'DOCS' | 'KANBAN' | 'FRASES' | null>(null);
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!selectedType || !title.trim()) return;
    
    setIsCreating(true);
    try {
      await onCreateBlock(selectedType, title.trim());
      // Reset form
      setSelectedType(null);
      setTitle('');
    } catch (error) {
      console.error('Error creating block:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedType && title.trim()) {
      handleCreate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Block Type Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Tipo de Bloque</Label>
        <div className="grid gap-3">
          {BLOCK_TYPES.map((blockType) => {
            const Icon = blockType.icon;
            return (
              <Card
                key={blockType.type}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedType === blockType.type
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : blockType.color
                }`}
                onClick={() => setSelectedType(blockType.type)}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm">{blockType.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {blockType.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Title Input */}
      {selectedType && (
        <div className="space-y-2">
          <Label htmlFor="block-title" className="text-sm font-medium">
            Título del Bloque
          </Label>
          <Input
            id="block-title"
            type="text"
            placeholder="Ingresa un título para tu bloque..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            maxLength={100}
            autoFocus
          />
          <p className="text-xs text-gray-500">
            {title.length}/100 caracteres
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={() => {
            setSelectedType(null);
            setTitle('');
          }}
          disabled={isCreating}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleCreate}
          disabled={!selectedType || !title.trim() || isCreating}
        >
          {isCreating ? 'Creando...' : 'Crear Bloque'}
        </Button>
      </div>
    </div>
  );
}