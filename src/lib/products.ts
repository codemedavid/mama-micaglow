import { supabase } from '@/lib/supabase';

export type Product = {
  id: number;
  name: string;
  description: string | null;
  category: string;
  pricePerVial: number;
  pricePerBox: number;
  vialsPerBox: number;
  isActive: boolean;
  imageUrl: string | null;
  specifications: any;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
};

export async function getAllProducts(): Promise<Product[]> {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not configured. Using fallback data.');
      return getFallbackProducts();
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      return getFallbackProducts();
    }

    if (!products || products.length === 0) {
      console.warn('No products found in database. Using fallback data.');
      return getFallbackProducts();
    }

    return products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      pricePerVial: Number(product.price_per_vial),
      pricePerBox: Number(product.price_per_box),
      vialsPerBox: product.vials_per_box,
      isActive: product.is_active,
      imageUrl: product.image_url,
      specifications: product.specifications,
      createdBy: product.created_by,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at),
    }));
  } catch {
    return getFallbackProducts();
  }
}

// Fallback products data when database is not available
function getFallbackProducts(): Product[] {
  return [
    {
      id: 1,
      name: 'BPC-157',
      description: 'Body Protection Compound 157 - Healing and Recovery Peptide',
      category: 'Healing & Recovery',
      pricePerVial: 250,
      pricePerBox: 2500,
      vialsPerBox: 10,
      isActive: true,
      imageUrl: null,
      specifications: null,
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: 'TB-500',
      description: 'Thymosin Beta-4 - Muscle and Joint Support',
      category: 'Muscle & Joint Support',
      pricePerVial: 300,
      pricePerBox: 3000,
      vialsPerBox: 10,
      isActive: true,
      imageUrl: null,
      specifications: null,
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: 'Ipamorelin',
      description: 'Growth Hormone Releasing Peptide',
      category: 'Growth Hormone',
      pricePerVial: 200,
      pricePerBox: 2000,
      vialsPerBox: 10,
      isActive: true,
      imageUrl: null,
      specifications: null,
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      name: 'Sermorelin',
      description: 'Growth Hormone Releasing Hormone',
      category: 'Growth Hormone',
      pricePerVial: 180,
      pricePerBox: 1800,
      vialsPerBox: 10,
      isActive: true,
      imageUrl: null,
      specifications: null,
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 5,
      name: 'CJC-1295',
      description: 'Growth Hormone Releasing Hormone Analog',
      category: 'Growth Hormone',
      pricePerVial: 220,
      pricePerBox: 2200,
      vialsPerBox: 10,
      isActive: true,
      imageUrl: null,
      specifications: null,
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

export async function getProductById(id: number): Promise<Product | null> {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not configured. Using fallback data.');
      const fallbackProducts = getFallbackProducts();
      return fallbackProducts.find(p => p.id === id) || null;
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // Try to find in fallback data
      const fallbackProducts = getFallbackProducts();
      return fallbackProducts.find(p => p.id === id) || null;
    }

    if (!product) {
      return null;
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      pricePerVial: Number(product.price_per_vial),
      pricePerBox: Number(product.price_per_box),
      vialsPerBox: product.vials_per_box,
      isActive: product.is_active,
      imageUrl: product.image_url,
      specifications: product.specifications,
      createdBy: product.created_by,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at),
    };
  } catch {
    // Try to find in fallback data
    const fallbackProducts = getFallbackProducts();
    return fallbackProducts.find(p => p.id === id) || null;
  }
}
