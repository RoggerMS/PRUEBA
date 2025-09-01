'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Award,
  BookOpen,
  Trophy,
  MessageSquare,
  FileText
} from 'lucide-react'

interface ActivityData {
  date: string
  xp: number
  courses: number
  challenges: number
  forum: number
  notes: number
}

interface SubjectData {
  subject: string
  xp: number
  courses: number
  color: string
}

interface MonthlyData {
  month: string
  xp: number
  crolars: number
  achievements: number
}

const mockWeeklyActivity: ActivityData[] = [
  { date: '2024-01-15', xp: 450, courses: 2, challenges: 1, forum: 3, notes: 5 },
  { date: '2024-01-16', xp: 320, courses: 1, challenges: 2, forum: 1, notes: 3 },
  { date: '2024-01-17', xp: 680, courses: 3, challenges: 1, forum: 4, notes: 7 },
  { date: '2024-01-18', xp: 520, courses: 2, challenges: 3, forum: 2, notes: 4 },
  { date: '2024-01-19', xp: 750, courses: 4, challenges: 2, forum: 5, notes: 8 },
  { date: '2024-01-20', xp: 380, courses: 1, challenges: 1, forum: 2, notes: 3 },
  { date: '2024-01-21', xp: 590, courses: 2, challenges: 2, forum: 3, notes: 6 }
]

const mockSubjectData: SubjectData[] = [
  { subject: 'Matemáticas', xp: 3200, courses: 8, color: '#8B5CF6' },
  { subject: 'Programación', xp: 2800, courses: 6, color: '#06B6D4' },
  { subject: 'Física', xp: 2100, courses: 5, color: '#10B981' },
  { subject: 'Química', xp: 1800, courses: 4, color: '#F59E0B' },
  { subject: 'Historia', xp: 1200, courses: 3, color: '#EF4444' },
  { subject: 'Literatura', xp: 900, courses: 2, color: '#EC4899' }
]

const mockMonthlyData: MonthlyData[] = [
  { month: 'Ene', xp: 2400, crolars: 480, achievements: 3 },
  { month: 'Feb', xp: 3200, crolars: 640, achievements: 5 },
  { month: 'Mar', xp: 2800, crolars: 560, achievements: 4 },
  { month: 'Abr', xp: 3600, crolars: 720, achievements: 6 },
  { month: 'May', xp: 4200, crolars: 840, achievements: 8 },
  { month: 'Jun', xp: 3800, crolars: 760, achievements: 7 }
]

interface StatsChartProps {
  className?: string
}

export default function StatsChart({ className }: StatsChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Actividad</TabsTrigger>
          <TabsTrigger value="subjects">Materias</TabsTrigger>
          <TabsTrigger value="progress">Progreso</TabsTrigger>
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
        </TabsList>

        {/* Activity Chart */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Actividad Semanal
              </CardTitle>
              <CardDescription>
                Tu progreso en XP durante los últimos 7 días
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockWeeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="xp" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center space-y-1">
                  <BookOpen className="h-5 w-5 text-blue-500 mx-auto" />
                  <div className="text-2xl font-bold">
                    {mockWeeklyActivity.reduce((sum, day) => sum + day.courses, 0)}
                  </div>
                  <div className="text-xs text-gray-600">Cursos</div>
                </div>
                <div className="text-center space-y-1">
                  <Trophy className="h-5 w-5 text-yellow-500 mx-auto" />
                  <div className="text-2xl font-bold">
                    {mockWeeklyActivity.reduce((sum, day) => sum + day.challenges, 0)}
                  </div>
                  <div className="text-xs text-gray-600">Desafíos</div>
                </div>
                <div className="text-center space-y-1">
                  <MessageSquare className="h-5 w-5 text-green-500 mx-auto" />
                  <div className="text-2xl font-bold">
                    {mockWeeklyActivity.reduce((sum, day) => sum + day.forum, 0)}
                  </div>
                  <div className="text-xs text-gray-600">Foro</div>
                </div>
                <div className="text-center space-y-1">
                  <FileText className="h-5 w-5 text-purple-500 mx-auto" />
                  <div className="text-2xl font-bold">
                    {mockWeeklyActivity.reduce((sum, day) => sum + day.notes, 0)}
                  </div>
                  <div className="text-xs text-gray-600">Notas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Chart */}
        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Distribución por Materias
              </CardTitle>
              <CardDescription>
                XP ganado en cada materia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockSubjectData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="xp"
                      >
                        {mockSubjectData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value} XP`, 'Experiencia']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-3">
                  {mockSubjectData.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: subject.color }}
                        />
                        <div>
                          <div className="font-medium">{subject.subject}</div>
                          <div className="text-sm text-gray-600">{subject.courses} cursos</div>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {subject.xp.toLocaleString()} XP
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Chart */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Progreso Mensual
              </CardTitle>
              <CardDescription>
                Tu evolución durante los últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="xp" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                      name="XP"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="crolars" 
                      stroke="#F59E0B" 
                      strokeWidth={3}
                      dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                      name="Crolars"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Chart */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Comparación de Actividades
              </CardTitle>
              <CardDescription>
                Comparación de tu rendimiento en diferentes áreas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockWeeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="courses" fill="#06B6D4" name="Cursos" />
                    <Bar dataKey="challenges" fill="#F59E0B" name="Desafíos" />
                    <Bar dataKey="forum" fill="#10B981" name="Foro" />
                    <Bar dataKey="notes" fill="#8B5CF6" name="Notas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-500 rounded" />
                  <span className="text-sm">Cursos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded" />
                  <span className="text-sm">Desafíos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-sm">Foro</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded" />
                  <span className="text-sm">Notas</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
