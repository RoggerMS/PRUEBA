'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ModerationDashboard from '@/components/moderation/ModerationDashboard';
import { useModeration } from '@/hooks/useModeration';
import {
  Users,
  MessageSquare,
  Flag,
  Shield,
  BarChart3,
  Settings,
  Database,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban
} from 'lucide-react';

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
    activeActions: number;
    resolvedToday: number;
    avgResponseTime: number;
  };
  system: {
    uptime: number;
    activeConnections: number;
    storageUsed: number;
    apiCalls: number;
  };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { getPendingReportsCount, getActiveActionsCount, loadReports, loadActions, loadStats } = useModeration();

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load moderation data
      await Promise.all([
        loadReports({ limit: 100 }),
        loadActions({ limit: 100 }),
        loadStats()
      ]);
      
      // Simulate loading admin stats (in real app, this would be an API call)
      const mockStats: AdminStats = {
        users: {
          total: 15420,
          active: 12350,
          banned: 45,
          suspended: 23,
          newToday: 127
        },
        content: {
          posts: 45230,
          comments: 128450,
          messages: 89320,
          conversations: 23450,
          removedContent: 234
        },
        moderation: {
          pendingReports: getPendingReportsCount(),
          activeActions: getActiveActionsCount(),
          resolvedToday: 18,
          avgResponseTime: 2.4
        },
        system: {
          uptime: 99.8,
          activeConnections: 1250,
          storageUsed: 78.5,
          apiCalls: 234567
        }
      };
      
      setAdminStats(mockStats);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getStatusColor = (status: string, value: number, threshold: number) => {
    if (status === 'good' || value < threshold) {
      return 'text-green-600';
    }
    if (status === 'warning' || value < threshold * 2) {
      return 'text-yellow-600';
    }
    return 'text-red-600';
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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">System management and moderation center</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadAdminData}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {adminStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(adminStats.users.total)}</div>
              <p className="text-xs text-muted-foreground">
                +{adminStats.users.newToday} today
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className="bg-green-100 text-green-800">
                  Active: {formatNumber(adminStats.users.active)}
                </Badge>
                {adminStats.users.banned > 0 && (
                  <Badge className="bg-red-100 text-red-800">
                    Banned: {adminStats.users.banned}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(adminStats.content.posts)}</div>
              <p className="text-xs text-muted-foreground">Posts</p>
              <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                <div>Comments: {formatNumber(adminStats.content.comments)}</div>
                <div>Messages: {formatNumber(adminStats.content.messages)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moderation</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.moderation.pendingReports}</div>
              <p className="text-xs text-muted-foreground">Pending reports</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className="bg-blue-100 text-blue-800">
                  Active: {adminStats.moderation.activeActions}
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  Resolved: {adminStats.moderation.resolvedToday}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{adminStats.system.uptime}%</div>
              <p className="text-xs text-muted-foreground">Uptime</p>
              <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                <div>Connections: {formatNumber(adminStats.system.activeConnections)}</div>
                <div>Storage: {adminStats.system.storageUsed}%</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {adminStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system events and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New user registration</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Report resolved</p>
                        <p className="text-xs text-gray-500">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Content moderated</p>
                        <p className="text-xs text-gray-500">8 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">User banned</p>
                        <p className="text-xs text-gray-500">12 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Current system health and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Database</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">API Services</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Storage</span>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">78% Used</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">WebSocket</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                      <Flag className="h-5 w-5" />
                      <span className="text-sm">Review Reports</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                      <Users className="h-5 w-5" />
                      <span className="text-sm">Manage Users</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                      <BarChart3 className="h-5 w-5" />
                      <span className="text-sm">View Analytics</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                      <Settings className="h-5 w-5" />
                      <span className="text-sm">System Config</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>System Alerts</CardTitle>
                  <CardDescription>Important notifications and warnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {adminStats.moderation.pendingReports > 10 && (
                      <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            High number of pending reports
                          </p>
                          <p className="text-xs text-yellow-700">
                            {adminStats.moderation.pendingReports} reports need attention
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {adminStats.system.storageUsed > 80 && (
                      <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            Storage usage critical
                          </p>
                          <p className="text-xs text-red-700">
                            {adminStats.system.storageUsed}% of storage used
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {adminStats.moderation.pendingReports <= 10 && adminStats.system.storageUsed <= 80 && (
                      <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            All systems operational
                          </p>
                          <p className="text-xs text-green-700">
                            No critical issues detected
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation">
          <ModerationDashboard />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">User management interface coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Manage posts, comments, and other content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Content management interface coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>System settings and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">System configuration interface coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}