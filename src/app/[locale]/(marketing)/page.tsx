import type { Metadata } from 'next';
import {
  ArrowRight,
  HelpCircle,
  Package,
  ShoppingCart,
  Users,
  Zap,
} from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import ActiveBatchSection from '@/components/ActiveBatchSection';
import RegionsSection from '@/components/RegionsSection';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllProducts } from '@/lib/products';

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

  // Fetch official products for Individual Purchase section
  const products = await getAllProducts();
  const featuredProducts = products.slice(0, 6);

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
                <Link href="#group-buy" className="text-purple-600">
                  <Users className="mr-2 h-5 w-5" />
                  Join Group Buy
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#individual" className="text-purple-600">
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

          {/* Mobile list layout */}
          <div className="space-y-4 md:hidden">
            {featuredProducts.map(product => (
              <Card key={product.id} className="overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {product.imageUrl
                      ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="h-16 w-16 object-cover"
                          />
                        )
                      : (
                          <div className="flex h-16 w-16 items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            <Package className="h-6 w-6 opacity-80" />
                          </div>
                        )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-gray-900">{product.name}</h3>
                        <p className="truncate text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="ml-3 text-right">
                        <div className="text-lg font-bold text-primary">
                          ₱
                          {product.pricePerBox.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          per box (
                          {product.vialsPerBox}
                          {' '}
                          vials)
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" className="flex-1" asChild>
                        <Link href="/products">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Link>
                      </Button>
                      <Button size="icon" variant="outline" asChild>
                        <Link href={`/products/${product.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Tablet/Desktop grid layout */}
          <div className="hidden grid-cols-1 gap-8 md:grid md:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map(product => (
              <Card key={product.id} className="group transition-shadow hover:shadow-lg">
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                  {product.imageUrl
                    ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      )
                    : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                          <Package className="h-16 w-16 text-purple-400" />
                        </div>
                      )}
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="mt-1">{product.category}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        ₱
                        {product.pricePerBox.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per box (
                        {product.vialsPerBox}
                        {' '}
                        vials)
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        ₱
                        {product.pricePerVial.toLocaleString()}
                        /vial
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
                        <Link href={`/products/${product.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
      <RegionsSection />

      {/* FAQ Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge className="mb-4 border-purple-200 bg-purple-100 text-purple-800">
              <HelpCircle className="mr-1 h-3 w-3" />
              Frequently Asked Questions
            </Badge>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Got Questions? We Have Answers
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Find answers to common questions about our peptide products, ordering process, and group buy system
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="rounded-lg border bg-card px-6">
                <AccordionTrigger className="text-left">
                  What are peptides and how do they work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Peptides are short chains of amino acids that play crucial roles in various biological processes. They can help with skin health, muscle growth, weight management, and overall wellness. Our peptides are pharmaceutical-grade and sourced from reputable manufacturers.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="rounded-lg border bg-card px-6">
                <AccordionTrigger className="text-left">
                  How does the group buy system work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Our group buy system allows customers to purchase peptides at discounted prices by joining together. When a batch reaches the minimum order quantity, we process all orders together, reducing individual costs. You can track your batch status and join active group buys through our platform.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="rounded-lg border bg-card px-6">
                <AccordionTrigger className="text-left">
                  What is the difference between individual purchase and group buy?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Individual purchases are immediate - you buy complete boxes at retail price with instant checkout and fast shipping. Group buys offer significant discounts (up to 30-50% off) but require waiting for the batch to fill up before processing. Both options are available for all our products.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="rounded-lg border bg-card px-6">
                <AccordionTrigger className="text-left">
                  How do I track my order status?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You can track your order using your unique order code on our track-order page. For group buys, you'll see the batch status and estimated processing time. For individual orders, you'll receive tracking information once your order ships.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="rounded-lg border bg-card px-6">
                <AccordionTrigger className="text-left">
                  What payment methods do you accept?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We accept various payment methods including bank transfers, GCash, PayMaya, and other digital wallets. All prices are in Philippine Peso (₱). Payment instructions will be provided after you place your order.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="rounded-lg border bg-card px-6">
                <AccordionTrigger className="text-left">
                  How long does shipping take?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Individual orders typically ship within 1-3 business days and arrive within 3-7 days depending on your location. Group buy orders are processed once the batch is complete, usually within 1-2 weeks, then shipped to all participants.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="rounded-lg border bg-card px-6">
                <AccordionTrigger className="text-left">
                  Are your products authentic and safe?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, all our peptides are pharmaceutical-grade and sourced from certified manufacturers. We provide certificates of analysis (COA) for all products and maintain strict quality control standards. Your safety and satisfaction are our top priorities.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="rounded-lg border bg-card px-6">
                <AccordionTrigger className="text-left">
                  Can I cancel my order?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Individual orders can be cancelled within 24 hours if not yet shipped. Group buy orders can be cancelled before the batch is processed. Once a group buy batch is complete, orders cannot be cancelled as they are already being prepared for shipping.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="mt-12 text-center">
            <p className="mb-4 text-muted-foreground">
              Still have questions? We're here to help!
            </p>
            <Button variant="outline" asChild>
              <Link href="https://wa.me/6391549012244" target="_blank" rel="noopener noreferrer">
                <HelpCircle className="mr-2 h-4 w-4" />
                Contact Us on WhatsApp
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
            <Button size="lg" variant="outline" className="border-2 border-white text-purple-300 hover:bg-white hover:text-purple-600" asChild>
              <Link href="#individual" className="text-purple-600">
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
