'use client';

import { useUser } from '@clerk/nextjs';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Package,
  Phone,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  status: 'draft' | 'active' | 'payment_collection' | 'ordering' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  target_vials: number;
  current_vials: number;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  created_at: string;
  batch_products: BatchProduct[];
};

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
  order_items: OrderItem[];
};

export default function ActiveBatchSection() {
  const { isSignedIn } = useUser();
  const { userProfile } = useRole();
  const { activeBatch, loading } = useRealtimeBatch();

  // User's order state
  const [userOrder, setUserOrder] = useState<Order | null>(null);

  const getProgressPercentage = (batch: Batch) => {
    if (batch.target_vials === 0) {
      return 0;
    }
    return Math.round((batch.current_vials / batch.target_vials) * 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getProductProgressPercentage = (current: number, target: number) => {
    if (target === 0) {
      return 0;
    }
    return Math.round((current / target) * 100);
  };

  const getRemainingVials = (current: number, target: number) => {
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

  // Fetch user's order for the active batch
  const fetchUserOrder = useCallback(async () => {
    if (!isSignedIn || !activeBatch || !userProfile) {
      return;
    }

    try {
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
        .eq('batch_id', activeBatch.id)
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (orders && orders.length > 0) {
        setUserOrder(orders[0]);
      } else {
        setUserOrder(null);
      }
    } catch (error) {
      console.error('Error fetching user order:', error);
      setUserOrder(null);
    }
  }, [isSignedIn, activeBatch, userProfile]);

  // Auto-fetch user's order when logged in and batch is loaded
  useEffect(() => {
    if (isSignedIn && activeBatch && userProfile) {
      fetchUserOrder();
    }
  }, [isSignedIn, activeBatch, userProfile, fetchUserOrder]);

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-purple-50 to-purple-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge className="mb-4 border-purple-200 bg-purple-100 text-purple-800">
              <Users className="mr-1 h-3 w-3" />
              Loading Active Batch...
            </Badge>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Current Group Buy
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Fetching the latest active batch information...
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <Card className="border-purple-200 shadow-lg">
              <CardContent className="p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                  <div className="h-4 w-2/3 rounded bg-gray-200"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  if (!activeBatch) {
    return (
      <section className="bg-gradient-to-br from-purple-50 to-purple-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge className="mb-4 border-gray-200 bg-gray-100 text-gray-800">
              <AlertCircle className="mr-1 h-3 w-3" />
              No Active Batch
            </Badge>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              No Active Group Buy
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              There are currently no active group buy batches. Check back soon for new opportunities!
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <Card className="border-gray-200 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">No Active Batches</h3>
                <p className="mb-6 text-gray-600">New group buy batches will appear here when they become available.</p>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/products">
                    <Package className="mr-2 h-5 w-5" />
                    Browse Individual Products
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  const daysRemaining = getDaysRemaining(activeBatch.end_date);
  const progressPercentage = getProgressPercentage(activeBatch);

  const isPaymentPhase = activeBatch.status === 'payment_collection';

  return (
    <section className="bg-gradient-to-br from-purple-50 to-purple-100 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <Badge className="mb-4 border-purple-200 bg-purple-100 text-purple-800">
            <Users className="mr-1 h-3 w-3" />
            Active Group Buy Batch
          </Badge>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Join Current Group Buy
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Get better prices by joining our active group buy batch. Limited time remaining!
          </p>
        </div>

        {/* Active Batch Card */}
        <div className="mx-auto max-w-4xl">
          <Card className="relative overflow-hidden border-purple-200 shadow-lg">
            <CardHeader className="gradient-purple rounded-t-lg bg-gradient-to-r py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="pt-2 text-2xl">{activeBatch.name}</CardTitle>
                  <CardDescription className="mt-2 text-purple-100">
                    Active Group Buy •
                    {' '}
                    {daysRemaining > 0 ? `Ends in ${daysRemaining} days` : 'Ended'}
                    {' '}
                    •
                    {' '}
                    {activeBatch.current_vials}
                    /
                    {activeBatch.target_vials}
                    {' '}
                    vials filled
                  </CardDescription>
                  {activeBatch.description && (
                    <p className="mt-2 text-sm text-purple-100">{activeBatch.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {progressPercentage}
                    %
                  </div>
                  <div className="text-sm text-purple-100">Complete</div>
                </div>
              </div>
              <div className="mt-4 h-3 w-full rounded-full bg-purple-200/30">
                <div
                  className="h-3 rounded-full bg-white transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </CardHeader>

            <CardContent className={`p-6 ${isPaymentPhase && !userOrder ? 'pointer-events-none blur-[1px] select-none md:blur-[2px]' : ''}`}>
              {activeBatch.batch_products && activeBatch.batch_products.length > 0
                ? (
                    <>
                      {/* Limited Products Display - Show only first 3 products */}
                      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {activeBatch.batch_products.slice(0, 3).map((batchProduct) => {
                          const product = batchProduct.product;
                          const remaining = getRemainingVials(batchProduct.current_vials, batchProduct.target_vials);
                          const productProgress = getProductProgressPercentage(batchProduct.current_vials, batchProduct.target_vials);
                          const status = getVialStatus(remaining);

                          return (
                            <div key={batchProduct.product_id} className="rounded-lg border border-purple-200 bg-purple-50/50 p-4">
                              <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div>
                                    <h3 className="text-lg font-semibold">{product.name}</h3>
                                    <p className="text-sm text-muted-foreground">{product.category}</p>
                                  </div>
                                </div>
                                <Badge className={status.color}>{status.text}</Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Price per vial:</span>
                                  <span className="font-bold text-purple-600">
                                    ₱
                                    {product.price_per_vial}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Progress:</span>
                                  <span className="text-sm font-medium">
                                    {batchProduct.current_vials}
                                    /
                                    {batchProduct.target_vials}
                                    {' '}
                                    vials
                                  </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-purple-200">
                                  <div
                                    className="gradient-purple h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${productProgress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Show "View All Products" button if there are more than 3 products */}
                      {activeBatch.batch_products.length > 3 && (
                        <div className="mb-6 text-center">
                          <Button
                            variant="outline"
                            className="border-purple-300 text-purple-600 hover:bg-purple-50"
                            asChild
                          >
                            <Link href={`/products/group-buy/${activeBatch.id}`}>
                              <Package className="mr-2 h-4 w-4" />
                              View All
                              {' '}
                              {activeBatch.batch_products.length}
                              {' '}
                              Products in This Batch
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      )}

                      {/* User's Order Details */}
                      {userOrder && (
                        <div className="mb-6 rounded-lg border border-green-200 bg-green-50/60 p-4">
                          <div className="mb-4 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <h3 className="text-lg font-semibold text-green-800">Your Order Details</h3>
                          </div>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <div className="text-sm text-gray-600">Order Code</div>
                              <div className="font-medium">{userOrder.order_code}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Status</div>
                              <div
                                className={`font-medium capitalize ${
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
                            <div>
                              <div className="text-sm text-gray-600">Total Amount</div>
                              <div className="font-semibold text-green-600">
                                ₱
                                {userOrder.total_amount.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Items</div>
                              <div className="font-medium">
                                {userOrder.order_items.length}
                                {' '}
                                product(s)
                              </div>
                            </div>
                          </div>
                          {isPaymentPhase && userOrder.payment_status === 'pending' && (
                            <div className="mt-4 flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigator.clipboard.writeText(userOrder.order_code)}
                              >
                                Copy Order Code
                              </Button>
                              <Button
                                size="sm"
                                asChild
                                className="bg-green-600 text-white hover:bg-green-700"
                              >
                                <a
                                  href={`https://wa.me/6391549012244?text=Hi, I'd like to pay for my order ${userOrder.order_code}. My total is ₱${userOrder.total_amount.toLocaleString()}.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Phone className="mr-2 h-4 w-4" />
                                  Pay Now
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Batch Actions */}
                      <div className="border-t border-purple-200 pt-6">
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                          {isPaymentPhase
                            ? (
                                <Button size="lg" className="bg-yellow-500 text-white hover:bg-yellow-600" asChild>
                                  <Link href={`/products/group-buy/${activeBatch.id}`}>
                                    <AlertCircle className="mr-2 h-5 w-5" />
                                    {userOrder ? 'View Payment Details' : 'Enter Order Code'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Link>
                                </Button>
                              )
                            : (
                                <Button size="lg" className="bg-purple-500 text-white hover:bg-purple-600" asChild>
                                  <Link href={`/products/group-buy/${activeBatch.id}`}>
                                    <Users className="mr-2 h-5 w-5" />
                                    {userOrder ? 'View Your Order' : 'Join This Batch'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                          <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50" asChild>
                            <Link href="/products/group-buy">
                              <TrendingUp className="mr-2 h-5 w-5" />
                              View All Batches
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </>
                  )
                : (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                        <Package className="h-8 w-8 text-purple-400" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-gray-900">No Products in Batch</h3>
                      <p className="mb-6 text-gray-600">This batch doesn't have any products yet.</p>
                      <Button size="lg" variant="outline" asChild>
                        <Link href="/products/group-buy">
                          <TrendingUp className="mr-2 h-5 w-5" />
                          View All Batches
                        </Link>
                      </Button>
                    </div>
                  )}
            </CardContent>

            {isPaymentPhase && !userOrder && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                <div className="rounded-xl border border-purple-200 bg-purple-50/80 px-6 py-4 text-center shadow">
                  <Badge className="mb-2 bg-yellow-100 text-yellow-800">Payment Phase</Badge>
                  <div className="mb-3 text-sm text-gray-700">
                    Orders are closed. Click below to enter your order code and view payment progress.
                  </div>
                  <Button size="sm" className="bg-yellow-500 text-white hover:bg-yellow-600" asChild>
                    <Link href={`/products/group-buy/${activeBatch.id}`}>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Enter Order Code
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
