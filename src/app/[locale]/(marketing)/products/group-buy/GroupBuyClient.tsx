'use client';

import {
  Calendar,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  product?: Product;
  target_vials: number;
  current_vials: number;
  price_per_vial?: number;
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
  group_buy_products: BatchProduct[];
};

export default function GroupBuyClient() {
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [productQuantities, setProductQuantities] = useState<Record<number, number>>({});
  const { dispatch } = useCart();

  const fetchActiveBatch = async () => {
    try {
      // First, test basic connection
      const { data: _testData, error: testError } = await supabase
        .from('group_buy_batches')
        .select('id, name, status')
        .limit(1);

      if (testError) {
        throw testError;
      }

      // Now try the full query
      const { data, error } = await supabase
        .from('group_buy_batches')
        .select(`
          *,
          group_buy_products(
            product_id,
            target_vials,
            current_vials
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Check if it's a "no rows" error (which is expected if no active batch exists)
        if (error.code === 'PGRST116') {
          setActiveBatch(null);
          return;
        }

        // For other errors, try a simpler query
        const { data: simpleData, error: simpleError } = await supabase
          .from('group_buy_batches')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);

        if (simpleError) {
          setActiveBatch(null);
          return;
        }

        setActiveBatch(simpleData as unknown as Batch);
        return;
      }

      // Fetch products separately if we have batch products
      if (data && data.group_buy_products && data.group_buy_products.length > 0) {
        const productIds = data.group_buy_products.map((bp: BatchProduct) => bp.product_id) as number[];

        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds as number[]);

        if (productsError) {

          // Continue with batch data even if products fail
        } else {
          // Combine batch products with product data
          const enrichedBatchProducts = data.group_buy_products.map((bp: BatchProduct) => ({
            ...bp,
            product: products?.find(p => p.id === bp.product_id),
          }));

          data.group_buy_products = enrichedBatchProducts;
        }
      }

      setActiveBatch(data as Batch);

      // Initialize quantities to 0
      const initialQuantities: Record<number, number> = {};
      data?.group_buy_products?.forEach((bp: BatchProduct) => {
        initialQuantities[bp.product_id] = 0;
      });
      setProductQuantities(initialQuantities);
    } catch {
      setActiveBatch(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveBatch();
  }, []);

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
    return { text: `${remaining} left`, color: 'bg-green-100 text-green-800' };
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity),
    }));
  };

  const addToCart = (batchProduct: BatchProduct) => {
    const quantity = productQuantities[batchProduct.product_id] || 0;
    if (quantity <= 0) {
      return;
    }

    const cartItem = {
      id: `group-buy-${activeBatch?.id}-${batchProduct.product_id}`,
      name: batchProduct.product?.name || 'Unknown Product',
      price: batchProduct.price_per_vial || batchProduct.product?.price_per_vial || 0,
      quantity,
      type: 'group-buy' as const,
      image: batchProduct.product?.image_url || undefined,
      batchId: activeBatch?.id.toString() || '',
      productId: batchProduct.product_id,
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
    if (!activeBatch || !activeBatch.group_buy_products) {
      return 0;
    }
    return activeBatch.group_buy_products.reduce((total, bp) => {
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
    <div className="container mx-auto px-4 py-8">
      {/* Batch Header */}
      <div className="mb-8 text-center">
        <Badge className="mb-4 border-green-200 bg-green-100 text-green-800">
          <Users className="mr-1 h-3 w-3" />
          Active Group Buy Batch
        </Badge>
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">
          {activeBatch.name}
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          {activeBatch.description || 'Join this active group buy batch to get better prices on premium peptides'}
        </p>
      </div>

      {/* Batch Overview Card */}
      <Card className="mb-8 border-green-200 shadow-lg">
        <CardHeader className="rounded-t-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{activeBatch.name}</CardTitle>
              <CardDescription className="mt-2 text-green-100">
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
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {progressPercentage}
                %
              </div>
              <div className="text-sm text-green-100">Complete</div>
            </div>
          </div>
          <div className="mt-4 h-3 w-full rounded-full bg-green-200/30">
            <div
              className="h-3 rounded-full bg-white transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <Calendar className="mx-auto mb-2 h-8 w-8 text-green-600" />
              <div className="text-sm text-muted-foreground">Batch Duration</div>
              <div className="font-semibold">
                {new Date(activeBatch.start_date).toLocaleDateString()}
                {' '}
                -
                {new Date(activeBatch.end_date).toLocaleDateString()}
              </div>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <TrendingUp className="mx-auto mb-2 h-8 w-8 text-blue-600" />
              <div className="text-sm text-muted-foreground">Current Progress</div>
              <div className="font-semibold">
                {activeBatch.current_vials}
                {' '}
                /
                {' '}
                {activeBatch.target_vials}
                {' '}
                vials
              </div>
            </div>
            <div className="rounded-lg bg-purple-50 p-4 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-purple-600" />
              <div className="text-sm text-muted-foreground">Participants</div>
              <div className="font-semibold">Join now!</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Section */}
      {activeBatch && activeBatch.group_buy_products && activeBatch.group_buy_products.length > 0
        ? (
            <div className="space-y-6">
              <h2 className="mb-6 text-center text-2xl font-bold">Available Products</h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeBatch.group_buy_products.map((batchProduct) => {
                  const product = batchProduct.product;
                  const remaining = getRemainingVials(batchProduct.current_vials, batchProduct.target_vials);
                  const productProgress = getProductProgressPercentage(batchProduct.current_vials, batchProduct.target_vials);
                  const status = getVialStatus(remaining);
                  const quantity = productQuantities[batchProduct.product_id] || 0;
                  const price = product?.price_per_vial || 0;

                  return (
                    <Card key={batchProduct.product_id} className="group transition-shadow hover:shadow-lg">
                      <CardHeader>
                        <div className="mb-3 flex items-center space-x-3">
                          {product?.image_url
                            ? (
                                <Image
                                  src={product.image_url}
                                  alt={product.name || 'Product'}
                                  width={48}
                                  height={48}
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                              )
                            : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 font-bold text-white">
                                  {(product?.name || 'P').charAt(0)}
                                </div>
                              )}
                          <div className="flex-1">
                            <CardTitle className="text-lg">{product?.name || 'Unknown Product'}</CardTitle>
                            <CardDescription className="text-sm">{product?.category || 'Unknown Category'}</CardDescription>
                          </div>
                          <Badge className={status.color}>{status.text}</Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Product Details */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Price per vial:</span>
                            <span className="font-bold text-green-600">
                              ₱
                              {price}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Progress:</span>
                            <span className="text-sm font-medium">
                              {batchProduct.current_vials}
                              /
                              {batchProduct.target_vials}
                              {' '}
                              vials
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-green-600 transition-all duration-300"
                              style={{ width: `${productProgress}%` }}
                            />
                          </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="space-y-2">
                          <Label htmlFor={`quantity-${batchProduct.product_id}`}>Quantity (vials)</Label>
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
                              id={`quantity-${batchProduct.product_id}`}
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
                          </div>
                          {quantity > 0 && (
                            <div className="text-sm text-muted-foreground">
                              Total: ₱
                              {(quantity * price).toLocaleString()}
                            </div>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                          className="w-full"
                          onClick={() => addToCart(batchProduct)}
                          disabled={quantity <= 0 || remaining === 0}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {remaining === 0 ? 'Sold Out' : `Add ${quantity} vial(s) to Cart`}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Cart Summary */}
              {totalItems > 0 && (
                <Card className="mt-8 border-purple-200 bg-purple-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Cart Summary</h3>
                        <p className="text-sm text-muted-foreground">
                          {totalItems}
                          {' '}
                          vial(s) selected • Total: ₱
                          {totalPrice.toLocaleString()}
                        </p>
                      </div>
                      <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        View Cart (
                        {totalItems}
                        )
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )
        : (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">No Products Available</h3>
              <p className="text-muted-foreground">
                This batch doesn't have any products yet.
              </p>
            </div>
          )}
    </div>
  );
}
