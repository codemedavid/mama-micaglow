'use client';

import {
  AlertCircle,
  DollarSign,
  Edit,
  Package,
  Plus,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';

type Product = {
  id: number;
  name: string;
  description: string | null;
  category: string;
  price_per_vial: number;
  price_per_box: number;
  vials_per_box: number;
  is_active: boolean;
  image_url: string | null;
  specifications: any | null;
  created_by: number;
  created_at: string;
  updated_at: string;
};

const categories = [
  'Healing & Recovery',
  'Growth Hormone',
  'Muscle & Joint Support',
  'Cognitive Enhancement',
  'Weight Management',
  'Anti-Aging',
  'Sleep & Recovery',
];

export default function AdminProductsPage() {
  const { isAdmin, loading: roleLoading } = useRole();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price_per_vial: '',
    price_per_box: '',
    vials_per_box: '10',
    image_url: '',
    specifications: '',
  });

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }

    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin, roleLoading, router]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        price_per_vial: Number.parseFloat(formData.price_per_vial),
        price_per_box: Number.parseFloat(formData.price_per_box),
        vials_per_box: Number.parseInt(formData.vials_per_box),
        image_url: formData.image_url || null,
        specifications: formData.specifications ? JSON.parse(formData.specifications) : null,
        created_by: 1, // This should be the current user's ID
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) {
          console.error('Error updating product:', error);
          return;
        }
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) {
          console.error('Error creating product:', error);
          return;
        }
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      price_per_vial: product.price_per_vial.toString(),
      price_per_box: product.price_per_box.toString(),
      vials_per_box: product.vials_per_box.toString(),
      image_url: product.image_url || '',
      specifications: product.specifications ? JSON.stringify(product.specifications, null, 2) : '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        return;
      }

      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price_per_vial: '',
      price_per_box: '',
      vials_per_box: '10',
      image_url: '',
      specifications: '',
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    resetForm();
  };

  if (roleLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="mt-2 text-gray-600">Manage your peptide product catalog</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleDialogClose()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct
                    ? 'Update the product information below.'
                    : 'Fill in the details to add a new product to your catalog.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={value => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="price_per_vial">Price per Vial (₱)</Label>
                    <Input
                      id="price_per_vial"
                      type="number"
                      step="0.01"
                      value={formData.price_per_vial}
                      onChange={e => setFormData(prev => ({ ...prev, price_per_vial: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_per_box">Price per Box (₱)</Label>
                    <Input
                      id="price_per_box"
                      type="number"
                      step="0.01"
                      value={formData.price_per_box}
                      onChange={e => setFormData(prev => ({ ...prev, price_per_box: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="vials_per_box">Vials per Box</Label>
                    <Input
                      id="vials_per_box"
                      type="number"
                      value={formData.vials_per_box}
                      onChange={e => setFormData(prev => ({ ...prev, vials_per_box: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image_url">Product Image</Label>
                  <ImageUpload
                    value={formData.image_url || undefined}
                    onChange={url => setFormData(prev => ({ ...prev, image_url: url || '' }))}
                    disabled={isSubmitting}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Upload a high-quality image of your product. Recommended size: 800x600px
                  </p>
                </div>

                <div>
                  <Label htmlFor="specifications">Specifications (JSON)</Label>
                  <Textarea
                    id="specifications"
                    value={formData.specifications}
                    onChange={e => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
                    rows={4}
                    placeholder='{"purity": "99%", "storage": "2-8°C", "shelf_life": "24 months"}'
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <Card key={product.id} className="group border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      {product.image_url
                        ? (
                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )
                        : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-lg font-bold text-white">
                              {product.name.charAt(0)}
                            </div>
                          )}
                      <div>
                        <CardTitle className="text-lg text-gray-900">{product.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {product.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Product Image Preview */}
                  {product.image_url && (
                    <div className="h-32 w-full overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  {product.description && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {product.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-green-200/50 bg-gradient-to-r from-green-50 to-emerald-50 p-3">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">
                          ₱
                          {product.price_per_vial}
                          /vial
                        </span>
                      </div>
                      <Badge
                        variant={product.is_active ? 'default' : 'secondary'}
                        className={product.is_active ? 'border-green-200 bg-green-100 text-green-800' : ''}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Box Price:</span>
                      <span className="font-semibold text-gray-900">
                        ₱
                        {product.price_per_box}
                        {' '}
                        (
                        {product.vials_per_box}
                        {' '}
                        vials)
                      </span>
                    </div>

                    {product.specifications && (
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Specifications:</span>
                        <span>
                          {Object.keys(product.specifications).length}
                          {' '}
                          properties
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200">
              <Package className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900">No products yet</h3>
            <p className="mx-auto mb-8 max-w-md text-gray-600">
              Get started by adding your first product to your catalog. You can manage pricing, categories, and specifications.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Your First Product
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
