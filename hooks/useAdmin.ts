import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface AdminStats {
  users: {
    total: number;
    active: number;
    banned: number;
    suspended: number;
    newToday: number;
  };
  content: {
    posts: number;
    comments: number;
    messages: number;
    conversations: number;
    removedContent: number;
  };
  moderation: {
    pendingReports: number;
    totalReports: number;
    activeActions: number;
    resolvedToday: number;
    avgResponseTime: number;
  };
  system: {
    uptime: number;
    activeConnections: number;
    storageUsed: number;
    apiCalls: number;
    responseTime: number;
    errorRate: number;
  };
  charts: {
    dailyActivity: Array<{
      date: string;
      users: number;
      posts: number;
      reports: number;
    }>;
    trendingIssues: Array<{
      reason: string;
      count: number;
    }>;
    topModerators: Array<{
      moderator: {
        id: string;
        name: string;
        username: string;
      };
      actions: number;
    }>;
  };
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
}

interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  status: string;
  verified: boolean;
  createdAt: string;
  lastActiveAt?: string;
  _count: {
    posts: number;
    comments: number;
    followers: number;
    following: number;
  };
  recentActions: Array<{
    id: string;
    type: string;
    reason: string;
    createdAt: string;
    expiresAt?: string;
    status: string;
    moderator: {
      name: string;
      username: string;
    };
  }>;
}

interface UsersPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UsersFilters {
  search?: string;
  status?: 'active' | 'banned' | 'suspended' | 'pending';
  role?: 'user' | 'moderator' | 'admin';
  sortBy?: 'createdAt' | 'lastActiveAt' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
}

interface BulkActionData {
  userIds: string[];
  action: 'ban' | 'suspend' | 'activate' | 'delete';
  reason?: string;
  duration?: number;
}

export function useAdmin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<UsersPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load admin statistics
  const loadStats = useCallback(async (period?: string, startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/admin/stats?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load statistics');
      }

      const data = await response.json();
      setStats(data);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load statistics';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load users with filters and pagination
  const loadUsers = useCallback(async (page = 1, limit = 20, filters: UsersFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      });

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load users';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user status or role
  const updateUser = useCallback(async (
    userId: string,
    updates: {
      status?: 'active' | 'banned' | 'suspended';
      role?: 'user' | 'moderator' | 'admin';
      reason?: string;
      duration?: number;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          ...updates
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const data = await response.json();
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, ...data.user }
            : user
        )
      );

      toast.success(data.message || 'User updated successfully');
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update user';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Perform bulk action on multiple users
  const bulkAction = useCallback(async (actionData: BulkActionData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(actionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform bulk action');
      }

      const data = await response.json();
      
      // Refresh users list
      if (pagination) {
        await loadUsers(pagination.page, pagination.limit);
      }

      toast.success(data.message || 'Bulk action completed successfully');
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to perform bulk action';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [pagination, loadUsers]);

  // Delete user
  const deleteUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      const data = await response.json();
      
      // Remove user from local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

      toast.success(data.message || 'User deleted successfully');
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete user';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Export users data
  const exportUsers = useCallback(async (filters: UsersFilters = {}, format: 'csv' | 'json' = 'csv') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        export: 'true',
        format,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      });

      const response = await fetch(`/api/admin/users/export?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export users');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Usuarios exportados exitosamente');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al exportar usuarios';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // System settings state
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [emailSettings, setEmailSettings] = useState<any>({});
  const [storageSettings, setStorageSettings] = useState<any>({});

  // Load system settings
  const loadSystemSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/settings');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load settings');
      }

      const data = await response.json();
      setSystemSettings(data.settings);
      setEmailSettings(data.emailSettings || {});
      setStorageSettings(data.storageSettings || {});
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar configuración';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Save system settings
  const saveSystemSettings = useCallback(async (category: 'system' | 'email' | 'storage', data: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/settings?category=${category}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      const result = await response.json();
      toast.success('Configuración guardada exitosamente');
      await loadSystemSettings(); // Reload settings
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar configuración';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadSystemSettings]);

  // Test settings
  const testSettings = useCallback(async (type: 'email' | 'storage', testData: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/settings/test?type=${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      const message = 'Error al realizar test';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset settings
  const resetSystemSettings = useCallback(async (category: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/settings/reset?category=${category}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset settings');
      }

      const result = await response.json();
      toast.success('Configuración restablecida a valores por defecto');
      await loadSystemSettings();
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al restablecer configuración';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadSystemSettings]);

  // Send system notification to all users
  const sendSystemNotification = useCallback(async (
    title: string,
    content: string,
    type: 'info' | 'warning' | 'error' | 'success' = 'info',
    targetUsers?: string[]
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          content,
          type,
          targetUsers
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send notification');
      }

      const data = await response.json();
      toast.success(data.message || 'Notification sent successfully');
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send notification';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Utility functions
  const getActiveUsersCount = useCallback(() => {
    return stats?.users.active || 0;
  }, [stats]);

  const getPendingReportsCount = useCallback(() => {
    return stats?.moderation.pendingReports || 0;
  }, [stats]);

  const getSystemHealth = useCallback(() => {
    if (!stats) return 'unknown';
    
    const { uptime, storageUsed, errorRate } = stats.system;
    
    if (uptime > 99 && storageUsed < 80 && errorRate < 1) {
      return 'healthy';
    } else if (uptime > 95 && storageUsed < 90 && errorRate < 5) {
      return 'warning';
    } else {
      return 'critical';
    }
  }, [stats]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    stats,
    users,
    pagination,
    loading,
    error,
    systemSettings,
    emailSettings,
    storageSettings,

    // Actions
    loadStats,
    loadUsers,
    updateUser,
    bulkAction,
    deleteUser,
    exportUsers,
    sendSystemNotification,
    loadSystemSettings,
    saveSystemSettings,
    testSettings,
    resetSystemSettings,

    // Utilities
    getActiveUsersCount,
    getPendingReportsCount,
    getSystemHealth,
    clearError
  };
}