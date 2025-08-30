'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Heart, 
  Zap, 
  Target, 
  Smile, 
  BookOpen, 
  Lightbulb, 
  Users, 
  Clock, 
  Star, 
  Settings, 
  Save, 
  RotateCcw, 
  Info,
  Volume2,
  Palette,
  MessageSquare,
  Shield,
  Globe,
  Mic
} from 'lucide-react';

interface PersonalityTrait {
  id: string;
  name: string;
  description: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface BotPersonalityProps {
  onPersonalityChange: (traits: PersonalityTrait[]) => void;
}

export function BotPersonality({ onPersonalityChange }: BotPersonalityProps) {
  const [activeTab, setActiveTab] = useState('personality');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Personality traits
  const [traits, setTraits] = useState<PersonalityTrait[]>([
    {
      id: 'friendliness',
      name: 'Amigabilidad',
      description: 'Qué tan cálido y acogedor es el bot',
      value: 80,
      icon: Heart,
      color: 'text-red-500'
    },
    {
      id: 'formality',
      name: 'Formalidad',
      description: 'Nivel de formalidad en las respuestas',
      value: 60,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      id: 'enthusiasm',
      name: 'Entusiasmo',
      description: 'Energía y emoción en las respuestas',
      value: 75,
      icon: Zap,
      color: 'text-yellow-500'
    },
    {
      id: 'patience',
      name: 'Paciencia',
      description: 'Tolerancia para explicaciones detalladas',
      value: 90,
      icon: Clock,
      color: 'text-green-500'
    },
    {
      id: 'creativity',
      name: 'Creatividad',
      description: 'Originalidad en ejemplos y explicaciones',
      value: 70,
      icon: Lightbulb,
      color: 'text-purple-500'
    },
    {
      id: 'precision',
      name: 'Precisión',
      description: 'Exactitud técnica en las respuestas',
      value: 85,
      icon: Target,
      color: 'text-indigo-500'
    }
  ]);

  // Bot settings
  const [settings, setSettings] = useState({
    voiceEnabled: true,
    autoSuggestions: true,
    contextMemory: true,
    proactiveHelp: false,
    emojiUsage: true,
    codeHighlighting: true,
    mathRendering: true,
    multiLanguage: false,
    safetyFilter: true,
    learningMode: true
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'auto',
    avatarStyle: 'gradient',
    messageStyle: 'bubbles',
    fontSize: 14,
    animationSpeed: 'normal'
  });

  const updateTrait = (traitId: string, newValue: number) => {
    const updatedTraits = traits.map(trait => 
      trait.id === traitId ? { ...trait, value: newValue } : trait
    );
    setTraits(updatedTraits);
    setHasChanges(true);
  };

  const updateSetting = (settingKey: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [settingKey]: value }));
    setHasChanges(true);
  };

  const updateAppearance = (key: string, value: any) => {
    setAppearance(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveChanges = () => {
    onPersonalityChange(traits);
    setHasChanges(false);
    // Here you would also save settings and appearance
  };

  const resetToDefaults = () => {
    // Reset traits to default values
    const defaultTraits = traits.map(trait => ({
      ...trait,
      value: trait.id === 'patience' ? 90 : trait.id === 'precision' ? 85 : 75
    }));
    setTraits(defaultTraits);
    
    // Reset settings
    setSettings({
      voiceEnabled: true,
      autoSuggestions: true,
      contextMemory: true,
      proactiveHelp: false,
      emojiUsage: true,
      codeHighlighting: true,
      mathRendering: true,
      multiLanguage: false,
      safetyFilter: true,
      learningMode: true
    });
    
    setHasChanges(true);
  };

  const getPersonalityDescription = () => {
    const high = traits.filter(t => t.value >= 80);
    const medium = traits.filter(t => t.value >= 60 && t.value < 80);
    const low = traits.filter(t => t.value < 60);
    
    let description = "CruneBot será ";
    
    if (high.length > 0) {
      description += `muy ${high.map(t => t.name.toLowerCase()).join(', ')}`;
    }
    
    if (medium.length > 0) {
      if (high.length > 0) description += " y moderadamente ";
      else description += "moderadamente ";
      description += medium.map(t => t.name.toLowerCase()).join(', ');
    }
    
    return description + ".";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración del Bot</h2>
          <p className="text-gray-600">Personaliza la personalidad y comportamiento de CruneBot</p>
        </div>
        
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Cambios sin guardar
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personality">Personalidad</TabsTrigger>
          <TabsTrigger value="behavior">Comportamiento</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
        </TabsList>

        <TabsContent value="personality" className="space-y-6">
          {/* Personality Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Vista previa de personalidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-blue-800">{getPersonalityDescription()}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {traits.map((trait) => {
                  const Icon = trait.icon;
                  return (
                    <div key={trait.id} className="text-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-2 ${trait.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium">{trait.name}</p>
                      <p className="text-xs text-gray-500">{trait.value}%</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Personality Sliders */}
          <Card>
            <CardHeader>
              <CardTitle>Ajustar rasgos de personalidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {traits.map((trait) => {
                const Icon = trait.icon;
                return (
                  <div key={trait.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${trait.color}`} />
                        <div>
                          <p className="font-medium">{trait.name}</p>
                          <p className="text-sm text-gray-600">{trait.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{trait.value}%</Badge>
                    </div>
                    
                    <Slider
                      value={[trait.value]}
                      onValueChange={(value) => updateTrait(trait.id, value[0])}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Bajo</span>
                      <span>Medio</span>
                      <span>Alto</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          {/* Communication Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comunicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Respuestas por voz</p>
                  <p className="text-sm text-gray-600">Habilitar síntesis de voz para las respuestas</p>
                </div>
                <Switch 
                  checked={settings.voiceEnabled}
                  onCheckedChange={(checked) => updateSetting('voiceEnabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sugerencias automáticas</p>
                  <p className="text-sm text-gray-600">Mostrar sugerencias de preguntas relacionadas</p>
                </div>
                <Switch 
                  checked={settings.autoSuggestions}
                  onCheckedChange={(checked) => updateSetting('autoSuggestions', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Memoria de contexto</p>
                  <p className="text-sm text-gray-600">Recordar conversaciones anteriores</p>
                </div>
                <Switch 
                  checked={settings.contextMemory}
                  onCheckedChange={(checked) => updateSetting('contextMemory', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Ayuda proactiva</p>
                  <p className="text-sm text-gray-600">Ofrecer ayuda sin ser solicitada</p>
                </div>
                <Switch 
                  checked={settings.proactiveHelp}
                  onCheckedChange={(checked) => updateSetting('proactiveHelp', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Uso de emojis</p>
                  <p className="text-sm text-gray-600">Incluir emojis en las respuestas</p>
                </div>
                <Switch 
                  checked={settings.emojiUsage}
                  onCheckedChange={(checked) => updateSetting('emojiUsage', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Learning Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Aprendizaje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Resaltado de código</p>
                  <p className="text-sm text-gray-600">Aplicar sintaxis highlighting al código</p>
                </div>
                <Switch 
                  checked={settings.codeHighlighting}
                  onCheckedChange={(checked) => updateSetting('codeHighlighting', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Renderizado matemático</p>
                  <p className="text-sm text-gray-600">Mostrar fórmulas matemáticas formateadas</p>
                </div>
                <Switch 
                  checked={settings.mathRendering}
                  onCheckedChange={(checked) => updateSetting('mathRendering', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Modo de aprendizaje</p>
                  <p className="text-sm text-gray-600">Adaptar respuestas según el progreso del usuario</p>
                </div>
                <Switch 
                  checked={settings.learningMode}
                  onCheckedChange={(checked) => updateSetting('learningMode', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Soporte multiidioma</p>
                  <p className="text-sm text-gray-600">Detectar y responder en múltiples idiomas</p>
                </div>
                <Switch 
                  checked={settings.multiLanguage}
                  onCheckedChange={(checked) => updateSetting('multiLanguage', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Safety Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Filtro de seguridad</p>
                  <p className="text-sm text-gray-600">Filtrar contenido inapropiado</p>
                </div>
                <Switch 
                  checked={settings.safetyFilter}
                  onCheckedChange={(checked) => updateSetting('safetyFilter', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Tema y estilo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium mb-2">Tema</p>
                <div className="grid grid-cols-3 gap-2">
                  {['light', 'dark', 'auto'].map((theme) => (
                    <Button
                      key={theme}
                      variant={appearance.theme === theme ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateAppearance('theme', theme)}
                      className="capitalize"
                    >
                      {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Automático'}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="font-medium mb-2">Estilo de avatar</p>
                <div className="grid grid-cols-2 gap-2">
                  {['gradient', 'solid'].map((style) => (
                    <Button
                      key={style}
                      variant={appearance.avatarStyle === style ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateAppearance('avatarStyle', style)}
                      className="capitalize"
                    >
                      {style === 'gradient' ? 'Degradado' : 'Sólido'}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="font-medium mb-2">Tamaño de fuente</p>
                <Slider
                  value={[appearance.fontSize]}
                  onValueChange={(value) => updateAppearance('fontSize', value[0])}
                  min={12}
                  max={18}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>12px</span>
                  <span>{appearance.fontSize}px</span>
                  <span>18px</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button 
          variant="outline" 
          onClick={resetToDefaults}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar valores por defecto
        </Button>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            disabled={!hasChanges}
          >
            Cancelar
          </Button>
          
          <Button 
            onClick={saveChanges}
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
}