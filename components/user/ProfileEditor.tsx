"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { X } from "lucide-react";

interface UserProfile {
  name?: string;
  socialLinks?: { twitter?: string };
  privacySettings?: { showEmail: boolean };
}

interface ProfileEditorProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (data: Partial<UserProfile>) => void;
}

export function ProfileEditor({ user, open, onOpenChange, onSave }: ProfileEditorProps) {
  const [form, setForm] = useState({
    name: user.name ?? "",
    twitter: user.socialLinks?.twitter ?? "",
    showEmail: user.privacySettings?.showEmail ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        socialLinks: { twitter: form.twitter },
        privacySettings: { showEmail: form.showEmail },
      };
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let data: any = null;
      const ct = response.headers.get("content-type") || "";
      if (response.status !== 204 && ct.includes("application/json")) {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      }
      if (!response.ok) {
        throw new Error(data?.message || `Error ${response.status}`);
      }
      onSave(data?.user ?? payload);
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
      <DialogContent
        aria-describedby="profile-editor-desc"
        className="pointer-events-auto max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription id="profile-editor-desc">
            Actualiza tu información básica, social y privacidad.
          </DialogDescription>
          <DialogClose asChild>
            <button
              aria-label="Cerrar editor"
              title="Cerrar"
              className="absolute right-3 top-3 rounded p-2 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogClose>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="privacy">Privacidad</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
            </TabsContent>
            <TabsContent value="social" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={form.twitter}
                  onChange={(e) => handleChange("twitter", e.target.value)}
                />
              </div>
            </TabsContent>
            <TabsContent value="privacy" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showEmail">Mostrar email</Label>
                <Switch
                  id="showEmail"
                  checked={form.showEmail}
                  onCheckedChange={(v) => handleChange("showEmail", v)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex items-center justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="btn-primary"
            >
              {isSubmitting ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
