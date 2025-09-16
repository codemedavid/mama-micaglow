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
import Link from 'next/link';
import { useEffect, useState } from 'react';
import GroupBuyCheckout from '@/components/GroupBuyCheckout';
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
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { dispatch } = useCart();

  useEffect(() => {
    fetchActiveBatch();
  }, []);

  // Realtime updates for batch and product progress
  useEffect(() => {
    if (!activeBatch?.id) {
      return;
    }

    const channel = supabase.channel(`group-buy-realtime-${activeBatch.id}`, {
      config: { broadcast: { ack: true }, presence: { key: `${activeBatch.id}` } },
    });

    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'group_buy_batches', filter: `id=eq.${activeBatch.id}` },
      (payload) => {
        const nextCurrent = (payload as any)?.new?.current_vials;
        if (typeof nextCurrent === 'number') {
          setActiveBatch(prev => (prev ? { ...prev, current_vials: nextCurrent } : prev));
        }
      },
    );

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'group_buy_products', filter: `batch_id=eq.${activeBatch.id}` },
      (payload) => {
        const newRow = (payload as any)?.new;
        const productId = newRow?.product_id;
        const currentVials = newRow?.current_vials;
        const targetVials = newRow?.target_vials;
        if (typeof productId !== 'number') {
          return;
        }

        setActiveBatch((prev) => {
          if (!prev?.group_buy_products) {
            return prev;
          }
          const updated = prev.group_buy_products.map(bp =>
            bp.product_id === productId
              ? {
                  ...bp,
                  current_vials: typeof currentVials === 'number' ? currentVials : bp.current_vials,
                  target_vials: typeof targetVials === 'number' ? targetVials : bp.target_vials,
                }
              : bp,
          );
          return { ...prev, group_buy_products: updated };
        });
      },
    );

    channel.subscribe((status) => {
      console.log('Realtime channel status:', status);
    });

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {}
    };
  }, [activeBatch?.id]);

  const fetchActiveBatch = async () => {
    try {
      console.log('Starting fetchActiveBatch...');

      // First, test basic connection
      console.log('Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('group_buy_batches')
        .select('id, name, status')
        .limit(1);

      if (testError) {
        console.error('Connection test failed:', testError);
        console.error('Error details:', {
          message: testError?.message || 'No message',
          code: testError?.code || 'No code',
          details: testError?.details || 'No details',
          hint: testError?.hint || 'No hint',
        });
        console.error('Connection test error (stringified):', JSON.stringify(testError, null, 2));
        throw testError;
      }

      console.log('Connection test successful:', testData);

      // Now try the full query
      console.log('Fetching full batch data...');
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
        console.error('Full query failed:', error);
        console.error('Error details:', {
          message: error?.message || 'No message',
          code: error?.code || 'No code',
          details: error?.details || 'No details',
          hint: error?.hint || 'No hint',
        });
        console.error('Full error object (stringified):', JSON.stringify(error, null, 2));

        // Check if it's a "no rows" error (which is expected if no active batch exists)
        if (error.code === 'PGRST116') {
          console.log('No active batch found - this is expected if no batch is active');
          setActiveBatch(null);
          return;
        }

        // For other errors, try a simpler query
        console.log('Trying simpler query...');
        const { data: simpleData, error: simpleError } = await supabase
          .from('group_buy_batches')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);

        if (simpleError) {
          console.error('Simple query also failed:', simpleError);
          console.error('Simple error details:', {
            message: simpleError?.message || 'No message',
            code: simpleError?.code || 'No code',
            details: simpleError?.details || 'No details',
            hint: simpleError?.hint || 'No hint',
          });
          console.error('Simple error object (stringified):', JSON.stringify(simpleError, null, 2));
          setActiveBatch(null);
          return;
        }

        console.log('Simple query succeeded:', simpleData);
        setActiveBatch(simpleData as unknown as Batch);
        return;
      }

      console.log('Full query succeeded:', data);

      // Fetch products separately if we have batch products
      if (data && data.group_buy_products && data.group_buy_products.length > 0) {
        console.log('Fetching products for batch...');
        console.log('Batch products (raw):', JSON.stringify(data.group_buy_products, null, 2));
        const productIds = data.group_buy_products.map((bp: BatchProduct) => bp.product_id);
        console.log('Product IDs to fetch:', productIds);
        console.log('Product ID types:', productIds.map((id: number) => ({ id, type: typeof id })));

        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        if (productsError) {
          console.error('Error fetching products:', productsError);
          console.error('Products error details:', JSON.stringify(productsError, null, 2));
        } else {
          console.log('Products fetched successfully:', products);
          console.log('Number of products found:', products?.length || 0);

          if (!products || products.length === 0) {
            console.log('No products found! Checking if products table has any data...');
            // Check if products table has any data at all
            const { data: allProducts, error: allProductsError } = await supabase
              .from('products')
              .select('*')
              .limit(5);

            if (allProductsError) {
              console.error('Error fetching all products:', allProductsError);
            } else {
              console.log('All products in database:', allProducts);
            }
          }

          // Combine batch products with product data
          const enrichedBatchProducts = data.group_buy_products.map((bp: BatchProduct) => {
            console.log(`Looking for product with ID: ${bp.product_id} (type: ${typeof bp.product_id})`);
            console.log(`Available products:`, products?.map(p => ({ id: p.id, name: p.name, type: typeof p.id })));

            const product = products?.find(p => p.id === bp.product_id);
            console.log(`Found product for ID ${bp.product_id}:`, product);

            // Try alternative matching methods
            if (!product) {
              console.log(`No exact match found. Trying alternative matching...`);
              const altProduct1 = products?.find(p => p.id == bp.product_id); // Loose equality
              const altProduct2 = products?.find(p => String(p.id) === String(bp.product_id)); // String comparison
              console.log(`Loose equality match:`, altProduct1);
              console.log(`String comparison match:`, altProduct2);
            }

            return {
              ...bp,
              product,
            };
          });

          console.log('Enriched batch products:', enrichedBatchProducts);
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
    } catch (error) {
      console.error('Error in fetchActiveBatch (catch block):', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Full error object:', error);
      setActiveBatch(null);
    } finally {
      setLoading(false);
    }
  };

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
    // Find the batch product to get remaining vials
    const batchProduct = activeBatch?.group_buy_products?.find(bp => bp.product_id === productId);
    if (batchProduct) {
      const remaining = getRemainingVials(batchProduct.current_vials, batchProduct.target_vials);
      const clampedQuantity = Math.max(0, Math.min(quantity, remaining));
      setProductQuantities(prev => ({
        ...prev,
        [productId]: clampedQuantity,
      }));
    } else {
      setProductQuantities(prev => ({
        ...prev,
        [productId]: Math.max(0, quantity),
      }));
    }
  };

  const addToCart = (batchProduct: BatchProduct) => {
    const quantity = productQuantities[batchProduct.product_id] || 0;
    if (quantity <= 0) {
      return;
    }

    const remaining = getRemainingVials(batchProduct.current_vials, batchProduct.target_vials);

    // Check if trying to add more than available
    if (quantity > remaining) {
      alert(`Cannot add ${quantity} vials. Only ${remaining} vials remaining for ${batchProduct.product?.name || 'this product'}.`);
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
      maxQuantity: remaining,
    };

    dispatch({ type: 'ADD_ITEM', payload: cartItem });

    // Reset quantity after adding to cart
    setProductQuantities(prev => ({
      ...prev,
      [batchProduct.product_id]: 0,
    }));

    // Removed success alert to avoid intrusive popups on add to cart
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
      const price = bp.price_per_vial || (bp.product?.price_per_vial || 0);
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
      {activeBatch && activeBatch.group_buy_products && activeBatch.group_buy_products.length > 0 ? (
        <div className="space-y-6">
          <h2 className="mb-6 text-center text-2xl font-bold">Available Products</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeBatch.group_buy_products.map((batchProduct) => {
              const product = batchProduct.product;
              const remaining = getRemainingVials(batchProduct.current_vials, batchProduct.target_vials);
              const productProgress = getProductProgressPercentage(batchProduct.current_vials, batchProduct.target_vials);
              const status = getVialStatus(remaining);
              const quantity = productQuantities[batchProduct.product_id] || 0;
              const price = batchProduct.price_per_vial || product?.price_per_vial || 0;

              return (
                <Card key={batchProduct.product_id} className="group transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-3 flex items-center space-x-3">
                      {product?.image_url
                        ? (
                            <img
                              src={product.image_url}
                              alt={product.name || 'Product'}
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
                  <div className="flex gap-3">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-purple-600 bg-white text-purple-600 hover:bg-purple-50"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      View Cart (
                      {totalItems}
                      )
                    </Button>
                    <Button
                      size="lg"
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => setIsCheckoutOpen(true)}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Proceed to Checkout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-xl font-semibold">No Products Available</h3>
          <p className="text-muted-foreground">
            This batch doesn't have any products yet.
          </p>
        </div>
      )}

      {/* Checkout Modal */}
      {activeBatch && (
        <GroupBuyCheckout
          batchId={activeBatch.id}
          batchName={activeBatch.name}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          prefillItems={
            activeBatch.group_buy_products
              ?.map(bp => ({
                id: `group-buy-${activeBatch.id}-${bp.product_id}`,
                name: bp.product?.name || 'Unknown Product',
                price: bp.price_per_vial || (bp.product?.price_per_vial || 0),
                quantity: productQuantities[bp.product_id] || 0,
                type: 'group-buy' as const,
                batchId: String(activeBatch.id),
                productId: bp.product_id,
              }))
              .filter(item => item.quantity > 0) || []
          }
          prefillTotal={getTotalPrice()}
        />
      )}
    </div>
  );
}
