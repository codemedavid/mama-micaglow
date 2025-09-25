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
    // BPC-157 variants
    {
      id: 1,
      name: 'BPC-157 5MG',
      description: 'Body Protection Compound 157 - 5MG Vial',
      category: 'Healing & Recovery',
      pricePerVial: 250,
      pricePerBox: 2500,
      vialsPerBox: 10,
      isActive: true,
      imageUrl: null,
      specifications: { mg: 5 },
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: 'BPC-157 10MG',
      description: 'Body Protection Compound 157 - 10MG Vial',
      category: 'Healing & Recovery',
      pricePerVial: 450,
      pricePerBox: 4500,
      vialsPerBox: 10,
      isActive: true,
      imageUrl: null,
      specifications: { mg: 10 },
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Tirzepatide variants
    {
      id: 3,
      name: 'Tirzepatide 2MG',
      description: 'Tirzepatide - 2MG Vial',
      category: 'Weight Management',
      pricePerVial: 180,
      pricePerBox: 1800,
      vialsPerBox: 10,
      isActive: true,
      imageUrl: null,
      specifications: { mg: 2 },
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      name: 'Tirzepatide 5MG',
      description: 'Tirzepatide - 5MG Vial',
      category: 'Weight Management',
      pricePerVial: 400,
      pricePerBox: 4000,
      vialsPerBox: 10,
      isActive: true,
      imageUrl: null,
      specifications: { mg: 5 },
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 5,
      name: 'Tirzepatide 10MG',
      description: 'Tirzepatide - 10MG Vial',
      category: 'Weight Management',
      pricePerVial: 750,
      pricePerBox: 7500,
      vialsPerBox: 10,
      isActive: true,
      imageUrl: null,
      specifications: { mg: 10 },
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 6,
      name: 'Tirzepatide 15MG',
      description: 'Tirzepatide - 15MG Vial',
      category: 'Weight Management',
      pricePerVial: 1100,
      pricePerBox: 11000,
      vialsPerBox: 10,
      isActive: true,
      imageUrl: null,
      specifications: { mg: 15 },
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Semaglutide variants
    {
      id: 7,
      name: 'Semaglutide 2MG',
      description: 'Semaglutide - 2MG Vial',
      category: 'Weight Management',
      pricePerVial: 150,
      pricePerBox: 1500,
      vialsPerBox: 10,
      isActive: true,
      imageUrl: null,
      specifications: { mg: 2 },
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 8,
      name: 'Semaglutide 5MG',
      description: 'Semaglutide - 5MG Vial',
      category: 'Weight Management',
      pricePerVial: 350,
      pricePerBox: 3500,
      vialsPerBox: 10,
      isActive: true,
      imageUrl: null,
      specifications: { mg: 5 },
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // TB-500 variants
    {
      id: 9,
      name: 'TB-500 2MG',
      description: 'Thymosin Beta-4 - 2MG Vial',
      category: 'Muscle & Joint Support',
      pricePerVial: 200,
      pricePerBox: 2000,
      vialsPerBox: 10,
      isActive: true,
      imageUrl: null,
      specifications: { mg: 2 },
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 10,
      name: 'TB-500 5MG',
      description: 'Thymosin Beta-4 - 5MG Vial',
      category: 'Muscle & Joint Support',
      pricePerVial: 450,
      pricePerBox: 4500,
      vialsPerBox: 10,
      isActive: true,
      imageUrl: null,
      specifications: { mg: 5 },
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Ipamorelin variants
    {
      id: 11,
      name: 'Ipamorelin 2MG',
      description: 'Growth Hormone Releasing Peptide - 2MG Vial',
      category: 'Growth Hormone',
      pricePerVial: 120,
      pricePerBox: 1200,
      vialsPerBox: 10,
      isActive: true,
      imageUrl: null,
      specifications: { mg: 2 },
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 12,
      name: 'Ipamorelin 5MG',
      description: 'Growth Hormone Releasing Peptide - 5MG Vial',
      category: 'Growth Hormone',
      pricePerVial: 280,
      pricePerBox: 2800,
      vialsPerBox: 10,
      isActive: true,
      imageUrl: null,
      specifications: { mg: 5 },
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

export async function getProductsByPeptideName(peptideName: string): Promise<Product[]> {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not configured. Using fallback data.');
      const fallbackProducts = getFallbackProducts();
      return fallbackProducts.filter(p =>
        p.name.toLowerCase().includes(peptideName.toLowerCase()),
      );
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${peptideName}%`)
      .eq('is_active', true)
      .order('name');

    if (error) {
      // Try to find in fallback data
      const fallbackProducts = getFallbackProducts();
      return fallbackProducts.filter(p =>
        p.name.toLowerCase().includes(peptideName.toLowerCase()),
      );
    }

    if (!products || products.length === 0) {
      // Try to find in fallback data
      const fallbackProducts = getFallbackProducts();
      return fallbackProducts.filter(p =>
        p.name.toLowerCase().includes(peptideName.toLowerCase()),
      );
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
    // Try to find in fallback data
    const fallbackProducts = getFallbackProducts();
    return fallbackProducts.filter(p =>
      p.name.toLowerCase().includes(peptideName.toLowerCase()),
    );
  }
}
