'use client';

import { useState } from 'react';
import { Plus, FileText, MessageSquare, Bot, Users, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface QuickAction {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

const quickActions: QuickAction[] = [
  {
    name: 'Nota Rápida',
    href: '/personal-space?action=quick-note',
    icon: FileText,
    color: 'bg-blue-500 hover:bg-blue-600',
    description: 'Crear una nota rápida en tu espacio personal'
  },
  {
    name: 'Pregunta',
    href: '/forum/ask',
    icon: MessageSquare,
    color: 'bg-green-500 hover:bg-green-600',
    description: 'Hacer una pregunta en el foro'
  },
  {
    name: 'CruneBot',
    href: '/crunebot',
    icon: Bot,
    color: 'bg-crunevo-500 hover:bg-crunevo-600',
    description: 'Chatear con CruneBot para ayuda rápida'
  },
  {
    name: 'Crear Club',
    href: '/clubs/create',
    icon: Users,
    color: 'bg-purple-500 hover:bg-purple-600',
    description: 'Crear un nuevo club de estudio'
  },
  {
    name: 'Evento',
    href: '/events/create',
    icon: Calendar,
    color: 'bg-orange-500 hover:bg-orange-600',
    description: 'Crear un nuevo evento'
  }
];

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Quick Action Buttons */}
        <div className={cn(
          'flex flex-col-reverse space-y-reverse space-y-3 mb-3 transition-all duration-300',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Tooltip key={action.href}>
                <TooltipTrigger asChild>
                  <Link href={action.href}>
                    <Button
                      size="sm"
                      className={cn(
                        'w-12 h-12 rounded-full shadow-lg text-white transition-all duration-200',
                        'transform hover:scale-110',
                        action.color,
                        'animate-in slide-in-from-bottom-2'
                      )}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both'
                      }}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="left" className="mr-2">
                  <div>
                    <p className="font-medium">{action.name}</p>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Main FAB Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              onClick={toggleMenu}
              className={cn(
                'w-14 h-14 rounded-full shadow-xl transition-all duration-300',
                'bg-gradient-to-r from-crunevo-500 to-crunevo-600',
                'hover:from-crunevo-600 hover:to-crunevo-700',
                'text-white transform hover:scale-110',
                'focus:ring-4 focus:ring-crunevo-200',
                isOpen && 'rotate-45'
              )}
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Plus className="w-6 h-6" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="mr-2">
            <p>{isOpen ? 'Cerrar menú' : 'Acciones rápidas'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
