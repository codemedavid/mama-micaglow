'use client';

import type { Product } from '@/lib/products';
import {
  ArrowRight,
  Package,
  ShoppingCart,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartActions } from '@/hooks/useCartActions';

type IndividualBuySectionProps = {
  products: Product[];
};

export function IndividualBuySection({ products }: IndividualBuySectionProps) {
  const { addIndividualItem } = useCartActions();

  const handleAddToCart = (product: Product) => {
    addIndividualItem({
      id: product.id.toString(),
      name: product.name,
      pricePerBox: product.pricePerBox,
      imageUrl: product.imageUrl || undefined,
      vialsPerBox: product.vialsPerBox,
    });
  };

  return (
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
          {products.map(product => (
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
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
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
          {products.map(product => (
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
                    <Button
                      className="flex-1"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
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
  );
}
