import type { Metadata } from 'next';
import { getAllProducts } from '@/lib/products';
import { ProductsClient } from './ProductsClient';

export const metadata: Metadata = {
  title: 'Products - Mama_MicaGlow',
  description: 'Browse our complete catalog of premium peptides available for individual purchase with instant checkout and fast shipping.',
};

export default async function ProductsPage() {
  const products = await getAllProducts();

  // Transform database products to match the expected format
  const transformedProducts = products.map(product => ({
    id: product.id.toString(),
    name: product.name,
    description: product.description || '',
    price: product.pricePerBox,
    pricePerVial: product.pricePerVial,
    category: product.category,
    image: product.imageUrl || '/api/placeholder/300/200',
    inStock: product.isActive,
    vialsPerBox: product.vialsPerBox,
  }));

  return <ProductsClient products={transformedProducts} />;
}
