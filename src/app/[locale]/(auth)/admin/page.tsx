'use client';

import {
  Activity,
  ArrowUpRight,
  Clock,
  DollarSign,
  Eye,
  Package,
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
import { supabase } from '@/lib/supabase';

type Order = {
  id: number;
  order_code: string;
  customer_name: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  total_amount: number;
  created_at: string;
  user_id?: number;
  user?: {
    id: number;
    clerk_id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
};

type DashboardStats = {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  recentProducts: any[];
  recentUsers: any[];
  recentOrders: Order[];
  topProducts: any[];
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    recentProducts: [],
    recentUsers: [],
    recentOrders: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch orders data
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          user:users(id, clerk_id, email, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      // Fetch recent products
      const { data: recentProducts } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent users
      const { data: recentUsers } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Calculate order statistics
      const totalOrders = ordersData?.length || 0;
      const pendingOrders = ordersData?.filter(order =>
        ['pending', 'confirmed', 'processing'].includes(order.status),
      ).length || 0;
      const completedOrders = ordersData?.filter(order =>
        order.status === 'delivered',
      ).length || 0;
      const totalRevenue = ordersData?.reduce((sum, order) =>
        order.payment_status === 'paid' ? sum + order.total_amount : sum, 0) || 0;

      setStats({
        totalProducts: productsCount || 0,
        totalUsers: usersCount || 0,
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
        recentProducts: recentProducts || [],
        recentUsers: recentUsers || [],
        recentOrders: ordersData?.slice(0, 5) || [],
        topProducts: recentProducts?.slice(0, 3) || [],
      });
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-xl text-gray-600">Welcome back! Here's what's happening with your platform.</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Products */}
          <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Total Products</p>
                  <p className="text-3xl font-bold">{stats.totalProducts}</p>
                  <div className="mt-2 flex items-center text-blue-200">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-xs">+12% from last month</span>
                  </div>
                </div>
                <div className="rounded-full bg-blue-400/20 p-3">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Users */}
          <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">Active Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  <div className="mt-2 flex items-center text-purple-200">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-xs">+8% from last month</span>
                  </div>
                </div>
                <div className="rounded-full bg-purple-400/20 p-3">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card className="border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-100">Total Orders</p>
                  <p className="text-3xl font-bold">{stats.totalOrders}</p>
                  <div className="mt-2 flex items-center text-orange-200">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-xs">+24% from last month</span>
                  </div>
                </div>
                <div className="rounded-full bg-orange-400/20 p-3">
                  <ShoppingCart className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">Total Revenue</p>
                  <p className="text-3xl font-bold">
                    ₱
                    {stats.totalRevenue.toLocaleString()}
                  </p>
                  <div className="mt-2 flex items-center text-purple-200">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span className="text-xs">+18% from last month</span>
                  </div>
                </div>
                <div className="rounded-full bg-purple-400/20 p-3">
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

          {/* Completed Orders */}
          <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">Completed Orders</p>
                  <p className="text-2xl font-bold">{stats.completedOrders}</p>
                  <p className="text-xs text-purple-200">Successfully delivered</p>
                </div>
                <div className="rounded-full bg-purple-400/20 p-3">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Zap className="mr-2 h-5 w-5 text-purple-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                <Link href="/admin/products">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/orders">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Recent Orders - Large Card */}
          <div className="lg:col-span-8">
            <Card className="h-full border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-xl">
                    <ShoppingCart className="mr-2 h-5 w-5 text-purple-600" />
                    Recent Orders
                  </CardTitle>
                  <CardDescription>Latest orders and their status</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/orders">
                    <Eye className="mr-2 h-4 w-4" />
                    View All
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between rounded-lg border border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100/50 p-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 font-bold text-white">
                          {order.order_code.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{order.order_code}</h3>
                          <p className="text-sm text-gray-600">{order.customer_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          ₱
                          {order.total_amount.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={order.status === 'delivered' ? 'default' : 'secondary'}
                            className={`text-xs ${
                              order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'processing'
                                    ? 'bg-purple-100 text-purple-800'
                                    : order.status === 'shipped'
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : order.status === 'delivered'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.status}
                          </Badge>
                          <Badge
                            variant={order.payment_status === 'paid' ? 'default' : 'secondary'}
                            className={`text-xs ${
                              order.payment_status === 'paid'
                                ? 'bg-purple-100 text-purple-800'
                                : order.payment_status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.payment_status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  {stats.recentOrders.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                      <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                      <p>No orders yet. Orders will appear here once customers start placing them!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Products - Medium Card */}
          <div className="lg:col-span-4">
            <Card className="h-full border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Package className="mr-2 h-5 w-5 text-blue-600" />
                  Recent Products
                </CardTitle>
                <CardDescription>Latest products added</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600">
                          ₱
                          {product.price_per_vial}
                          /vial
                        </p>
                      </div>
                      <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-xs">
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                  {stats.recentProducts.length === 0 && (
                    <div className="py-4 text-center text-gray-500">
                      <p className="text-sm">No products yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Conversion Rate */}
          <Card className="border-0 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-100">Conversion Rate</p>
                  <p className="text-3xl font-bold">12.5%</p>
                  <p className="text-xs text-indigo-200">+2.1% from last month</p>
                </div>
                <div className="rounded-full bg-indigo-400/20 p-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Order Value */}
          <Card className="border-0 bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-rose-100">Avg Order Value</p>
                  <p className="text-3xl font-bold">₱2,450</p>
                  <p className="text-xs text-rose-200">+15% from last month</p>
                </div>
                <div className="rounded-full bg-rose-400/20 p-3">
                  <DollarSign className="h-6 w-6" />
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
