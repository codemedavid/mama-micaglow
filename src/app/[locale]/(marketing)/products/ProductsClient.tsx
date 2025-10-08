'use client';

import {
  Filter,
  Package,
  Search,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCartActions } from '@/hooks/useCartActions';

// Category mapping with emojis (matching dosing guide)
const categoryMapping = [
  { id: 'all', name: 'All Peptides', icon: '💊' },
  { id: 'Weight Loss & Metabolic', name: 'Weight Loss & Metabolic', icon: '⚖️' },
  { id: 'Tissue Repair & Healing', name: 'Tissue Repair & Healing', icon: '🩹' },
  { id: 'Anti-Aging & Longevity', name: 'Anti-Aging & Longevity', icon: '✨' },
  { id: 'Neuroprotection & Cognitive', name: 'Neuroprotection & Cognitive', icon: '🧠' },
  { id: 'Reproductive & Hormone', name: 'Reproductive & Hormone', icon: '❤️' },
  { id: 'Other', name: 'Other', icon: '🔬' },
];

// Function to normalize category names based on actual database categories
const normalizeCategory = (category: string): string => {
  const lowerCategory = category.toLowerCase();

  // Weight Loss & Metabolic Peptides
  if (lowerCategory.includes('tirzepatide')
    || lowerCategory.includes('semaglutide')
    || lowerCategory.includes('retatrutide')
    || lowerCategory.includes('cagrilintide')
    || lowerCategory.includes('survodutide')
    || lowerCategory.includes('aod-9604')
    || lowerCategory.includes('adipotide')
    || lowerCategory.includes('lipoc')
    || lowerCategory.includes('l-carnitine')
    || lowerCategory.includes('melanotan')
    || lowerCategory.includes('hgh fragment')
    || lowerCategory.includes('5-amino-1mq')
    || lowerCategory.includes('lemon bottle')
    || lowerCategory.includes('mots-c')) {
    return 'Weight Loss & Metabolic';
  }

  // Tissue Repair & Healing Peptides
  if (lowerCategory.includes('bpc-157')
    || lowerCategory.includes('bcp')
    || lowerCategory.includes('tb-500')
    || lowerCategory.includes('ipamorelin')
    || lowerCategory.includes('cjc-1295')
    || lowerCategory.includes('cjc')
    || lowerCategory.includes('sermorelin')
    || lowerCategory.includes('tesamorelin')
    || lowerCategory.includes('hgh')
    || lowerCategory.includes('growth hormone')
    || lowerCategory.includes('igf-1')
    || lowerCategory.includes('igf')
    || lowerCategory.includes('hexarelin')
    || lowerCategory.includes('ghrp-6')
    || lowerCategory.includes('ghrp')) {
    return 'Tissue Repair & Healing';
  }

  // Anti-Aging & Longevity Peptides
  if (lowerCategory.includes('ghk-cu')
    || lowerCategory.includes('ghk')
    || lowerCategory.includes('epitalon')
    || lowerCategory.includes('nad+')
    || lowerCategory.includes('nad')
    || lowerCategory.includes('glutathione')
    || lowerCategory.includes('pinealon')
    || lowerCategory.includes('ss-31')
    || lowerCategory.includes('hyaluronic acid')) {
    return 'Anti-Aging & Longevity';
  }

  // Neuroprotection & Cognitive Peptides
  if (lowerCategory.includes('semax')
    || lowerCategory.includes('selank')
    || lowerCategory.includes('dsip')
    || lowerCategory.includes('cerebrolysin')
    || lowerCategory.includes('delta sleep')) {
    return 'Neuroprotection & Cognitive';
  }

  // Reproductive & Hormone Peptides
  if (lowerCategory.includes('hcg')
    || lowerCategory.includes('pt-141')
    || lowerCategory.includes('oxytocin')
    || lowerCategory.includes('kisspeptin')
    || lowerCategory.includes('hmg')) {
    return 'Reproductive & Hormone';
  }

  // Other/Utility Peptides
  if (lowerCategory.includes('thymalin')
    || lowerCategory.includes('thymosin')
    || lowerCategory.includes('vip')
    || lowerCategory.includes('melatonin')
    || lowerCategory.includes('dermorphin')
    || lowerCategory.includes('insulin')
    || lowerCategory.includes('epo')
    || lowerCategory.includes('ara-290')
    || lowerCategory.includes('ara290')
    || lowerCategory.includes('kpv')
    || lowerCategory.includes('pnc')
    || lowerCategory.includes('bacteriostatic water')
    || lowerCategory.includes('acetic acid')
    || lowerCategory.includes('pbs')
    || lowerCategory.includes('lc120')
    || lowerCategory.includes('peptide combinations')) {
    return 'Other';
  }

  // If it's already a proper category name, return it
  return categoryMapping.find(cat => cat.name === category)?.id || 'Other';
};

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

