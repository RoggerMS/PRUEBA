'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Download,
  Trash2,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Lock,
  User,
  Save,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  forumReplies: boolean
  courseUpdates: boolean
  challengeReminders: boolean
  weeklyDigest: boolean
  achievementAlerts: boolean
  marketplaceUpdates: boolean
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private'
  showAchievements: boolean
  showProgress: boolean
  showActivity: boolean
  allowMessages: boolean
  showOnlineStatus: boolean
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  dateFormat: string
  compactMode: boolean
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  loginAlerts: boolean
  sessionTimeout: number
  passwordLastChanged: string
}

interface SettingsPanelProps {
  className?: string
}

export default function SettingsPanel({ className }: SettingsPanelProps) {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    forumReplies: true,
    courseUpdates: true,
    challengeReminders: false,
    weeklyDigest: true,
    achievementAlerts: true,
    marketplaceUpdates: false
  })

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showAchievements: true,
    showProgress: true,
    showActivity: false,
    allowMessages: true,
    showOnlineStatus: true
  })

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'system',
    language: 'es',
    timezone: 'America/Mexico_City',
    dateFormat: 'DD/MM/YYYY',
    compactMode: false
  })

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
    passwordLastChanged: '2024-01-15'
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
  }

  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    setPrivacy(prev => ({ ...prev, [key]: value }))
  }

  const handleAppearanceChange = (key: keyof AppearanceSettings, value: any) => {
    setAppearance(prev => ({ ...prev, [key]: value }))
  }

  const handleSecurityChange = (key: keyof SecuritySettings, value: any) => {
    setSecurity(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    toast.success('Configuración guardada correctamente')
  }

  const handlePasswordChange = () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    if (passwordForm.new.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }
    toast.success('Contraseña actualizada correctamente')
    setPasswordForm({ current: '', new: '', confirm: '' })
  }

  const handleExportData = () => {
    toast.success('Exportación iniciada. Recibirás un email cuando esté lista.')
  }

  const handleDeleteAccount = () => {
    toast.error('Función no disponible en la demo')
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="privacy">Privacidad</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuración de Notificaciones
              </CardTitle>
              <CardDescription>
                Controla qué notificaciones quieres recibir y cómo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificaciones por email</Label>
                    <div className="text-sm text-gray-600">
                      Recibe notificaciones importantes por correo electrónico
                    </div>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(value) => handleNotificationChange('emailNotifications', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificaciones push</Label>
                    <div className="text-sm text-gray-600">
                      Recibe notificaciones en tiempo real en tu dispositivo
                    </div>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(value) => handleNotificationChange('pushNotifications', value)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Notificaciones específicas</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Respuestas del foro</Label>
                      <Switch
                        checked={notifications.forumReplies}
                        onCheckedChange={(value) => handleNotificationChange('forumReplies', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Actualizaciones de cursos</Label>
                      <Switch
                        checked={notifications.courseUpdates}
                        onCheckedChange={(value) => handleNotificationChange('courseUpdates', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Recordatorios de desafíos</Label>
                      <Switch
                        checked={notifications.challengeReminders}
                        onCheckedChange={(value) => handleNotificationChange('challengeReminders', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Resumen semanal</Label>
                      <Switch
                        checked={notifications.weeklyDigest}
                        onCheckedChange={(value) => handleNotificationChange('weeklyDigest', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Alertas de logros</Label>
                      <Switch
                        checked={notifications.achievementAlerts}
                        onCheckedChange={(value) => handleNotificationChange('achievementAlerts', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Marketplace</Label>
                      <Switch
                        checked={notifications.marketplaceUpdates}
                        onCheckedChange={(value) => handleNotificationChange('marketplaceUpdates', value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuración de Privacidad
              </CardTitle>
              <CardDescription>
                Controla quién puede ver tu información y actividad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Visibilidad del perfil</Label>
                  <Select 
                    value={privacy.profileVisibility} 
                    onValueChange={(value: 'public' | 'friends' | 'private') => 
                      handlePrivacyChange('profileVisibility', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="friends">Solo amigos</SelectItem>
                      <SelectItem value="private">Privado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Información visible</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Mostrar logros</Label>
                      <Switch
                        checked={privacy.showAchievements}
                        onCheckedChange={(value) => handlePrivacyChange('showAchievements', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Mostrar progreso</Label>
                      <Switch
                        checked={privacy.showProgress}
                        onCheckedChange={(value) => handlePrivacyChange('showProgress', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Mostrar actividad</Label>
                      <Switch
                        checked={privacy.showActivity}
                        onCheckedChange={(value) => handlePrivacyChange('showActivity', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Permitir mensajes</Label>
                      <Switch
                        checked={privacy.allowMessages}
                        onCheckedChange={(value) => handlePrivacyChange('allowMessages', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Mostrar estado en línea</Label>
                      <Switch
                        checked={privacy.showOnlineStatus}
                        onCheckedChange={(value) => handlePrivacyChange('showOnlineStatus', value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Configuración de Apariencia
              </CardTitle>
              <CardDescription>
                Personaliza la apariencia de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select 
                    value={appearance.theme} 
                    onValueChange={(value: 'light' | 'dark' | 'system') => 
                      handleAppearanceChange('theme', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select 
                    value={appearance.language} 
                    onValueChange={(value) => handleAppearanceChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Zona horaria</Label>
                  <Select 
                    value={appearance.timezone} 
                    onValueChange={(value) => handleAppearanceChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                      <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Formato de fecha</Label>
                  <Select 
                    value={appearance.dateFormat} 
                    onValueChange={(value) => handleAppearanceChange('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Modo compacto</Label>
                  <div className="text-sm text-gray-600">
                    Reduce el espaciado para mostrar más contenido
                  </div>
                </div>
                <Switch
                  checked={appearance.compactMode}
                  onCheckedChange={(value) => handleAppearanceChange('compactMode', value)}
                />
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Configuración de Seguridad
              </CardTitle>
              <CardDescription>
                Mantén tu cuenta segura con estas opciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Autenticación de dos factores</Label>
                    <div className="text-sm text-gray-600">
                      Añade una capa extra de seguridad a tu cuenta
                    </div>
                  </div>
                  <Switch
                    checked={security.twoFactorEnabled}
                    onCheckedChange={(value) => handleSecurityChange('twoFactorEnabled', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Alertas de inicio de sesión</Label>
                    <div className="text-sm text-gray-600">
                      Recibe notificaciones cuando alguien acceda a tu cuenta
                    </div>
                  </div>
                  <Switch
                    checked={security.loginAlerts}
                    onCheckedChange={(value) => handleSecurityChange('loginAlerts', value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tiempo de sesión (minutos)</Label>
                  <Select 
                    value={security.sessionTimeout.toString()} 
                    onValueChange={(value) => handleSecurityChange('sessionTimeout', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                      <SelectItem value="0">Sin límite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Cambiar contraseña</h4>
                  <div className="text-sm text-gray-600">
                    Última actualización: {new Date(security.passwordLastChanged).toLocaleDateString('es-ES')}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Contraseña actual</Label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                          placeholder="Ingresa tu contraseña actual"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Nueva contraseña</Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.new}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                          placeholder="Ingresa tu nueva contraseña"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Confirmar nueva contraseña</Label>
                      <Input
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                        placeholder="Confirma tu nueva contraseña"
                      />
                    </div>

                    <Button 
                      onClick={handlePasswordChange}
                      disabled={!passwordForm.current || !passwordForm.new || !passwordForm.confirm}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualizar Contraseña
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Gestión de datos</h4>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar mis datos
                    </Button>
                    
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar cuenta
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}