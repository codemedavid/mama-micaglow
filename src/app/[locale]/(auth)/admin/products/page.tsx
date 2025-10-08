'use client';

import {
  AlertCircle,
  DollarSign,
  Edit,
  Filter,
  Package,
  Plus,
  Search,
  Trash2,
  X,
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
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardImage } from '@/components/ui/OptimizedImage';
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

const peptideNames = [
  'BPC-157',
  'Tirzepatide',
  'Semaglutide',
  'Retatrutide',
  'TB-500',
  'Ipamorelin',
  'CJC-1295',
  'GHRP-6',
  'GHRP-2',
  'IGF-1 LR3',
  'MGF',
  'PEG-MGF',
  'Thymosin Alpha-1',
  'Thymosin Beta-4',
  'AOD-9604',
  'HGH Fragment 176-191',
  'Melanotan II',
  'PT-141',
  'DSIP',
  'Epitalon',
  'Thymalin',
  'Bremelanotide',
  'Oxytocin',
  'Vasopressin',
  'Selank',
  'Semax',
  'Cerebrolysin',
  'Cortexin',
  'P21',
  'Dihexa',
  'NAD+',
  'Glutathione',
  'Bacteriostatic Water',
];

export default function AdminProductsPage() {
  const { isAdmin, loading: roleLoading } = useRole();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [peptideFilter, setPeptideFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
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

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Handle error if needed
      } else {
        setProducts(data || []);
      }
    } catch {
      // Handle error if needed
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(prev => ({
      ...prev,
      name: '',
      description: '',
      category: '',
      price_per_vial: '',
      price_per_box: '',
      vials_per_box: '10',
      image_url: '',
      specifications: '',
    }));
  };

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }

    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin, roleLoading, router]);

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
          return;
        }
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) {
          return;
        }
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch {
      // Handle error if needed
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
  // Filter products based on search query and all filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchQuery === ''
      || product.name.toLowerCase().includes(searchQuery.toLowerCase())
      || product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      || product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPeptide = peptideFilter === 'all'
      || product.name.toLowerCase().includes(peptideFilter.toLowerCase());

    const matchesCategory = categoryFilter === 'all'
      || product.category === categoryFilter;

    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'active' && product.is_active)
      || (statusFilter === 'inactive' && !product.is_active);

    return matchesSearch && matchesPeptide && matchesCategory && matchesStatus;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setPeptideFilter('all');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  const handleDelete = async (productId: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        // Handle error if needed
      } else {
        fetchProducts();
      }
    } catch {
      // Handle error if needed
    }
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
            <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct
                    ? 'Update the product information below.'
                    : 'Fill in the details to add a new product to your catalog.'}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-1">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value as string }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={value => setFormData(prev => ({ ...prev, category: value as string }))}
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
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value as string }))}
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
                        onChange={e => setFormData(prev => ({ ...prev, price_per_vial: e.target.value as string }))}
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
                        onChange={e => setFormData(prev => ({ ...prev, price_per_box: e.target.value as string }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="vials_per_box">Vials per Box</Label>
                      <Input
                        id="vials_per_box"
                        type="number"
                        value={formData.vials_per_box}
                        onChange={e => setFormData(prev => ({ ...prev, vials_per_box: e.target.value as string }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="image_url">Product Image</Label>
                    <ImageUpload
                      currentImageUrl={formData.image_url || undefined}
                      onImageUploadedAction={(url: string) => setFormData(prev => ({ ...prev, image_url: url }))}
                      onImageRemovedAction={() => setFormData(prev => ({ ...prev, image_url: '' }))}
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
                      onChange={e => setFormData(prev => ({ ...prev, specifications: e.target.value as string }))}
                      rows={4}
                      placeholder='{"purity": "99%", "storage": "2-8°C", "shelf_life": "24 months"}'
                    />
                  </div>

                </form>
              </div>
              <div className="mt-4 flex flex-shrink-0 justify-end space-x-2 border-t border-gray-200 pt-4">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  {isSubmitting
                    ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                          {editingProduct ? 'Updating...' : 'Creating...'}
                        </>
                      )
                    : (
                        <>
                          <Package className="mr-2 h-4 w-4" />
                          {editingProduct ? 'Update Product' : 'Add Product'}
                        </>
                      )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search products by name, description, or category..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pr-10 pl-10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />

                {/* Peptide Filter */}
                <Select value={peptideFilter} onValueChange={setPeptideFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by peptide" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Peptides</SelectItem>
                    {peptideNames.map(peptide => (
                      <SelectItem key={peptide} value={peptide}>
                        {peptide}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Count and Active Filters */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing
                {' '}
                {filteredProducts.length}
                {' '}
                of
                {' '}
                {products.length}
                {' '}
                products
              </div>

              {/* Active Filters Indicator */}
              {(searchQuery || peptideFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all') && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Active filters:</span>
                  <div className="flex flex-wrap gap-1">
                    {searchQuery && (
                      <Badge variant="secondary" className="text-xs">
                        Search: "
                        {searchQuery}
                        "
                      </Badge>
                    )}
                    {peptideFilter !== 'all' && (
                      <Badge variant="secondary" className="text-xs">
                        Peptide:
                        {' '}
                        {peptideFilter}
                      </Badge>
                    )}
                    {categoryFilter !== 'all' && (
                      <Badge variant="secondary" className="text-xs">
                        Category:
                        {' '}
                        {categoryFilter}
                      </Badge>
                    )}
                    {statusFilter !== 'all' && (
                      <Badge variant="secondary" className="text-xs">
                        Status:
                        {' '}
                        {statusFilter}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map(product => (
            <Card key={product.id} className="group border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      {product.image_url
                        ? (
                            <CardImage
                              src={product.image_url}
                              alt={product.name}
                              size="small"
                              className="rounded-xl"
                            />
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
                      <CardImage
                        src={product.image_url}
                        alt={product.name}
                        size="large"
                        className="h-full w-full rounded-lg"
                      />
                    </div>
                  )}

                  {product.description && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {product.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-purple-200/50 bg-gradient-to-r from-purple-50 to-purple-50 p-3">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">
                          ₱
                          {product.price_per_vial}
                          /vial
                        </span>
                      </div>
                      <Badge
                        variant={product.is_active ? 'default' : 'secondary'}
                        className={product.is_active ? 'border-purple-200 bg-purple-100 text-purple-800' : ''}
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

        {filteredProducts.length === 0 && products.length > 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200">
              <Search className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900">No products found</h3>
            <p className="mx-auto mb-8 max-w-md text-gray-600">
              No products match your current search or filter criteria. Try adjusting your search terms or filters.
            </p>
            <Button
              onClick={clearFilters}
              variant="outline"
              className="border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              Clear Filters
            </Button>
          </div>
        )}

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
