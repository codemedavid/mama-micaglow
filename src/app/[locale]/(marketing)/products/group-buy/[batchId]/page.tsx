'use client';

import { useUser } from '@clerk/nextjs';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Minus,
  Plus as PlusIcon,
  ShoppingCart,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useCart } from '@/contexts/CartContext';
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
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  target_vials: number;
  current_vials: number;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  created_at: string;
  batch_products: BatchProduct[];
};

type VialOrder = {
  product_id: number;
  vials: number;
};

export default function GroupBuyBatchPage({ params }: { params: { batchId: string } }) {
  const { user, isSignedIn } = useUser();
  const { addToCart } = useCart();
  const router = useRouter();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [vialOrders, setVialOrders] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBatch();
  }, [params.batchId]);

  const fetchBatch = async () => {
    try {
      const { data, error } = await supabase
        .from('group_buy_batches')
        .select(`
          *,
          batch_products:group_buy_products(
            product_id,
            target_vials,
            current_vials,
            price_per_vial,
            product:products(*)
          )
        `)
        .eq('id', params.batchId)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching batch:', error);
        router.push('/products/group-buy');
        return;
      }

      setBatch(data);
    } catch (error) {
      console.error('Error fetching batch:', error);
      router.push('/products/group-buy');
    } finally {
      setLoading(false);
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
      return sum + (product ? product.price_per_vial * vials : 0);
    }, 0);
  };

  const getProgressPercentage = (batchProduct: BatchProduct) => {
    if (batchProduct.target_vials === 0) {
      return 0;
    }
    return Math.round((batchProduct.current_vials / batchProduct.target_vials) * 100);
  };

  const getBatchProgressPercentage = () => {
    if (!batch || batch.target_vials === 0) {
      return 0;
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
          addToCart({
            id: `group-buy-${product.product_id}-${batch?.id}`,
            name: product.product.name,
            price: product.price_per_vial,
            quantity: vials,
            type: 'group-buy',
            image: product.product.image_url,
            batchId: batch?.id,
            productId: product.product_id,
          });
        }
      }
    });

    setVialOrders({});
    router.push('/cart');
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
                <div className="mb-1 text-2xl font-bold">{batch.current_vials}</div>
                <div className="text-sm text-purple-100">Vials Purchased</div>
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
                <div className="text-sm text-purple-100">Progress</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold">
                  {isBatchComplete() ? 'Complete!' : 'Active'}
                </div>
                <div className="text-sm text-purple-100">Status</div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>
                  {getBatchProgressPercentage()}
                  %
                </span>
              </div>
              <Progress value={getBatchProgressPercentage()} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        {!isBatchComplete() && (
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

        {isBatchComplete() && (
          <Alert className="mb-8 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Batch Complete!</strong>
              {' '}
              All vials have been purchased. Orders are now being processed and payments are being collected.
            </AlertDescription>
          </Alert>
        )}

        {/* Products Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {batch.batch_products?.map(batchProduct => (
            <Card key={batchProduct.product_id} className="group border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {batchProduct.product.image_url
                      ? (
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                            <img
                              src={batchProduct.product.image_url}
                              alt={batchProduct.product.name}
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
                    <div className="text-2xl font-bold text-green-600">
                      ₱
                      {batchProduct.price_per_vial}
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
                      <span className="text-gray-600">Vials Progress</span>
                      <span className="font-semibold">
                        {getProgressPercentage(batchProduct)}
                        %
                      </span>
                    </div>
                    <Progress value={getProgressPercentage(batchProduct)} className="h-2" />
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>
                        {batchProduct.current_vials}
                        {' '}
                        purchased
                      </span>
                      <span>
                        {batchProduct.target_vials}
                        {' '}
                        needed
                      </span>
                    </div>
                  </div>

                  {/* Vial Ordering */}
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium">Order Vials</Label>
                    <div className="mt-2 flex items-center space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateVialOrder(batchProduct.product_id, (vialOrders[batchProduct.product_id] || 0) - 1)}
                        disabled={(vialOrders[batchProduct.product_id] || 0) <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        max={batchProduct.target_vials - batchProduct.current_vials}
                        value={vialOrders[batchProduct.product_id] || 0}
                        onChange={e => updateVialOrder(batchProduct.product_id, Number.parseInt(e.target.value) || 0)}
                        className="w-20 text-center"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateVialOrder(batchProduct.product_id, (vialOrders[batchProduct.product_id] || 0) + 1)}
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        {getTotalVials() > 0 && (
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
