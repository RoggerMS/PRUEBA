'use client';

import { FileText, MessageSquare, Users, Calendar, Upload, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface QuickAction {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    name: 'Subir Apunte',
    href: '/notes/upload',
    icon: Upload,
    description: 'Comparte tus apuntes',
    color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
  },
  {
    name: 'Hacer Pregunta',
    href: '/forum/ask',
    icon: HelpCircle,
    description: 'Pregunta a la comunidad',
    color: 'text-green-600 bg-green-50 hover:bg-green-100'
  },
  {
    name: 'Crear Club',
    href: '/clubs/create',
    icon: Users,
    description: 'Forma un grupo de estudio',
    color: 'text-purple-600 bg-purple-50 hover:bg-purple-100'
  },
  {
    name: 'Crear Evento',
    href: '/events/create',
    icon: Calendar,
    description: 'Organiza un evento',
    color: 'text-orange-600 bg-orange-50 hover:bg-orange-100'
  }
];

export function QuickActions() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start h-auto p-3 ${action.color} transition-colors`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-medium text-sm">{action.name}</p>
                    <p className="text-xs opacity-75">{action.description}</p>
                  </div>
                </div>
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}