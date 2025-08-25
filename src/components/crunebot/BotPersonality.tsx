"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Bot, 
  Settings, 
  Zap, 
  Heart, 
  Brain, 
  Lightbulb, 
  Target, 
  Smile, 
  BookOpen, 
  Sparkles,
  Volume2,
  Palette,
  Clock,
  MessageCircle
} from "lucide-react";

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
  const [traits, setTraits] = useState<PersonalityTrait[]>([
    {
      id: "enthusiasm",
      name: "Entusiasmo",
      description: "Qué tan animado y energético es el bot",
      value: 75,
      icon: Zap,
      color: "text-yellow-500"
    },
    {
      id: "empathy",
      name: "Empatía",
      description: "Nivel de comprensión emocional",
      value: 85,
      icon: Heart,
      color: "text-red-500"
    },
    {
      id: "intelligence",
      name: "Inteligencia",
      description: "Profundidad de las respuestas",
      value: 90,
      icon: Brain,
      color: "text-purple-500"
    },
    {
      id: "creativity",
      name: "Creatividad",
      description: "Originalidad en las explicaciones",
      value: 70,
      icon: Lightbulb,
      color: "text-orange-500"
    },
    {
      id: "focus",
      name: "Enfoque",
      description: "Concentración en el tema principal",
      value: 80,
      icon: Target,
      color: "text-blue-500"
    },
    {
      id: "humor",
      name: "Humor",
      description: "Uso de bromas y comentarios divertidos",
      value: 60,
      icon: Smile,
      color: "text-green-500"
    }
  ]);

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [responseStyle, setResponseStyle] = useState("balanced");
  const [explanationDepth, setExplanationDepth] = useState("medium");

  const presets = [
    {
      id: "tutor",
      name: "Tutor Académico",
      description: "Formal, estructurado y educativo",
      icon: BookOpen,
      traits: {
        enthusiasm: 60,
        empathy: 70,
        intelligence: 95,
        creativity: 50,
        focus: 90,
        humor: 30
      }
    },
    {
      id: "friend",
      name: "Amigo Estudioso",
      description: "Casual, divertido y motivador",
      icon: Smile,
      traits: {
        enthusiasm: 85,
        empathy: 90,
        intelligence: 75,
        creativity: 80,
        focus: 70,
        humor: 85
      }
    },
    {
      id: "mentor",
      name: "Mentor Sabio",
      description: "Reflexivo, paciente y profundo",
      icon: Brain,
      traits: {
        enthusiasm: 50,
        empathy: 95,
        intelligence: 90,
        creativity: 70,
        focus: 85,
        humor: 40
      }
    },
    {
      id: "coach",
      name: "Coach Motivacional",
      description: "Energético, positivo y alentador",
      icon: Zap,
      traits: {
        enthusiasm: 95,
        empathy: 80,
        intelligence: 70,
        creativity: 75,
        focus: 75,
        humor: 70
      }
    }
  ];

  const responseStyles = [
    { value: "concise", label: "Conciso", description: "Respuestas breves y directas" },
    { value: "balanced", label: "Equilibrado", description: "Balance entre detalle y brevedad" },
    { value: "detailed", label: "Detallado", description: "Explicaciones completas y exhaustivas" }
  ];

  const explanationDepths = [
    { value: "basic", label: "Básico", description: "Conceptos fundamentales" },
    { value: "medium", label: "Intermedio", description: "Explicaciones moderadas" },
    { value: "advanced", label: "Avanzado", description: "Análisis profundo y técnico" }
  ];

  const handleTraitChange = (traitId: string, value: number[]) => {
    const updatedTraits = traits.map(trait => 
      trait.id === traitId ? { ...trait, value: value[0] } : trait
    );
    setTraits(updatedTraits);
    onPersonalityChange(updatedTraits);
  };

  const applyPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      const updatedTraits = traits.map(trait => ({
        ...trait,
        value: preset.traits[trait.id as keyof typeof preset.traits]
      }));
      setTraits(updatedTraits);
      setSelectedPreset(presetId);
      onPersonalityChange(updatedTraits);
    }
  };

  const resetToDefault = () => {
    const defaultTraits = traits.map(trait => ({
      ...trait,
      value: 75
    }));
    setTraits(defaultTraits);
    setSelectedPreset(null);
    onPersonalityChange(defaultTraits);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Personalidad del Bot
          </CardTitle>
          <p className="text-sm text-gray-600">
            Personaliza cómo CruneBot interactúa contigo y responde a tus preguntas.
          </p>
        </CardHeader>
      </Card>

      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Personalidades Predefinidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {presets.map((preset) => {
              const Icon = preset.icon;
              return (
                <Card
                  key={preset.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPreset === preset.id
                      ? 'ring-2 ring-purple-500 bg-purple-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => applyPreset(preset.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Icon className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {preset.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {preset.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={resetToDefault}>
              <Settings className="h-4 w-4 mr-2" />
              Restablecer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Personality Traits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Rasgos de Personalidad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {traits.map((trait) => {
            const Icon = trait.icon;
            return (
              <div key={trait.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${trait.color}`} />
                    <span className="font-medium text-gray-900">
                      {trait.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {trait.value}%
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {trait.description}
                </p>
                <Slider
                  value={[trait.value]}
                  onValueChange={(value) => handleTraitChange(trait.id, value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Response Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Configuración de Respuestas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Response Style */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Estilo de Respuesta
            </label>
            <div className="grid grid-cols-1 gap-2">
              {responseStyles.map((style) => (
                <label key={style.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="responseStyle"
                    value={style.value}
                    checked={responseStyle === style.value}
                    onChange={(e) => setResponseStyle(e.target.value)}
                    className="text-purple-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{style.label}</div>
                    <div className="text-sm text-gray-600">{style.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Explanation Depth */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Profundidad de Explicación
            </label>
            <div className="grid grid-cols-1 gap-2">
              {explanationDepths.map((depth) => (
                <label key={depth.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="explanationDepth"
                    value={depth.value}
                    checked={explanationDepth === depth.value}
                    onChange={(e) => setExplanationDepth(e.target.value)}
                    className="text-purple-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{depth.label}</div>
                    <div className="text-sm text-gray-600">{depth.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Vista Previa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Bot className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-sm text-gray-900">
                    {traits.find(t => t.id === 'enthusiasm')?.value > 80 && "¡"}
                    Hola{traits.find(t => t.id === 'humor')?.value > 70 ? " amigo" : ""}! 
                    {traits.find(t => t.id === 'empathy')?.value > 80 && "Me alegra verte por aquí. "}
                    {responseStyle === 'concise' 
                      ? "¿En qué puedo ayudarte?"
                      : responseStyle === 'detailed'
                      ? "Estoy aquí para ayudarte con cualquier pregunta o tema que tengas. Puedo explicarte conceptos, resolver problemas y guiarte en tu aprendizaje."
                      : "¿En qué tema te gustaría que te ayude hoy?"
                    }
                    {traits.find(t => t.id === 'enthusiasm')?.value > 80 && " ✨"}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  Ahora
                  <Badge variant="outline" className="text-xs">
                    {presets.find(p => p.id === selectedPreset)?.name || "Personalizado"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
