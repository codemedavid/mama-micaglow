import type { Metadata } from 'next';
import {
  AlertCircle,
  CheckCircle,
  Package,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProductById } from '@/lib/products';

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(Number.parseInt(id));

  if (!product) {
    return {
      title: 'Product Not Found - Mama_MicaGlow',
      description: 'The requested product could not be found.',
    };
  }

  return {
    title: `${product.name} - Mama_MicaGlow`,
    description: product.description || 'Premium peptide product',
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(Number.parseInt(id));

  if (!product) {
    notFound();
  }

  // Transform database product to match the expected format
  const transformedProduct = {
    id: product.id.toString(),
    name: product.name,
    description: product.description || '',
    longDescription: product.description || `Learn more about ${product.name} and its benefits.`,
    price: product.pricePerBox,
    originalPrice: product.pricePerBox * 1.2, // 20% markup for original price
    category: product.category,
    image: product.imageUrl || '/api/placeholder/600/400',
    rating: 4.5, // Default rating since not in DB
    reviews: 0, // Default reviews since not in DB
    inStock: product.isActive,
    vialsPerBox: product.vialsPerBox,
    dosage: '250mcg per vial', // Default dosage
    storage: 'Store in refrigerator (2-8°C)',
    shelfLife: '24 months from manufacture date',
    specifications: product.specifications || {
      purity: '99%+',
      molecularWeight: 'N/A',
      sequence: 'N/A',
      solubility: 'Water soluble',
      pH: '6.5-7.5',
    },
    relatedProducts: [], // Will be populated separately if needed
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/products" className="text-muted-foreground hover:text-foreground">
              Products
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">{transformedProduct.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-xl bg-muted">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                <Package className="h-32 w-32 text-purple-400" />
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="aspect-square w-20 overflow-hidden rounded-lg bg-muted">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                  <Package className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              <div className="aspect-square w-20 overflow-hidden rounded-lg bg-muted">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                  <Package className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              <div className="aspect-square w-20 overflow-hidden rounded-lg bg-muted">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                  <Package className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary">{transformedProduct.category}</Badge>
                {!transformedProduct.inStock && (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
              <h1 className="mb-2 pt-4 text-3xl font-bold">{transformedProduct.name}</h1>
              <p className="mb-4 text-lg text-muted-foreground">{transformedProduct.description}</p>

              <div className="mb-4 flex items-center gap-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={`star-${transformedProduct.id}-${transformedProduct.name}-${i + 1}`}
                      className={`h-5 w-5 ${
                        i < Math.floor(transformedProduct.rating)
                          ? 'fill-current text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {transformedProduct.rating}
                  {' '}
                  (
                  {transformedProduct.reviews}
                  {' '}
                  reviews)
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  ₱
                  {transformedProduct.price.toLocaleString()}
                </span>
                {transformedProduct.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₱
                    {transformedProduct.originalPrice.toLocaleString()}
                  </span>
                )}
                {transformedProduct.originalPrice && (
                  <Badge className="bg-purple-100 text-purple-800">
                    Save ₱
                    {(transformedProduct.originalPrice - transformedProduct.price).toLocaleString()}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                ₱
                {transformedProduct.price / transformedProduct.vialsPerBox}
                {' '}
                per vial (
                {transformedProduct.vialsPerBox}
                {' '}
                vials per box) •
                {' '}
                {transformedProduct.dosage}
              </p>
            </div>

            {/* Purchase Options */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="gradient-purple text-white hover:opacity-90"
                  disabled={!transformedProduct.inStock}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <span className="text-sm">Free shipping on orders over ₱5,000</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <span className="text-sm">30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <span className="text-sm">Lab-tested for purity and potency</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Fast delivery within 2-3 business days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground">{transformedProduct.longDescription}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purity</span>
                        <span className="font-medium">{transformedProduct.specifications.purity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Molecular Weight</span>
                        <span className="font-medium">{transformedProduct.specifications.molecularWeight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Solubility</span>
                        <span className="font-medium">{transformedProduct.specifications.solubility}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Storage</span>
                        <span className="font-medium">{transformedProduct.storage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shelf Life</span>
                        <span className="font-medium">{transformedProduct.shelfLife}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">pH Range</span>
                        <span className="font-medium">{transformedProduct.specifications.pH}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <div>
                          <h4 className="font-medium text-amber-900">Important Notice</h4>
                          <p className="mt-1 text-sm text-amber-800">
                            This product is for research purposes only. Not for human consumption.
                            Please consult with a healthcare professional before use.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">General Guidelines</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Store in refrigerator at 2-8°C</li>
                        <li>• Reconstitute with bacteriostatic water</li>
                        <li>• Use within 30 days after reconstitution</li>
                        <li>• Follow proper injection protocols</li>
                        <li>• Dispose of needles properly</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center">
                    <Star className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-medium">No Reviews Yet</h3>
                    <p className="text-muted-foreground">
                      Be the first to review this product after your purchase.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
