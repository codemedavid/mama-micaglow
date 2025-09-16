import type { Metadata } from 'next';
import { ProductsClient } from './ProductsClient';

export const metadata: Metadata = {
  title: 'Products - Mama_MicaGlow',
  description: 'Browse our complete catalog of premium peptides available through individual purchase, group buy, and regional sub-groups.',
};

// Mock data - in real app, this would come from Supabase
const products = [
  {
    id: '1',
    name: 'BPC-157',
    description: 'Body Protection Compound-157 for tissue repair and healing',
    price: 2500, // Price per box
    pricePerVial: 250, // Price per vial
    category: 'Healing',
    image: '/api/placeholder/300/200',
    inStock: true,
    vialsPerBox: 10,
  },
  {
    id: '2',
    name: 'TB-500',
    description: 'Thymosin Beta-4 for muscle recovery and injury prevention',
    price: 3200,
    pricePerVial: 320,
    category: 'Recovery',
    image: '/api/placeholder/300/200',
    inStock: true,
    vialsPerBox: 10,
  },
  {
    id: '3',
    name: 'Ipamorelin',
    description: 'Growth hormone releasing peptide for muscle growth',
    price: 1800,
    pricePerVial: 180,
    category: 'Growth',
    image: '/api/placeholder/300/200',
    inStock: true,
    vialsPerBox: 10,
  },
  {
    id: '4',
    name: 'Sermorelin',
    description: 'Growth hormone releasing hormone for anti-aging',
    price: 2200,
    pricePerVial: 220,
    category: 'Anti-Aging',
    image: '/api/placeholder/300/200',
    inStock: true,
    vialsPerBox: 10,
  },
  {
    id: '5',
    name: 'CJC-1295',
    description: 'Growth hormone releasing hormone analog',
    price: 2800,
    pricePerVial: 280,
    category: 'Growth',
    image: '/api/placeholder/300/200',
    inStock: true,
    vialsPerBox: 10,
  },
  {
    id: '6',
    name: 'Melanotan II',
    description: 'Tanning peptide for skin pigmentation',
    price: 1500,
    pricePerVial: 150,
    category: 'Cosmetic',
    image: '/api/placeholder/300/200',
    inStock: true,
    vialsPerBox: 10,
  },
];

export default function ProductsPage() {
  return <ProductsClient products={products} />;
}
