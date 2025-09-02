'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Mail,
  Database,
  Shield,
  Users,
  FileText,
  Bell,
  Lock,
  Globe,
  Save,
  RefreshCw,
  TestTube,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  siteUrl?: string;
  contactEmail?: string;
  supportEmail?: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  moderationEnabled: boolean;
  autoModerationEnabled: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  maxPostLength: number;
  maxCommentLength: number;
  rateLimitEnabled: boolean;
  maxRequestsPerMinute: number;
  sessionTimeout: number;
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
  twoFactorEnabled: boolean;
  socialLoginEnabled: boolean;
  googleLoginEnabled: boolean;
  facebookLoginEnabled: boolean;
  twitterLoginEnabled: boolean;
  notificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  analyticsEnabled: boolean;
  cookieConsentRequired: boolean;
  gdprCompliant: boolean;
  backupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  logRetentionDays: number;
}

interface EmailSettings {
  id?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  fromEmail?: string;
  fromName?: string;
  replyToEmail?: string;
}

interface StorageSettings {
  id?: string;
  storageProvider?: 'local' | 'aws' | 'cloudinary' | 'google';
  awsAccessKey?: string;
  awsSecretKey?: string;
  awsBucket?: string;
  awsRegion?: string;
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;
  googleProjectId?: string;
  googleKeyFile?: string;
  googleBucket?: string;
}

