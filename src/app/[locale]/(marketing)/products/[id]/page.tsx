import type { Metadata } from 'next';
import {
  AlertCircle,
  CheckCircle,
  Package,
  ShoppingCart,
  Star,
  Truck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data - in real app, this would come from Supabase
const product = {
  id: '1',
  name: 'BPC-157',
  description: 'Body Protection Compound-157 for tissue repair and healing',
  longDescription: `BPC-157 (Body Protection Compound-157) is a synthetic peptide that has shown remarkable potential in promoting tissue repair and healing. This 15-amino acid peptide is derived from a protein found in gastric juice and has been extensively studied for its protective and regenerative properties.

Key Benefits:
• Accelerates healing of various tissues including muscle, tendon, ligament, and bone
• Reduces inflammation and oxidative stress
• Improves blood flow and angiogenesis
• Supports gastrointestinal health and healing
• May help with joint and connective tissue injuries

BPC-157 is particularly popular among athletes and individuals recovering from injuries due to its ability to promote faster healing and reduce recovery time.`,
  price: 2500,
  originalPrice: 3000,
  category: 'Healing',
  image: '/api/placeholder/600/400',
  rating: 4.8,
  reviews: 124,
  inStock: true,
  vialsPerBox: 10,
  dosage: '250mcg per vial',
  storage: 'Store in refrigerator (2-8°C)',
  shelfLife: '24 months from manufacture date',
  specifications: {
    purity: '99%+',
    molecularWeight: '1419.5 Da',
    sequence: 'Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val',
    solubility: 'Water soluble',
    pH: '6.5-7.5',
  },
  relatedProducts: [
    {
      id: '2',
      name: 'TB-500',
      price: 3200,
      image: '/api/placeholder/200/150',
      category: 'Recovery',
    },
    {
      id: '3',
      name: 'Ipamorelin',
      price: 1800,
      image: '/api/placeholder/200/150',
      category: 'Growth',
    },
  ],
};

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${product.name} - Mama_MicaGlow`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  // In real app, fetch product by ID from Supabase
  if (id !== product.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/products" className="text-muted-foreground hover:text-primary">
              Products
            </Link>
            <span>/</span>
            <span className="text-primary">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                <Package className="h-32 w-32 text-purple-400" />
              </div>
              {!product.inStock && (
                <div className="absolute top-4 right-4">
                  <Badge variant="destructive">Out of Stock</Badge>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <div className="h-20 w-20 rounded-lg border-2 border-primary bg-muted"></div>
              <div className="h-20 w-20 rounded-lg border bg-muted"></div>
              <div className="h-20 w-20 rounded-lg border bg-muted"></div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary">{product.category}</Badge>
                <Badge variant="outline" className="border-green-600 text-green-600">
                  In Stock
                </Badge>
              </div>
              <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
              <p className="mb-4 text-lg text-muted-foreground">{product.description}</p>

              <div className="mb-4 flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array.from({ length: 5 })].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-current text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  ₱
                  {product.price.toLocaleString()}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  ₱
                  {product.originalPrice.toLocaleString()}
                </span>
                <Badge className="bg-green-100 text-green-800">
                  Save ₱
                  {(product.originalPrice - product.price).toLocaleString()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                per box (
                {product.vialsPerBox}
                {' '}
                vials) •
                {' '}
                {product.dosage}
              </p>
            </div>

            {/* Purchase Options */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="gradient-purple text-white hover:opacity-90"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline">
                  <Users className="mr-2 h-5 w-5" />
                  Join Group Buy
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Or purchase individual vials through our group buy system
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Free shipping on orders over ₱5,000</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Lab-tested for purity and potency</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Fast delivery across the Philippines</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="usage">Usage & Storage</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Product Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="leading-relaxed text-muted-foreground">
                      {product.longDescription}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b py-2">
                        <span className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                          :
                        </span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Instructions & Storage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-semibold">Dosage</h4>
                    <p className="text-muted-foreground">{product.dosage}</p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Storage</h4>
                    <p className="text-muted-foreground">{product.storage}</p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Shelf Life</h4>
                    <p className="text-muted-foreground">{product.shelfLife}</p>
                  </div>
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">Important Notice</h4>
                        <p className="mt-1 text-sm text-yellow-700">
                          This product is for research purposes only. Not for human consumption.
                          Please consult with a healthcare professional before use.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="mb-8 text-2xl font-bold">Related Products</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {product.relatedProducts.map(related => (
              <Card key={related.id} className="group transition-shadow hover:shadow-lg">
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                    <Package className="h-12 w-12 text-purple-400" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-semibold">{related.name}</h3>
                    <Badge variant="secondary">{related.category}</Badge>
                  </div>
                  <p className="mb-3 text-2xl font-bold text-primary">
                    ₱
                    {related.price.toLocaleString()}
                  </p>
                  <Button className="w-full" variant="outline">
                    View Product
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
