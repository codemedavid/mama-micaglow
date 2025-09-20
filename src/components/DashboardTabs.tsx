'use client';

import { UserProfile } from '@clerk/nextjs';
import { AlertCircle, ArrowRight, CheckCircle, Clock, Layers, Package, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRole } from '@/hooks/useRole';

export type RecentOrder = {
  id: string;
  product: string;
  type: string;
  quantity: number;
  total: number;
  status: 'delivered' | 'shipped' | 'processing' | 'pending' | 'confirmed' | 'cancelled' | string;
  date: string;
  orderId?: number;
  batchName?: string;
  orderItems?: any[];
  paymentStatus?: string;
};

export function DashboardTabs({
  recentOrders,
  totalOrders,
  totalSpent,
}: {
  recentOrders: RecentOrder[];
  totalOrders: number;
  totalSpent: number;
}) {
  const searchParams = useSearchParams();
  const { isAdmin, isHost } = useRole();
  const defaultTab = useMemo(() => {
    const tab = searchParams.get('tab');
    if (tab === 'profile') {
      return 'profile';
    }
    if (tab === 'all-orders') {
      return 'all-orders';
    }
    return 'orders';
  }, [searchParams]);

  return (
    <>
      {(isAdmin || isHost) && (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {isAdmin && (
            <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-100">Admin Panel</p>
                    <p className="text-lg font-bold">Quick Actions</p>
                  </div>
                  <Shield className="h-6 w-6 opacity-80" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Button asChild size="sm" className="bg-white/90 text-purple-700 hover:bg-white">
                    <Link href="/admin/products">Products</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-white/90 text-purple-700 hover:bg-white">
                    <Link href="/admin/orders">Orders</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-white/90 text-purple-700 hover:bg-white">
                    <Link href="/admin/batches">Batches</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Link href="/admin">Overview</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          {isHost && (
            <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-100">Host Panel</p>
                    <p className="text-lg font-bold">Quick Actions</p>
                  </div>
                  <Layers className="h-6 w-6 opacity-80" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Button asChild size="sm" className="bg-white/90 text-blue-700 hover:bg-white">
                    <Link href="/host/batches">My Batches</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Link href="/host/batches">Create Batch</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱
              {totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="all-orders">All Orders</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest peptide purchases and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="rounded-lg border p-4">
                    {/* Order Header */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">
                            Order
                            {order.id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.type}
                            {' '}
                            •
                            {order.quantity}
                            {' '}
                            {order.quantity > 1 ? 'vials' : 'vial'}
                            {order.batchName && ` • ${order.batchName}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ₱
                          {order.total.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={order.status === 'delivered' ? 'default' : order.status === 'shipped' ? 'secondary' : 'outline'}
                          >
                            {order.status === 'delivered' && <CheckCircle className="mr-1 h-3 w-3" />}
                            {order.status === 'shipped' && <Clock className="mr-1 h-3 w-3" />}
                            {order.status === 'processing' && <AlertCircle className="mr-1 h-3 w-3" />}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    {order.orderItems && order.orderItems.length > 0 && (
                      <div className="ml-14 space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Items:</p>
                        <div className="space-y-1">
                          {order.orderItems.map((item: any, index: number) => (
                            <div key={`${order.id}-item-${item.product?.id || index}`} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">•</span>
                                <span>{item.product?.name || 'Unknown Product'}</span>
                                <span className="text-muted-foreground">
                                  (
                                  {item.product?.category}
                                  )
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">
                                  {item.quantity}
                                  {' '}
                                  × ₱
                                  {item.price_per_vial?.toLocaleString()}
                                </span>
                                <span className="font-medium">
                                  ₱
                                  {item.total_price?.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Order Footer */}
                    <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>
                          Ordered on
                          {order.date}
                        </span>
                        <span>
                          Payment:
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button variant="outline" asChild>
                  <Link href="/dashboard?tab=all-orders">
                    View All Orders
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Complete history of your peptide purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length === 0
                  ? (
                      <div className="py-8 text-center">
                        <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">No Orders Yet</h3>
                        <p className="mb-4 text-muted-foreground">
                          You haven't placed any orders yet. Start exploring our products!
                        </p>
                        <Button asChild>
                          <Link href="/products">
                            Browse Products
                          </Link>
                        </Button>
                      </div>
                    )
                  : (
                      recentOrders.map(order => (
                        <div key={order.id} className="rounded-lg border p-4">
                          {/* Order Header */}
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  Order
                                  {order.id}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {order.type}
                                  {' '}
                                  •
                                  {order.quantity}
                                  {' '}
                                  {order.quantity > 1 ? 'vials' : 'vial'}
                                  {order.batchName && ` • ${order.batchName}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                ₱
                                {order.total.toLocaleString()}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={order.status === 'delivered' ? 'default' : order.status === 'shipped' ? 'secondary' : 'outline'}
                                >
                                  {order.status === 'delivered' && <CheckCircle className="mr-1 h-3 w-3" />}
                                  {order.status === 'shipped' && <Clock className="mr-1 h-3 w-3" />}
                                  {order.status === 'processing' && <AlertCircle className="mr-1 h-3 w-3" />}
                                  {order.status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                                  {order.status === 'confirmed' && <CheckCircle className="mr-1 h-3 w-3" />}
                                  {order.status === 'cancelled' && <AlertCircle className="mr-1 h-3 w-3" />}
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Order Items */}
                          {order.orderItems && order.orderItems.length > 0 && (
                            <div className="ml-14 space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Items:</p>
                              <div className="space-y-1">
                                {order.orderItems.map((item: any, index: number) => (
                                  <div key={`${order.id}-item-${item.product?.id || index}`} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">•</span>
                                      <span>{item.product?.name || 'Unknown Product'}</span>
                                      <span className="text-muted-foreground">
                                        (
                                        {item.product?.category}
                                        )
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">
                                        {item.quantity}
                                        {' '}
                                        × ₱
                                        {item.price_per_vial?.toLocaleString()}
                                      </span>
                                      <span className="font-medium">
                                        ₱
                                        {item.total_price?.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Order Footer */}
                          <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                            <div className="flex items-center justify-between">
                              <span>
                                Ordered on
                                {order.date}
                              </span>
                              <span>
                                Payment:
                                {order.paymentStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your account and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <UserProfile routing="hash" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
