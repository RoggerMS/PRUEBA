'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface VerificationStatus {
  isVerified: boolean;
  emailVerified: boolean;
  university?: string;
  career?: string;
  graduationYear?: number;
  email: string;
  hasPendingVerification: boolean;
  isUniversityEmail: boolean;
}

interface VerificationData {
  universityEmail: string;
  university: string;
  career: string;
  studentId?: string;
  graduationYear?: number;
}

export function useUniversityVerification() {
  const { data: session, update } = useSession();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar estado de verificación
  const loadVerificationStatus = async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch('/api/auth/verify-university');
      if (response.ok) {
        const data = await response.json();
        setVerificationStatus(data);
      } else {
        console.error('Error loading verification status');
      }
    } catch (error) {
      console.error('Error loading verification status:', error);
    }
  };

  // Solicitar verificación universitaria
  const requestVerification = async (data: VerificationData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-university', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Código de verificación enviado a tu email universitario');
        await loadVerificationStatus();
        return { success: true, verificationCode: result.verificationCode };
      } else {
        setError(result.error || 'Error al enviar verificación');
        toast.error(result.error || 'Error al enviar verificación');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'Error de conexión';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Confirmar verificación con código
  const confirmVerification = async (verificationCode: string, universityEmail: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-university', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationCode,
          universityEmail
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('¡Verificación universitaria completada!');
        toast.success(`¡Ganaste ${result.bonusAwarded.crolars} Crolars y ${result.bonusAwarded.xp} XP!`);
        
        // Actualizar sesión
        await update();
        await loadVerificationStatus();
        
        return { success: true, bonusAwarded: result.bonusAwarded };
      } else {
        setError(result.error || 'Código de verificación inválido');
        toast.error(result.error || 'Código de verificación inválido');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'Error de conexión';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Verificar si el usuario necesita verificación
  const needsVerification = () => {
    return session?.user && !session.user.verified;
  };

  // Verificar si el usuario puede crear contenido
  const canCreateContent = () => {
    return session?.user?.verified === true;
  };

  // Obtener información de permisos del usuario
  const getUserPermissions = () => {
    if (!session?.user) {
      return {
        isAuthenticated: false,
        isVerified: false,
        role: 'GUEST',
        canCreateContent: false,
        canModerate: false,
        canAdmin: false,
        university: null,
        career: null
      };
    }

    const user = session.user;
    return {
      isAuthenticated: true,
      isVerified: user.verified || false,
      role: user.role || 'STUDENT',
      canCreateContent: user.verified || false,
      canModerate: user.role === 'MODERATOR' || user.role === 'ADMIN',
      canAdmin: user.role === 'ADMIN',
      university: user.university,
      career: user.career
    };
  };

  // Cargar estado al montar el componente
  useEffect(() => {
    if (session?.user) {
      loadVerificationStatus();
    }
  }, [session?.user]);

  return {
    verificationStatus,
    loading,
    error,
    requestVerification,
    confirmVerification,
    loadVerificationStatus,
    needsVerification,
    canCreateContent,
    getUserPermissions,
    clearError: () => setError(null)
  };
}

// Hook para verificar permisos específicos
export function usePermissions() {
  const { data: session } = useSession();

  const hasRole = (requiredRole: 'STUDENT' | 'MODERATOR' | 'ADMIN') => {
    if (!session?.user?.role) return false;
    
    const roleHierarchy = {
      'STUDENT': 1,
      'MODERATOR': 2,
      'ADMIN': 3
    };
    
    const userLevel = roleHierarchy[session.user.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole];
    
    return userLevel >= requiredLevel;
  };

  const isVerified = () => {
    return session?.user?.verified === true;
  };

  const canCreateContent = () => {
    return isVerified();
  };

  const canModerate = () => {
    return hasRole('MODERATOR');
  };

  const canAdmin = () => {
    return hasRole('ADMIN');
  };

  return {
    hasRole,
    isVerified,
    canCreateContent,
    canModerate,
    canAdmin,
    user: session?.user,
    isAuthenticated: !!session?.user
  };
}