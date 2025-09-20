'use client';

import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  MapPin,
  Minus,
  Package,
  Phone,
  Plus,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Cart } from '@/components/cart/Cart';
import SubGroupCheckout from '@/components/SubGroupCheckout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ProductImage } from '@/components/ui/OptimizedImage';
import { useCart } from '@/contexts/CartContext';
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
  status: 'draft' | 'active' | 'payment_collection' | 'ordering' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  target_vials: number;
  current_vials: number;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  host_id: number;
  region_id: number | null;
  created_at: string;
  updated_at: string;
  batch_products: BatchProduct[];
};

type Region = {
  id: number;
  name: string;
  description: string | null;
  region: string;
  city: string;
  host_id: number | null;
  whatsapp_number: string | null;
  is_active: boolean;
  created_at: string;
  host?: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  active_batch?: SubGroupBatch;
};

export default function RegionSubGroupPage() {
  const params = useParams();
  const regionId = params.regionId as string;
  const [region, setRegion] = useState<Region | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use real-time hook for batch data
  const { activeBatch, loading: batchLoading } = useRealtimeSubGroupBatch(undefined, Number.parseInt(regionId));

  // Create a computed region with real-time batch data
  const regionWithBatch = useMemo(
    () => (region ? { ...region, active_batch: activeBatch } : null),
    [region, activeBatch],
  );

  // Cart functionality
  const { dispatch } = useCart();
  const [productQuantities, setProductQuantities] = useState<Record<number, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Order tracking
  const { userProfile } = useRole();
  const [userOrder, setUserOrder] = useState<any>(null);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity),
    }));
  }, []);

  const addToCart = useCallback((batchProduct: BatchProduct) => {
    const requested = productQuantities[batchProduct.product_id] || 0;
    const remaining = Math.max(0, batchProduct.target_vials - batchProduct.current_vials);
    const clamped = Math.min(requested, remaining);
    if (clamped <= 0) {
      return;
    }

    // Guard clause: ensure we have the required region and batch data
    if (!regionWithBatch || !regionWithBatch.active_batch || !regionWithBatch.id) {
      console.warn('Cannot add to cart: missing region or batch data', {
        regionWithBatch,
        hasActiveBatch: !!regionWithBatch?.active_batch,
        hasId: !!regionWithBatch?.id,
      });
      return;
    }

    const cartItem = {
      id: `subgroup-${regionWithBatch.active_batch.id}-${batchProduct.product_id}`,
      name: batchProduct.product.name,
      price: batchProduct.price_per_vial,
      quantity: clamped,
      type: 'subgroup' as const,
      image: batchProduct.product.image_url || undefined,
      batchId: regionWithBatch.active_batch.id.toString(),
      productId: batchProduct.product_id,
      maxQuantity: remaining,
      subGroupId: regionWithBatch.id,
      subGroupName: regionWithBatch.name,
      regionWhatsapp: regionWithBatch.whatsapp_number || undefined,
    };

    dispatch({ type: 'ADD_ITEM', payload: cartItem });

    // Reset quantity after adding to cart
    setProductQuantities(prev => ({
      ...prev,
      [batchProduct.product_id]: 0,
    }));
  }, [productQuantities, regionWithBatch, dispatch]);

  const getTotalItems = () => {
    return Object.values(productQuantities).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    if (!regionWithBatch?.active_batch?.batch_products) {
      return 0;
    }
    return regionWithBatch.active_batch.batch_products.reduce((total, bp) => {
      const quantity = productQuantities[bp.product_id] || 0;
      const price = bp.price_per_vial;
      return total + (quantity * price);
    }, 0);
  };

  useEffect(() => {
    const fetchRegion = async () => {
      try {
        const { data: regionData, error: regionError } = await supabase
          .from('sub_groups')
          .select(`
            *,
            host:users!sub_groups_host_id_fkey(
              id,
              first_name,
              last_name,
              email
            )
          `)
          .eq('id', regionId)
          .eq('is_active', true)
          .single();

        if (regionError) {
          console.warn('Error fetching region:', regionError);
          setError('Region not found');
          return;
        }

        if (!regionData) {
          setError('Region not found');
          return;
        }

        setRegion(regionData);
      } catch (error) {
        console.warn('Error fetching region:', error);
        setError('Failed to load region');
      }
    };

    if (regionId) {
      fetchRegion();
    }
  }, [regionId]);

  // Fetch user's order for the active sub-group batch
  const fetchUserOrder = useCallback(async () => {
    if (!userProfile || !regionWithBatch?.active_batch) {
      return;
    }

    try {
      const { data: orders } = await supabase
        .from('sub_group_orders')
        .select(`
          *,
          order_items:sub_group_order_items(
            *,
            product:products(*)
          )
        `)
        .eq('batch_id', regionWithBatch.active_batch.id)
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (orders && orders.length > 0) {
        setUserOrder(orders[0]);
      } else {
        setUserOrder(null);
      }
    } catch (error) {
      console.warn('Error fetching user order:', error);
      setUserOrder(null);
    }
  }, [userProfile, regionWithBatch?.active_batch]);

  // Auto-fetch user's order when logged in and batch is loaded
  useEffect(() => {
    if (userProfile && regionWithBatch?.active_batch) {
      fetchUserOrder();
    }
  }, [userProfile, regionWithBatch?.active_batch, fetchUserOrder]);

  const getProgressPercentage = (batch: SubGroupBatch) => {
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

  if (batchLoading || !regionWithBatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading region...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !region) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900">Region Not Found</h1>
            <p className="mb-8 text-xl text-gray-600">{error || 'The requested region could not be found.'}</p>
            <Button size="lg" asChild>
              <Link href="/">
                <ArrowRight className="mr-2 h-5 w-5" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveBatch = regionWithBatch.active_batch && regionWithBatch.active_batch.status === 'active';
  const daysRemaining = hasActiveBatch
    ? getDaysRemaining(regionWithBatch.active_batch!.end_date)
    : 0;
  const progressPercentage = hasActiveBatch
    ? getProgressPercentage(regionWithBatch.active_batch!)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-20">
        {/* Region Header */}
        <div className="mb-12 text-center">
          <Badge className="mb-4 border-blue-200 bg-blue-100 text-blue-800">
            <MapPin className="mr-1 h-3 w-3" />
            {regionWithBatch.region}
            {' '}
            •
            {regionWithBatch.city}
          </Badge>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">{regionWithBatch.name}</h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            {regionWithBatch.description || `Regional peptide community in ${regionWithBatch.region}, ${regionWithBatch.city}`}
          </p>
          {regionWithBatch.host && (
            <div className="mt-4 text-sm text-gray-500">
              Hosted by:
              {' '}
              {regionWithBatch.host.first_name || ''}
              {' '}
              {regionWithBatch.host.last_name || ''}
            </div>
          )}
        </div>

        {/* Active Batch Section */}
        {hasActiveBatch
          ? (
              <div className="mx-auto max-w-4xl">
                <Card className="relative overflow-hidden border-blue-200 shadow-lg">
                  <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-600 to-blue-800 py-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="pt-2 text-2xl">{regionWithBatch.active_batch!.name}</CardTitle>
                        <CardDescription className="mt-2 text-blue-100">
                          Active Sub-Group Batch •
                          {' '}
                          {daysRemaining > 0 ? `Ends in ${daysRemaining} days` : 'Ended'}
                          {' '}
                          •
                          {' '}
                          {regionWithBatch.active_batch!.current_vials}
                          /
                          {regionWithBatch.active_batch!.target_vials}
                          {' '}
                          vials filled
                        </CardDescription>
                        {regionWithBatch.active_batch!.description && (
                          <p className="mt-2 text-sm text-blue-100">{regionWithBatch.active_batch!.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">
                          {progressPercentage}
                          %
                        </div>
                        <div className="text-sm text-blue-100">Complete</div>
                      </div>
                    </div>
                    <div className="mt-4 h-3 w-full rounded-full bg-blue-200/30">
                      <div
                        className="h-3 rounded-full bg-white transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {regionWithBatch.active_batch!.batch_products && regionWithBatch.active_batch!.batch_products.length > 0
                      ? (
                          <>
                            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                              {regionWithBatch.active_batch!.batch_products.map((batchProduct) => {
                                const product = batchProduct.product;
                                const remaining = getRemainingVials(batchProduct.current_vials, batchProduct.target_vials);
                                const productProgress = getProductProgressPercentage(batchProduct.current_vials, batchProduct.target_vials);
                                const status = getVialStatus(remaining);

                                return (
                                  <div key={batchProduct.product_id} className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <ProductImage
                                          src={product.image_url}
                                          alt={product.name}
                                          size="small"
                                        />
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
                                        <span className="font-bold text-blue-600">
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
                                      <div className="h-2 w-full rounded-full bg-blue-200">
                                        <div
                                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                                          style={{ width: `${productProgress}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Product Selection */}
                            <div className="border-t border-blue-200 pt-6">
                              <h3 className="mb-4 text-lg font-semibold">Select Products to Order</h3>
                              <div className="space-y-4">
                                {regionWithBatch.active_batch?.batch_products?.map((batchProduct) => {
                                  const product = batchProduct.product;
                                  const remaining = Math.max(0, batchProduct.target_vials - batchProduct.current_vials);
                                  const quantity = productQuantities[batchProduct.product_id] || 0;
                                  const price = batchProduct.price_per_vial;

                                  return (
                                    <div key={batchProduct.product_id} className="flex items-center justify-between rounded-lg border p-4">
                                      <div className="flex items-center space-x-4">
                                        <ProductImage
                                          src={product.image_url}
                                          alt={product.name}
                                          size="small"
                                        />
                                        <div>
                                          <h4 className="font-medium">{product.name}</h4>
                                          <p className="text-sm text-muted-foreground">
                                            ₱
                                            {price.toLocaleString()}
                                            {' '}
                                            per vial •
                                            {' '}
                                            {remaining}
                                            {' '}
                                            vials available
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={() => updateQuantity(batchProduct.product_id, quantity - 1)}
                                          disabled={quantity <= 0}
                                        >
                                          <Minus className="h-4 w-4" />
                                        </Button>
                                        <Input
                                          type="number"
                                          min="0"
                                          max={remaining}
                                          value={quantity}
                                          onChange={e => updateQuantity(batchProduct.product_id, Number.parseInt(e.target.value) || 0)}
                                          className="w-20 text-center"
                                        />
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={() => updateQuantity(batchProduct.product_id, quantity + 1)}
                                          disabled={quantity >= remaining}
                                        >
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          onClick={() => addToCart(batchProduct)}
                                          disabled={quantity <= 0 || remaining === 0}
                                          className="ml-2"
                                        >
                                          <ShoppingCart className="mr-2 h-4 w-4" />
                                          Add to Cart
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

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
                                        {userOrder.order_items?.length || 0}
                                        {' '}
                                        product(s)
                                      </div>
                                    </div>
                                  </div>
                                  {userOrder.payment_status === 'pending' && (
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
                                          href={`https://wa.me/${regionWithBatch.whatsapp_number}?text=Hi, I'd like to pay for my order ${userOrder.order_code}. My total is ₱${userOrder.total_amount.toLocaleString()}.`}
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

                              {/* Cart Summary */}
                              {getTotalItems() > 0 && (
                                <div className="mt-6 rounded-lg bg-blue-50 p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-semibold">Cart Summary</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {getTotalItems()}
                                        {' '}
                                        vial(s) selected • Total: ₱
                                        {getTotalPrice().toLocaleString()}
                                      </p>
                                    </div>

                                  </div>
                                </div>
                              )}

                              {/* Back to Regions */}
                              <div className="mt-4 flex justify-center">
                                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50" asChild>
                                  <Link href="/products/sub-groups">
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    View All Regions
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </>
                        )
                      : (
                          <div className="py-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                              <Package className="h-8 w-8 text-blue-400" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900">No Products in Batch</h3>
                            <p className="mb-6 text-gray-600">This batch doesn't have any products yet.</p>
                            <Button size="lg" variant="outline" asChild>
                              <Link href="/products/sub-groups">
                                <TrendingUp className="mr-2 h-5 w-5" />
                                View All Regions
                              </Link>
                            </Button>
                          </div>
                        )}
                  </CardContent>
                </Card>
              </div>
            )
          : (
              <div className="mx-auto max-w-4xl">
                <Card className="border-gray-200 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">No Active Batch</h3>
                    <p className="mb-6 text-gray-600">
                      There are currently no active batches in this region. Check back soon for new opportunities!
                    </p>
                    {regionWithBatch.whatsapp_number && (
                      <div className="mb-6 rounded-lg bg-green-50 p-4">
                        <p className="text-sm text-green-800">
                          Contact the host directly:
                          {' '}
                          {regionWithBatch.whatsapp_number}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                      <Button size="lg" variant="outline" asChild>
                        <Link href="/products">
                          <Package className="mr-2 h-5 w-5" />
                          Browse Individual Products
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild>
                        <Link href="/products/sub-groups">
                          <MapPin className="mr-2 h-5 w-5" />
                          View All Regions
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
      </div>

      {/* Cart Component */}
      <Cart isOpen={isCartOpen} onOpenChangeAction={setIsCartOpen} />

      {/* Sub-Group Checkout Dialog */}
      {regionWithBatch?.active_batch && (
        <SubGroupCheckout
          batchId={regionWithBatch.active_batch.id}
          batchName={regionWithBatch.active_batch.name}
          regionWhatsapp={regionWithBatch.whatsapp_number || ''}
          subGroupId={regionWithBatch.id}
          subGroupName={regionWithBatch.name}
          isOpen={isCheckoutOpen}
          onCloseAction={() => setIsCheckoutOpen(false)}
          onOrderSuccessAction={fetchUserOrder}
        />
      )}
    </div>
  );
}
