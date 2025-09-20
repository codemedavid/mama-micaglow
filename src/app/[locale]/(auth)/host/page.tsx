'use client';

import {
  Activity,
  ArrowUpRight,
  Clock,
  DollarSign,
  Eye,
  Layers,
  MapPin,
  Plus,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';

type HostBatch = {
  id: number;
  name: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'payment_collection' | 'ordering' | 'processing' | 'shipped' | 'delivered';
  target_vials: number;
  current_vials: number;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  created_at: string;
  batch_products: any[];
};

type HostRegion = {
  id: number;
  name: string;
  description: string | null;
  region: string;
  city: string;
  host_id: number | null;
  whatsapp_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type HostStats = {
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  totalParticipants: number;
  totalRevenue: number;
  pendingOrders: number;
  recentBatches: HostBatch[];
  regionInfo: HostRegion | null;
};

export default function HostOverviewPage() {
  const { isHost, loading, userProfile } = useRole();
  const [stats, setStats] = useState<HostStats>({
    totalBatches: 0,
    activeBatches: 0,
    completedBatches: 0,
    totalParticipants: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentBatches: [],
    regionInfo: null,
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isHost || !userProfile) {
      return;
    }

    const fetchHostData = async () => {
      try {
        // Fetch host's region
        const { data: regionData } = await supabase
          .from('sub_groups')
          .select('*')
          .eq('host_id', userProfile.id)
          .eq('is_active', true)
          .single();

        // Fetch host's sub-group batches
        const { data: batches, error: batchesError } = await supabase
          .from('sub_group_batches')
          .select(`
            *,
            batch_products:sub_group_batch_products(
              *,
              product:products(*)
            )
          `)
          .eq('host_id', userProfile.id)
          .order('created_at', { ascending: false });

        if (batchesError) {
          console.error('Error fetching batches:', batchesError);
          return;
        }

        // Fetch orders for this host's region
        const { data: ordersData } = await supabase
          .from('orders')
          .select(`
            *,
            batch:sub_group_batches!inner(host_id)
          `)
          .eq('batch.host_id', userProfile.id);

        // Calculate stats
        const totalBatches = batches?.length || 0;
        const activeBatches = batches?.filter(batch =>
          ['active', 'payment_collection', 'ordering', 'processing', 'shipped'].includes(batch.status),
        ).length || 0;
        const completedBatches = batches?.filter(batch => batch.status === 'completed').length || 0;
        const pendingOrders = ordersData?.filter(order =>
          ['pending', 'confirmed', 'processing'].includes(order.status),
        ).length || 0;

        // Calculate participants and revenue
        const totalParticipants = batches?.reduce((sum, batch) => sum + batch.current_vials, 0) || 0;
        const totalRevenue = ordersData?.reduce((sum, order) =>
          order.payment_status === 'paid' ? sum + order.total_amount : sum, 0) || 0;

        setStats({
          totalBatches,
          activeBatches,
          completedBatches,
          totalParticipants,
          totalRevenue,
          pendingOrders,
          recentBatches: batches?.slice(0, 5) || [],
          regionInfo: regionData,
        });
      } catch (error) {
        console.error('Error fetching host data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchHostData();
  }, [isHost, userProfile]);

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading host dashboard...</p>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'payment_collection':
        return 'bg-orange-100 text-orange-800';
      case 'ordering':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (batch: HostBatch) => {
    if (batch.target_vials === 0) {
      return 0;
    }
    return Math.round((batch.current_vials / batch.target_vials) * 100);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Host Dashboard</h1>
          <p className="text-xl text-gray-600">
            Welcome back! Here's what's happening in your region.
            {stats.regionInfo && (
              <span className="ml-2 text-blue-600">
                (
                {stats.regionInfo.region}
                ,
                {' '}
                {stats.regionInfo.city}
                )
              </span>
            )}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Batches */}
          <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Total Batches</p>
                  <p className="text-3xl font-bold">{stats.totalBatches}</p>
                  <div className="mt-2 flex items-center text-blue-200">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-xs">+12% from last month</span>
                  </div>
                </div>
                <div className="rounded-full bg-blue-400/20 p-3">
                  <Layers className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Batches */}
          <Card className="border-0 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-100">Active Batches</p>
                  <p className="text-3xl font-bold">{stats.activeBatches}</p>
                  <div className="mt-2 flex items-center text-green-200">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-xs">+8% from last month</span>
                  </div>
                </div>
                <div className="rounded-full bg-green-400/20 p-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Participants */}
          <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">Total Participants</p>
                  <p className="text-3xl font-bold">{stats.totalParticipants}</p>
                  <div className="mt-2 flex items-center text-purple-200">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-xs">+24% from last month</span>
                  </div>
                </div>
                <div className="rounded-full bg-purple-400/20 p-3">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-100">Total Revenue</p>
                  <p className="text-3xl font-bold">
                    ₱
                    {stats.totalRevenue.toLocaleString()}
                  </p>
                  <div className="mt-2 flex items-center text-orange-200">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-xs">+18% from last month</span>
                  </div>
                </div>
                <div className="rounded-full bg-orange-400/20 p-3">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Pending Orders */}
          <Card className="border-0 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-100">Pending Orders</p>
                  <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                  <p className="text-xs text-yellow-200">Awaiting processing</p>
                </div>
                <div className="rounded-full bg-yellow-400/20 p-3">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Batches */}
          <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Completed Batches</p>
                  <p className="text-2xl font-bold">{stats.completedBatches}</p>
                  <p className="text-xs text-blue-200">Successfully delivered</p>
                </div>
                <div className="rounded-full bg-blue-400/20 p-3">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Zap className="mr-2 h-5 w-5 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Link href="/host/batches">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Batch
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/host/orders">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/host/analytics">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Recent Batches - Large Card */}
          <div className="lg:col-span-8">
            <Card className="h-full border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-xl">
                    <Layers className="mr-2 h-5 w-5 text-blue-600" />
                    Recent Batches
                  </CardTitle>
                  <CardDescription>Your latest regional batches and their status</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/host/batches">
                    <Eye className="mr-2 h-4 w-4" />
                    View All
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentBatches.map(batch => (
                    <div key={batch.id} className="flex items-center justify-between rounded-lg border border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100/50 p-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white">
                          {batch.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{batch.name}</h3>
                          <p className="text-sm text-gray-600">
                            {batch.current_vials}
                            /
                            {batch.target_vials}
                            {' '}
                            vials
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(batch.status)}>
                            {batch.status}
                          </Badge>
                          {batch.status === 'active' && (
                            <Badge className="animate-pulse bg-green-500 px-2 py-1 text-xs text-white">
                              LIVE
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {new Date(batch.created_at).toLocaleDateString()}
                        </div>
                        <div className="mt-1">
                          <div className="h-1 w-20 rounded-full bg-gray-200">
                            <div
                              className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                              style={{ width: `${getProgressPercentage(batch)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {getProgressPercentage(batch)}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {stats.recentBatches.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                      <Layers className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                      <p>No batches yet. Create your first batch to get started!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Region Info - Medium Card */}
          <div className="lg:col-span-4">
            <Card className="h-full border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <MapPin className="mr-2 h-5 w-5 text-green-600" />
                  Region Info
                </CardTitle>
                <CardDescription>Your assigned region details</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.regionInfo
                  ? (
                      <div className="space-y-4">
                        <div className="rounded-lg bg-green-50 p-4">
                          <h4 className="font-semibold text-green-900">{stats.regionInfo.name}</h4>
                          <p className="text-sm text-green-700">
                            {stats.regionInfo.region}
                            ,
                            {' '}
                            {stats.regionInfo.city}
                          </p>
                          {stats.regionInfo.description && (
                            <p className="mt-2 text-xs text-green-600">{stats.regionInfo.description}</p>
                          )}
                        </div>
                        {stats.regionInfo.whatsapp_number && (
                          <div className="text-sm">
                            <span className="text-gray-500">WhatsApp:</span>
                            <span className="ml-1 font-medium">{stats.regionInfo.whatsapp_number}</span>
                          </div>
                        )}
                        <div className="text-sm">
                          <span className="text-gray-500">Status:</span>
                          <Badge className="ml-1 bg-green-100 text-green-800">
                            Active
                          </Badge>
                        </div>
                      </div>
                    )
                  : (
                      <div className="py-4 text-center text-gray-500">
                        <p className="text-sm">No region assigned</p>
                      </div>
                    )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Completion Rate */}
          <Card className="border-0 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-100">Completion Rate</p>
                  <p className="text-3xl font-bold">
                    {stats.totalBatches > 0 ? Math.round((stats.completedBatches / stats.totalBatches) * 100) : 0}
                    %
                  </p>
                  <p className="text-xs text-indigo-200">+2.1% from last month</p>
                </div>
                <div className="rounded-full bg-indigo-400/20 p-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Participants */}
          <Card className="border-0 bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-rose-100">Avg Participants</p>
                  <p className="text-3xl font-bold">
                    {stats.totalBatches > 0 ? Math.round(stats.totalParticipants / stats.totalBatches) : 0}
                  </p>
                  <p className="text-xs text-rose-200">+15% from last month</p>
                </div>
                <div className="rounded-full bg-rose-400/20 p-3">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Satisfaction */}
          <Card className="border-0 bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-100">Satisfaction</p>
                  <p className="text-3xl font-bold">4.8/5</p>
                  <p className="text-xs text-teal-200">Based on 127 reviews</p>
                </div>
                <div className="rounded-full bg-teal-400/20 p-3">
                  <Star className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