export function ProductsClient({ products }: ProductsClientProps) {
  const { addIndividualItem } = useCartActions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Generate available categories based on products that actually exist
  const availableCategories = useMemo(() => {
    const productCategories = new Set(products.map(product => normalizeCategory(product.category)));

    // Filter category mapping to only show those that have products
    const categoriesWithProducts = categoryMapping.filter(category =>
      category.id === 'all' || productCategories.has(category.id),
    );

    return categoriesWithProducts;
  }, [products]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
        || product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const normalizedProductCategory = normalizeCategory(product.category);
      const matchesCategory = selectedCategory === 'all' || normalizedProductCategory === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Group filtered products by normalized category
  const productsByCategory = useMemo(() => {
    const grouped = filteredProducts.reduce((acc, product) => {
      const normalizedCategory = normalizeCategory(product.category);
      if (!acc[normalizedCategory]) {
        acc[normalizedCategory] = [];
      }
      acc[normalizedCategory]!.push(product);
      return acc;
    }, {} as Record<string, Product[]>);

    // Sort categories alphabetically
    const sortedCategories = Object.keys(grouped).sort();
    const sortedGrouped: Record<string, Product[]> = {};
    sortedCategories.forEach((category) => {
      sortedGrouped[category] = grouped[category]!;
    });

    return sortedGrouped;
  }, [filteredProducts]);

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
              Discover our complete range of high-quality peptides with instant checkout and fast shipping
            </p>
            <div className="flex justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100" asChild>
                <Link href="#products">
                  <Package className="mr-2 h-5 w-5" />
                  Browse Products
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
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
                  <SelectValue placeholder="Category">
                    {availableCategories.find(cat => cat.id === selectedCategory) && (
                      <span className="flex items-center gap-2">
                        <span>{availableCategories.find(cat => cat.id === selectedCategory)?.icon}</span>
                        <span>{availableCategories.find(cat => cat.id === selectedCategory)?.name}</span>
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </span>
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
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="py-12">
        <div className="container mx-auto px-4">
          {Object.keys(productsByCategory).length === 0
            ? (
                <div className="py-12 text-center">
                  <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No products found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or category filter.
                  </p>
                </div>
              )
            : (
                <div className="space-y-12">
                  {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                    <div key={category}>
                      {/* Category Header */}
                      <div className="mb-6">
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">
                          <span className="flex items-center gap-3">
                            <span>{categoryMapping.find(cat => cat.id === category)?.icon || '💊'}</span>
                            <span>{category}</span>
                          </span>
                        </h2>
                        <p className="text-muted-foreground">
                          {categoryProducts.length}
                          {' '}
                          product
                          {categoryProducts.length !== 1
                            ? 's'
                            : ''}
                          {' '}
                          in this category
                        </p>
                      </div>

                      {/* Products Grid for this Category */}
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {categoryProducts.map(product => (
                          <Card key={product.id} className="group transition-shadow hover:shadow-lg">
                            <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                                <Package className="h-16 w-16 text-purple-400" />
                              </div>
                              {!product.inStock && (
                                <div className="absolute top-2 right-2">
                                  <Badge variant="destructive">Not Available</Badge>
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
                                    {product.inStock ? 'Add to Cart' : 'Unavailable'}
                                  </Button>
                                  <Button variant="outline" size="icon" asChild>
                                    <Link href={`/products/${product.id}`}>
                                      <Package className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </div>
      </section>
    </div>
  );
}
