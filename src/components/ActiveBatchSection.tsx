'use client';

import {
  AlertCircle,
  ArrowRight,
  Package,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function ActiveBatchSection() {
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveBatch();
  }, []);

  const fetchActiveBatch = async () => {
    try {
      // Fetch the active batch with its products
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
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching active batch:', error);
        setActiveBatch(null);
      } else {
        setActiveBatch(data);
      }
    } catch (error) {
      console.error('Error fetching active batch:', error);
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

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge className="mb-4 border-green-200 bg-green-100 text-green-800">
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
            <Card className="border-green-200 shadow-lg">
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
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-20">
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

  return (
    <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <Badge className="mb-4 border-green-200 bg-green-100 text-green-800">
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
          <Card className="border-green-200 shadow-lg">
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
                  {activeBatch.description && (
                    <p className="mt-2 text-sm text-green-100">{activeBatch.description}</p>
                  )}
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
              {activeBatch.batch_products && activeBatch.batch_products.length > 0 ? (
                <>
                  <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {activeBatch.batch_products.map((batchProduct) => {
                      const product = batchProduct.product;
                      const remaining = getRemainingVials(batchProduct.current_vials, batchProduct.target_vials);
                      const productProgress = getProductProgressPercentage(batchProduct.current_vials, batchProduct.target_vials);
                      const status = getVialStatus(remaining);

                      return (
                        <div key={batchProduct.product_id} className="rounded-lg border border-green-200 bg-green-50/50 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {product.image_url
                                ? (
                                    <img
                                      src={product.image_url}
                                      alt={product.name}
                                      className="h-10 w-10 rounded-lg object-cover"
                                    />
                                  )
                                : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-sm font-bold text-white">
                                      {product.name.charAt(0)}
                                    </div>
                                  )}
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
                              <span className="font-bold text-green-600">
                                ₱
                                {batchProduct.price_per_vial}
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
                            <div className="h-2 w-full rounded-full bg-green-200">
                              <div
                                className="h-2 rounded-full bg-green-600 transition-all duration-300"
                                style={{ width: `${productProgress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Batch Actions */}
                  <div className="border-t border-green-200 pt-6">
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                      <Button size="lg" className="bg-green-600 text-white hover:bg-green-700" asChild>
                        <Link href={`/products/group-buy/${activeBatch.id}`}>
                          <Users className="mr-2 h-5 w-5" />
                          Join This Batch
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50" asChild>
                        <Link href="/products/group-buy">
                          <TrendingUp className="mr-2 h-5 w-5" />
                          View All Batches
                        </Link>
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Package className="h-8 w-8 text-green-400" />
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
          </Card>
        </div>
      </div>
    </section>
  );
}
