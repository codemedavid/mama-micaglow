'use client';

import {
  AlertCircle,
  ArrowRight,
  MapPin,
  Package,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealtimeRegions } from '@/hooks/useRealtimeSubGroupBatch';

// Remove the local Region type since we're using the one from the hook

export default function SubGroupsPage() {
  const { regions, loading, regionsEnabled } = useRealtimeRegions();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-20">
          <div className="mb-16 text-center">
            <Badge className="mb-4 border-blue-200 bg-blue-100 text-blue-800">
              <MapPin className="mr-1 h-3 w-3" />
              Loading Regions...
            </Badge>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              Regional Sub-Groups
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Fetching regional groups and active batches...
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
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
      </div>
    );
  }

  // Show message if regions feature is disabled
  if (!regionsEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-20">
          <div className="mb-16 text-center">
            <Badge className="mb-4 border-gray-200 bg-gray-100 text-gray-800">
              <AlertCircle className="mr-1 h-3 w-3" />
              Feature Disabled
            </Badge>
            <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Regional Sub-Groups Not Available
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              This feature is currently disabled. Please check back later or contact support for more information.
            </p>
            <div className="mt-8">
              <Link href="/products">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (regions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-20">
          <div className="mb-16 text-center">
            <Badge className="mb-4 border-gray-200 bg-gray-100 text-gray-800">
              <AlertCircle className="mr-1 h-3 w-3" />
              No Active Regions
            </Badge>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              No Regional Groups Available
            </h1>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-20">
        <div className="mb-16 text-center">
          <Badge className="mb-4 border-blue-200 bg-blue-100 text-blue-800">
            <MapPin className="mr-1 h-3 w-3" />
            Regional Sub-Groups
          </Badge>
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">
            Find Local Peptide Communities
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Connect with regional hosts for the best prices. Click on an area to see available products.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {regions.map((region) => {
            const hasActiveBatch = region.active_batch && region.active_batch.status === 'active';
            const progressPercentage = hasActiveBatch
              ? Math.round((region.active_batch!.current_vials / region.active_batch!.target_vials) * 100)
              : 0;

            return (
              <Link key={region.id} href={`/products/sub-groups/${region.id}`}>
                <Card className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
                      <MapPin className="h-16 w-16 text-blue-400" />
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-blue-100 text-blue-800">{region.city}</Badge>
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
                      {region.city}
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
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs text-gray-600">
                                    <span>Progress</span>
                                    <span>
                                      {Math.round((region.active_batch!.current_vials / region.active_batch!.target_vials) * 100)}
                                      %
                                    </span>
                                  </div>
                                  <div className="h-2 w-full rounded-full bg-gray-200">
                                    <div
                                      className="h-2 rounded-full bg-purple-600 transition-all duration-300"
                                      style={{ width: `${Math.round((region.active_batch!.current_vials / region.active_batch!.target_vials) * 100)}%` }}
                                    />
                                  </div>
                                </div>
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
