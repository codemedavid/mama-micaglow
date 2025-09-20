'use client';

import { MapPin, Minus, Package, Plus, ShoppingCart } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import SimpleSubGroupCheckout from '@/components/SimpleSubGroupCheckout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';

type Product = {
  id: number;
  name: string;
  category: string;
  price_per_vial: number;
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
  status: 'active' | 'completed' | 'cancelled';
  target_vials: number;
  current_vials: number;
  start_date: string;
  end_date: string;
  sub_group_id: number;
  batch_products: BatchProduct[];
};

type SubGroup = {
  id: number;
  name: string;
  description: string | null;
  region: string;
  city: string;
  whatsapp_number: string | null;
  is_active: boolean;
};

export default function SimpleSubGroupPage() {
  const params = useParams();
  const regionId = params.regionId as string;

  const [subGroup, setSubGroup] = useState<SubGroup | null>(null);
  const [activeBatch, setActiveBatch] = useState<SubGroupBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart functionality
  const { dispatch } = useCart();
  const [productQuantities, setProductQuantities] = useState<Record<number, number>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Fetch sub-group and active batch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sub-group
        const { data: subGroupData, error: subGroupError } = await supabase
          .from('sub_groups')
          .select('*')
          .eq('id', regionId)
          .eq('is_active', true)
          .single();

        if (subGroupError) {
          setError('Sub-group not found');
          return;
        }

        setSubGroup(subGroupData);

        // Fetch active batch with products
        const { data: batchData, error: batchError } = await supabase
          .from('sub_group_batches')
          .select(`
            *,
            batch_products:sub_group_batch_products(
              *,
              product:products(*)
            )
          `)
          .eq('sub_group_id', regionId)
          .in('status', ['active', 'payment_collection'])
          .single();

        if (!batchError && batchData) {
          setActiveBatch(batchData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (regionId) {
      fetchData();
    }
  }, [regionId]);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity),
    }));
  }, []);

  const addToCart = useCallback((batchProduct: BatchProduct) => {
    const quantity = productQuantities[batchProduct.product_id] || 0;
    const remaining = Math.max(0, batchProduct.target_vials - batchProduct.current_vials);
    const clamped = Math.min(quantity, remaining);

    if (clamped <= 0 || !subGroup || !activeBatch) {
      return;
    }

    const cartItem = {
      id: `subgroup-${activeBatch.id}-${batchProduct.product_id}`,
      name: batchProduct.product.name,
      price: batchProduct.price_per_vial,
      quantity: clamped,
      type: 'subgroup' as const,
      image: batchProduct.product.image_url || undefined,
      batchId: activeBatch.id.toString(),
      productId: batchProduct.product_id,
      maxQuantity: remaining,
      subGroupId: subGroup.id,
      subGroupName: subGroup.name,
      regionWhatsapp: subGroup.whatsapp_number || undefined,
    };

    dispatch({ type: 'ADD_ITEM', payload: cartItem });

    // Reset quantity
    setProductQuantities(prev => ({
      ...prev,
      [batchProduct.product_id]: 0,
    }));
  }, [productQuantities, subGroup, activeBatch, dispatch]);

  const getTotalItems = () => {
    return Object.values(productQuantities).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    if (!activeBatch?.batch_products) {
      return 0;
    }

    return activeBatch.batch_products.reduce((total, bp) => {
      const quantity = productQuantities[bp.product_id] || 0;
      return total + (quantity * bp.price_per_vial);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !subGroup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Sub-Group Not Found</h1>
          <p className="text-gray-600">{error || 'The requested sub-group could not be found.'}</p>
        </div>
      </div>
    );
  }

  if (!activeBatch) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8">
              <Badge className="mb-4">
                <MapPin className="mr-1 h-3 w-3" />
                {subGroup.region}
                {' '}
                •
                {subGroup.city}
              </Badge>
              <h1 className="mb-4 text-4xl font-bold text-gray-900">{subGroup.name}</h1>
              <p className="text-xl text-gray-600">
                {subGroup.description || `Regional peptide community in ${subGroup.region}, ${subGroup.city}`}
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                <div className="mb-4">
                  <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">No Active Batch</h3>
                  <p className="text-gray-600">
                    There are currently no active batches in this sub-group. Check back soon!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <Badge className="mb-4">
            <MapPin className="mr-1 h-3 w-3" />
            {subGroup.region}
            {' '}
            •
            {subGroup.city}
          </Badge>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">{subGroup.name}</h1>
          <p className="text-xl text-gray-600">
            {subGroup.description || `Regional peptide community in ${subGroup.region}, ${subGroup.city}`}
          </p>
        </div>

        {/* Active Batch */}
        <div className="mx-auto max-w-4xl">
          <Card className="shadow-lg">
            <CardHeader className="rounded-t-lg bg-blue-600 text-white">
              <CardTitle className="text-2xl">{activeBatch.name}</CardTitle>
              <p className="text-blue-100">
                Active Sub-Group Batch •
                {' '}
                {activeBatch.current_vials}
                /
                {activeBatch.target_vials}
                {' '}
                vials filled
              </p>
              {activeBatch.description && (
                <p className="mt-2 text-sm text-blue-100">{activeBatch.description}</p>
              )}
            </CardHeader>

            <CardContent className="p-6">
              {/* Products */}
              {activeBatch.batch_products && activeBatch.batch_products.length > 0
                ? (
                    <>
                      <div className="mb-6">
                        <h3 className="mb-4 text-lg font-semibold">Available Products</h3>
                        <div className="space-y-4">
                          {activeBatch.batch_products.map((batchProduct) => {
                            const product = batchProduct.product;
                            const remaining = Math.max(0, batchProduct.target_vials - batchProduct.current_vials);
                            const quantity = productQuantities[batchProduct.product_id] || 0;
                            const price = batchProduct.price_per_vial;

                            return (
                              <div key={batchProduct.product_id} className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex items-center space-x-4">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                    <Package className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{product.name}</h4>
                                    <p className="text-sm text-gray-600">
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
                      </div>

                      {/* Cart Summary */}
                      {getTotalItems() > 0 && (
                        <div className="mt-6 rounded-lg bg-blue-50 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">Cart Summary</h4>
                              <p className="text-sm text-gray-600">
                                {getTotalItems()}
                                {' '}
                                vial(s) selected • Total: ₱
                                {getTotalPrice().toLocaleString()}
                              </p>
                            </div>
                            <Button
                              size="lg"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => setIsCheckoutOpen(true)}
                            >
                              <ShoppingCart className="mr-2 h-5 w-5" />
                              Order Now (
                              {getTotalItems()}
                              )
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )
                : (
                    <div className="py-8 text-center">
                      <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                      <h3 className="mb-2 text-xl font-semibold text-gray-900">No Products Available</h3>
                      <p className="text-gray-600">This batch doesn't have any products yet.</p>
                    </div>
                  )}
            </CardContent>
          </Card>
        </div>

        {/* Checkout Dialog */}
        {subGroup && activeBatch && (
          <SimpleSubGroupCheckout
            batchId={activeBatch.id}
            batchName={activeBatch.name}
            subGroupId={subGroup.id}
            subGroupName={subGroup.name}
            regionWhatsapp={subGroup.whatsapp_number || undefined}
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            onSuccess={() => {
              // Refresh data or show success message
              console.error('Order created successfully!');
            }}
          />
        )}
      </div>
    </div>
  );
}
