'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  Trash2,
  Download,
  Send,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
  Clock,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface UserManagementProps {
  className?: string;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  banned: 'bg-red-100 text-red-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-gray-100 text-gray-800'
};

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  moderator: 'bg-blue-100 text-blue-800',
  user: 'bg-gray-100 text-gray-800'
};

export function UserManagement({ className }: UserManagementProps) {
  const {
    users,
    pagination,
    loading,
    error,
    loadUsers,
    updateUser,
    bulkAction,
    deleteUser,
    exportUsers,
    sendSystemNotification
  } = useAdmin();

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    role: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'update' | 'bulk' | 'delete' | 'notification';
    user?: any;
  }>({ open: false, type: 'update' });

  const [actionForm, setActionForm] = useState({
    status: '',
    role: '',
    reason: '',
    duration: '',
    bulkAction: '',
    notificationTitle: '',
    notificationContent: '',
    notificationType: 'info'
  });

  // Load users on component mount and filter changes
  useEffect(() => {
    loadUsers(1, 20, filters);
  }, [loadUsers, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (page: number) => {
    if (pagination) {
      loadUsers(page, pagination.limit, filters);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const openActionDialog = (type: 'update' | 'bulk' | 'delete' | 'notification', user?: any) => {
    setActionDialog({ open: true, type, user });
    if (type === 'update' && user) {
      setActionForm({
        ...actionForm,
        status: user.status,
        role: user.role
      });
    }
  };

  const closeActionDialog = () => {
    setActionDialog({ open: false, type: 'update' });
    setActionForm({
      status: '',
      role: '',
      reason: '',
      duration: '',
      bulkAction: '',
      notificationTitle: '',
      notificationContent: '',
      notificationType: 'info'
    });
  };

  const handleUpdateUser = async () => {
    if (!actionDialog.user) return;

    try {
      await updateUser(actionDialog.user.id, {
        status: actionForm.status as any,
        role: actionForm.role as any,
        reason: actionForm.reason,
        duration: actionForm.duration ? parseInt(actionForm.duration) : undefined
      });
      closeActionDialog();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    try {
      await bulkAction({
        userIds: selectedUsers,
        action: actionForm.bulkAction as any,
        reason: actionForm.reason,
        duration: actionForm.duration ? parseInt(actionForm.duration) : undefined
      });
      setSelectedUsers([]);
      closeActionDialog();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDeleteUser = async () => {
    if (!actionDialog.user) return;

    try {
      await deleteUser(actionDialog.user.id);
      closeActionDialog();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleSendNotification = async () => {
    try {
      await sendSystemNotification(
        actionForm.notificationTitle,
        actionForm.notificationContent,
        actionForm.notificationType as any,
        selectedUsers.length > 0 ? selectedUsers : undefined
      );
      setSelectedUsers([]);
      closeActionDialog();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleExport = async () => {
    try {
      await exportUsers(filters);
    } catch (error) {
      // Error handled by hook
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'banned':
        return <Ban className="h-4 w-4" />;
      case 'suspended':
        return <Clock className="h-4 w-4" />;
      default:
        return <UserCheck className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openActionDialog('notification')}
            disabled={loading}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.role}
          onValueChange={(value) => handleFilterChange('role', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split('-');
            handleFilterChange('sortBy', sortBy);
            handleFilterChange('sortOrder', sortOrder);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
            <SelectItem value="lastActiveAt-desc">Recently Active</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium">
            {selectedUsers.length} user(s) selected
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openActionDialog('bulk')}
            >
              Bulk Actions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedUsers([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name?.charAt(0) || user.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name || user.username}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                      {user.verified && (
                        <Badge variant="secondary" className="ml-2">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[user.status as keyof typeof statusColors]}>
                      <span className="flex items-center space-x-1">
                        {getStatusIcon(user.status)}
                        <span className="capitalize">{user.status}</span>
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                      <span className="capitalize">{user.role}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{user._count.posts} posts</div>
                      <div className="text-muted-foreground">
                        {user._count.followers} followers
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    {user.lastActiveAt && (
                      <div className="text-xs text-muted-foreground">
                        Last active: {new Date(user.lastActiveAt).toLocaleDateString()}
                      </div>
                    )}
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
                        <DropdownMenuItem onClick={() => openActionDialog('update', user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openActionDialog('update', user)}>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openActionDialog('delete', user)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
            {pagination.totalCount} users
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Action Dialogs */}
      <Dialog open={actionDialog.open} onOpenChange={closeActionDialog}>
        <DialogContent className="sm:max-w-[425px]">
          {actionDialog.type === 'update' && (
            <>
              <DialogHeader>
                <DialogTitle>Update User</DialogTitle>
                <DialogDescription>
                  Update user status, role, or other properties.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={actionForm.status}
                    onValueChange={(value) => setActionForm({ ...actionForm, status: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select
                    value={actionForm.role}
                    onValueChange={(value) => setActionForm({ ...actionForm, role: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
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
                {(actionForm.status === 'banned' || actionForm.status === 'suspended') && (
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
                      placeholder="Leave empty for permanent"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeActionDialog}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser} disabled={loading}>
                  Update User
                </Button>
              </DialogFooter>
            </>
          )}

          {actionDialog.type === 'bulk' && (
            <>
              <DialogHeader>
                <DialogTitle>Bulk Action</DialogTitle>
                <DialogDescription>
                  Perform action on {selectedUsers.length} selected user(s).
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bulkAction" className="text-right">
                    Action
                  </Label>
                  <Select
                    value={actionForm.bulkAction}
                    onValueChange={(value) => setActionForm({ ...actionForm, bulkAction: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activate">Activate</SelectItem>
                      <SelectItem value="ban">Ban</SelectItem>
                      <SelectItem value="suspend">Suspend</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
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
                {(actionForm.bulkAction === 'ban' || actionForm.bulkAction === 'suspend') && (
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
                      placeholder="Leave empty for permanent"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeActionDialog}>
                  Cancel
                </Button>
                <Button onClick={handleBulkAction} disabled={loading}>
                  Apply Action
                </Button>
              </DialogFooter>
            </>
          )}

          {actionDialog.type === 'delete' && (
            <>
              <DialogHeader>
                <DialogTitle>Delete User</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this user? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={closeActionDialog}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteUser} disabled={loading}>
                  Delete User
                </Button>
              </DialogFooter>
            </>
          )}

          {actionDialog.type === 'notification' && (
            <>
              <DialogHeader>
                <DialogTitle>Send System Notification</DialogTitle>
                <DialogDescription>
                  Send a notification to {selectedUsers.length > 0 ? `${selectedUsers.length} selected user(s)` : 'all users'}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notificationTitle" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="notificationTitle"
                    value={actionForm.notificationTitle}
                    onChange={(e) => setActionForm({ ...actionForm, notificationTitle: e.target.value })}
                    className="col-span-3"
                    placeholder="Notification title"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notificationContent" className="text-right">
                    Content
                  </Label>
                  <Textarea
                    id="notificationContent"
                    value={actionForm.notificationContent}
                    onChange={(e) => setActionForm({ ...actionForm, notificationContent: e.target.value })}
                    className="col-span-3"
                    placeholder="Notification content..."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notificationType" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={actionForm.notificationType}
                    onValueChange={(value) => setActionForm({ ...actionForm, notificationType: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeActionDialog}>
                  Cancel
                </Button>
                <Button onClick={handleSendNotification} disabled={loading}>
                  Send Notification
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}