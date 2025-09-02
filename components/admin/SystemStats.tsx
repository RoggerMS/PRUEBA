'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  Activity,
  Server,
  Database,
  Wifi,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface SystemStatsProps {
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const healthStatusColors = {
  excellent: 'bg-green-100 text-green-800',
  good: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800'
};

export function SystemStats({ className }: SystemStatsProps) {
  const { stats, loading, loadStats } = useAdmin();
  const [timePeriod, setTimePeriod] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats(timePeriod);
  }, [loadStats, timePeriod]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats(timePeriod);
    setRefreshing(false);
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (trend < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading && !stats) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">System Statistics</h2>
            <p className="text-muted-foreground">Loading system metrics...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load system statistics</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Statistics</h2>
          <p className="text-muted-foreground">
            Comprehensive overview of system performance and metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.users.total)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(stats.users.growth)}
              <span>{formatPercentage(Math.abs(stats.users.growth))} from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.users.active)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>{formatPercentage((stats.users.active / stats.users.total) * 100)} of total</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.content.posts + stats.content.comments)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(stats.content.growth)}
              <span>{formatPercentage(Math.abs(stats.content.growth))} from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moderation Queue</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.moderation.pendingReports}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{stats.moderation.avgResponseTime}h avg response</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              {getHealthIcon(stats.system.serverHealth.status)}
              <Badge className={healthStatusColors[stats.system.serverHealth.status as keyof typeof healthStatusColors]}>
                {stats.system.serverHealth.status}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>CPU Usage</span>
                <span>{formatPercentage(stats.system.serverHealth.cpu)}</span>
              </div>
              <Progress value={stats.system.serverHealth.cpu} className="h-1" />
              <div className="flex justify-between text-xs">
                <span>Memory Usage</span>
                <span>{formatPercentage(stats.system.serverHealth.memory)}</span>
              </div>
              <Progress value={stats.system.serverHealth.memory} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Health</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              {getHealthIcon(stats.system.databaseHealth.status)}
              <Badge className={healthStatusColors[stats.system.databaseHealth.status as keyof typeof healthStatusColors]}>
                {stats.system.databaseHealth.status}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Connections</span>
                <span>{stats.system.databaseHealth.connections}/100</span>
              </div>
              <Progress value={(stats.system.databaseHealth.connections / 100) * 100} className="h-1" />
              <div className="flex justify-between text-xs">
                <span>Query Time</span>
                <span>{stats.system.databaseHealth.queryTime}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Health</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              {getHealthIcon(stats.system.apiHealth.status)}
              <Badge className={healthStatusColors[stats.system.apiHealth.status as keyof typeof healthStatusColors]}>
                {stats.system.apiHealth.status}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Response Time</span>
                <span>{stats.system.apiHealth.responseTime}ms</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Success Rate</span>
                <span>{formatPercentage(stats.system.apiHealth.successRate)}</span>
              </div>
              <Progress value={stats.system.apiHealth.successRate} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {formatPercentage(stats.system.storageUsage.percentage)}
            </div>
            <div className="space-y-1">
              <Progress value={stats.system.storageUsage.percentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatNumber(stats.system.storageUsage.used)} GB used</span>
                <span>{formatNumber(stats.system.storageUsage.total)} GB total</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
            <CardDescription>
              User activity and content creation over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number, name: string) => [formatNumber(value), name]}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stackId="1" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  name="Active Users"
                />
                <Area 
                  type="monotone" 
                  dataKey="posts" 
                  stackId="1" 
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  name="Posts Created"
                />
                <Area 
                  type="monotone" 
                  dataKey="comments" 
                  stackId="1" 
                  stroke="#ffc658" 
                  fill="#ffc658" 
                  name="Comments"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Status Distribution</CardTitle>
            <CardDescription>
              Breakdown of user account statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: stats.users.active, color: '#00C49F' },
                    { name: 'Inactive', value: stats.users.inactive, color: '#FFBB28' },
                    { name: 'Suspended', value: stats.users.suspended, color: '#FF8042' },
                    { name: 'Banned', value: stats.users.banned, color: '#FF4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Active', value: stats.users.active, color: '#00C49F' },
                    { name: 'Inactive', value: stats.users.inactive, color: '#FFBB28' },
                    { name: 'Suspended', value: stats.users.suspended, color: '#FF8042' },
                    { name: 'Banned', value: stats.users.banned, color: '#FF4444' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatNumber(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trending Issues and Top Moderators */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Trending Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Trending Issues</CardTitle>
            <CardDescription>
              Most reported issues in the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.trendingIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{issue.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {issue.count} reports
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(issue.trend)}
                    <span className="text-xs text-muted-foreground">
                      {formatPercentage(Math.abs(issue.trend))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Moderators */}
        <Card>
          <CardHeader>
            <CardTitle>Top Moderators</CardTitle>
            <CardDescription>
              Most active moderators in the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topModerators.map((moderator, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{moderator.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {moderator.actionsCount} actions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatPercentage(moderator.responseRate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      response rate
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            System performance over the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.performanceMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name: string) => {
                  if (name.includes('Time')) {
                    return [`${value}ms`, name];
                  }
                  return [formatPercentage(value), name];
                }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="responseTime" 
                stroke="#8884d8" 
                name="Response Time (ms)"
                strokeWidth={2}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="cpuUsage" 
                stroke="#82ca9d" 
                name="CPU Usage (%)"
                strokeWidth={2}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="memoryUsage" 
                stroke="#ffc658" 
                name="Memory Usage (%)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}