const SystemSettings: React.FC = () => {
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({});
  const [storageSettings, setStorageSettings] = useState<StorageSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Load settings
  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();

      if (response.ok) {
        setSystemSettings(data.settings);
        setEmailSettings(data.emailSettings || {});
        setStorageSettings(data.storageSettings || {});
      } else {
        toast.error(data.error || 'Error al cargar configuración');
      }
    } catch (error) {
      toast.error('Error al cargar configuración');
    } finally {
      setIsLoading(false);
    }
  };

  // Save settings
  const saveSettings = async (category: 'system' | 'email' | 'storage') => {
    setIsSaving(true);
    try {
      let data;
      switch (category) {
        case 'system':
          data = systemSettings;
          break;
        case 'email':
          data = emailSettings;
          break;
        case 'storage':
          data = storageSettings;
          break;
      }

      const response = await fetch(`/api/admin/settings?category=${category}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Configuración guardada exitosamente');
        loadSettings(); // Reload to get updated data
      } else {
        toast.error(result.error || 'Error al guardar configuración');
      }
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  // Test settings
  const testSettings = async (type: 'email' | 'storage', testData: any) => {
    setIsTesting(true);
    try {
      const response = await fetch(`/api/admin/settings/test?type=${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const result = await response.json();
      setTestResults(result);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Test fallido');
      }
    } catch (error) {
      toast.error('Error al realizar test');
    } finally {
      setIsTesting(false);
    }
  };

  // Reset settings
  const resetSettings = async (category: string) => {
    try {
      const response = await fetch(`/api/admin/settings/reset?category=${category}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Configuración restablecida a valores por defecto');
        loadSettings();
        setShowResetDialog(false);
      } else {
        toast.error(result.error || 'Error al restablecer configuración');
      }
    } catch (error) {
      toast.error('Error al restablecer configuración');
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando configuración...</span>
      </div>
    );
  }

  if (!systemSettings) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
        <p>No se pudo cargar la configuración del sistema</p>
        <Button onClick={loadSettings} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuración del Sistema</h2>
          <p className="text-muted-foreground">
            Administra la configuración global del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Restablecer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Restablecer Configuración</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que quieres restablecer la configuración del sistema a los valores por defecto?
                  Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowResetDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => resetSettings('system')}
                >
                  Restablecer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={loadSettings}
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Almacenamiento
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Funciones
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Sitio</CardTitle>
              <CardDescription>
                Configuración básica del sitio web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nombre del Sitio</Label>
                  <Input
                    id="siteName"
                    value={systemSettings.siteName}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      siteName: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">URL del Sitio</Label>
                  <Input
                    id="siteUrl"
                    type="url"
                    value={systemSettings.siteUrl || ''}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      siteUrl: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Descripción del Sitio</Label>
                <Textarea
                  id="siteDescription"
                  value={systemSettings.siteDescription}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    siteDescription: e.target.value
                  })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email de Contacto</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={systemSettings.contactEmail || ''}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      contactEmail: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Email de Soporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={systemSettings.supportEmail || ''}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      supportEmail: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={(checked) => setSystemSettings({
                    ...systemSettings,
                    maintenanceMode: checked
                  })}
                />
                <Label htmlFor="maintenanceMode">Modo de Mantenimiento</Label>
                {systemSettings.maintenanceMode && (
                  <Badge variant="destructive">Activo</Badge>
                )}
              </div>
              
              <Button
                onClick={() => saveSettings('system')}
                disabled={isSaving}
                className="w-full md:w-auto"
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Configuración General
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Límites de Contenido</CardTitle>
              <CardDescription>
                Configuración de límites para posts y archivos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxPostLength">Longitud Máxima de Post</Label>
                  <Input
                    id="maxPostLength"
                    type="number"
                    value={systemSettings.maxPostLength}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      maxPostLength: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxCommentLength">Longitud Máxima de Comentario</Label>
                  <Input
                    id="maxCommentLength"
                    type="number"
                    value={systemSettings.maxCommentLength}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      maxCommentLength: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Tamaño Máximo de Archivo (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={systemSettings.maxFileSize}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      maxFileSize: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes">Tipos de Archivo Permitidos</Label>
                <Input
                  id="allowedFileTypes"
                  value={systemSettings.allowedFileTypes.join(', ')}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    allowedFileTypes: e.target.value.split(',').map(type => type.trim())
                  })}
                  placeholder="jpg, png, pdf, doc"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Autenticación y Registro</CardTitle>
              <CardDescription>
                Configuración de seguridad y acceso de usuarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="registrationEnabled"
                    checked={systemSettings.registrationEnabled}
                    onCheckedChange={(checked) => setSystemSettings({
                      ...systemSettings,
                      registrationEnabled: checked
                    })}
                  />
                  <Label htmlFor="registrationEnabled">Permitir Registro de Usuarios</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailVerificationRequired"
                    checked={systemSettings.emailVerificationRequired}
                    onCheckedChange={(checked) => setSystemSettings({
                      ...systemSettings,
                      emailVerificationRequired: checked
                    })}
                  />
                  <Label htmlFor="emailVerificationRequired">Requerir Verificación de Email</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="twoFactorEnabled"
                    checked={systemSettings.twoFactorEnabled}
                    onCheckedChange={(checked) => setSystemSettings({
                      ...systemSettings,
                      twoFactorEnabled: checked
                    })}
                  />
                  <Label htmlFor="twoFactorEnabled">Autenticación de Dos Factores</Label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Longitud Mínima de Contraseña</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={systemSettings.passwordMinLength}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      passwordMinLength: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Tiempo de Sesión (horas)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      sessionTimeout: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="passwordRequireSpecialChars"
                  checked={systemSettings.passwordRequireSpecialChars}
                  onCheckedChange={(checked) => setSystemSettings({
                    ...systemSettings,
                    passwordRequireSpecialChars: checked
                  })}
                />
                <Label htmlFor="passwordRequireSpecialChars">Requerir Caracteres Especiales en Contraseña</Label>
              </div>
              
              <Button
                onClick={() => saveSettings('system')}
                disabled={isSaving}
                className="w-full md:w-auto"
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Configuración de Seguridad
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rate Limiting</CardTitle>
              <CardDescription>
                Configuración de límites de velocidad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="rateLimitEnabled"
                  checked={systemSettings.rateLimitEnabled}
                  onCheckedChange={(checked) => setSystemSettings({
                    ...systemSettings,
                    rateLimitEnabled: checked
                  })}
                />
                <Label htmlFor="rateLimitEnabled">Habilitar Rate Limiting</Label>
              </div>
              
              {systemSettings.rateLimitEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="maxRequestsPerMinute">Máximo de Requests por Minuto</Label>
                  <Input
                    id="maxRequestsPerMinute"
                    type="number"
                    value={systemSettings.maxRequestsPerMinute}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      maxRequestsPerMinute: parseInt(e.target.value)
                    })}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración SMTP</CardTitle>
              <CardDescription>
                Configuración del servidor de correo electrónico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">Servidor SMTP</Label>
                  <Input
                    id="smtpHost"
                    value={emailSettings.smtpHost || ''}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings,
                      smtpHost: e.target.value
                    })}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Puerto SMTP</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={emailSettings.smtpPort || ''}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings,
                      smtpPort: parseInt(e.target.value)
                    })}
                    placeholder="587"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">Usuario SMTP</Label>
                  <Input
                    id="smtpUser"
                    value={emailSettings.smtpUser || ''}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings,
                      smtpUser: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">Contraseña SMTP</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword || ''}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings,
                      smtpPassword: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="smtpSecure"
                  checked={emailSettings.smtpSecure || false}
                  onCheckedChange={(checked) => setEmailSettings({
                    ...emailSettings,
                    smtpSecure: checked
                  })}
                />
                <Label htmlFor="smtpSecure">Conexión Segura (SSL/TLS)</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">Email Remitente</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail || ''}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings,
                      fromEmail: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">Nombre Remitente</Label>
                  <Input
                    id="fromName"
                    value={emailSettings.fromName || ''}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings,
                      fromName: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => saveSettings('email')}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => testSettings('email', {
                    ...emailSettings,
                    testEmail: systemSettings.contactEmail
                  })}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Probar Configuración
                </Button>
              </div>
              
              {testResults && (
                <div className={`p-4 rounded-lg border ${
                  testResults.success 
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {testResults.success ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                    <span className="font-medium">{testResults.message}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Settings */}
        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Almacenamiento</CardTitle>
              <CardDescription>
                Configuración del proveedor de almacenamiento de archivos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storageProvider">Proveedor de Almacenamiento</Label>
                <Select
                  value={storageSettings.storageProvider || 'local'}
                  onValueChange={(value) => setStorageSettings({
                    ...storageSettings,
                    storageProvider: value as any
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="aws">Amazon S3</SelectItem>
                    <SelectItem value="cloudinary">Cloudinary</SelectItem>
                    <SelectItem value="google">Google Cloud Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {storageSettings.storageProvider === 'aws' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="awsAccessKey">AWS Access Key</Label>
                      <Input
                        id="awsAccessKey"
                        value={storageSettings.awsAccessKey || ''}
                        onChange={(e) => setStorageSettings({
                          ...storageSettings,
                          awsAccessKey: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="awsSecretKey">AWS Secret Key</Label>
                      <Input
                        id="awsSecretKey"
                        type="password"
                        value={storageSettings.awsSecretKey || ''}
                        onChange={(e) => setStorageSettings({
                          ...storageSettings,
                          awsSecretKey: e.target.value
                        })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="awsBucket">AWS Bucket</Label>
                      <Input
                        id="awsBucket"
                        value={storageSettings.awsBucket || ''}
                        onChange={(e) => setStorageSettings({
                          ...storageSettings,
                          awsBucket: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="awsRegion">AWS Region</Label>
                      <Input
                        id="awsRegion"
                        value={storageSettings.awsRegion || ''}
                        onChange={(e) => setStorageSettings({
                          ...storageSettings,
                          awsRegion: e.target.value
                        })}
                        placeholder="us-east-1"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {storageSettings.storageProvider === 'cloudinary' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cloudinaryCloudName">Cloud Name</Label>
                      <Input
                        id="cloudinaryCloudName"
                        value={storageSettings.cloudinaryCloudName || ''}
                        onChange={(e) => setStorageSettings({
                          ...storageSettings,
                          cloudinaryCloudName: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cloudinaryApiKey">API Key</Label>
                      <Input
                        id="cloudinaryApiKey"
                        value={storageSettings.cloudinaryApiKey || ''}
                        onChange={(e) => setStorageSettings({
                          ...storageSettings,
                          cloudinaryApiKey: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cloudinaryApiSecret">API Secret</Label>
                      <Input
                        id="cloudinaryApiSecret"
                        type="password"
                        value={storageSettings.cloudinaryApiSecret || ''}
                        onChange={(e) => setStorageSettings({
                          ...storageSettings,
                          cloudinaryApiSecret: e.target.value
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={() => saveSettings('storage')}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => testSettings('storage', storageSettings)}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Probar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Funciones del Sistema</CardTitle>
              <CardDescription>
                Habilitar o deshabilitar funciones del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="moderationEnabled"
                    checked={systemSettings.moderationEnabled}
                    onCheckedChange={(checked) => setSystemSettings({
                      ...systemSettings,
                      moderationEnabled: checked
                    })}
                  />
                  <Label htmlFor="moderationEnabled">Sistema de Moderación</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notificationsEnabled"
                    checked={systemSettings.notificationsEnabled}
                    onCheckedChange={(checked) => setSystemSettings({
                      ...systemSettings,
                      notificationsEnabled: checked
                    })}
                  />
                  <Label htmlFor="notificationsEnabled">Sistema de Notificaciones</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="socialLoginEnabled"
                    checked={systemSettings.socialLoginEnabled}
                    onCheckedChange={(checked) => setSystemSettings({
                      ...systemSettings,
                      socialLoginEnabled: checked
                    })}
                  />
                  <Label htmlFor="socialLoginEnabled">Login Social</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="analyticsEnabled"
                    checked={systemSettings.analyticsEnabled}
                    onCheckedChange={(checked) => setSystemSettings({
                      ...systemSettings,
                      analyticsEnabled: checked
                    })}
                  />
                  <Label htmlFor="analyticsEnabled">Analytics</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="backupEnabled"
                    checked={systemSettings.backupEnabled}
                    onCheckedChange={(checked) => setSystemSettings({
                      ...systemSettings,
                      backupEnabled: checked
                    })}
                  />
                  <Label htmlFor="backupEnabled">Respaldos Automáticos</Label>
                </div>
              </div>
              
              {systemSettings.backupEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Frecuencia de Respaldo</Label>
                  <Select
                    value={systemSettings.backupFrequency}
                    onValueChange={(value) => setSystemSettings({
                      ...systemSettings,
                      backupFrequency: value as any
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <Button
                onClick={() => saveSettings('system')}
                disabled={isSaving}
                className="w-full md:w-auto"
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Configuración de Funciones
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;