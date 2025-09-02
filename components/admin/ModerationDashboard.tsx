'use client';

import React, { useState, useEffect } from 'react';
import { useModeration } from '@/hooks/useModeration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  User,
  FileText,
  Shield,
  Ban,
  UserX,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface ModerationDashboardProps {
  className?: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  investigating: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  dismissed: 'bg-gray-100 text-gray-800'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const actionTypeColors = {
  warning: 'bg-yellow-100 text-yellow-800',
  content_removal: 'bg-orange-100 text-orange-800',
  temporary_ban: 'bg-red-100 text-red-800',
  permanent_ban: 'bg-red-200 text-red-900',
  account_suspension: 'bg-purple-100 text-purple-800'
};

export function ModerationDashboard({ className }: ModerationDashboardProps) {
  const {
    reports,
    actions,
    stats,
    loading,
    error,
    loadReports,
    loadActions,
    loadStats,
    updateReport,
    createAction,
    updateAction,
    deleteReport,
    deleteAction
  } = useModeration();

  const [activeTab, setActiveTab] = useState('reports');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    search: ''
  });

  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'create' | 'update' | 'view';
    report?: any;
    action?: any;
  }>({ open: false, type: 'create' });

  const [actionForm, setActionForm] = useState({
    type: '',
    reason: '',
    duration: '',
    targetId: '',
    targetType: '',
    notes: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Load data on component mount
  useEffect(() => {
    loadReports();
    loadActions();
    loadStats();
  }, [loadReports, loadActions, loadStats]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const openActionDialog = (type: 'create' | 'update' | 'view', report?: any, action?: any) => {
    setActionDialog({ open: true, type, report, action });
    if (type === 'create' && report) {
      setActionForm({
        ...actionForm,
        targetId: report.targetId,
        targetType: report.targetType
      });
    } else if (type === 'update' && action) {
      setActionForm({
        type: action.type,
        reason: action.reason,
        duration: action.duration?.toString() || '',
        targetId: action.targetId,
        targetType: action.targetType,
        notes: action.notes || ''
      });
    }
  };

  const closeActionDialog = () => {
    setActionDialog({ open: false, type: 'create' });
    setActionForm({
      type: '',
      reason: '',
      duration: '',
      targetId: '',
      targetType: '',
      notes: ''
    });
  };

  const handleCreateAction = async () => {
    try {
      await createAction({
        type: actionForm.type as any,
        reason: actionForm.reason,
        targetId: actionForm.targetId,
        targetType: actionForm.targetType as any,
        duration: actionForm.duration ? parseInt(actionForm.duration) : undefined,
        notes: actionForm.notes
      });
      
      // Update report status if creating action from report
      if (actionDialog.report) {
        await updateReport(actionDialog.report.id, {
          status: 'resolved',
          moderatorNotes: `Action taken: ${actionForm.type}`
        });
      }
      
      closeActionDialog();
      loadReports();
      loadActions();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleUpdateReport = async (reportId: string, updates: any) => {
    try {
      await updateReport(reportId, updates);
      loadReports();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteReport(reportId);
      loadReports();
    } catch (error) {
      // Error handled by hook
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'investigating':
        return <Eye className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'dismissed':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'post':
      case 'comment':
        return <FileText className="h-4 w-4" />;
      case 'message':
      case 'conversation':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  // Filter reports and actions
  const filteredReports = reports.filter(report => {
    if (filters.status && report.status !== filters.status) return false;
    if (filters.type && report.targetType !== filters.type) return false;
    if (filters.priority && report.priority !== filters.priority) return false;
    if (filters.search && !report.reason.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const filteredActions = actions.filter(action => {
    if (filters.type && action.type !== filters.type) return false;
    if (filters.search && !action.reason.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Pagination
  const totalReports = filteredReports.length;
  const totalReportPages = Math.ceil(totalReports / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalActions = filteredActions.length;
  const totalActionPages = Math.ceil(totalActions / itemsPerPage);
  const paginatedActions = filteredActions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Moderation Dashboard</h2>
          <p className="text-muted-foreground">
            Manage reports, moderation actions, and system safety
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            loadReports();
            loadActions();
            loadStats();
          }}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reports.pending}</div>
              <p className="text-xs text-muted-foreground">
                {stats.reports.total} total reports
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Actions</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.actions.active}</div>
              <p className="text-xs text-muted-foreground">
                {stats.actions.total} total actions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responseTime.average}h</div>
              <p className="text-xs text-muted-foreground">
                Average response time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolutionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Reports resolved
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search reports and actions..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.type}
          onValueChange={(value) => handleFilterChange('type', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="post">Post</SelectItem>
            <SelectItem value="comment">Comment</SelectItem>
            <SelectItem value="message">Message</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.priority}
          onValueChange={(value) => handleFilterChange('priority', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">Reports ({filteredReports.length})</TabsTrigger>
          <TabsTrigger value="actions">Actions ({filteredActions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading reports...
                    </TableCell>
                  </TableRow>
                ) : paginatedReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.reason}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.description?.substring(0, 100)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(report.targetType)}
                          <span className="capitalize">{report.targetType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(report.status)}
                            <span className="capitalize">{report.status}</span>
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[report.priority as keyof typeof priorityColors]}>
                          <span className="capitalize">{report.priority}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={report.reporter?.avatar} />
                            <AvatarFallback>
                              {report.reporter?.name?.charAt(0) || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {report.reporter?.name || 'Anonymous'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openActionDialog('view', report)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openActionDialog('create', report)}>
                              <Shield className="h-4 w-4 mr-2" />
                              Take Action
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateReport(report.id, { status: 'investigating' })}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Mark Investigating
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateReport(report.id, { status: 'dismissed' })}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Dismiss
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteReport(report.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Reports Pagination */}
          {totalReportPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, totalReports)} of {totalReports} reports
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalReportPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalReportPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Moderator</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading actions...
                    </TableCell>
                  </TableRow>
                ) : paginatedActions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No actions found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedActions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{action.reason}</div>
                          <div className="text-sm text-muted-foreground">
                            {action.notes?.substring(0, 100)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(action.targetType)}
                          <span className="capitalize">{action.targetType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={actionTypeColors[action.type as keyof typeof actionTypeColors]}>
                          <span className="capitalize">{action.type.replace('_', ' ')}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={action.moderator?.avatar} />
                            <AvatarFallback>
                              {action.moderator?.name?.charAt(0) || 'M'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {action.moderator?.name || 'System'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(action.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {action.expiresAt 
                            ? new Date(action.expiresAt).toLocaleDateString()
                            : 'Permanent'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openActionDialog('view', undefined, action)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openActionDialog('update', undefined, action)}>
                              <Shield className="h-4 w-4 mr-2" />
                              Edit Action
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteAction(action.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Reverse Action
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Actions Pagination */}
          {totalActionPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, totalActions)} of {totalActions} actions
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalActionPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalActionPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={closeActionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          {actionDialog.type === 'create' && (
            <>
              <DialogHeader>
                <DialogTitle>Take Moderation Action</DialogTitle>
                <DialogDescription>
                  Create a moderation action for this report.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="actionType" className="text-right">
                    Action Type
                  </Label>
                  <Select
                    value={actionForm.type}
                    onValueChange={(value) => setActionForm({ ...actionForm, type: value })}
                  >
                    <SelectTrigger className="col-span-3">
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reason" className="text-right">
                    Reason
                  </Label>
                  <Textarea
                    id="reason"
                    value={actionForm.reason}
                    onChange={(e) => setActionForm({ ...actionForm, reason: e.target.value })}
                    className="col-span-3"
                    placeholder="Reason for this action..."
                  />
                </div>
                {(actionForm.type === 'temporary_ban' || actionForm.type === 'account_suspension') && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="duration" className="text-right">
                      Duration (days)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      value={actionForm.duration}
                      onChange={(e) => setActionForm({ ...actionForm, duration: e.target.value })}
                      className="col-span-3"
                      placeholder="Number of days"
                    />
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={actionForm.notes}
                    onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })}
                    className="col-span-3"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeActionDialog}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAction} disabled={loading}>
                  Create Action
                </Button>
              </DialogFooter>
            </>
          )}

          {actionDialog.type === 'view' && (actionDialog.report || actionDialog.action) && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {actionDialog.report ? 'Report Details' : 'Action Details'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {actionDialog.report && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Reason</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {actionDialog.report.reason}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {actionDialog.report.description || 'No description provided'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Evidence</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {actionDialog.report.evidence || 'No evidence provided'}
                      </p>
                    </div>
                  </>
                )}
                {actionDialog.action && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Action Type</Label>
                      <p className="text-sm text-muted-foreground mt-1 capitalize">
                        {actionDialog.action.type.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Reason</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {actionDialog.action.reason}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Notes</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {actionDialog.action.notes || 'No notes provided'}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button onClick={closeActionDialog}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}