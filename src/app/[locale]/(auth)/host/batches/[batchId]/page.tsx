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
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CardImage } from '@/components/ui/OptimizedImage';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRealtimeSubGroupBatch } from '@/hooks/useRealtimeSubGroupBatch';
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

type SubGroupBatch = {
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
  host_id: number;
  region_id: number | null;
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
  { value: 'refunded', label: 'Refunded', color: 'bg-red-100 text-red-800' },
];

const orderStatuses = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export default function HostBatchDetailsPage() {
  const { isHost, isAdmin, loading: roleLoading } = useRole();
  const params = useParams();
  const batchId = Number.parseInt(params.batchId as string);
  const { activeBatch: batch, loading: batchLoading } = useRealtimeSubGroupBatch(batchId);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const { data, error } = await supabase
        .from('sub_group_orders')
        .select(`
          *,
          order_items:sub_group_order_items(
            *,
            product:products(*)
          )
        `)
        .eq('batch_id', batchId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    if (!roleLoading && !isHost && !isAdmin) {
      window.location.href = '/dashboard';
      return;
    }

    if ((isHost || isAdmin) && batchId) {
      fetchOrders();
    }
  }, [isHost, isAdmin, roleLoading, batchId, fetchOrders]);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('sub_group_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
      } else {
        await fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const updatePaymentStatus = async (orderId: number, newPaymentStatus: string) => {
    try {
      const { error } = await supabase
        .from('sub_group_orders')
        .update({ payment_status: newPaymentStatus })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating payment status:', error);
      } else {
        await fetchOrders();
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const openWhatsApp = (order: Order) => {
    const message = `Hi ${order.customer_name}! I'm following up on your order ${order.order_code} for batch "${batch?.name}". Please provide an update on the status.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${order.whatsapp_number}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <TrendingUp className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getProgressPercentage = (batch: SubGroupBatch) => {
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = searchQuery === ''
      || order.order_code.toLowerCase().includes(searchQuery.toLowerCase())
      || order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
      || order.whatsapp_number.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId],
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const bulkUpdateStatus = async (newStatus: string) => {
    if (selectedOrders.length === 0) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sub_group_orders')
        .update({ status: newStatus })
        .in('id', selectedOrders);

      if (error) {
        console.error('Error bulk updating status:', error);
      } else {
        await fetchOrders();
        setSelectedOrders([]);
      }
    } catch (error) {
      console.error('Error bulk updating status:', error);
    }
  };

  const bulkUpdatePaymentStatus = async (newPaymentStatus: string) => {
    if (selectedOrders.length === 0) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sub_group_orders')
        .update({ payment_status: newPaymentStatus })
        .in('id', selectedOrders);

      if (error) {
        console.error('Error bulk updating payment status:', error);
      } else {
        await fetchOrders();
        setSelectedOrders([]);
      }
    } catch (error) {
      console.error('Error bulk updating payment status:', error);
    }
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
              <Link href="/host/batches">
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
              <Link href="/host/batches">
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
              <Link href={`/host/batches?edit=${batch.id}`}>
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
                            {batchProduct.price_per_vial}
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

            {/* Orders Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>
                      Orders (
                      {filteredOrders.length}
                      )
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchOrders}
                      disabled={ordersLoading}
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Search orders by code, customer name, or WhatsApp..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          {orderStatuses.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Payment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Payment</SelectItem>
                          {paymentStatuses.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {selectedOrders.length > 0 && (
                    <div className="flex items-center gap-2 rounded-lg border bg-blue-50 p-3">
                      <span className="text-sm font-medium text-blue-800">
                        {selectedOrders.length}
                        {' '}
                        order(s) selected
                      </span>
                      <div className="flex gap-2">
                        <Select onValueChange={bulkUpdateStatus}>
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {orderStatuses.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select onValueChange={bulkUpdatePaymentStatus}>
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue placeholder="Update Payment" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentStatuses.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrders([])}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Orders Table */}
                {ordersLoading
                  ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
                      </div>
                    )
                  : filteredOrders.length === 0
                    ? (
                        <div className="py-8 text-center text-gray-500">
                          <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                          <p>No orders found for this batch</p>
                        </div>
                      )
                    : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">
                                  <input
                                    type="checkbox"
                                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 rounded border-gray-300"
                                  />
                                </TableHead>
                                <TableHead>Order Code</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredOrders.map(order => (
                                <TableRow key={order.id}>
                                  <TableCell>
                                    <input
                                      type="checkbox"
                                      checked={selectedOrders.includes(order.id)}
                                      onChange={() => handleSelectOrder(order.id)}
                                      className="h-4 w-4 rounded border-gray-300"
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">{order.order_code}</TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{order.customer_name}</div>
                                      <div className="text-sm text-gray-500">{order.whatsapp_number}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-semibold">
                                    ₱
                                    {order.total_amount.toLocaleString()}
                                  </TableCell>
                                  <TableCell>
                                    <Select value={order.status} onValueChange={value => updateOrderStatus(order.id, value)}>
                                      <SelectTrigger className="h-8 w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {orderStatuses.map(status => (
                                          <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    <Select value={order.payment_status} onValueChange={value => updatePaymentStatus(order.id, value)}>
                                      <SelectTrigger className="h-8 w-24">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {paymentStatuses.map(status => (
                                          <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openWhatsApp(order)}
                                        title="Contact via WhatsApp"
                                      >
                                        <Phone className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
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
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/host/batches?edit=${batch.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Batch
                  </Link>
                </Button>
                <Button className="w-full" variant="outline" onClick={fetchOrders}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Orders
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
