'use client';

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  Edit,
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

type DashboardStats = {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  recentProducts: any[];
  recentUsers: any[];
  topProducts: any[];
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentProducts: [],
    recentUsers: [],
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

      setStats({
        totalProducts: productsCount || 0,
        totalUsers: usersCount || 0,
        totalOrders: 0, // Mock data for now
        totalRevenue: 0, // Mock data for now
        recentProducts: recentProducts || [],
        recentUsers: recentUsers || [],
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-xl text-gray-600">Welcome back! Here's what's happening with your platform.</p>
        </div>

        {/* Bento Grid Layout */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Stats Overview - Large Card */}
          <div className="lg:col-span-8">
            <Card className="h-full border-0 bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Activity className="mr-2 h-6 w-6" />
                  Platform Overview
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Key metrics and performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                  <div className="text-center">
                    <div className="mb-1 text-3xl font-bold">{stats.totalProducts}</div>
                    <div className="text-sm text-purple-100">Total Products</div>
                    <div className="mt-2 flex items-center justify-center text-green-300">
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                      <span className="text-xs">+12%</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-1 text-3xl font-bold">{stats.totalUsers}</div>
                    <div className="text-sm text-purple-100">Active Users</div>
                    <div className="mt-2 flex items-center justify-center text-green-300">
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                      <span className="text-xs">+8%</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-1 text-3xl font-bold">{stats.totalOrders}</div>
                    <div className="text-sm text-purple-100">Orders</div>
                    <div className="mt-2 flex items-center justify-center text-green-300">
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                      <span className="text-xs">+24%</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-1 text-3xl font-bold">
                      ₱
                      {stats.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-100">Revenue</div>
                    <div className="mt-2 flex items-center justify-center text-green-300">
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                      <span className="text-xs">+18%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions - Medium Card */}
          <div className="lg:col-span-4">
            <Card className="h-full border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
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
                  <Link href="/admin/users">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/analytics">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/settings">
                    <Edit className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Second Row - Bento Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Recent Products - Large Card */}
          <div className="lg:col-span-8">
            <Card className="h-full border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-xl">
                    <Package className="mr-2 h-5 w-5 text-purple-600" />
                    Recent Products
                  </CardTitle>
                  <CardDescription>Latest products added to your catalog</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/products">
                    <Eye className="mr-2 h-4 w-4" />
                    View All
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentProducts.map((product, _index) => (
                    <div key={product.id} className="flex items-center justify-between rounded-lg border border-purple-200/50 bg-gradient-to-r from-purple-50 to-purple-100/50 p-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 font-bold text-white">
                          {product.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          ₱
                          {product.price_per_vial}
                          /vial
                        </div>
                        <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-xs">
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {stats.recentProducts.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                      <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                      <p>No products yet. Add your first product to get started!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Products - Medium Card */}
          <div className="lg:col-span-4">
            <Card className="h-full border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Star className="mr-2 h-5 w-5 text-yellow-500" />
                  Top Products
                </CardTitle>
                <CardDescription>Most popular items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-sm font-bold text-white">
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
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          +
                          {Math.floor(Math.random() * 20) + 10}
                          %
                        </div>
                      </div>
                    </div>
                  ))}
                  {stats.topProducts.length === 0 && (
                    <div className="py-4 text-center text-gray-500">
                      <p className="text-sm">No data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Third Row - Analytics Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Sales Chart Placeholder */}
          <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="mr-2 h-5 w-5" />
                Sales Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-3xl font-bold">+24%</div>
              <p className="text-sm text-blue-100">vs last month</p>
            </CardContent>
          </Card>

          {/* User Growth */}
          <Card className="border-0 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="mr-2 h-5 w-5" />
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-3xl font-bold">+18%</div>
              <p className="text-sm text-green-100">new users this month</p>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className="border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <DollarSign className="mr-2 h-5 w-5" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-3xl font-bold">₱45K</div>
              <p className="text-sm text-orange-100">this month</p>
            </CardContent>
          </Card>

          {/* Orders */}
          <Card className="border-0 bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-3xl font-bold">127</div>
              <p className="text-sm text-pink-100">completed orders</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
