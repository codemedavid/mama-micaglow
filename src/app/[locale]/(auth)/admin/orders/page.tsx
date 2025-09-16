'use client';

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  Phone,
  RefreshCw,
  ShoppingCart,
  Truck,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';

type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_per_vial: number;
  total_price: number;
  created_at: string;
  product: {
    id: number;
    name: string;
    category: string;
  };
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
  batch: {
    id: number;
    name: string;
    status: string;
  };
  order_items: OrderItem[];
};

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: RefreshCw },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: Package },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle },
];

const paymentStatusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'refunded', label: 'Refunded', color: 'bg-red-100 text-red-800' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          batch:group_buy_batches(id, name, status),
          order_items(
            *,
            product:products(id, name, category)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        // Handle error if needed
      } else {
        setOrders(data || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        // Handle error if needed
      } else {
        await fetchOrders();
      }
    } catch {
      // Handle error if needed
    }
  };

  const updatePaymentStatus = async (orderId: number, newPaymentStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newPaymentStatus })
        .eq('id', orderId);

      if (error) {
        // Handle error if needed
      } else {
        await fetchOrders();
      }
    } catch {
      // Handle error if needed
    }
  };

  const openWhatsApp = (order: Order) => {
    const message = `Hi! I'm following up on order ${order.order_code} for batch "${order.batch.name}". Please provide an update on the status.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/6391549012244?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredOrders = orders.filter((order) => {
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    const paymentMatch = paymentFilter === 'all' || order.payment_status === paymentFilter;
    return statusMatch && paymentMatch;
  });

  const getStatusIcon = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    const IconComponent = statusOption?.icon || Clock;
    return <IconComponent className="h-4 w-4" />;
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'refunded': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage group buy orders and track their status
          </p>
        </div>
        <Button onClick={fetchOrders} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="status-filter" className="mb-2 block text-sm font-medium">Filter by Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />

                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="payment-status-filter" className="mb-2 block text-sm font-medium">Filter by Payment Status</label>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Payment Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Statuses</SelectItem>
              {paymentStatusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {getPaymentStatusIcon(option.value)}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0
        ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-semibold">No Orders Found</h3>
                <p className="text-muted-foreground">
                  {orders.length === 0
                    ? 'No orders have been placed yet.'
                    : 'No orders match the current filters.'}
                </p>
              </CardContent>
            </Card>
          )
        : (
            <div className="space-y-6">
              {filteredOrders.map(order => (
                <Card key={order.id} className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{order.order_code}</CardTitle>
                        <CardDescription className="mt-1">
                          Batch:
                          {' '}
                          {order.batch.name}
                          {' '}
                          • Created:
                          {' '}
                          {new Date(order.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${statusOptions.find(s => s.value === order.status)?.color} flex items-center gap-1`}>
                          {getStatusIcon(order.status)}
                          {statusOptions.find(s => s.value === order.status)?.label}
                        </Badge>
                        <Badge className={`${paymentStatusOptions.find(s => s.value === order.payment_status)?.color} flex items-center gap-1`}>
                          {getPaymentStatusIcon(order.payment_status)}
                          {paymentStatusOptions.find(s => s.value === order.payment_status)?.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-muted-foreground">Customer Name</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{order.whatsapp_number}</div>
                          <div className="text-sm text-muted-foreground">WhatsApp Number</div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="mb-2 font-medium">Order Items:</h4>
                      <div className="space-y-2">
                        {order.order_items.map(item => (
                          <div key={item.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                            <div>
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-sm text-muted-foreground">{item.product.category}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {item.quantity}
                                {' '}
                                vial(s)
                              </div>
                              <div className="text-sm font-bold">
                                ₱
                                {item.total_price.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Total Amount:</span>
                        <span className="text-xl font-bold text-green-600">
                          ₱
                          {order.total_amount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button
                        onClick={() => openWhatsApp(order)}
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Contact via WhatsApp
                      </Button>

                      <Select value={order.status} onValueChange={value => updateOrderStatus(order.id, value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <option.icon className="h-4 w-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={order.payment_status} onValueChange={value => updatePaymentStatus(order.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentStatusOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                {getPaymentStatusIcon(option.value)}
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
    </div>
  );
}
