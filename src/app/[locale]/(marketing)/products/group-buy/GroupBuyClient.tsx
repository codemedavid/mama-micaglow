'use client';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Copy,
  Minus,
  Package,
  Phone,
  Plus,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useRealtimeBatch } from '@/hooks/useRealtimeBatch';
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
  product?: Product;
  target_vials: number;
  current_vials: number;
  price_per_vial?: number;
};

type Batch = {
  id: number;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'payment_collection' | 'ordering' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  target_vials: number;
  current_vials: number;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  created_at: string;
  batch_products: BatchProduct[];
};

type Order = {
  id: number;
  order_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  batch_id: number;
  order_items: OrderItem[];
};

type OrderItem = {
  id: number;
  product_id: number;
  product: Product;
  quantity: number;
  price_per_vial: number;
  total_price: number;
};

export default function GroupBuyClient() {
  const { activeBatch, loading } = useRealtimeBatch();
  const [productQuantities, setProductQuantities] = useState<Record<number, number>>({});
  const { dispatch } = useCart();

  // Order code verification state
  const [orderCodeInput, setOrderCodeInput] = useState('');
  const [verifiedOrder, setVerifiedOrder] = useState<Order | null>(null);
  const [verificationError, setVerificationError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Payment stats for progress calculation
  const [paidVialsPerProduct, setPaidVialsPerProduct] = useState<Record<number, number>>({});

  // Define isPaymentPhase early
  const isPaymentPhase = activeBatch?.status === 'payment_collection';

  // Load payment stats and calculate paid vials per product
  const loadPaymentStats = useCallback(async () => {
    if (!activeBatch) {
      return;
    }

    try {
      const { data } = await supabase
        .from('orders')
        .select(`
          payment_status,
          order_items(
            product_id,
            quantity
          )
        `)
        .eq('batch_id', activeBatch.id);

      const paidVials: Record<number, number> = {};

      (data || []).forEach((order: any) => {
        if (order.payment_status === 'paid') {
          // Count paid vials per product
          order.order_items?.forEach((item: any) => {
            paidVials[item.product_id] = (paidVials[item.product_id] || 0) + item.quantity;
          });
        }
      });

      setPaidVialsPerProduct(paidVials);
    } catch (err) {
      console.error('Error loading payment stats:', err);
    }
  }, [activeBatch]);

  // Order verification function
  const handleVerifyOrder = async () => {
    if (!orderCodeInput.trim()) {
      setVerificationError('Please enter an order code.');
      return;
    }
    setVerifying(true);
    setVerificationError('');

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            product_id,
            quantity,
            price_per_vial,
            total_price,
            product:products(*)
          )
        `)
        .eq('order_code', orderCodeInput.trim().toUpperCase())
        .eq('batch_id', activeBatch?.id)
        .single();

      if (error || !data) {
        setVerificationError('Order code not found for this batch. Please check and try again.');
        setVerifiedOrder(null);
      } else {
        setVerifiedOrder(data);
        setVerificationError('');
      }
    } catch (err) {
      console.error('Order verification error:', err);
      setVerificationError('An unexpected error occurred during verification.');
      setVerifiedOrder(null);
    } finally {
      setVerifying(false);
    }
  };

  // Initialize quantities when activeBatch changes
  const updateProductQuantities = useCallback(() => {
    if (activeBatch?.batch_products) {
      const initialQuantities: Record<number, number> = {};
      activeBatch.batch_products.forEach((bp: BatchProduct) => {
        initialQuantities[bp.product_id] = 0;
      });
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setProductQuantities(initialQuantities);
    }
  }, [activeBatch?.batch_products]);

  useEffect(() => {
    updateProductQuantities();
    // Load payment stats when batch changes
    if (activeBatch) {
      loadPaymentStats();
    }
  }, [updateProductQuantities, activeBatch, loadPaymentStats]);

  const getProgressPercentage = (batch: Batch) => {
    if (batch.target_vials === 0) {
      return 0;
    }

    // During payment phase, show paid vials progress
    if (isPaymentPhase) {
      const totalPaidVials = Object.values(paidVialsPerProduct).reduce((sum, vials) => sum + vials, 0);
      return Math.round((totalPaidVials / batch.target_vials) * 100);
    }

    return Math.round((batch.current_vials / batch.target_vials) * 100);
  };

  const isOrderingLocked = (batch?: Batch | null) => {
    if (!batch) {
      return true;
    }
    // Lock ordering during payment_collection phase
    return batch.status === 'payment_collection';
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getProductProgressPercentage = (current: number, target: number, productId: number) => {
    if (target === 0) {
      return 0;
    }

    // During payment phase, show paid vials progress
    if (isPaymentPhase) {
      const paidVials = paidVialsPerProduct[productId] || 0;
      return Math.round((paidVials / target) * 100);
    }

    return Math.round((current / target) * 100);
  };

  const getRemainingVials = (current: number, target: number, productId: number) => {
    // During payment phase, show remaining vials based on paid orders
    if (isPaymentPhase) {
      const paidVials = paidVialsPerProduct[productId] || 0;
      return Math.max(0, target - paidVials);
    }

    return Math.max(0, target - current);
  };

  const getVialStatus = (remaining: number) => {
    if (remaining === 0) {
      return { text: 'Sold out', color: 'bg-red-100 text-red-800' };
    }
    if (remaining <= 2) {
      return { text: `${remaining} left`, color: 'bg-red-100 text-red-800' };
    }
    if (remaining <= 5) {
      return { text: `${remaining} left`, color: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: `${remaining} left`, color: 'bg-purple-100 text-purple-800' };
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity),
    }));
  };

  const addToCart = (batchProduct: BatchProduct) => {
    const requested = productQuantities[batchProduct.product_id] || 0;
    const remaining = Math.max(0, (batchProduct.target_vials || 0) - (batchProduct.current_vials || 0));
    const clamped = Math.min(requested, remaining);
    if (clamped <= 0) {
      return;
    }

    const cartItem = {
      id: `group-buy-${activeBatch?.id}-${batchProduct.product_id}`,
      name: batchProduct.product?.name || 'Unknown Product',
      price: batchProduct.price_per_vial || batchProduct.product?.price_per_vial || 0,
      quantity: clamped,
      type: 'group-buy' as const,
      image: batchProduct.product?.image_url || undefined,
      batchId: activeBatch?.id.toString() || '',
      productId: batchProduct.product_id,
      maxQuantity: remaining,
    };

    dispatch({ type: 'ADD_ITEM', payload: cartItem });

    // Reset quantity after adding to cart
    setProductQuantities(prev => ({
      ...prev,
      [batchProduct.product_id]: 0,
    }));
  };

  const getTotalItems = () => {
    return Object.values(productQuantities).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    if (!activeBatch || !activeBatch.batch_products) {
      return 0;
    }
    return activeBatch.batch_products.reduce((total, bp) => {
      const quantity = productQuantities[bp.product_id] || 0;
      const price = bp.product?.price_per_vial || 0;
      return total + (quantity * price);
    }, 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="text-muted-foreground">Loading active group buy batch...</p>
        </div>
      </div>
    );
  }

  if (!activeBatch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-12 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-xl font-semibold">No Active Group Buy</h3>
          <p className="mb-6 text-muted-foreground">
            There are currently no active group buy batches. Check back soon for new opportunities!
          </p>
          <Button asChild>
            <Link href="/products">
              <Package className="mr-2 h-4 w-4" />
              Browse Individual Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(activeBatch.end_date);
  const progressPercentage = getProgressPercentage(activeBatch);
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/20">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="relative mb-16 overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 px-8 py-16 text-white shadow-2xl">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10 text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Users className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">Active Group Buy</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              {activeBatch.name}
            </h1>

            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-purple-100">
              {activeBatch.description || 'Join this exclusive group buy to unlock premium peptides at unbeatable prices. Limited time offer with real-time progress tracking.'}
            </p>

            {/* Quick Stats */}
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold">
                  {progressPercentage}
                  %
                </div>
                <div className="text-sm text-purple-200">Complete</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold">{activeBatch.current_vials}</div>
                <div className="text-sm text-purple-200">Vials Ordered</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold">{daysRemaining}</div>
                <div className="text-sm text-purple-200">Days Left</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Phase Order Code Verification */}
        {isPaymentPhase && !verifiedOrder && (
          <div className="mb-12">
            <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-8 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 to-yellow-100/20"></div>
              <div className="relative z-10">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                    <AlertCircle className="h-8 w-8 text-amber-600" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-amber-900">Payment Collection Phase</h2>
                  <p className="text-amber-700">
                    This batch is now collecting payments. Enter your order code to view your order details and payment status.
                  </p>
                </div>

                <div className="mx-auto max-w-md">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Input
                      value={orderCodeInput}
                      onChange={e => setOrderCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g., GB-20241201-001"
                      className="h-12 text-center font-mono text-lg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleVerifyOrder();
                        }
                      }}
                    />
                    <Button
                      onClick={handleVerifyOrder}
                      disabled={verifying || !orderCodeInput.trim()}
                      className="h-12 bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                      {verifying
                        ? (
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Verifying...
                            </div>
                          )
                        : (
                            'Verify Order'
                          )}
                    </Button>
                  </div>
                  {verificationError && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{verificationError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details for Verified Users */}
        {isPaymentPhase && verifiedOrder && (
          <div className="mb-12">
            <div className="relative overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-green-100/20 to-emerald-100/20"></div>
              <div className="relative z-10">
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-green-900">Your Order Details</h2>
                  <p className="text-green-700">
                    Order Code:
                    {verifiedOrder.order_code}
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Order Status Cards */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-xl bg-white/60 p-6 backdrop-blur-sm">
                      <div className="mb-2 text-sm font-medium text-gray-600">Order Status</div>
                      <div className="text-2xl font-bold text-gray-900 capitalize">{verifiedOrder.status}</div>
                    </div>
                    <div className="rounded-xl bg-white/60 p-6 backdrop-blur-sm">
                      <div className="mb-2 text-sm font-medium text-gray-600">Payment Status</div>
                      <div className={`text-2xl font-bold capitalize ${
                        verifiedOrder.payment_status === 'paid'
                          ? 'text-green-600'
                          : verifiedOrder.payment_status === 'pending'
                            ? 'text-amber-600'
                            : 'text-red-600'
                      }`}
                      >
                        {verifiedOrder.payment_status}
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="rounded-xl bg-white/60 p-6 backdrop-blur-sm">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Customer Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <div className="text-sm text-gray-600">Name</div>
                        <div className="font-medium">{verifiedOrder.customer_name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="font-medium">{verifiedOrder.customer_email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Phone</div>
                        <div className="font-medium">{verifiedOrder.customer_phone}</div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="rounded-xl bg-white/60 p-6 backdrop-blur-sm">
                    <h3 className="mb-6 text-lg font-semibold text-gray-900">Order Items</h3>
                    <div className="space-y-4">
                      {verifiedOrder.order_items.map(item => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
                          <div className="flex items-center space-x-4">
                            {item.product.image_url && (
                              <Image
                                src={item.product.image_url}
                                alt={item.product.name}
                                width={48}
                                height={48}
                                className="rounded-lg"
                              />
                            )}
                            <div>
                              <div className="font-semibold text-gray-900">{item.product.name}</div>
                              <div className="text-sm text-gray-600">
                                {item.quantity}
                                {' '}
                                vial(s) × ₱
                                {item.price_per_vial.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              ₱
                              {item.total_price.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total and Payment Actions */}
                  <div className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                      <div className="text-center sm:text-left">
                        <div className="text-sm text-purple-200">Total Amount</div>
                        <div className="text-3xl font-bold">
                          ₱
                          {verifiedOrder.total_amount.toLocaleString()}
                        </div>
                      </div>
                      {verifiedOrder.payment_status === 'pending' && (
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Button
                            variant="outline"
                            onClick={() => navigator.clipboard.writeText(verifiedOrder.order_code)}
                            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Order Code
                          </Button>
                          <Button
                            asChild
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            <a
                              href={`https://wa.me/639154901224?text=Hi, I'd like to pay for my order ${verifiedOrder.order_code}. My total is ₱${verifiedOrder.total_amount.toLocaleString()}.`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Phone className="mr-2 h-4 w-4" />
                              Pay via WhatsApp
                            </a>
                          </Button>
                        </div>
                      )}
                      {verifiedOrder.payment_status === 'paid' && (
                        <div className="flex items-center gap-2 text-green-300">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-lg font-semibold">Payment Received</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Batch Overview Card */}
        <div className={`${isPaymentPhase && !verifiedOrder ? 'pointer-events-none blur-[1px] select-none md:blur-[2px]' : ''}`}>
          <div className="mb-12">
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl">
              {/* Progress Header */}
              <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 px-8 py-12 text-white">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-indigo-700/90"></div>
                <div className="relative z-10">
                  <div className="mb-6 flex flex-col items-center justify-between gap-6 lg:flex-row">
                    <div className="text-center lg:text-left">
                      <h2 className="mb-2 text-3xl font-bold">Batch Progress</h2>
                      <p className="text-purple-100">
                        {daysRemaining > 0 ? `Ends in ${daysRemaining} days` : 'Batch Ended'}
                        {' '}
                        •
                        {activeBatch.current_vials}
                        /
                        {activeBatch.target_vials}
                        {' '}
                        vials filled
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl font-bold">
                        {progressPercentage}
                        %
                      </div>
                      <div className="text-purple-200">Complete</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-4 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full bg-gradient-to-r from-white to-purple-200 transition-all duration-1000 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="p-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="group rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-6 transition-all hover:shadow-lg">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-200">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="mb-2 text-sm font-medium text-gray-600">Batch Duration</div>
                    <div className="text-lg font-bold text-gray-900">
                      {new Date(activeBatch.start_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {' - '}
                      {new Date(activeBatch.end_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  <div className="group rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 transition-all hover:shadow-lg">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-200">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="mb-2 text-sm font-medium text-gray-600">
                      {isPaymentPhase ? 'Paid Progress' : 'Current Progress'}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {isPaymentPhase
                        ? `${Object.values(paidVialsPerProduct).reduce((sum, vials) => sum + vials, 0)}`
                        : `${activeBatch.current_vials}`}
                      {' / '}
                      {activeBatch.target_vials}
                      {' '}
                      vials
                    </div>
                  </div>

                  <div className="group rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-6 transition-all hover:shadow-lg">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-200">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="mb-2 text-sm font-medium text-gray-600">Participants</div>
                    <div className="text-lg font-bold text-gray-900">Join now!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          {activeBatch && activeBatch.batch_products && activeBatch.batch_products.length > 0
            ? (
                <div className="space-y-12">
                  <div className="text-center">
                    <h2 className="mb-4 text-3xl font-bold text-gray-900">Available Products</h2>
                    <p className="text-lg text-gray-600">Choose from our premium peptide selection</p>
                  </div>

                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {activeBatch.batch_products.map((batchProduct) => {
                      const product = batchProduct.product;
                      const remaining = getRemainingVials(batchProduct.current_vials, batchProduct.target_vials, batchProduct.product_id);
                      const productProgress = getProductProgressPercentage(batchProduct.current_vials, batchProduct.target_vials, batchProduct.product_id);
                      const status = getVialStatus(remaining);
                      const quantity = productQuantities[batchProduct.product_id] || 0;
                      const price = product?.price_per_vial || 0;

                      return (
                        <div key={batchProduct.product_id} className="group relative overflow-hidden rounded-3xl bg-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                          {/* Product Image */}
                          <div className="relative h-48 overflow-hidden">
                            {product?.image_url
                              ? (
                                  <Image
                                    src={product.image_url}
                                    alt={product.name || 'Product'}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                )
                              : (
                                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600">
                                    <div className="text-6xl font-bold text-white">
                                      {(product?.name || 'P').charAt(0)}
                                    </div>
                                  </div>
                                )}

                            {/* Status Badge */}
                            <div className="absolute top-4 right-4">
                              <Badge className={`${status.color} shadow-lg backdrop-blur-sm`}>
                                {status.text}
                              </Badge>
                            </div>

                            {/* Progress Overlay */}
                            <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                              <div className="mb-2 flex items-center justify-between text-white">
                                <span className="text-sm font-medium">
                                  {isPaymentPhase ? 'Paid Progress' : 'Progress'}
                                </span>
                                <span className="text-sm font-bold">
                                  {isPaymentPhase
                                    ? `${paidVialsPerProduct[batchProduct.product_id] || 0}`
                                    : `${batchProduct.current_vials}`}
                                  /
                                  {batchProduct.target_vials}
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-white/20">
                                <div
                                  className="h-2 rounded-full bg-gradient-to-r from-white to-purple-200 transition-all duration-500"
                                  style={{ width: `${productProgress}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="p-8">
                            <div className="mb-4">
                              <h3 className="mb-2 text-2xl font-bold text-gray-900">
                                {product?.name || 'Unknown Product'}
                              </h3>
                              <p className="text-gray-600">
                                {product?.category || 'Unknown Category'}
                              </p>
                            </div>

                            {/* Price */}
                            <div className="mb-6 flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-purple-600">
                                ₱
                                {price.toLocaleString()}
                              </span>
                              <span className="text-gray-500">per vial</span>
                            </div>

                            {/* Quantity Selector and Add to Cart - Only show during active phase */}
                            {!isPaymentPhase && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor={`quantity-${batchProduct.product_id}`} className="mb-2 block text-sm font-medium text-gray-700">
                                    Quantity (vials)
                                  </Label>
                                  <div className="flex items-center space-x-3">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => updateQuantity(batchProduct.product_id, quantity - 1)}
                                      disabled={quantity <= 0}
                                      className="h-10 w-10 rounded-full"
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                      id={`quantity-${batchProduct.product_id}`}
                                      type="number"
                                      min="0"
                                      max={remaining}
                                      value={quantity}
                                      onChange={e => updateQuantity(batchProduct.product_id, Number.parseInt(e.target.value) || 0)}
                                      className="h-10 w-20 text-center font-semibold"
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => updateQuantity(batchProduct.product_id, quantity + 1)}
                                      disabled={quantity >= remaining}
                                      className="h-10 w-10 rounded-full"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  {quantity > 0 && (
                                    <div className="mt-2 text-center">
                                      <span className="text-sm text-gray-600">Total: </span>
                                      <span className="text-lg font-bold text-purple-600">
                                        ₱
                                        {(quantity * price).toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Add to Cart Button */}
                                <Button
                                  className="h-12 w-full rounded-xl text-lg font-semibold"
                                  onClick={() => addToCart(batchProduct)}
                                  disabled={isOrderingLocked(activeBatch) || quantity <= 0 || remaining === 0}
                                >
                                  <ShoppingCart className="mr-2 h-5 w-5" />
                                  {isOrderingLocked(activeBatch)
                                    ? 'Orders Closed - Payment Phase'
                                    : remaining === 0
                                      ? 'Sold Out'
                                      : `Add ${quantity} vial(s) to Cart`}
                                </Button>
                              </div>
                            )}

                            {/* Payment Phase Message */}
                            {isPaymentPhase && (
                              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
                                <div className="text-lg font-semibold text-amber-800">
                                  Orders Closed - Payment Phase
                                </div>
                                <div className="mt-2 text-sm text-amber-600">
                                  Enter your order code above to view payment details
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cart Summary */}
                  {totalItems > 0 && (
                    <div className="mt-12">
                      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-indigo-600/90"></div>
                        <div className="relative z-10">
                          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                            <div className="text-center sm:text-left">
                              <h3 className="mb-2 text-2xl font-bold">Cart Summary</h3>
                              <p className="text-purple-100">
                                {totalItems}
                                {' '}
                                vial(s) selected • Total: ₱
                                {totalPrice.toLocaleString()}
                              </p>
                            </div>
                            <Button
                              size="lg"
                              className="h-14 rounded-xl bg-white px-8 text-lg font-semibold text-purple-600 hover:bg-purple-50"
                            >
                              <ShoppingCart className="mr-3 h-6 w-6" />
                              View Cart (
                              {totalItems}
                              )
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            : (
                <div className="py-20 text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-gray-900">No Products Available</h3>
                  <p className="text-lg text-gray-600">
                    This batch doesn't have any products yet.
                  </p>
                </div>
              )}
        </div>
      </div>
    </div>
  );
}
