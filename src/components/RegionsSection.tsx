'use client';

import {
  AlertCircle,
  ArrowRight,
  MapPin,
  Package,
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

export default function RegionsSection() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionsEnabled, setRegionsEnabled] = useState(true);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        // First check if regions feature is enabled
        const { data: settingData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'regions_enabled')
          .single();

        const isEnabled = settingData?.value === 'true';
        setRegionsEnabled(isEnabled);

        // If regions are disabled, don't fetch regions data
        if (!isEnabled) {
          setLoading(false);
          return;
        }

        const { data: regionsData, error: regionsError } = await supabase
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
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (regionsError) {
          setRegions([]);
          return;
        }

        // For each region with a host, fetch their active batch
        const regionsWithBatches = await Promise.all(
          (regionsData || []).map(async (region) => {
            if (!region.host_id) {
              return { ...region, active_batch: null };
            }

            const { data: batchData, error: batchError } = await supabase
              .from('sub_group_batches')
              .select(`
                *,
                batch_products:sub_group_batch_products(
                  *,
                  product:products(*)
                )
              `)
              .eq('host_id', region.host_id)
              .in('status', ['active', 'payment_collection'])
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (batchError) {
              return { ...region, active_batch: null };
            }

            return { ...region, active_batch: batchData };
          }),
        );

        setRegions(regionsWithBatches);
      } catch {
        setRegions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  // Don't render anything if regions feature is disabled
  if (!regionsEnabled) {
    return null;
  }

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

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge className="mb-4 border-blue-200 bg-blue-100 text-blue-800">
              <MapPin className="mr-1 h-3 w-3" />
              Loading Regions...
            </Badge>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Find Local Peptide Communities
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Fetching regional groups and active batches...
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video rounded-t-lg bg-gray-200"></div>
                <CardHeader>
                  <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-gray-200"></div>
                    <div className="h-3 w-2/3 rounded bg-gray-200"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (regions.length === 0) {
    return (
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge className="mb-4 border-gray-200 bg-gray-100 text-gray-800">
              <AlertCircle className="mr-1 h-3 w-3" />
              No Active Regions
            </Badge>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              No Regional Groups Available
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              There are currently no active regional groups. Check back soon for new communities!
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <Card className="border-gray-200 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <MapPin className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">No Regional Groups</h3>
                <p className="mb-6 text-gray-600">New regional groups will appear here when they become available.</p>
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

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <Badge className="mb-4 border-blue-200 bg-blue-100 text-blue-800">
            <MapPin className="mr-1 h-3 w-3" />
            Regional Sub-Groups
          </Badge>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Find Local Peptide Communities
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Connect with regional hosts for the best prices. Click on an area to see available products.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {regions.map((region) => {
            const hasActiveBatch = region.active_batch && region.active_batch.status === 'active';
            const daysRemaining = hasActiveBatch ? getDaysRemaining(region.active_batch!.end_date) : 0;
            const progressPercentage = hasActiveBatch ? getProgressPercentage(region.active_batch!) : 0;

            return (
              <Link key={region.id} href={`/products/sub-groups/${region.id}`}>
                <Card className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
                      <MapPin className="h-16 w-16 text-blue-400" />
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-blue-100 text-blue-800">{region.region}</Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-purple-100 text-purple-800">
                        {hasActiveBatch ? 'Active Batch' : 'No Active Batch'}
                      </Badge>
                    </div>
                    {hasActiveBatch && (
                      <div className="absolute right-2 bottom-2 left-2">
                        <div className="rounded-full bg-white/90 p-1">
                          <div className="h-2 w-full rounded-full bg-blue-200">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="mt-1 text-center text-xs font-medium text-gray-700">
                          {progressPercentage}
                          % Complete
                        </div>
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{region.name}</CardTitle>
                    <CardDescription>
                      {region.description || `${region.region} • ${region.city}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {hasActiveBatch
                        ? (
                            <>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Active Batch:</span>
                                  <span className="font-semibold text-purple-600">{region.active_batch!.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Progress:</span>
                                  <span className="font-semibold">
                                    {region.active_batch!.current_vials}
                                    /
                                    {region.active_batch!.target_vials}
                                    {' '}
                                    vials
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Time Left:</span>
                                  <span className="font-semibold text-purple-600">
                                    {daysRemaining > 0 ? `${daysRemaining} days` : 'Ended'}
                                  </span>
                                </div>
                                {region.active_batch!.batch_products && region.active_batch!.batch_products.length > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span>Products:</span>
                                    <span className="font-semibold">{region.active_batch!.batch_products.length}</span>
                                  </div>
                                )}
                              </div>
                              <div className="pt-2">
                                <Button size="sm" className="w-full bg-purple-600 text-white hover:bg-purple-700">
                                  <Users className="mr-2 h-4 w-4" />
                                  Join Group Buy
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )
                        : (
                            <>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Status:</span>
                                  <span className="font-semibold text-gray-500">No Active Batch</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Host:</span>
                                  <span className="font-semibold">
                                    {region.host ? `${region.host.first_name || ''} ${region.host.last_name || ''}`.trim() : 'Unassigned'}
                                  </span>
                                </div>
                                {region.whatsapp_number && (
                                  <div className="flex justify-between text-sm">
                                    <span>Contact:</span>
                                    <span className="font-semibold text-green-600">{region.whatsapp_number}</span>
                                  </div>
                                )}
                              </div>
                              <div className="pt-2">
                                <Button size="sm" variant="outline" className="w-full">
                                  <MapPin className="mr-2 h-4 w-4" />
                                  View Region
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700" asChild>
            <Link href="/products/sub-groups">
              <MapPin className="mr-2 h-5 w-5" />
              View All Areas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
