import type { Metadata } from 'next';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Package,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export async function generateMetadata({ params }: { params: Promise<{ area: string }> }): Promise<Metadata> {
  const { area } = await params;
  const areaName = area.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${areaName} Sub-Group - Mama_MicaGlow`,
    description: `Connect with local hosts in ${areaName} for regional group purchases. Find sub-groups in your area and join community-driven peptide purchases.`,
  };
}

// Mock data for area-specific products
const areaProducts = {
  'metro-manila': {
    name: 'Metro Manila',
    host: 'Dr. Maria Santos',
    members: 156,
    activeBatches: 3,
    products: [
      {
        id: '1',
        name: 'BPC-157',
        description: 'Body Protection Compound-157 for tissue repair and healing',
        pricePerVial: 180,
        category: 'Healing',
        remainingVials: 3,
        totalVials: 10,
        batchEnds: '3 days',
      },
      {
        id: '2',
        name: 'TB-500',
        description: 'Thymosin Beta-4 for muscle recovery and injury prevention',
        pricePerVial: 240,
        category: 'Recovery',
        remainingVials: 5,
        totalVials: 10,
        batchEnds: '3 days',
      },
      {
        id: '3',
        name: 'Ipamorelin',
        description: 'Growth hormone releasing peptide for muscle growth',
        pricePerVial: 130,
        category: 'Growth',
        remainingVials: 2,
        totalVials: 10,
        batchEnds: '3 days',
      },
    ],
  },
  'cebu': {
    name: 'Cebu',
    host: 'Prof. Juan Dela Cruz',
    members: 89,
    activeBatches: 2,
    products: [
      {
        id: '1',
        name: 'BPC-157',
        description: 'Body Protection Compound-157 for tissue repair and healing',
        pricePerVial: 180,
        category: 'Healing',
        remainingVials: 4,
        totalVials: 10,
        batchEnds: '5 days',
      },
      {
        id: '2',
        name: 'Sermorelin',
        description: 'Growth hormone releasing hormone for anti-aging',
        pricePerVial: 160,
        category: 'Anti-Aging',
        remainingVials: 6,
        totalVials: 10,
        batchEnds: '5 days',
      },
    ],
  },
  'davao': {
    name: 'Davao',
    host: 'Sarah Johnson',
    members: 67,
    activeBatches: 1,
    products: [
      {
        id: '1',
        name: 'Melanotan II',
        description: 'Tanning peptide for skin pigmentation',
        pricePerVial: 100,
        category: 'Cosmetic',
        remainingVials: 8,
        totalVials: 10,
        batchEnds: '2 days',
      },
    ],
  },
};

export default async function AreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  const areaData = areaProducts[area as keyof typeof areaProducts];

  if (!areaData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Area Not Found</h1>
          <p className="mb-4 text-muted-foreground">The requested area is not available.</p>
          <Button asChild>
            <Link href="/products/sub-groups">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Areas
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-800 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" asChild>
              <Link href="/products/sub-groups">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Areas
              </Link>
            </Button>
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 border-white/30 bg-white/20 text-white">
              <MapPin className="mr-1 h-3 w-3" />
              {areaData.name}
              {' '}
              Sub-Group
            </Badge>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              {areaData.name}
              {' '}
              Peptide Community
            </h1>
            <p className="mb-8 text-xl opacity-90">
              Connect with local hosts in
              {' '}
              {areaData.name}
              {' '}
              for regional group purchases.
              Get the best prices through community-driven purchases.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                <Users className="mr-2 h-5 w-5" />
                Join Community
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <TrendingUp className="mr-2 h-5 w-5" />
                View Batch Progress
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Area Info */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {areaData.members}
                {' '}
                Members
              </h3>
              <p className="text-sm text-muted-foreground">
                Active community members in
                {' '}
                {areaData.name}
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {areaData.activeBatches}
                {' '}
                Active Batches
              </h3>
              <p className="text-sm text-muted-foreground">
                Currently running group purchases
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Host:
                {areaData.host}
              </h3>
              <p className="text-sm text-muted-foreground">
                Regional community leader
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products in this Area */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Available Products in
              {areaData.name}
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Join group purchases for these products at the best sub-group prices
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {areaData.products.map(product => (
              <Card key={product.id} className="group border-blue-200 transition-shadow hover:shadow-lg">
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
                    <Package className="h-16 w-16 text-blue-400" />
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-blue-100 text-blue-800">Sub-Group</Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-red-100 text-red-800">
                      {product.remainingVials}
                      {' '}
                      vials left
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {product.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        ₱
                        {product.pricePerVial}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per vial (Sub-Group)
                      </div>
                      <div className="mt-1 text-xs text-blue-600">
                        Best price available
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress:</span>
                      <span className="font-semibold">
                        {product.totalVials - product.remainingVials}
                        /
                        {product.totalVials}
                        {' '}
                        vials
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${((product.totalVials - product.remainingVials) / product.totalVials) * 100}%` }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <Users className="mr-2 h-4 w-4" />
                        Join Group Buy
                      </Button>
                      <Button variant="outline" size="icon">
                        <Clock className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-center text-xs text-muted-foreground">
                      Batch ends in
                      {' '}
                      {product.batchEnds}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-800 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Join the
            {' '}
            {areaData.name}
            {' '}
            Community?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
            Connect with local hosts and start participating in regional group purchases today
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              <Users className="mr-2 h-5 w-5" />
              Join Community
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <MapPin className="mr-2 h-5 w-5" />
              Contact Host
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
