'use client';

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Edit,
  Package,
  Phone,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardImage } from '@/components/ui/OptimizedImage';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useRealtimeBatch } from '@/hooks/useRealtimeBatch';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';

type Product = {
  id: number;
  name: string;
  description: string | null;
  category: string;
  price_per_vial: number;
  price_per_box: number;
  vials_per_box: number;
  image_url: string | null;
};

type BatchProduct = {
  product_id: number;
  product: Product;
  target_vials: number;
  current_vials: number;
  price_per_vial: number;
};

type Batch = {
  id: number;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'payment_collection' | 'ordering' | 'processing' | 'shipped' | 'delivered';
  target_vials: number;
  current_vials: number;
  discount_percentage: number;
  shipping_fee: number;
  start_date: string;
  end_date: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  batch_products: BatchProduct[];
};

type Order = {
  id: number;
  order_code: string;
  customer_name: string;
  whatsapp_number: string;
  batch_id: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
};

type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  product: Product;
  quantity: number;
  price_per_vial: number;
  total_price: number;
};

const batchStatuses = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'active', label: 'Active', color: 'bg-purple-100 text-purple-800' },
  { value: 'payment_collection', label: 'Payment Collection', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'ordering', label: 'Ordering', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

const paymentStatuses = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
];

const orderStatuses = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export default function BatchDetailsPage() {
  const { isAdmin, loading: roleLoading } = useRole();
  const params = useParams();
  const batchId = Number.parseInt(params.batchId as string);
  const { activeBatch: batch, loading: batchLoading } = useRealtimeBatch(batchId);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq('batch_id', batchId)
        .order('created_at', { ascending: false });

      if (error) {
        // Handle error if needed
      } else {
        setOrders(data || []);
      }
    } catch {
      // Handle error if needed
    } finally {
      setOrdersLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      window.location.href = '/dashboard';
      return;
    }

    if (isAdmin && batchId) {
      fetchOrders();
    }
  }, [isAdmin, roleLoading, batchId, fetchOrders]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <TrendingUp className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getProgressPercentage = (batch: Batch) => {
    if (batch.target_vials === 0) {
      return 0;
    }
    return Math.round((batch.current_vials / batch.target_vials) * 100);
  };

  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + order.total_amount, 0);
  };

  const getPaidOrders = () => {
    return orders.filter(order => order.payment_status === 'paid');
  };

  const getPendingOrders = () => {
    return orders.filter(order => order.payment_status === 'pending');
  };

  if (roleLoading || batchLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading batch details...</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Batch not found</h1>
            <p className="mb-6 text-gray-600">The batch you're looking for doesn't exist or has been deleted.</p>
            <Button asChild>
              <Link href="/admin/batches">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Batches
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/admin/batches">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Batches
              </Link>
            </Button>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{batch.name}</h1>
              <p className="mt-2 text-gray-600">{batch.description}</p>
              <div className="mt-4 flex items-center space-x-4">
                <Badge className={`${batchStatuses.find(s => s.value === batch.status)?.color}`}>
                  {getStatusIcon(batch.status)}
                  <span className="ml-1">{batchStatuses.find(s => s.value === batch.status)?.label}</span>
                </Badge>
                {batch.status === 'active' && (
                  <Badge className="animate-pulse bg-purple-500 px-2 py-1 text-xs text-white">
                    LIVE
                  </Badge>
                )}
              </div>
            </div>
            <Button asChild>
              <Link href={`/admin/batches?edit=${batch.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Batch
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Batch Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Progress Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-600">Vial Progress</span>
                      <span className="font-semibold">
                        {getProgressPercentage(batch)}
                        %
                      </span>
                    </div>
                    <Progress value={getProgressPercentage(batch)} className="h-3" />
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>
                        {batch.current_vials}
                        {' '}
                        vials collected
                      </span>
                      <span>
                        {batch.target_vials}
                        {' '}
                        target vials
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {orders.length}
                      </div>
                      <div className="text-sm text-gray-500">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ₱
                        {getTotalRevenue().toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">Total Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        ₱
                        {batch.shipping_fee?.toLocaleString() || '0.00'}
                      </div>
                      <div className="text-sm text-gray-500">Shipping Fee</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products in Batch */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Products in Batch</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {batch.batch_products?.map(batchProduct => (
                    <div key={batchProduct.product_id} className="flex items-center space-x-4 rounded-lg border p-4">
                      <div className="flex-shrink-0">
                        {batchProduct.product.image_url
                          ? (
                              <CardImage
                                src={batchProduct.product.image_url}
                                alt={batchProduct.product.name}
                                size="medium"
                              />
                            )
                          : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-xl font-bold text-white">
                                {batchProduct.product.name.charAt(0)}
                              </div>
                            )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{batchProduct.product.name}</h4>
                        <p className="text-sm text-gray-500">{batchProduct.product.category}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm">
                          <span className="text-gray-600">
                            Target:
                            {' '}
                            {batchProduct.target_vials}
                            {' '}
                            vials
                          </span>
                          <span className="text-gray-600">
                            Current:
                            {' '}
                            {batchProduct.current_vials}
                            {' '}
                            vials
                          </span>
                          <span className="font-semibold text-purple-600">
                            ₱
                            {batchProduct.product.price_per_vial}
                            /vial
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Progress</div>
                        <div className="text-lg font-semibold">
                          {Math.round((batchProduct.current_vials / batchProduct.target_vials) * 100)}
                          %
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>
                    Orders (
                    {orders.length}
                    )
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading
                  ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
                      </div>
                    )
                  : orders.length === 0
                    ? (
                        <div className="py-8 text-center text-gray-500">
                          <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                          <p>No orders yet for this batch</p>
                        </div>
                      )
                    : (
                        <div className="space-y-4">
                          {orders.map(order => (
                            <div key={order.id} className="rounded-lg border p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="mb-2 flex items-center space-x-2">
                                    <h4 className="font-semibold text-gray-900">
                                      Order #
                                      {order.order_code}
                                    </h4>
                                    <Badge className={paymentStatuses.find(s => s.value === order.payment_status)?.color}>
                                      {order.payment_status}
                                    </Badge>
                                    <Badge className={orderStatuses.find(s => s.value === order.status)?.color}>
                                      {order.status}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2">
                                    <div className="flex items-center space-x-2">
                                      <User className="h-4 w-4" />
                                      <span>{order.customer_name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Phone className="h-4 w-4" />
                                      <span>{order.whatsapp_number}</span>
                                    </div>
                                  </div>
                                  <div className="mt-2 text-sm">
                                    <span className="text-gray-500">Items: </span>
                                    {order.order_items?.map((item, index) => (
                                      <span key={item.id}>
                                        {item.quantity}
                                        x
                                        {item.product.name}
                                        {index < (order.order_items?.length || 0) - 1 ? ', ' : ''}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-semibold text-gray-900">
                                    ₱
                                    {order.total_amount.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Batch Info */}
            <Card>
              <CardHeader>
                <CardTitle>Batch Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">Start Date:</span>
                  <span>{new Date(batch.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">End Date:</span>
                  <span>{new Date(batch.end_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">Products:</span>
                  <span>{batch.batch_products?.length || 0}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">Discount:</span>
                  <span>
                    {batch.discount_percentage}
                    %
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-semibold">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Orders</span>
                  <span className="font-semibold text-green-600">{getPaidOrders().length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Payment</span>
                  <span className="font-semibold text-yellow-600">{getPendingOrders().length}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-semibold text-purple-600">
                    ₱
                    {getTotalRevenue().toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Batch
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  View All Orders
                </Button>
                <Button className="w-full" variant="outline">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
