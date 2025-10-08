'use client';

import { AlertCircle, CheckCircle, Clock, Package, Phone, Search, Truck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';

type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_per_vial?: number;
  price_per_box?: number;
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
  whatsapp_number?: string;
  customer_phone?: string;
  customer_email?: string;
  batch_id?: number;
  sub_group_id?: number;
  user_id: number | null;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping_cost: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
  order_type: 'group_buy' | 'sub_group' | 'individual';
  batch?: {
    id: number;
    name: string;
    status: string;
  };
  sub_group?: {
    id: number;
    name: string;
    region: string;
    city: string;
  };
  order_items: OrderItem[];
  // Individual order specific fields
  shipping_address?: string;
  shipping_city?: string;
  shipping_province?: string;
  shipping_zip_code?: string;
};

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: Package },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle },
];

const paymentStatusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'refunded', label: 'Refunded', color: 'bg-red-100 text-red-800' },
];

export default function TrackOrderPage() {
  const [orderCode, setOrderCode] = useState('');
  const [allUserOrders, setAllUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userOrderCodes, setUserOrderCodes] = useState<string[]>([]);
  const [loadingUserOrders, setLoadingUserOrders] = useState(true);
  const { userProfile } = useRole();

  const fetchUserOrderCodes = useCallback(async () => {
    if (!userProfile?.id) {
      setLoadingUserOrders(false);
      return;
    }

    try {
      setLoadingUserOrders(true);

      // Fetch user's orders from all order types
      const [
        { data: groupBuyOrders },
        { data: individualOrders },
        { data: subGroupOrders },
      ] = await Promise.all([
        supabase
          .from('orders')
          .select('order_code, created_at')
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('individual_orders')
          .select('order_code, created_at')
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('sub_group_orders')
          .select('order_code, created_at')
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false }),
      ]);

      // Combine all order codes
      const allOrderCodes = [
        ...(groupBuyOrders || []),
        ...(individualOrders || []),
        ...(subGroupOrders || []),
      ];

      // Sort by creation date (newest first) and extract order codes
      const sortedOrderCodes = allOrderCodes
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(order => order.order_code);

      setUserOrderCodes(sortedOrderCodes);
    } catch (error) {
      console.error('Error fetching user orders:', error);
    } finally {
      setLoadingUserOrders(false);
    }
  }, [userProfile?.id]);

  useEffect(() => {
    fetchUserOrderCodes();
  }, [fetchUserOrderCodes]);

  const searchOrder = async () => {
    if (!orderCode.trim()) {
      setError('Please enter an order code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let initialOrder: Order | null = null;
      let orderType: 'group_buy' | 'sub_group' | 'individual' = 'group_buy';

      // Search in group buy orders first
      const { data: groupBuyOrder, error: groupBuyError } = await supabase
        .from('orders')
        .select(`
          *,
          batch:group_buy_batches(id, name, status),
          order_items(
            *,
            product:products(id, name, category)
          )
        `)
        .eq('order_code', orderCode.trim())
        .single();

      if (!groupBuyError && groupBuyOrder) {
        initialOrder = { ...groupBuyOrder, order_type: 'group_buy' };
        orderType = 'group_buy';
      } else {
        // Search in sub group orders
        const { data: subGroupOrder, error: subGroupError } = await supabase
          .from('sub_group_orders')
          .select(`
            *,
            sub_group:sub_groups(id, name, region, city),
            order_items:sub_group_order_items(
              *,
              product:products(id, name, category)
            )
          `)
          .eq('order_code', orderCode.trim())
          .single();

        if (!subGroupError && subGroupOrder) {
          initialOrder = { ...subGroupOrder, order_type: 'sub_group' };
          orderType = 'sub_group';
        } else {
          // Search in individual orders
          const { data: individualOrder, error: individualError } = await supabase
            .from('individual_orders')
            .select(`
              *,
              order_items:individual_order_items(
                *,
                product:products(id, name, category)
              )
            `)
            .eq('order_code', orderCode.trim())
            .single();

          if (!individualError && individualOrder) {
            initialOrder = { ...individualOrder, order_type: 'individual' };
            orderType = 'individual';
          }
        }
      }

      if (!initialOrder) {
        setError('Order not found. Please check your order code.');
        setAllUserOrders([]);
        return;
      }

      // For group buy orders, fetch all orders for that user in the same batch
      if (orderType === 'group_buy' && initialOrder.user_id && initialOrder.batch_id) {
        const { data: userOrders, error: userOrdersError } = await supabase
          .from('orders')
          .select(`
            *,
            batch:group_buy_batches(id, name, status),
            order_items(
              *,
              product:products(id, name, category)
            )
          `)
          .eq('user_id', initialOrder.user_id)
          .eq('batch_id', initialOrder.batch_id)
          .order('created_at', { ascending: false });

        if (!userOrdersError && userOrders) {
          setAllUserOrders(userOrders.map(order => ({ ...order, order_type: 'group_buy' })));
        } else {
          setAllUserOrders([initialOrder]);
        }
      } else {
        // For sub group and individual orders, just show the single order
        setAllUserOrders([initialOrder]);
      }
    } catch {
      setError('Error searching for order. Please try again.');
      setAllUserOrders([]);
    } finally {
      setLoading(false);
    }
  };

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

  const openWhatsApp = (order: Order) => {
    let message = '';

    if (order.order_type === 'group_buy') {
      message = `Hi! I'm checking on order ${order.order_code} for batch "${order.batch?.name}". Could you provide an update on the status?`;
    } else if (order.order_type === 'sub_group') {
      message = `Hi! I'm checking on order ${order.order_code} for sub-group "${order.sub_group?.name}" in ${order.sub_group?.city}. Could you provide an update on the status?`;
    } else if (order.order_type === 'individual') {
      message = `Hi! I'm checking on order ${order.order_code} for individual purchase. Could you provide an update on the status?`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/639154901224?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const renderOrderCard = (orderData: Order, isMainOrder: boolean = false) => {
    const orderTitle = isMainOrder ? orderData.order_code : orderData.order_code;
    const cardClassName = isMainOrder
      ? 'border-0 bg-white/80 shadow-xl backdrop-blur-sm'
      : 'border-0 bg-white/60 shadow-lg backdrop-blur-sm';

    const getOrderTypeLabel = () => {
      switch (orderData.order_type) {
        case 'group_buy': return 'Group Buy';
        case 'sub_group': return 'Sub Group';
        case 'individual': return 'Individual';
        default: return 'Order';
      }
    };

    const getOrderContext = () => {
      if (orderData.order_type === 'group_buy' && orderData.batch) {
        return `Batch: ${orderData.batch.name}`;
      } else if (orderData.order_type === 'sub_group' && orderData.sub_group) {
        return `Sub Group: ${orderData.sub_group.name} (${orderData.sub_group.city})`;
      } else if (orderData.order_type === 'individual') {
        return 'Individual Purchase';
      }
      return '';
    };

    return (
      <Card key={orderData.id} className={cardClassName}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className={`${isMainOrder ? 'text-2xl' : 'text-xl'}`}>
                {orderTitle}
                {!isMainOrder && <span className="ml-2 text-sm text-muted-foreground">(Additional Order)</span>}
              </CardTitle>
              <CardDescription className="mt-1">
                {isMainOrder && (
                  <>
                    {getOrderTypeLabel()}
                    {' '}
                    •
                    {' '}
                    {getOrderContext()}
                    {' '}
                    • Created:
                    {' '}
                    {new Date(orderData.created_at).toLocaleDateString()}
                  </>
                )}
                {!isMainOrder && (
                  <>
                    Created:
                    {' '}
                    {new Date(orderData.created_at).toLocaleDateString()}
                  </>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${statusOptions.find(s => s.value === orderData.status)?.color} flex items-center gap-1`}>
                {getStatusIcon(orderData.status)}
                {statusOptions.find(s => s.value === orderData.status)?.label}
              </Badge>
              <Badge className={`${paymentStatusOptions.find(s => s.value === orderData.payment_status)?.color} flex items-center gap-1`}>
                {getPaymentStatusIcon(orderData.payment_status)}
                {paymentStatusOptions.find(s => s.value === orderData.payment_status)?.label}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Customer Info - only show on main order */}
          {isMainOrder && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium">{orderData.customer_name}</div>
                  <div className="text-sm text-muted-foreground">Customer Name</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">
                    {orderData.whatsapp_number || orderData.customer_phone}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {orderData.whatsapp_number ? 'WhatsApp Number' : 'Phone Number'}
                  </div>
                </div>
              </div>

              {/* Show email for individual orders */}
              {orderData.order_type === 'individual' && orderData.customer_email && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{orderData.customer_email}</div>
                    <div className="text-sm text-muted-foreground">Email Address</div>
                  </div>
                </div>
              )}

              {/* Show shipping address for individual orders */}
              {orderData.order_type === 'individual' && orderData.shipping_address && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                    <Package className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {orderData.shipping_city}
                      ,
                      {orderData.shipping_province}
                    </div>
                    <div className="text-sm text-muted-foreground">Shipping Address</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Order Items */}
          <div>
            <h4 className="mb-3 text-lg font-semibold">Order Items</h4>
            <div className="space-y-3">
              {orderData.order_items.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-purple-200/50 bg-gradient-to-r from-purple-50 to-purple-100/50 p-4">
                  <div>
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-sm text-muted-foreground">{item.product.category}</div>
                    {item.price_per_vial && (
                      <div className="text-xs text-muted-foreground">
                        ₱
                        {item.price_per_vial.toLocaleString()}
                        {' '}
                        per vial
                      </div>
                    )}
                    {item.price_per_box && (
                      <div className="text-xs text-muted-foreground">
                        ₱
                        {item.price_per_box.toLocaleString()}
                        {' '}
                        per box
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {item.quantity}
                      {' '}
                      {orderData.order_type === 'individual' ? 'box' : 'vial'}
                      {item.quantity !== 1 ? 'es' : ''}
                    </div>
                    <div className="text-sm font-bold text-purple-600">
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
            {(orderData.subtotal && orderData.subtotal > 0) || (orderData.shipping_cost && orderData.shipping_cost > 0)
              ? (
                  <div className="space-y-2">
                    {orderData.subtotal && orderData.subtotal > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">Subtotal:</span>
                        <span className="text-lg font-semibold">
                          ₱
                          {orderData.subtotal.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {orderData.shipping_cost && orderData.shipping_cost > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">Shipping:</span>
                        <span className="text-lg font-semibold">
                          ₱
                          {orderData.shipping_cost.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="text-xl font-semibold">Total Amount:</span>
                      <span className="text-2xl font-bold text-purple-600">
                        ₱
                        {orderData.total_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )
              : (
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-purple-600">
                      ₱
                      {orderData.total_amount.toLocaleString()}
                    </span>
                  </div>
                )}
          </div>

          {/* Payment Section - Show when batch is in payment_collection and order payment is pending */}
          {((orderData.order_type === 'group_buy' && orderData.batch?.status === 'payment_collection')
            || (orderData.order_type === 'sub_group' && orderData.batch?.status === 'payment_collection')
            || (orderData.order_type === 'individual')) && orderData.payment_status === 'pending' && (
            <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="text-center text-lg text-orange-800">
                  Proceed to Payment
                </CardTitle>
                <CardDescription className="text-center text-orange-700">
                  Your order is ready for payment. Please complete payment to confirm your order.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-800">
                    ₱
                    {orderData.total_amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-orange-600">Total Amount to Pay</div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => openWhatsApp(orderData)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Pay via WhatsApp
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        let orderDetails = `Order Code: ${orderData.order_code}\nAmount: ₱${orderData.total_amount.toLocaleString()}`;

                        if (orderData.order_type === 'group_buy' && orderData.batch) {
                          orderDetails += `\nBatch: ${orderData.batch.name}`;
                        } else if (orderData.order_type === 'sub_group' && orderData.sub_group) {
                          orderDetails += `\nSub Group: ${orderData.sub_group.name} (${orderData.sub_group.city})`;
                        } else if (orderData.order_type === 'individual') {
                          orderDetails += `\nType: Individual Purchase`;
                        }

                        navigator.clipboard.writeText(orderDetails);
                        // eslint-disable-next-line no-alert
                        alert('Order details copied to clipboard!');
                      }}
                      className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
                    >
                      Copy Order Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button
              onClick={() => openWhatsApp(orderData)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Phone className="mr-2 h-4 w-4" />
              Contact via WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Track Your Order</h1>
          <p className="text-xl text-gray-600">
            Enter your order code to check the status of your peptide purchase (Group Buy, Sub Group, or Individual orders)
          </p>
        </div>

        {/* Search Form */}
        <Card className="mx-auto max-w-2xl border-0 bg-white/80 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center">Order Tracking</CardTitle>
            <CardDescription className="text-center">
              Enter your order code to view order details and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Enter your order code (e.g., GB-20241216-001, SG-20241216-001, IND-2024-001234)"
                    value={orderCode}
                    onChange={e => setOrderCode(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        searchOrder();
                      }
                    }}
                  />
                </div>
                <Button onClick={searchOrder} disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-700">
                  {error}
                </div>
              )}

              {/* User's Order Codes */}
              {userProfile && (
                <div className="mt-4">
                  {loadingUserOrders
                    ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-purple-600"></div>
                          <span className="ml-2 text-sm text-gray-600">Loading your orders...</span>
                        </div>
                      )
                    : userOrderCodes.length > 0
                      ? (
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h3 className="mb-3 text-sm font-medium text-gray-700">Your Recent Orders</h3>
                            <div className="flex flex-wrap gap-2">
                              {userOrderCodes.map(code => (
                                <button
                                  key={code}
                                  type="button"
                                  onClick={() => {
                                    setOrderCode(code);
                                    searchOrder();
                                  }}
                                  className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 transition-colors hover:bg-purple-200"
                                >
                                  {code}
                                </button>
                              ))}
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                              Click any order code to track it instantly
                            </p>
                          </div>
                        )
                      : (
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                            <p className="text-sm text-gray-600">No orders found for your account</p>
                          </div>
                        )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        {allUserOrders.length > 0 && (
          <div className="mt-8 space-y-6">
            {/* Show batch info if multiple orders */}
            {allUserOrders.length > 1 && allUserOrders[0] && (
              <Card className="border-0 bg-gradient-to-r from-purple-50 to-purple-100/50 shadow-xl backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-center text-xl">
                    Your Orders in "
                    {allUserOrders[0].order_type === 'group_buy' && allUserOrders[0].batch?.name}
                    {allUserOrders[0].order_type === 'sub_group' && allUserOrders[0].sub_group?.name}
                    {allUserOrders[0].order_type === 'individual' && 'Individual Orders'}
                    "
                    {' '}
                    {allUserOrders[0].order_type === 'group_buy' ? 'Batch' : allUserOrders[0].order_type === 'sub_group' ? 'Sub Group' : 'Collection'}
                  </CardTitle>
                  <CardDescription className="text-center">
                    You have
                    {' '}
                    {allUserOrders.length}
                    {' '}
                    order
                    {allUserOrders.length !== 1 ? 's' : ''}
                    {' '}
                    {allUserOrders[0].order_type === 'group_buy'
                      ? 'in this batch'
                      : allUserOrders[0].order_type === 'sub_group'
                        ? 'in this sub group'
                        : 'in your collection'}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Render all orders */}
            {allUserOrders.map((orderData, index) => renderOrderCard(orderData, index === 0))}

            {/* Order Status Timeline - based on main order */}
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Order Status Timeline</CardTitle>
                <CardDescription>Track the progress of your orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">
                        Order
                        {allUserOrders.length > 1 ? 's' : ''}
                        {' '}
                        Placed
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {allUserOrders[0] && new Date(allUserOrders[0].created_at).toLocaleString()}
                        {allUserOrders.length > 1 && (
                          <span className="ml-2 text-xs">
                            (
                            {allUserOrders.length}
                            {' '}
                            order
                            {allUserOrders.length !== 1 ? 's' : ''}
                            {' '}
                            in batch)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {allUserOrders[0] && allUserOrders[0].status !== 'pending' && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">
                          Order
                          {allUserOrders.length > 1 ? 's' : ''}
                          {' '}
                          Confirmed
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Your order
                          {allUserOrders.length > 1 ? 's have' : ' has'}
                          {' '}
                          been confirmed and
                          {' '}
                          {allUserOrders.length > 1 ? 'are' : 'is'}
                          {' '}
                          being processed
                        </div>
                      </div>
                    </div>
                  )}

                  {allUserOrders[0] && ['processing', 'shipped', 'delivered'].includes(allUserOrders[0].status) && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Processing</div>
                        <div className="text-sm text-muted-foreground">
                          Your order
                          {allUserOrders.length > 1 ? 's are' : ' is'}
                          {' '}
                          being prepared for shipment
                        </div>
                      </div>
                    </div>
                  )}

                  {allUserOrders[0] && ['shipped', 'delivered'].includes(allUserOrders[0].status) && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Shipped</div>
                        <div className="text-sm text-muted-foreground">
                          Your order
                          {allUserOrders.length > 1 ? 's are' : ' is'}
                          {' '}
                          on its way
                        </div>
                      </div>
                    </div>
                  )}

                  {allUserOrders[0] && allUserOrders[0].status === 'delivered' && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Delivered</div>
                        <div className="text-sm text-muted-foreground">
                          Your order
                          {allUserOrders.length > 1 ? 's have' : ' has'}
                          {' '}
                          been successfully delivered
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
