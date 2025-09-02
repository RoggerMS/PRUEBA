'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Flag,
  MessageSquare,
  Search,
  Shield,
  Trash2,
  User,
  Users,
  XCircle,
  BarChart3,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

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

export default function ModerationDashboard() {
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  
  // Filters
  const [reportFilters, setReportFilters] = useState({
    status: '',
    type: '',
    reason: '',
    search: ''
  });
  
  const [actionFilters, setActionFilters] = useState({
    type: '',
    targetType: '',
    active: '',
    search: ''
  });

  // Action form
  const [actionForm, setActionForm] = useState({
    type: '',
    reason: '',
    duration: '',
    notes: '',
    notifyUser: true
  });

  useEffect(() => {
    loadReports();
    loadActions();
    loadStats();
  }, []);

  useEffect(() => {
    loadReports();
  }, [reportFilters]);

  useEffect(() => {
    loadActions();
  }, [actionFilters]);

  const loadReports = async () => {
    try {
      const params = new URLSearchParams();
      if (reportFilters.status) params.append('status', reportFilters.status);
      if (reportFilters.type) params.append('type', reportFilters.type);
      if (reportFilters.reason) params.append('reason', reportFilters.reason);
      
      const response = await fetch(`/api/moderation/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        let filteredReports = data.reports;
        
        if (reportFilters.search) {
          filteredReports = filteredReports.filter((report: Report) =>
            report.reporter.username.toLowerCase().includes(reportFilters.search.toLowerCase()) ||
            report.reporter.name.toLowerCase().includes(reportFilters.search.toLowerCase()) ||
            report.reason.toLowerCase().includes(reportFilters.search.toLowerCase())
          );
        }
        
        setReports(filteredReports);
      }
    } catch (error) {
      toast.error('Error loading reports');
    }
  };

  const loadActions = async () => {
    try {
      const params = new URLSearchParams();
      if (actionFilters.type) params.append('type', actionFilters.type);
      if (actionFilters.targetType) params.append('targetType', actionFilters.targetType);
      if (actionFilters.active) params.append('active', actionFilters.active);
      
      const response = await fetch(`/api/moderation/actions?${params}`);
      if (response.ok) {
        const data = await response.json();
        let filteredActions = data.actions;
        
        if (actionFilters.search) {
          filteredActions = filteredActions.filter((action: ModerationAction) =>
            action.moderator.username.toLowerCase().includes(actionFilters.search.toLowerCase()) ||
            action.moderator.name.toLowerCase().includes(actionFilters.search.toLowerCase()) ||
            action.reason.toLowerCase().includes(actionFilters.search.toLowerCase())
          );
        }
        
        setActions(filteredActions);
      }
    } catch (error) {
      toast.error('Error loading actions');
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/moderation/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      toast.error('Error loading statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, status: string, action?: string, notes?: string) => {
    try {
      const response = await fetch('/api/moderation/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reportId,
          status,
          action,
          moderatorNotes: notes
        })
      });

      if (response.ok) {
        toast.success('Report updated successfully');
        loadReports();
        setSelectedReport(null);
      } else {
        toast.error('Failed to update report');
      }
    } catch (error) {
      toast.error('Error updating report');
    }
  };

  const handleCreateAction = async () => {
    if (!selectedReport || !actionForm.type || !actionForm.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/moderation/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: actionForm.type,
          targetType: selectedReport.type,
          targetId: selectedReport.targetId,
          reason: actionForm.reason,
          duration: actionForm.duration ? parseInt(actionForm.duration) : undefined,
          notes: actionForm.notes,
          notifyUser: actionForm.notifyUser
        })
      });

      if (response.ok) {
        toast.success('Moderation action created successfully');
        setActionDialogOpen(false);
        setActionForm({ type: '', reason: '', duration: '', notes: '', notifyUser: true });
        loadActions();
        
        // Also update the report status
        await handleReportAction(selectedReport.id, 'resolved', actionForm.type);
      } else {
        toast.error('Failed to create moderation action');
      }
    } catch (error) {
      toast.error('Error creating moderation action');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="h-4 w-4" />;
      case 'post': return <MessageSquare className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'conversation': return <Users className="h-4 w-4" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
          <p className="text-gray-600">Manage reports, actions, and system moderation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadStats}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Refresh Stats
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reports.total}</div>
              <p className="text-xs text-muted-foreground">
                Resolution rate: {stats.reports.resolutionRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions Taken</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.actions.total}</div>
              <p className="text-xs text-muted-foreground">
                Content removed: {stats.userActions.contentRemoved}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.performance.avgResponseTime)}h</div>
              <p className="text-xs text-muted-foreground">
                Min: {Math.round(stats.performance.minResponseTime)}h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Actions</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.userActions.bannedUsers + stats.userActions.suspendedUsers}</div>
              <p className="text-xs text-muted-foreground">
                Banned: {stats.userActions.bannedUsers}, Suspended: {stats.userActions.suspendedUsers}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search reports..."
                    value={reportFilters.search}
                    onChange={(e) => setReportFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <Select value={reportFilters.status} onValueChange={(value) => setReportFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={reportFilters.type} onValueChange={(value) => setReportFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="comment">Comment</SelectItem>
                    <SelectItem value="message">Message</SelectItem>
                    <SelectItem value="conversation">Conversation</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={reportFilters.reason} onValueChange={(value) => setReportFilters(prev => ({ ...prev, reason: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Reasons</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="hate_speech">Hate Speech</SelectItem>
                    <SelectItem value="violence">Violence</SelectItem>
                    <SelectItem value="sexual_content">Sexual Content</SelectItem>
                    <SelectItem value="misinformation">Misinformation</SelectItem>
                    <SelectItem value="copyright">Copyright</SelectItem>
                    <SelectItem value="privacy">Privacy</SelectItem>
                    <SelectItem value="impersonation">Impersonation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getTypeIcon(report.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getPriorityColor(report.priority)}>
                            {report.priority}
                          </Badge>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Badge variant="outline">
                            {report.type}
                          </Badge>
                          <Badge variant="outline">
                            {report.reason.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Reported by <span className="font-medium">{report.reporter.name}</span> (@{report.reporter.username})
                        </p>
                        {report.description && (
                          <p className="text-sm text-gray-800 mb-2">{report.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Created: {new Date(report.createdAt).toLocaleString()}
                        </p>
                        {report.moderator && (
                          <p className="text-xs text-gray-500">
                            Handled by: {report.moderator.name} (@{report.moderator.username})
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {report.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReportAction(report.id, 'investigating')}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Investigate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReport(report);
                              setActionDialogOpen(true);
                            }}
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Take Action
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          {/* Action Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search actions..."
                    value={actionFilters.search}
                    onChange={(e) => setActionFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <Select value={actionFilters.type} onValueChange={(value) => setActionFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Action Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="content_removal">Content Removal</SelectItem>
                    <SelectItem value="temporary_ban">Temporary Ban</SelectItem>
                    <SelectItem value="permanent_ban">Permanent Ban</SelectItem>
                    <SelectItem value="account_suspension">Account Suspension</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={actionFilters.targetType} onValueChange={(value) => setActionFilters(prev => ({ ...prev, targetType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Target Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Targets</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="comment">Comment</SelectItem>
                    <SelectItem value="message">Message</SelectItem>
                    <SelectItem value="conversation">Conversation</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={actionFilters.active} onValueChange={(value) => setActionFilters(prev => ({ ...prev, active: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Actions List */}
          <div className="space-y-4">
            {actions.map((action) => (
              <Card key={action.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getTypeIcon(action.targetType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={action.isActive ? 'default' : 'secondary'}>
                            {action.type.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {action.targetType}
                          </Badge>
                          {action.isActive ? (
                            <Badge className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-800 mb-2">
                          <span className="font-medium">Reason:</span> {action.reason}
                        </p>
                        {action.notes && (
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Notes:</span> {action.notes}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Created: {new Date(action.createdAt).toLocaleString()}
                        </p>
                        {action.expiresAt && (
                          <p className="text-xs text-gray-500">
                            Expires: {new Date(action.expiresAt).toLocaleString()}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          By: {action.moderator.name} (@{action.moderator.username})
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reports by Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Reports by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.reports.byStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="capitalize">{status}</span>
                        <Badge className={getStatusColor(status)}>{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reports by Reason */}
              <Card>
                <CardHeader>
                  <CardTitle>Reports by Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.reports.byReason).map(([reason, count]) => (
                      <div key={reason} className="flex items-center justify-between">
                        <span className="capitalize">{reason.replace('_', ' ')}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.actions.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Moderators */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Moderators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.actions.byModerator.slice(0, 5).map((item) => (
                      <div key={item.moderatorId} className="flex items-center justify-between">
                        <span>{item.moderator?.name || 'Unknown'}</span>
                        <Badge variant="outline">{item._count.moderatorId}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Take Moderation Action</DialogTitle>
            <DialogDescription>
              Create a moderation action for this report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="actionType">Action Type</Label>
              <Select value={actionForm.type} onValueChange={(value) => setActionForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="content_removal">Content Removal</SelectItem>
                  <SelectItem value="temporary_ban">Temporary Ban</SelectItem>
                  <SelectItem value="permanent_ban">Permanent Ban</SelectItem>
                  <SelectItem value="account_suspension">Account Suspension</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={actionForm.reason}
                onChange={(e) => setActionForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter reason for action"
              />
            </div>
            {(actionForm.type === 'temporary_ban' || actionForm.type === 'account_suspension') && (
              <div>
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={actionForm.duration}
                  onChange={(e) => setActionForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="Enter duration in hours"
                />
              </div>
            )}
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={actionForm.notes}
                onChange={(e) => setActionForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAction}>
              Create Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}