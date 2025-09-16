import type { Metadata } from 'next';
import {
  ArrowRight,
  MapPin,
  Package,
  ShoppingCart,
  Users,
  Zap,
} from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import ActiveBatchSection from '@/components/ActiveBatchSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Mama_MicaGlow - Premium Peptide Retail Platform',
    description: 'Discover premium peptides with individual buying, group buy, and regional sub-group options. Philippine Peso pricing with secure transactions.',
  };
}

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="gradient-purple mb-4 border-0 text-white">
              <Zap className="mr-1 h-3 w-3" />
              Premium Peptide Platform
            </Badge>
            <h1 className="gradient-text-purple mb-6 text-5xl font-bold md:text-6xl">
              Mama_MicaGlow
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground md:text-2xl">
              Discover premium peptides through individual purchases, group buys,
              and regional sub-groups. All prices in Philippine Peso (₱).
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="gradient-purple text-white hover:opacity-90" asChild>
                <Link href="#group-buy">
                  <Users className="mr-2 h-5 w-5" />
                  Join Group Buy
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#individual">
                  <Package className="mr-2 h-5 w-5" />
                  Individual Purchase
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Group Buy Section - Dynamic */}
      <ActiveBatchSection />

      {/* Individual Buy Section - Second Section */}
      <section id="individual" className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge className="mb-4 border-blue-200 bg-blue-100 text-blue-800">
              <Package className="mr-1 h-3 w-3" />
              Individual Purchase
            </Badge>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Individual Purchase
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Buy complete boxes with instant checkout and fast shipping
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* BPC-157 Individual */}
            <Card className="group transition-shadow hover:shadow-lg">
              <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                  <Package className="h-16 w-16 text-purple-400" />
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">Healing</Badge>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">BPC-157</CardTitle>
                    <CardDescription className="mt-1">
                      Body Protection Compound-157 for tissue repair and healing
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ₱2,500
                    </div>
                    <div className="text-sm text-muted-foreground">
                      per box (10 vials)
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      ₱250/vial
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button className="flex-1" asChild>
                      <Link href="/products">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href="/products">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TB-500 Individual */}
            <Card className="group transition-shadow hover:shadow-lg">
              <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                  <Package className="h-16 w-16 text-purple-400" />
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">Recovery</Badge>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">TB-500</CardTitle>
                    <CardDescription className="mt-1">
                      Thymosin Beta-4 for muscle recovery and injury prevention
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ₱3,200
                    </div>
                    <div className="text-sm text-muted-foreground">
                      per box (10 vials)
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      ₱320/vial
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button className="flex-1" asChild>
                      <Link href="/products">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href="/products">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ipamorelin Individual */}
            <Card className="group transition-shadow hover:shadow-lg">
              <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                  <Package className="h-16 w-16 text-purple-400" />
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">Growth</Badge>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Ipamorelin</CardTitle>
                    <CardDescription className="mt-1">
                      Growth hormone releasing peptide for muscle growth
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ₱1,800
                    </div>
                    <div className="text-sm text-muted-foreground">
                      per box (10 vials)
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      ₱180/vial
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button className="flex-1" asChild>
                      <Link href="/products">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href="/products">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" className="gradient-purple text-white hover:opacity-90" asChild>
              <Link href="/products">
                <Package className="mr-2 h-5 w-5" />
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sub-Group Section - Third Section */}
      <section id="sub-groups" className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
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
            {/* Metro Manila */}
            <Link href="/products/sub-groups/metro-manila">
              <Card className="group cursor-pointer transition-shadow hover:shadow-lg">
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
                    <MapPin className="h-16 w-16 text-blue-400" />
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-blue-100 text-blue-800">Metro Manila</Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-100 text-green-800">156 members</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Metro Manila Peptide Community</CardTitle>
                  <CardDescription>
                    Largest peptide community with 3 active batches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Active Batches:</span>
                      <span className="font-semibold">3</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Best Price:</span>
                      <span className="font-semibold text-green-600">₱180/vial</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last activity: 2 hours ago
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Cebu */}
            <Link href="/products/sub-groups/cebu">
              <Card className="group cursor-pointer transition-shadow hover:shadow-lg">
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
                    <MapPin className="h-16 w-16 text-blue-400" />
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-blue-100 text-blue-800">Cebu</Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-100 text-green-800">89 members</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Cebu Research Group</CardTitle>
                  <CardDescription>
                    Research-focused group with 2 active batches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Active Batches:</span>
                      <span className="font-semibold">2</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Best Price:</span>
                      <span className="font-semibold text-green-600">₱180/vial</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last activity: 1 day ago
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Davao */}
            <Link href="/products/sub-groups/davao">
              <Card className="group cursor-pointer transition-shadow hover:shadow-lg">
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
                    <MapPin className="h-16 w-16 text-blue-400" />
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-blue-100 text-blue-800">Davao</Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-100 text-green-800">67 members</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Davao Wellness Circle</CardTitle>
                  <CardDescription>
                    Wellness-focused community with 1 active batch
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Active Batches:</span>
                      <span className="font-semibold">1</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Best Price:</span>
                      <span className="font-semibold text-green-600">₱180/vial</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last activity: 3 days ago
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
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

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
            Join thousands of satisfied customers who trust Mama_MicaGlow for their peptide needs
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" className="border-2 border-white bg-white text-purple-600 hover:bg-gray-100" asChild>
              <Link href="#group-buy">
                <Users className="mr-2 h-5 w-5" />
                Join Group Buy
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-purple-600" asChild>
              <Link href="#individual">
                <Package className="mr-2 h-5 w-5" />
                Individual Purchase
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
