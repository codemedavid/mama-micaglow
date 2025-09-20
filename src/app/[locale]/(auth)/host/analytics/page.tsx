'use client';

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';

type AnalyticsData = {
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  totalOrders: number;
  totalRevenue: number;
  totalParticipants: number;
  averageOrderValue: number;
  completionRate: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  batchPerformance: Array<{ name: string; participants: number; revenue: number }>;
  orderStatusDistribution: Array<{ status: string; count: number }>;
  recentActivity: Array<{ type: string; description: string; timestamp: string }>;
};

export default function HostAnalyticsPage() {
  const { isHost, loading, userProfile } = useRole();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalBatches: 0,
    activeBatches: 0,
    completedBatches: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalParticipants: 0,
    averageOrderValue: 0,
    completionRate: 0,
    monthlyRevenue: [],
    batchPerformance: [],
    orderStatusDistribution: [],
    recentActivity: [],
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isHost || !userProfile) {
      return;
    }

    const fetchAnalytics = async () => {
      try {
        // Fetch host's batches
        const { data: batches } = await supabase
          .from('sub_group_batches')
          .select('*')
          .eq('host_id', userProfile.id)
          .order('created_at', { ascending: false });

        // Fetch orders for this host's region
        const { data: orders } = await supabase
          .from('orders')
          .select(`
            *,
            batch:sub_group_batches!inner(host_id)
          `)
          .eq('batch.host_id', userProfile.id);

        // Calculate basic stats
        const totalBatches = batches?.length || 0;
        const activeBatches = batches?.filter(batch =>
          ['active', 'payment_collection', 'ordering', 'processing', 'shipped'].includes(batch.status),
        ).length || 0;
        const completedBatches = batches?.filter(batch => batch.status === 'completed').length || 0;
        const totalOrders = orders?.length || 0;
        const totalRevenue = orders?.reduce((sum, order) =>
          order.payment_status === 'paid' ? sum + order.total_amount : sum, 0) || 0;
        const totalParticipants = batches?.reduce((sum, batch) => sum + batch.current_vials, 0) || 0;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const completionRate = totalBatches > 0 ? (completedBatches / totalBatches) * 100 : 0;

        // Generate monthly revenue data (last 6 months)
        const monthlyRevenue = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

          const monthOrders = orders?.filter((order) => {
            const orderDate = new Date(order.created_at);
            return orderDate >= monthStart && orderDate <= monthEnd && order.payment_status === 'paid';
          }) || [];

          const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total_amount, 0);

          monthlyRevenue.push({
            month: monthName,
            revenue: monthRevenue,
          });
        }

        // Generate batch performance data
        const batchPerformance = batches?.slice(0, 5).map(batch => ({
          name: batch.name,
          participants: batch.current_vials,
          revenue: orders?.filter(order =>
            order.batch?.id === batch.id && order.payment_status === 'paid',
          ).reduce((sum, order) => sum + order.total_amount, 0) || 0,
        })) || [];

        // Generate order status distribution
        const orderStatusDistribution = [
          { status: 'Pending', count: orders?.filter(order => order.status === 'pending').length || 0 },
          { status: 'Confirmed', count: orders?.filter(order => order.status === 'confirmed').length || 0 },
          { status: 'Processing', count: orders?.filter(order => order.status === 'processing').length || 0 },
          { status: 'Shipped', count: orders?.filter(order => order.status === 'shipped').length || 0 },
          { status: 'Delivered', count: orders?.filter(order => order.status === 'delivered').length || 0 },
          { status: 'Cancelled', count: orders?.filter(order => order.status === 'cancelled').length || 0 },
        ];

        // Generate recent activity
        const recentActivity = [
          {
            type: 'batch',
            description: `Created new batch: ${batches?.[0]?.name || 'N/A'}`,
            timestamp: batches?.[0]?.created_at || new Date().toISOString(),
          },
          {
            type: 'order',
            description: `New order received: ${orders?.[0]?.order_code || 'N/A'}`,
            timestamp: orders?.[0]?.created_at || new Date().toISOString(),
          },
          {
            type: 'payment',
            description: `Payment received: ₱${orders?.find(order => order.payment_status === 'paid')?.total_amount || 0}`,
            timestamp: orders?.find(order => order.payment_status === 'paid')?.created_at || new Date().toISOString(),
          },
        ];

        setAnalytics({
          totalBatches,
          activeBatches,
          completedBatches,
          totalOrders,
          totalRevenue,
          totalParticipants,
          averageOrderValue,
          completionRate,
          monthlyRevenue,
          batchPerformance,
          orderStatusDistribution,
          recentActivity,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchAnalytics();
  }, [isHost, userProfile]);

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!isHost) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Analytics</h1>
          <p className="text-xl text-gray-600">Insights and performance metrics for your region</p>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Total Revenue</p>
                  <p className="text-3xl font-bold">
                    ₱
                    {analytics.totalRevenue.toLocaleString()}
                  </p>
                  <div className="mt-2 flex items-center text-blue-200">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-xs">+12% from last month</span>
                  </div>
                </div>
                <div className="rounded-full bg-blue-400/20 p-3">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-100">Total Orders</p>
                  <p className="text-3xl font-bold">{analytics.totalOrders}</p>
                  <div className="mt-2 flex items-center text-green-200">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-xs">+8% from last month</span>
                  </div>
                </div>
                <div className="rounded-full bg-green-400/20 p-3">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">Avg Order Value</p>
                  <p className="text-3xl font-bold">
                    ₱
                    {analytics.averageOrderValue.toLocaleString()}
                  </p>
                  <div className="mt-2 flex items-center text-purple-200">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-xs">+15% from last month</span>
                  </div>
                </div>
                <div className="rounded-full bg-purple-400/20 p-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-100">Completion Rate</p>
                  <p className="text-3xl font-bold">
                    {analytics.completionRate.toFixed(1)}
                    %
                  </p>
                  <div className="mt-2 flex items-center text-orange-200">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-xs">+2.1% from last month</span>
                  </div>
                </div>
                <div className="rounded-full bg-orange-400/20 p-3">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Insights */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Monthly Revenue Chart */}
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                Monthly Revenue
              </CardTitle>
              <CardDescription>Revenue trends over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.monthlyRevenue.map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{month.month}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ₱
                        {month.revenue.toLocaleString()}
                      </p>
                      <div className="h-2 w-32 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                          style={{
                            width: `${Math.max(10, (month.revenue / Math.max(...analytics.monthlyRevenue.map(m => m.revenue), 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Batch Performance */}
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Layers className="mr-2 h-5 w-5 text-green-600" />
                Batch Performance
              </CardTitle>
              <CardDescription>Top performing batches by participants and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.batchPerformance.map((batch, index) => (
                  <div key={batch.name} className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">{batch.name}</h4>
                      <span className="text-sm text-gray-500">
                        #
                        {index + 1}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Participants:</span>
                        <span className="ml-1 font-semibold">{batch.participants}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Revenue:</span>
                        <span className="ml-1 font-semibold">
                          ₱
                          {batch.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Distribution and Recent Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Order Status Distribution */}
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
                Order Status Distribution
              </CardTitle>
              <CardDescription>Breakdown of orders by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.orderStatusDistribution.map(status => (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                      <span className="font-medium text-gray-900">{status.status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">{status.count}</span>
                      <div className="h-2 w-20 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
                          style={{
                            width: `${Math.max(10, (status.count / Math.max(...analytics.orderStatusDistribution.map(s => s.count), 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Activity className="mr-2 h-5 w-5 text-orange-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest activities in your region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivity.map(activity => (
                  <div key={`${activity.type}-${activity.timestamp}`} className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                      {activity.type === 'batch' && <Layers className="h-4 w-4 text-orange-600" />}
                      {activity.type === 'order' && <Activity className="h-4 w-4 text-orange-600" />}
                      {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-orange-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
