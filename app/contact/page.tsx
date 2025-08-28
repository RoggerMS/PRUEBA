"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send, 
  User, 
  Building, 
  GraduationCap,
  HelpCircle,
  Bug,
  Star,
  Shield,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        university: '',
        subject: '',
        category: '',
        message: ''
      });
    }, 2000);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Correo Electrónico",
      value: "soporte@crunevo.com",
      description: "Respuesta en 24-48 horas",
      action: "mailto:soporte@crunevo.com",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Phone,
      title: "Teléfono",
      value: "+51 1 234-5678",
      description: "Lun-Vie 9:00 AM - 6:00 PM",
      action: "tel:+5112345678",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: MessageCircle,
      title: "Chat en Vivo",
      value: "Disponible ahora",
      description: "Respuesta inmediata",
      action: "#",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: MapPin,
      title: "Oficina Principal",
      value: "Lima, Perú",
      description: "Av. Universitaria 123, San Miguel",
      action: "https://maps.google.com",
      color: "bg-orange-100 text-orange-600"
    }
  ];

  const supportCategories = [
    { icon: HelpCircle, label: "Soporte General", value: "general" },
    { icon: Bug, label: "Reporte de Error", value: "bug" },
    { icon: GraduationCap, label: "Soporte Académico", value: "academic" },
    { icon: Shield, label: "Seguridad y Privacidad", value: "security" },
    { icon: Star, label: "Sugerencias", value: "feedback" },
    { icon: Building, label: "Institucional", value: "institutional" }
  ];

  const socialLinks = [
    { icon: Facebook, name: "Facebook", url: "https://facebook.com/crunevo", color: "hover:text-blue-600" },
    { icon: Instagram, name: "Instagram", url: "https://instagram.com/crunevo", color: "hover:text-pink-600" },
    { icon: Twitter, name: "Twitter", url: "https://twitter.com/crunevo", color: "hover:text-blue-400" },
    { icon: Linkedin, name: "LinkedIn", url: "https://linkedin.com/company/crunevo", color: "hover:text-blue-700" },
    { icon: Youtube, name: "YouTube", url: "https://youtube.com/crunevo", color: "hover:text-red-600" }
  ];

  const faqItems = [
    {
      question: "¿Cómo puedo registrarme con mi correo de La Cantuta?",
      answer: "Usa tu correo institucional @une.edu.pe para registrarte y acceder a todas las funciones de la plataforma."
    },
    {
      question: "¿CRUNEVO es gratuito para estudiantes cantutinos?",
      answer: "Sí, CRUNEVO es completamente gratuito para todos los estudiantes de La Cantuta y universidades pedagógicas del Perú."
    },
    {
      question: "¿Cómo puedo ganar más Crolars?",
      answer: "Participa en foros educativos, comparte recursos pedagógicos, completa desafíos académicos y contribuye con contenido de calidad."
    },
    {
      question: "¿Puedo encontrar recursos específicos de mi facultad?",
      answer: "Sí, tenemos recursos organizados por las 7 facultades de La Cantuta y sus respectivos programas de pregrado."
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-white/80 backdrop-blur-sm border-green-200">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-green-100 rounded-full">
                <Send className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">
                ¡Mensaje Enviado!
              </h2>
              <p className="text-gray-600">
                Gracias por contactarnos. Nuestro equipo revisará tu mensaje y te responderá pronto.
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => setSubmitted(false)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Enviar Otro Mensaje
              </Button>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  Volver al Inicio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Contáctanos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Estamos aquí para ayudarte. Ponte en contacto con nuestro equipo de CRUNEVO 
            y te responderemos lo más pronto posible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                  Envíanos un Mensaje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Nombre Completo *
                      </label>
                      <Input
                        placeholder="Tu nombre completo"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="border-gray-300 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Correo Electrónico *
                      </label>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="border-gray-300 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Universidad
                      </label>
                      <Input
                        placeholder="Tu universidad"
                        value={formData.university}
                        onChange={(e) => handleInputChange('university', e.target.value)}
                        className="border-gray-300 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Categoría *
                      </label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500">
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {supportCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center gap-2">
                                <category.icon className="h-4 w-4" />
                                {category.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Asunto *
                    </label>
                    <Input
                      placeholder="Describe brevemente tu consulta"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Mensaje *
                    </label>
                    <Textarea
                      placeholder="Describe tu consulta o problema en detalle..."
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      rows={6}
                      className="border-gray-300 focus:border-blue-500 resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Enviar Mensaje
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Methods */}
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
              <CardHeader>
                <CardTitle className="text-xl text-purple-700">
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactMethods.map((method, index) => {
                  const IconComponent = method.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-lg ${method.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {method.title}
                        </h4>
                        <p className="text-gray-600 font-medium">
                          {method.value}
                        </p>
                        <p className="text-sm text-gray-500">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-green-700">
                  <Clock className="h-5 w-5" />
                  Horarios de Atención
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Lunes - Viernes</span>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      9:00 AM - 6:00 PM
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Sábados</span>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      10:00 AM - 2:00 PM
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Domingos</span>
                    <Badge variant="outline" className="text-gray-500 border-gray-200">
                      Cerrado
                    </Badge>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    <strong>Zona horaria:</strong> GMT-5 (Hora de Perú)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
              <CardHeader>
                <CardTitle className="text-xl text-pink-700">
                  Síguenos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social, index) => {
                    const IconComponent = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors ${social.color}`}
                        title={social.name}
                      >
                        <IconComponent className="h-5 w-5" />
                      </a>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Mantente al día con las últimas noticias y actualizaciones de CRUNEVO
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <Card className="bg-white/80 backdrop-blur-sm border-indigo-200">
            <CardHeader>
              <CardTitle className="text-2xl text-indigo-700 text-center">
                Preguntas Frecuentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faqItems.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-semibold text-gray-800">
                      {item.question}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6">
                <Link href="/help">
                  <Button variant="outline" className="gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Ver Más Preguntas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contact */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Phone className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                ¿Necesitas ayuda urgente?
              </h3>
              <p className="text-red-700 mb-4">
                Para problemas críticos de seguridad o emergencias técnicas
              </p>
              <Button className="bg-red-600 hover:bg-red-700 gap-2">
                <Phone className="h-4 w-4" />
                Contacto de Emergencia: +51 1 999-8888
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}