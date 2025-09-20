'use client';

import { useUser } from '@clerk/nextjs';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Minus,
  Phone,
  Plus as PlusIcon,
  ShoppingCart,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useCartActions } from '@/hooks/useCartActions';
import { useRealtimeBatch } from '@/hooks/useRealtimeBatch';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';
// import { useCart } from '@/contexts/CartContext';

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

// type VialOrder = {
//   product_id: number;
//   vials: number;
// };

export default function GroupBuyBatchPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { isSignedIn } = useUser();
  const { userProfile } = useRole();
  const { addToCart, updateQuantity } = useCartActions();
  const router = useRouter();
  const [vialOrders, setVialOrders] = useState<Record<number, number>>({});
  const [isSubmitting] = useState(false);

  const resolvedParams = use(params);
  const { activeBatch: batch, loading } = useRealtimeBatch(Number.parseInt(resolvedParams.batchId));

  // Define isPaymentPhase early
  const isPaymentPhase = batch?.status === 'payment_collection';

  // Gated access during payment phase
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [orderCodeInput, setOrderCodeInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // User's order for logged-in users
  const [userOrder, setUserOrder] = useState<any>(null);

  // Payment stats for authorized users during payment phase
  const [paymentStats, setPaymentStats] = useState<{ total: number; paid: number; pending: number; refunded: number }>({ total: 0, paid: 0, pending: 0, refunded: 0 });

  // Paid vials per product for progress calculation
  const [paidVialsPerProduct, setPaidVialsPerProduct] = useState<Record<number, number>>({});

  // If batch is missing, go back to list; otherwise keep page visible
  useEffect(() => {
    if (!loading && !batch) {
      router.push('/products/group-buy');
    }
  }, [batch, loading, router]);

  // Auto-fetch user's order if logged in and has orders from this batch
  const fetchUserOrder = useCallback(async () => {
    if (!isSignedIn || !batch || !userProfile) {
      return;
    }

    try {
      setAuthLoading(true);

      // Find orders for this user in this batch using the user's ID from userProfile
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            product:products(*)
          )
        `)
        .eq('batch_id', batch.id)
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (orders && orders.length > 0) {
        setUserOrder(orders[0]);
        // Auto-authorize if user has orders from this batch
        setIsAuthorized(true);
      } else {
        // Clear user order if no orders found
        setUserOrder(null);
        setIsAuthorized(false);
      }
    } catch {
      setUserOrder(null);
      setIsAuthorized(false);
    } finally {
      setAuthLoading(false);
    }
  }, [isSignedIn, batch, userProfile]);

  const loadPaymentStats = useCallback(async () => {
    if (!batch) {
      return;
    }

    // Load overall payment stats
    const { data: ordersData } = await supabase
      .from('orders')
      .select('payment_status')
      .eq('batch_id', batch.id);

    const counts = { total: 0, paid: 0, pending: 0, refunded: 0 };
    (ordersData || []).forEach((row: any) => {
      counts.total += 1;
      if (row.payment_status === 'paid') {
        counts.paid += 1;
      } else if (row.payment_status === 'pending') {
        counts.pending += 1;
      } else if (row.payment_status === 'refunded') {
        counts.refunded += 1;
      }
    });
    setPaymentStats(counts);

    // Load paid vials per product
    const { data: orderItemsData } = await supabase
      .from('orders')
      .select(`
        payment_status,
        order_items(
          product_id,
          quantity
        )
      `)
      .eq('batch_id', batch.id);

    const paidVials: Record<number, number> = {};
    (orderItemsData || []).forEach((order: any) => {
      if (order.payment_status === 'paid') {
        order.order_items?.forEach((item: any) => {
          paidVials[item.product_id] = (paidVials[item.product_id] || 0) + item.quantity;
        });
      }
    });
    setPaidVialsPerProduct(paidVials);
  }, [batch]);

  // Auto-fetch user's order when logged in and batch is loaded
  useEffect(() => {
    if (isSignedIn && batch && userProfile) {
      fetchUserOrder();
    }
  }, [isSignedIn, batch, userProfile, fetchUserOrder]);

  // Load payment stats when batch changes
  useEffect(() => {
    if (batch) {
      loadPaymentStats();
    }
  }, [batch, loadPaymentStats]);

  const verifyOrderCode = async () => {
    if (!batch) {
      return;
    }
    if (!orderCodeInput.trim()) {
      setAuthError('Please enter your order code');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const { data } = await supabase
        .from('orders')
        .select('id')
        .eq('order_code', orderCodeInput.trim().toUpperCase())
        .eq('batch_id', batch.id)
        .single();
      if (!data) {
        setAuthError('Order not found for this batch. Check your code and try again.');
        return;
      }
      setIsAuthorized(true);
      await loadPaymentStats();
    } finally {
      setAuthLoading(false);
    }
  };

  const updateVialOrder = (productId: number, vials: number) => {
    if (vials < 0) {
      return;
    }

    const product = batch?.batch_products.find(bp => bp.product_id === productId);
    if (product && vials > (product.target_vials - product.current_vials)) {
      return;
    }

    setVialOrders(prev => ({
      ...prev,
      [productId]: vials,
    }));
  };

  const getTotalVials = () => {
    return Object.values(vialOrders).reduce((sum, vials) => sum + vials, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(vialOrders).reduce((sum, [productId, vials]) => {
      const product = batch?.batch_products.find(bp => bp.product_id === Number.parseInt(productId));
      return sum + (product ? product.product.price_per_vial * vials : 0);
    }, 0);
  };

  const getProgressPercentage = (batchProduct: BatchProduct) => {
    if (batchProduct.target_vials === 0) {
      return 0;
    }

    // During payment phase, show paid vials progress
    if (isPaymentPhase) {
      const paidVials = paidVialsPerProduct[batchProduct.product_id] || 0;
      return Math.round((paidVials / batchProduct.target_vials) * 100);
    }

    return Math.round((batchProduct.current_vials / batchProduct.target_vials) * 100);
  };

  const getBatchProgressPercentage = () => {
    if (!batch || batch.target_vials === 0) {
      return 0;
    }

    // During payment phase, show paid vials progress
    if (isPaymentPhase) {
      const totalPaidVials = Object.values(paidVialsPerProduct).reduce((sum, vials) => sum + vials, 0);
      return Math.round((totalPaidVials / batch.target_vials) * 100);
    }

    return Math.round((batch.current_vials / batch.target_vials) * 100);
  };

  const isBatchComplete = () => {
    return batch?.batch_products.every(bp => bp.current_vials >= bp.target_vials) || false;
  };

  const canPlaceOrder = () => {
    return isSignedIn && getTotalVials() > 0;
  };

  const handleAddToCart = () => {
    if (!canPlaceOrder()) {
      return;
    }

    Object.entries(vialOrders).forEach(([productId, vials]) => {
      if (vials > 0) {
        const product = batch?.batch_products.find(bp => bp.product_id === Number.parseInt(productId));
        if (product) {
          const remaining = Math.max(0, (product.target_vials || 0) - (product.current_vials || 0));
          const clamped = Math.min(vials, remaining);
          if (clamped <= 0) {
            return;
          }
          const itemId = `group-buy-${product.product_id}-${batch?.id?.toString() || ''}`;
          addToCart({
            id: itemId,
            name: product.product.name,
            price: product.product.price_per_vial,
            type: 'group-buy',
            image: product.product.image_url || undefined,
            batchId: batch?.id?.toString() || undefined,
            productId: product.product_id,
            maxQuantity: remaining,
          });
          // Update quantity to the desired number of vials
          updateQuantity(itemId, clamped);
        }
      }
    });

    setVialOrders({});
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading batch...</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Batch Not Found</h1>
          <p className="mb-4 text-gray-600">This group buying batch doesn't exist or is no longer active.</p>
          <Button onClick={() => router.push('/products/group-buy')}>
            View All Batches
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Batch Header */}
        <Card className="mb-8 border-0 bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-2xl">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="mb-2 text-3xl">{batch.name}</CardTitle>
                <CardDescription className="text-lg text-purple-100">
                  {batch.description}
                </CardDescription>
              </div>
              <Badge className="bg-white px-3 py-1 text-purple-600">
                {batch.discount_percentage}
                % OFF
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold">
                  {isPaymentPhase
                    ? Object.values(paidVialsPerProduct).reduce((sum, vials) => sum + vials, 0)
                    : batch.current_vials}
                </div>
                <div className="text-sm text-purple-100">
                  {isPaymentPhase ? 'Vials Paid' : 'Vials Purchased'}
                </div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold">{batch.target_vials}</div>
                <div className="text-sm text-purple-100">Target Vials</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold">
                  {getBatchProgressPercentage()}
                  %
                </div>
                <div className="text-sm text-purple-100">
                  {isPaymentPhase ? 'Paid Progress' : 'Progress'}
                </div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold">
                  {isPaymentPhase ? 'Payment Phase' : (isBatchComplete() ? 'Complete!' : 'Active')}
                </div>
                <div className="text-sm text-purple-100">Status</div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm">
                <span>{isPaymentPhase ? 'Paid Progress' : 'Overall Progress'}</span>
                <span>
                  {getBatchProgressPercentage()}
                  %
                </span>
              </div>
              <Progress value={getBatchProgressPercentage()} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Payment Phase Order Code Verification - Only for non-logged-in users or users without orders */}
        {isPaymentPhase && !isAuthorized && (!isSignedIn || !userOrder) && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50/60 shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-5 w-5" />
                Payment Collection Phase
              </CardTitle>
              <CardDescription className="text-yellow-700">
                This batch is now in the payment collection phase. Enter your order code to view batch progress and payment details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={orderCodeInput}
                  onChange={e => setOrderCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g., GB-20241201-001"
                  className="h-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      verifyOrderCode();
                    }
                  }}
                />
                <Button
                  onClick={verifyOrderCode}
                  disabled={authLoading || !orderCodeInput.trim()}
                  className="h-12 bg-purple-600 text-white hover:bg-purple-700"
                >
                  {authLoading ? 'Verifying...' : 'Verify Order Code'}
                </Button>
              </div>
              {authError && (
                <Alert variant="destructive" className="mt-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Progress for Authorized Users */}
        {isPaymentPhase && isAuthorized && (
          <Card className="mb-8 border-purple-200 bg-purple-50/60 shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <CheckCircle className="h-5 w-5" />
                Payment Progress
              </CardTitle>
              <CardDescription className="text-purple-700">
                Live payment status for this batch.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Total Orders</div>
                  <div className="text-2xl font-bold text-purple-600">{paymentStats.total}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Paid</div>
                  <div className="text-2xl font-bold text-green-600">{paymentStats.paid}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Pending</div>
                  <div className="text-2xl font-bold text-yellow-600">{paymentStats.pending}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Refunded</div>
                  <div className="text-2xl font-bold text-red-600">{paymentStats.refunded}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-600">Payment Progress</span>
                  <span className="font-semibold">
                    {paymentStats.total > 0 ? Math.round((paymentStats.paid / paymentStats.total) * 100) : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={paymentStats.total > 0 ? (paymentStats.paid / paymentStats.total) * 100 : 0}
                  className="h-3"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* User's Order Details for Logged-in Users */}
        {isAuthorized && userOrder && (
          <Card className="mb-8 border-green-200 bg-green-50/60 shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Your Order Details
              </CardTitle>
              <CardDescription className="text-green-700">
                Order Code:
                {' '}
                {userOrder.order_code}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Order Status */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm text-gray-600">Order Status</div>
                    <div className="text-lg font-semibold capitalize">{userOrder.status}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Payment Status</div>
                    <div className={`text-lg font-semibold capitalize ${
                      userOrder.payment_status === 'paid'
                        ? 'text-green-600'
                        : userOrder.payment_status === 'pending'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                    >
                      {userOrder.payment_status}
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="mb-2 font-semibold">Customer Information</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
                    <div>
                      <strong>Name:</strong>
                      {' '}
                      {userOrder.customer_name}
                    </div>
                    <div>
                      <strong>Email:</strong>
                      {' '}
                      {userOrder.customer_email || 'N/A'}
                    </div>
                    <div>
                      <strong>Phone:</strong>
                      {' '}
                      {userOrder.whatsapp_number}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="mb-3 font-semibold">Order Items</h4>
                  <div className="space-y-2">
                    {userOrder.order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center space-x-3">
                          {item.product.image_url && (
                            <Image
                              src={item.product.image_url}
                              alt={item.product.name}
                              width={40}
                              height={40}
                              className="rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{item.product.name}</div>
                            <div className="text-sm text-gray-600">
                              {item.quantity}
                              {' '}
                              vial(s) × ₱
                              {item.price_per_vial.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            ₱
                            {item.total_price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total and Payment Actions */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">
                      Total Amount: ₱
                      {userOrder.total_amount.toLocaleString()}
                    </div>
                    {isPaymentPhase && userOrder.payment_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(userOrder.order_code)}
                        >
                          Copy Order Code
                        </Button>
                        <Button
                          asChild
                          className="bg-green-600 text-white hover:bg-green-700"
                        >
                          <a
                            href={`https://wa.me/6391549012244?text=Hi, I'd like to pay for my order ${userOrder.order_code}. My total is ₱${userOrder.total_amount.toLocaleString()}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Phone className="mr-2 h-4 w-4" />
                            Pay Now via WhatsApp
                          </a>
                        </Button>
                      </div>
                    )}
                    {isPaymentPhase && userOrder.payment_status === 'paid' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-semibold">Payment Received</span>
                      </div>
                    )}
                    {!isPaymentPhase && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-semibold">Order Confirmed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Important Notice */}
        {!isBatchComplete() && !isPaymentPhase && (
          <Alert className="mb-8 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Important:</strong>
              {' '}
              Orders and payments will only be processed when ALL vials in this batch are fully purchased.
              Your order will be held until the batch is complete.
            </AlertDescription>
          </Alert>
        )}

        {isBatchComplete() && !isPaymentPhase && (
          <Alert className="mb-8 border-purple-200 bg-purple-50">
            <CheckCircle className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              <strong>Batch Complete!</strong>
              {' '}
              All vials have been purchased. Orders are now being processed and payments are being collected.
            </AlertDescription>
          </Alert>
        )}

        {/* Products Grid */}
        <div className={`mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2 ${isPaymentPhase && !isAuthorized && (!isSignedIn || !userOrder) ? 'pointer-events-none blur-[1px] select-none md:blur-[2px]' : ''}`}>
          {batch.batch_products?.map((batchProduct: BatchProduct) => (
            <Card key={batchProduct.product_id} className="group border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {batchProduct.product.image_url
                      ? (
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                            <Image
                              src={batchProduct.product.image_url}
                              alt={batchProduct.product.name}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )
                      : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-xl font-bold text-white">
                            {batchProduct.product.name.charAt(0)}
                          </div>
                        )}
                    <div>
                      <CardTitle className="text-xl">{batchProduct.product.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {batchProduct.product.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      ₱
                      {batchProduct.product.price_per_vial}
                    </div>
                    <div className="text-sm text-gray-500">per vial</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {batchProduct.product.description && (
                    <p className="text-sm text-gray-600">
                      {batchProduct.product.description}
                    </p>
                  )}

                  {/* Product Progress */}
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-600">
                        {isPaymentPhase ? 'Paid Progress' : 'Vials Progress'}
                      </span>
                      <span className="font-semibold">
                        {getProgressPercentage(batchProduct)}
                        %
                      </span>
                    </div>
                    <Progress value={getProgressPercentage(batchProduct)} className="h-2" />
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>
                        {isPaymentPhase
                          ? `${paidVialsPerProduct[batchProduct.product_id] || 0} paid`
                          : `${batchProduct.current_vials} purchased`}
                      </span>
                      <span>
                        {batchProduct.target_vials}
                        {' '}
                        needed
                      </span>
                    </div>
                  </div>

                  {/* Vial Ordering - Only show during active phase */}
                  {!isPaymentPhase && (
                    <div className="border-t pt-4">
                      <Label className="text-sm font-medium">Order Vials</Label>
                      <div className="mt-2 flex items-center space-x-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateVialOrder(batchProduct.product_id, (vialOrders[batchProduct.product_id] as number || 0) - 1)}
                          disabled={(vialOrders[batchProduct.product_id] || 0) <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          max={batchProduct.target_vials - batchProduct.current_vials}
                          value={vialOrders[batchProduct.product_id] as number || 0}
                          onChange={e => updateVialOrder(batchProduct.product_id, Number.parseInt(e.target.value as string) || 0)}
                          className="w-20 text-center"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateVialOrder(batchProduct.product_id, (vialOrders[batchProduct.product_id] as number || 0) + 1)}
                          disabled={(vialOrders[batchProduct.product_id] || 0) >= (batchProduct.target_vials - batchProduct.current_vials)}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                        <div className="text-sm text-gray-600">
                          Max:
                          {' '}
                          {batchProduct.target_vials - batchProduct.current_vials}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Phase Message */}
                  {isPaymentPhase && (
                    <div className="border-t pt-4">
                      <div className="rounded-lg bg-yellow-50 p-3 text-center">
                        <div className="text-sm font-medium text-yellow-800">
                          Orders Closed - Payment Phase
                        </div>
                        <div className="mt-1 text-xs text-yellow-600">
                          Enter your order code above to view payment details
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary - Only show during active phase */}
        {!isPaymentPhase && getTotalVials() > 0 && (
          <Card className="sticky bottom-4 border-0 bg-white/95 shadow-2xl backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Order Summary</h3>
                  <p className="text-sm text-gray-600">
                    {getTotalVials()}
                    {' '}
                    vials • ₱
                    {getTotalPrice().toLocaleString()}
                  </p>
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={!canPlaceOrder() || isSubmitting}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {isSubmitting ? 'Adding...' : 'Add to Cart'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Batch Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Batch Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <h4 className="mb-2 font-semibold text-gray-900">Start Date</h4>
                <p className="text-gray-600">{new Date(batch.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-900">End Date</h4>
                <p className="text-gray-600">{new Date(batch.end_date).toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-900">Discount</h4>
                <p className="text-gray-600">
                  {batch.discount_percentage}
                  % off regular price
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
