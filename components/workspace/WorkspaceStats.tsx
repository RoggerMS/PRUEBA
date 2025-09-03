'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Grid3X3, 
  FileText, 
  Kanban, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Clock
} from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspace';

interface WorkspaceStatsProps {
  className?: string;
}

export function WorkspaceStats({ className }: WorkspaceStatsProps) {
  const { stats, loadStats, isLoading } = useWorkspace();

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (isLoading || !stats) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Pizarras',
      value: stats.boardsCount,
      icon: Grid3X3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Pizarras creadas',
      progress: Math.min((stats.boardsCount / 10) * 100, 100), // Max 10 boards
    },
    {
      title: 'Bloques',
      value: stats.blocksCount,
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Bloques totales',
      progress: Math.min((stats.blocksCount / 100) * 100, 100), // Max 100 blocks
    },
    {
      title: 'Documentos',
      value: stats.docsCount,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Docs creados',
      progress: Math.min((stats.docsCount / 50) * 100, 100), // Max 50 docs
    },
    {
      title: 'Kanban',
      value: stats.kanbanCount,
      icon: Kanban,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Tableros Kanban',
      progress: Math.min((stats.kanbanCount / 20) * 100, 100), // Max 20 kanban
    },
  ];

  return (
    <div className={className}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{stat.value}</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{stat.description}</span>
                    <span>{Math.round(stat.progress)}%</span>
                  </div>
                  <Progress value={stat.progress} className="h-1" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Activity Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Bloques totales</span>
                <Badge variant="secondary">{stats.blocksCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Docs totales</span>
                <Badge variant="secondary">{stats.docsCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Kanban totales</span>
                <Badge variant="secondary">{stats.kanbanCount}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collaboration Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Colaboración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Colaboradores activos</span>
                <Badge variant="outline">{stats.collaboratorsCount ?? 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pizarras compartidas</span>
                <Badge variant="outline">{stats.sharedBoardsCount ?? 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Uso del Workspace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pizarras totales</span>
                <Badge variant="outline">{stats.boardsCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Bloques totales</span>
                <Badge variant="outline">{stats.blocksCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Frases totales</span>
                <Badge variant="outline">{stats.frasesCount}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}