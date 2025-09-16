'use client';

import {
  Filter,
  MapPin,
  Package,
  Search,
  ShoppingCart,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCartActions } from '@/hooks/useCartActions';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  pricePerVial: number;
  category: string;
  image: string;
  inStock: boolean;
  vialsPerBox: number;
};

type ProductsClientProps = {
  products: Product[];
};

const categories = ['all', 'Healing', 'Recovery', 'Growth', 'Anti-Aging', 'Cosmetic'];

export function ProductsClient({ products }: ProductsClientProps) {
  const { addIndividualItem } = useCartActions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      || product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    addIndividualItem({
      id: product.id,
      name: product.name,
      pricePerBox: product.price,
      imageUrl: product.image,
      vialsPerBox: product.vialsPerBox,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Premium Peptide Catalog
            </h1>
            <p className="mb-8 text-xl opacity-90">
              Discover our complete range of high-quality peptides with flexible purchasing options
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100" asChild>
                <Link href="#individual">
                  <Package className="mr-2 h-5 w-5" />
                  Individual Purchase
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600" asChild>
                <Link href="#group-buy">
                  <Users className="mr-2 h-5 w-5" />
                  Join Group Buy
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Purchase Methods */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
              <TabsTrigger value="individual">
                <Package className="mr-2 h-4 w-4" />
                Individual Purchase
              </TabsTrigger>
              <TabsTrigger value="group-buy">
                <Users className="mr-2 h-4 w-4" />
                Group Buy
              </TabsTrigger>
              <TabsTrigger value="sub-groups">
                <MapPin className="h-4 w-4" />
                Regional Sub-Groups
              </TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="mt-8" id="individual">
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold">Individual Purchase</h2>
                <p className="text-muted-foreground">
                  Buy complete boxes (10 vials) with instant checkout and fast shipping
                </p>
              </div>

              {/* Filters and Search */}
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex flex-1 flex-col gap-4 sm:flex-row">
                  <div className="relative max-w-md flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  {filteredProducts.length}
                  {' '}
                  products found
                </div>
              </div>
            </TabsContent>

            <TabsContent value="group-buy" className="mt-8" id="group-buy">
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold">Group Buy</h2>
                <p className="text-muted-foreground">
                  Join admin-hosted batches to buy individual vials at better prices
                </p>
              </div>

              {/* Group Buy Products */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map(product => (
                  <Card key={`group-${product.id}`} className="group transition-shadow hover:shadow-lg">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                        <Users className="h-16 w-16 text-purple-400" />
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-green-100 text-green-800">Group Buy</Badge>
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
                          <div className="text-2xl font-bold text-green-600">
                            ₱
                            {Math.round(product.pricePerVial * 0.8).toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            per vial (Group Buy)
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Save ₱
                            {Math.round(product.pricePerVial * 0.2)}
                            /vial
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-green-600 hover:bg-green-700" asChild>
                            <Link href="/products/group-buy">
                              <Users className="mr-2 h-4 w-4" />
                              Join Group Buy
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sub-groups" className="mt-8" id="sub-groups">
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold">Regional Sub-Groups</h2>
                <p className="text-muted-foreground">
                  Connect with local hosts for regional group purchases
                </p>
              </div>

              {/* Sub-Group Products */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map(product => (
                  <Card key={`sub-${product.id}`} className="group transition-shadow hover:shadow-lg">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                        <MapPin className="h-16 w-16 text-purple-400" />
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-blue-100 text-blue-800">Sub-Group</Badge>
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
                            {Math.round(product.pricePerVial * 0.72).toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            per vial (Sub-Group)
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Save ₱
                            {Math.round(product.pricePerVial * 0.28)}
                            /vial
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-blue-600 hover:bg-blue-700" asChild>
                            <Link href="/products/sub-groups">
                              <MapPin className="mr-2 h-4 w-4" />
                              Find Local Groups
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(product => (
              <Card key={product.id} className="group transition-shadow hover:shadow-lg">
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                    <Package className="h-16 w-16 text-purple-400" />
                  </div>
                  {!product.inStock && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary">{product.category}</Badge>
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
                      <div className="text-2xl font-bold text-primary">
                        ₱
                        {product.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per box (
                        {product.vialsPerBox}
                        {' '}
                        vials)
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Individual: ₱
                        {product.pricePerVial}
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
                        disabled={!product.inStock}
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link href="/products/group-buy">
                          <Users className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
