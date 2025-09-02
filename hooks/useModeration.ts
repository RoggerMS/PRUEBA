'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Report {
  id: string;
  type: 'user' | 'post' | 'comment' | 'message' | 'conversation';
  targetId: string;
  reason: string;
  description?: string;
  evidence?: string[];
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    username: string;
    name: string;
    image?: string;
  };
  moderator?: {
    id: string;
    username: string;
    name: string;
    image?: string;
  };
  targetData: any;
}

interface ModerationAction {
  id: string;
  type: 'warning' | 'content_removal' | 'temporary_ban' | 'permanent_ban' | 'account_suspension';
  targetType: 'user' | 'post' | 'comment' | 'message' | 'conversation';
  targetId: string;
  reason: string;
  notes?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  moderator: {
    id: string;
    username: string;
    name: string;
    image?: string;
  };
  targetData: any;
}

interface ModerationStats {
  period: {
    start: string;
    end: string;
    type: string;
  };
  reports: {
    total: number;
    byStatus: Record<string, number>;
    byReason: Record<string, number>;
    byType: Record<string, number>;
    resolutionRate: number;
  };
  actions: {
    total: number;
    byType: Record<string, number>;
    byModerator: Array<{
      moderatorId: string;
      _count: { moderatorId: number };
      moderator: {
        id: string;
        username: string;
        name: string;
        image?: string;
      };
    }>;
  };
  performance: {
    avgResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
  };
  userActions: {
    bannedUsers: number;
    suspendedUsers: number;
    contentRemoved: number;
  };
}

interface CreateReportData {
  type: 'user' | 'post' | 'comment' | 'message' | 'conversation';
  targetId: string;
  reason: string;
  description?: string;
  evidence?: string[];
}

interface CreateActionData {
  type: 'warning' | 'content_removal' | 'temporary_ban' | 'permanent_ban' | 'account_suspension';
  targetType: 'user' | 'post' | 'comment' | 'message' | 'conversation';
  targetId: string;
  reason: string;
  duration?: number;
  notes?: string;
  notifyUser?: boolean;
}

interface ReportFilters {
  status?: string;
  type?: string;
  reason?: string;
  priority?: string;
  moderatorId?: string;
  reporterId?: string;
  limit?: number;
  offset?: number;
}

interface ActionFilters {
  type?: string;
  targetType?: string;
  active?: boolean;
  moderatorId?: string;
  limit?: number;
  offset?: number;
}

export function useModeration() {
  const [reports, setReports] = useState<Report[]>([]);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load reports with filters
  const loadReports = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/moderation/reports?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load reports');
      }

      const data = await response.json();
      setReports(data.reports);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reports';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load moderation actions with filters
  const loadActions = useCallback(async (filters: ActionFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/moderation/actions?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load actions');
      }

      const data = await response.json();
      setActions(data.actions);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load actions';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load moderation statistics
  const loadStats = useCallback(async (period?: string, startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/moderation/stats?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load statistics');
      }

      const data = await response.json();
      setStats(data.stats);
      return data.stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load statistics';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new report
  const createReport = useCallback(async (reportData: CreateReportData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/moderation/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create report');
      }

      const data = await response.json();
      toast.success('Report submitted successfully');
      
      // Refresh reports list
      await loadReports();
      
      return data.report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create report';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadReports]);

  // Update a report
  const updateReport = useCallback(async (
    reportId: string,
    updates: {
      status?: 'pending' | 'investigating' | 'resolved' | 'dismissed';
      priority?: 'low' | 'medium' | 'high';
      moderatorNotes?: string;
      action?: string;
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/moderation/reports', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: reportId,
          ...updates,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update report');
      }

      const data = await response.json();
      toast.success('Report updated successfully');
      
      // Update local state
      setReports(prev => prev.map(report => 
        report.id === reportId ? { ...report, ...data.report } : report
      ));
      
      return data.report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update report';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a moderation action
  const createAction = useCallback(async (actionData: CreateActionData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/moderation/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create action');
      }

      const data = await response.json();
      toast.success('Moderation action created successfully');
      
      // Refresh actions list
      await loadActions();
      
      return data.action;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create action';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadActions]);

  // Update a moderation action
  const updateAction = useCallback(async (
    actionId: string,
    updates: {
      isActive?: boolean;
      notes?: string;
      expiresAt?: string;
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/moderation/actions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: actionId,
          ...updates,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update action');
      }

      const data = await response.json();
      toast.success('Action updated successfully');
      
      // Update local state
      setActions(prev => prev.map(action => 
        action.id === actionId ? { ...action, ...data.action } : action
      ));
      
      return data.action;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update action';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a report
  const deleteReport = useCallback(async (reportId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/moderation/reports', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: reportId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete report');
      }

      toast.success('Report deleted successfully');
      
      // Remove from local state
      setReports(prev => prev.filter(report => report.id !== reportId));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete report';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a moderation action
  const deleteAction = useCallback(async (actionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/moderation/actions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: actionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete action');
      }

      toast.success('Action deleted successfully');
      
      // Remove from local state
      setActions(prev => prev.filter(action => action.id !== actionId));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete action';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get report by ID
  const getReport = useCallback((reportId: string) => {
    return reports.find(report => report.id === reportId);
  }, [reports]);

  // Get action by ID
  const getAction = useCallback((actionId: string) => {
    return actions.find(action => action.id === actionId);
  }, [actions]);

  // Get reports by status
  const getReportsByStatus = useCallback((status: string) => {
    return reports.filter(report => report.status === status);
  }, [reports]);

  // Get actions by type
  const getActionsByType = useCallback((type: string) => {
    return actions.filter(action => action.type === type);
  }, [actions]);

  // Get pending reports count
  const getPendingReportsCount = useCallback(() => {
    return reports.filter(report => report.status === 'pending').length;
  }, [reports]);

  // Get active actions count
  const getActiveActionsCount = useCallback(() => {
    return actions.filter(action => action.isActive).length;
  }, [actions]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset all data
  const reset = useCallback(() => {
    setReports([]);
    setActions([]);
    setStats(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    // State
    reports,
    actions,
    stats,
    loading,
    error,
    
    // Actions
    loadReports,
    loadActions,
    loadStats,
    createReport,
    updateReport,
    createAction,
    updateAction,
    deleteReport,
    deleteAction,
    
    // Getters
    getReport,
    getAction,
    getReportsByStatus,
    getActionsByType,
    getPendingReportsCount,
    getActiveActionsCount,
    
    // Utilities
    clearError,
    reset,
  };
}

export type { Report, ModerationAction, ModerationStats, CreateReportData, CreateActionData, ReportFilters, ActionFilters };