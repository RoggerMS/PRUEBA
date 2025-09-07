"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "sonner";
import {
  Twitter,
  Linkedin,
  Github,
  Instagram,
} from "lucide-react";

interface UserProfile {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  university?: string;
  career?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
  privacySettings?: {
    showEmail?: boolean;
    showActivity?: boolean;
    allowMessages?: boolean;
  };
  stats?: any;
  joinDate?: string;
  phone?: string;
  semester?: number;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
}

interface ProfileEditorProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (data: Partial<UserProfile>) => void;
}

const BIO_LIMIT = 500;

const universities = [
  {
    value: "pucp",
    label: "Pontificia Universidad Católica del Perú",
    careers: ["Ingeniería Industrial", "Derecho", "Diseño Gráfico"],
  },
  {
    value: "uni",
    label: "Universidad Nacional de Ingeniería",
    careers: ["Ingeniería Civil", "Ingeniería de Sistemas", "Arquitectura"],
  },
  {
    value: "san-marcos",
    label: "Universidad Nacional Mayor de San Marcos",
    careers: ["Medicina", "Economía", "Historia"],
  },
];

export function ProfileEditor({ user, open, onOpenChange, onSave }: ProfileEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    avatar: user.avatar || "",
    avatarFile: null as File | null,
    coverImage: user.coverImage || "",
    coverImageFile: null as File | null,
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    university: user.university || "",
    career: user.career || "",
    twitter: user.socialLinks?.twitter || "",
    linkedin: user.socialLinks?.linkedin || "",
    github: user.socialLinks?.github || "",
    instagram: user.socialLinks?.instagram || "",
    showEmail: user.privacySettings?.showEmail ?? true,
    showActivity: user.privacySettings?.showActivity ?? true,
    allowMessages: user.privacySettings?.allowMessages ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [websiteError, setWebsiteError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        avatar: user.avatar || "",
        avatarFile: null,
        coverImage: user.coverImage || "",
        coverImageFile: null,
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        university: user.university || "",
        career: user.career || "",
        twitter: user.socialLinks?.twitter || "",
        linkedin: user.socialLinks?.linkedin || "",
        github: user.socialLinks?.github || "",
        instagram: user.socialLinks?.instagram || "",
        showEmail: user.privacySettings?.showEmail ?? true,
        showActivity: user.privacySettings?.showActivity ?? true,
        allowMessages: user.privacySettings?.allowMessages ?? true,
      });
      setIsDirty(false);
      setWebsiteError("");
    }
  }, [open, user]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange("avatarFile", file);
      const url = URL.createObjectURL(file);
      handleChange("avatar", url);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange("coverImageFile", file);
      const url = URL.createObjectURL(file);
      handleChange("coverImage", url);
    }
  };

  const handleWebsite = (value: string) => {
    handleChange("website", value);
    if (value) {
      try {
        new URL(value);
        setWebsiteError("");
      } catch {
        setWebsiteError("URL inválida");
      }
    } else {
      setWebsiteError("");
    }
  };

  const selectedUniversity = universities.find((u) => u.value === form.university);
  const careerOptions = selectedUniversity
    ? selectedUniversity.careers.map((c) => ({ value: c, label: c }))
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("bio", form.bio);
      payload.append("location", form.location);
      payload.append("website", form.website);
      payload.append("university", form.university);
      payload.append("career", form.career);
      payload.append("socialLinks[twitter]", form.twitter);
      payload.append("socialLinks[linkedin]", form.linkedin);
      payload.append("socialLinks[github]", form.github);
      payload.append("socialLinks[instagram]", form.instagram);
      payload.append("privacySettings[showEmail]", String(form.showEmail));
      payload.append("privacySettings[showActivity]", String(form.showActivity));
      payload.append("privacySettings[allowMessages]", String(form.allowMessages));
      if (form.avatarFile) {
        payload.append("avatar", form.avatarFile);
      }
      if (form.coverImageFile) {
        payload.append("coverImage", form.coverImageFile);
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        body: payload,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || `Error ${response.status}`);
      }
      const updatedProfile: Partial<UserProfile> = {
        ...user,
        name: form.name,
        bio: form.bio,
        location: form.location,
        website: form.website,
        university: form.university,
        career: form.career,
        avatar: form.avatar || user.avatar,
        coverImage: form.coverImage || user.coverImage,
        socialLinks: {
          twitter: form.twitter,
          linkedin: form.linkedin,
          github: form.github,
          instagram: form.instagram,
        },
        privacySettings: {
          showEmail: form.showEmail,
          showActivity: form.showActivity,
          allowMessages: form.allowMessages,
        },
      };
      onSave(data?.user || updatedProfile);
      toast.success("Perfil actualizado");
      onOpenChange(false);
      setIsDirty(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-6xl" aria-describedby="profile-editor-desc">
      <div className="relative h-32 sm:h-40 md:h-48 w-full mb-4 rounded-md overflow-hidden">
        {form.coverImage ? (
          <img
            src={form.coverImage}
            alt="Banner"
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="absolute bottom-2 right-2"
          onClick={() => bannerInputRef.current?.click()}
        >
          Cambiar banner
        </Button>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />
      </div>
      <DialogHeader>
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogDescription id="profile-editor-desc">
          Actualiza tu información básica, social y privacidad.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        <Tabs defaultValue="basic" className="space-y-4">
              <TabsList>
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="privacy">Privacidad</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    {form.avatar ? (
                      <AvatarImage src={form.avatar} alt="Avatar" />
                    ) : (
                      <AvatarFallback>{form.name?.[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Cambiar foto
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    maxLength={BIO_LIMIT}
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {form.bio.length}/{BIO_LIMIT}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    value={form.website}
                    onChange={(e) => handleWebsite(e.target.value)}
                  />
                  {websiteError && (
                    <p className="text-xs text-destructive">{websiteError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Universidad</Label>
                  <Combobox
                    value={form.university}
                    onChange={(v) => handleChange("university", v)}
                    options={universities.map((u) => ({ value: u.value, label: u.label }))}
                    placeholder="Selecciona una universidad"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Carrera</Label>
                  <Combobox
                    value={form.career}
                    onChange={(v) => handleChange("career", v)}
                    options={careerOptions}
                    placeholder={
                      selectedUniversity
                        ? "Selecciona una carrera"
                        : "Selecciona una universidad primero"
                    }
                    className={selectedUniversity ? "" : "opacity-50 pointer-events-none"}
                  />
                </div>
              </TabsContent>
              <TabsContent value="social" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" /> Twitter
                  </Label>
                  <Input
                    id="twitter"
                    value={form.twitter}
                    onChange={(e) => handleChange("twitter", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={form.linkedin}
                    onChange={(e) => handleChange("linkedin", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github" className="flex items-center gap-2">
                    <Github className="h-4 w-4" /> GitHub
                  </Label>
                  <Input
                    id="github"
                    value={form.github}
                    onChange={(e) => handleChange("github", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" /> Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={form.instagram}
                    onChange={(e) => handleChange("instagram", e.target.value)}
                  />
                </div>
              </TabsContent>
              <TabsContent value="privacy" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showEmail">Mostrar email en el perfil público</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite que otros usuarios vean tu email.
                    </p>
                  </div>
                  <Switch
                    id="showEmail"
                    checked={form.showEmail}
                    onCheckedChange={(v) => handleChange("showEmail", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showActivity">Mostrar mi actividad reciente</Label>
                    <p className="text-sm text-muted-foreground">
                      Muestra tus acciones recientes en tu perfil.
                    </p>
                  </div>
                  <Switch
                    id="showActivity"
                    checked={form.showActivity}
                    onCheckedChange={(v) => handleChange("showActivity", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowMessages">
                      Permitir que otros usuarios me envíen mensajes directos
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Otros podrán contactarte mediante mensajes.
                    </p>
                  </div>
                  <Switch
                    id="allowMessages"
                    checked={form.allowMessages}
                    onCheckedChange={(v) => handleChange("allowMessages", v)}
                  />
                </div>
              </TabsContent>
            </Tabs>
        <DialogFooter className="mt-6">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? "Guardando…" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ProfileEditor;
