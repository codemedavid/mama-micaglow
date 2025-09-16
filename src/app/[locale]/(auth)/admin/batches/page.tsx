'use client';

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Package,
  Plus,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  image_url: string | null;
};

type BatchProduct = {
  product_id: number;
  product: Product;
  target_vials: number;
  current_vials: number;
  price_per_vial: number;
};

type Batch = {
  id: number;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  target_vials: number;
  current_vials: number;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  batch_products: BatchProduct[];
};

const batchStatuses = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export default function AdminBatchesPage() {
  const { isAdmin, loading: roleLoading } = useRole();
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft' as 'draft' | 'active' | 'completed' | 'cancelled',
    products: [] as Array<{ product_id: number; target_vials: number; price_per_vial: number }>,
  });

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }

    if (isAdmin) {
      fetchBatches();
      fetchProducts();
    }
  }, [isAdmin, roleLoading, router]);

  const fetchBatches = async () => {
    try {
      // First, let's try a simple query to see if the table exists
      const { data, error } = await supabase
        .from('group_buy_batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching batches:', error);
        // If the main query fails, try to fetch without nested data
        const { data: simpleData, error: simpleError } = await supabase
          .from('group_buy_batches')
          .select('*')
          .order('created_at', { ascending: false });

        if (simpleError) {
          console.error('Error with simple query:', simpleError);
          setBatches([]);
        } else {
          setBatches(simpleData?.map(batch => ({ ...batch, batch_products: [] })) || []);
        }
      } else {
        // If basic query works, try to fetch batch products separately
        const batchIds = data?.map(batch => batch.id) || [];
        let batchProducts: any[] = [];

        if (batchIds.length > 0) {
          const { data: productsData, error: productsError } = await supabase
            .from('group_buy_products')
            .select(`
              *,
              product:products(*)
            `)
            .in('batch_id', batchIds);

          if (!productsError && productsData) {
            batchProducts = productsData;
          }
        }

        // Combine batches with their products
        const batchesWithProducts = data?.map(batch => ({
          ...batch,
          batch_products: batchProducts.filter(bp => bp.batch_id === batch.id),
        })) || [];

        setBatches(batchesWithProducts);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First, get the current user ID or create a default admin user
      let createdByUserId = 1;

      // Try to get the current user from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Try to find the user in our users table
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', user.id)
          .single();

        if (userData) {
          createdByUserId = userData.id;
        } else {
          // User not found in our users table, create a default admin user
          const { data: adminUser } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'admin')
            .limit(1)
            .single();

          if (adminUser) {
            createdByUserId = adminUser.id;
          }
        }
      } else {
        // No authenticated user, try to find any admin user
        const { data: adminUser } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'admin')
          .limit(1)
          .single();

        if (adminUser) {
          createdByUserId = adminUser.id;
        }
      }

      const batchData = {
        name: formData.name,
        description: formData.description || null,
        status: formData.status,
        discount_percentage: 0, // No discount by default
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        created_by: createdByUserId,
        target_vials: formData.products.reduce((sum, p) => sum + p.target_vials, 0),
        current_vials: 0,
      };

      console.log('Creating batch with data:', batchData);
      console.log('Status value:', formData.status, 'Type:', typeof formData.status);

      let batchId: number;

      // If setting status to 'active', deactivate all other active batches first
      if (formData.status === 'active') {
        console.log('Setting other active batches to draft...');
        const { error: deactivateError } = await supabase
          .from('group_buy_batches')
          .update({ status: 'draft' })
          .eq('status', 'active')
          .neq('id', editingBatch?.id || 0); // Exclude current batch if editing

        if (deactivateError) {
          console.error('Error deactivating other batches:', deactivateError);
          alert(`Error updating other batches: ${deactivateError.message}`);
          return;
        }
        console.log('Other active batches set to draft successfully');
      }

      if (editingBatch) {
        const { data, error } = await supabase
          .from('group_buy_batches')
          .update(batchData)
          .eq('id', editingBatch.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating batch:', error);
          alert(`Error updating batch: ${error.message}`);
          return;
        }
        batchId = data.id;

        // Delete existing batch products
        await supabase
          .from('group_buy_products')
          .delete()
          .eq('batch_id', batchId);
      } else {
        const { data, error } = await supabase
          .from('group_buy_batches')
          .insert(batchData)
          .select()
          .single();

        if (error) {
          console.error('Error creating batch:', error);
          alert(`Error creating batch: ${error.message}`);
          return;
        }
        batchId = data.id;
      }

      // Insert batch products only if there are valid products
      if (formData.products.length > 0) {
        // Filter out invalid products (product_id = 0 or target_vials = 0)
        const validProducts = formData.products.filter(p =>
          p.product_id > 0 && p.target_vials > 0,
          // && p.price_per_vial > 0 // Temporarily removed
        );

        if (validProducts.length > 0) {
          // Temporarily remove price_per_vial to test if that's the issue
          const batchProducts = validProducts.map(p => ({
            batch_id: batchId,
            product_id: p.product_id,
            target_vials: p.target_vials,
            current_vials: 0,
            // price_per_vial: p.price_per_vial // Commented out temporarily
          }));

          console.log('Inserting batch products:', batchProducts);

          const { error: productsError } = await supabase
            .from('group_buy_products')
            .insert(batchProducts);

          if (productsError) {
            console.error('Error creating batch products:', productsError);
            console.error('Full error object:', JSON.stringify(productsError, null, 2));
            alert(`Error creating batch products: ${productsError.message || productsError.code || 'Unknown error'}`);
            return;
          }

          console.log('Batch products created successfully');
        }
      }

      await fetchBatches();
      handleDialogClose();

      // Show success message with info about active batch constraint
      if (formData.status === 'active') {
        alert('Batch created successfully! Other active batches have been automatically set to draft status.');
      } else {
        alert('Batch created successfully!');
      }
    } catch (error) {
      console.error('Error saving batch:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      description: batch.description || '',
      status: batch.status,
      products: batch.batch_products?.map(bp => ({
        product_id: bp.product_id,
        target_vials: bp.target_vials,
        price_per_vial: bp.price_per_vial,
      })) || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (batchId: number) => {
    if (!confirm('Are you sure you want to delete this batch? This will also delete all associated products. This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting batch with ID:', batchId);

      // First, delete all related batch products
      console.log('Deleting related batch products...');
      const { error: productsError } = await supabase
        .from('group_buy_products')
        .delete()
        .eq('batch_id', batchId);

      if (productsError) {
        console.error('Error deleting batch products:', productsError);
        alert(`Error deleting batch products: ${productsError.message || 'Unknown error'}`);
        return;
      }

      console.log('Batch products deleted successfully');

      // Then delete the batch itself
      console.log('Deleting batch...');
      const { error: batchError } = await supabase
        .from('group_buy_batches')
        .delete()
        .eq('id', batchId);

      if (batchError) {
        console.error('Error deleting batch:', batchError);
        console.error('Full error object:', JSON.stringify(batchError, null, 2));
        alert(`Error deleting batch: ${batchError.message || batchError.code || 'Unknown error'}`);
        return;
      }

      console.log('Batch deleted successfully');
      await fetchBatches();
      alert('Batch and all associated products deleted successfully!');
    } catch (error) {
      console.error('Error deleting batch:', error);
      alert(`Error deleting batch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingBatch(null);
    setFormData({
      name: '',
      description: '',
      status: 'draft',
      products: [],
    });
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { product_id: 0, target_vials: 0, price_per_vial: 0 }],
    }));
  };

  const addProductFromList = (product: Product) => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, {
        product_id: product.id,
        target_vials: 10, // Default target vials
        price_per_vial: product.price_per_vial, // Use official product price
      }],
    }));
  };

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((p, i) =>
        i === index ? { ...p, [field]: value } : p,
      ),
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <TrendingUp className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getProgressPercentage = (batch: Batch) => {
    if (batch.target_vials === 0) {
      return 0;
    }
    return Math.round((batch.current_vials / batch.target_vials) * 100);
  };

  if (roleLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading batches...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Group Buy Batches</h1>
            <p className="mt-2 text-gray-600">Manage group buying batches and product allocations</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleDialogClose()}>
                <Plus className="mr-2 h-4 w-4" />
                Create Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="flex h-[90vh] w-[95vw] max-w-[95vw] flex-col overflow-hidden p-0">
              <DialogHeader className="border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white px-8 py-6">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="mb-1 text-2xl font-bold text-gray-900">
                      {editingBatch ? 'Edit Batch' : 'Create New Batch'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      {editingBatch ? 'Update batch details and product allocations' : 'Set up a new group buying batch with products and vial targets'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-8 py-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                    <div className="mb-6 flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Batch Information</h3>
                        <p className="text-sm text-gray-500">Basic details for your group buy batch</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700">
                          <span>Batch Name</span>
                          <span className="ml-1 text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Healing Peptides Batch #001"
                          className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {batchStatuses.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                <div className="flex items-center space-x-2">
                                  <div className={`h-2 w-2 rounded-full ${status.value === 'active' ? 'bg-green-500' : status.value === 'completed' ? 'bg-blue-500' : status.value === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                                  <span>{status.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-8 space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this batch includes, its benefits, and any special instructions..."
                        rows={4}
                        className="resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Available Products Section */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">Available Products</h3>
                          <p className="text-sm text-gray-500">Select products to include in this batch</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {products.length}
                        {' '}
                        products available
                      </div>
                    </div>

                    <div className="max-h-96 space-y-3 overflow-y-auto">
                      {products.map((product) => {
                        const isAlreadyAdded = formData.products.some(p => p.product_id === product.id);
                        return (
                          <div
                            key={product.id}
                            className={`group flex cursor-pointer items-center space-x-4 rounded-xl border-2 p-5 transition-all duration-200 ${
                              isAlreadyAdded
                                ? 'border-gray-200 bg-gray-50 opacity-75'
                                : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50 hover:shadow-md'
                            }`}
                            onClick={() => {
                              if (!isAlreadyAdded) {
                                addProductFromList(product);
                              }
                            }}
                          >
                            {/* Product Image */}
                            <div className="relative flex-shrink-0">
                              {product.image_url
                                ? (
                                    <img
                                      src={product.image_url}
                                      alt={product.name}
                                      className="h-14 w-14 rounded-xl object-cover shadow-sm"
                                    />
                                  )
                                : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-xl font-bold text-white shadow-sm">
                                      {product.name.charAt(0)}
                                    </div>
                                  )}
                              {isAlreadyAdded && (
                                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                                  <CheckCircle className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate text-lg font-semibold text-gray-900">{product.name}</h4>
                              <p className="truncate text-sm text-gray-600">{product.category}</p>
                              {product.description && (
                                <p className="mt-1 line-clamp-1 truncate text-xs text-gray-400">{product.description}</p>
                              )}
                            </div>

                            {/* Price and Action */}
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-lg font-bold text-green-600">
                                  ₱
                                  {product.price_per_vial}
                                </p>
                                <p className="text-xs text-gray-500">per vial</p>
                              </div>

                              {isAlreadyAdded
                                ? (
                                    <div className="flex items-center space-x-2 rounded-lg bg-green-100 px-3 py-2 text-green-700">
                                      <CheckCircle className="h-4 w-4" />
                                      <span className="text-sm font-medium">Added</span>
                                    </div>
                                  )
                                : (
                                    <Button
                                      type="button"
                                      size="sm"
                                      className="rounded-lg bg-green-600 px-4 py-2 text-white shadow-sm hover:bg-green-700"
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Add to Batch
                                    </Button>
                                  )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {products.length === 0 && (
                      <div className="py-12 text-center text-gray-500">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="mb-2 text-lg font-medium text-gray-900">No products available</h4>
                        <p className="text-sm">Create products first in the Products section to add them to batches.</p>
                      </div>
                    )}
                  </div>

                  {/* Selected Products Section */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">Products in Batch</h3>
                          <p className="text-sm text-gray-500">
                            {formData.products.length}
                            {' '}
                            products selected
                          </p>
                        </div>
                      </div>
                      {formData.products.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addProduct}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add More
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {formData.products.length === 0
                        ? (
                            <div className="py-12 text-center text-gray-500">
                              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                <Package className="h-8 w-8 text-blue-400" />
                              </div>
                              <h4 className="mb-2 text-lg font-medium text-gray-900">No products selected</h4>
                              <p className="text-sm">Click on products above to add them to this batch.</p>
                            </div>
                          )
                        : (
                            formData.products.map((product, index) => {
                              const selectedProduct = products.find(p => p.id === product.product_id);
                              return (
                                <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                                    <div className="space-y-2">
                                      <Label className="flex items-center text-sm font-medium text-gray-700">
                                        <span>Product</span>
                                        <span className="ml-1 text-red-500">*</span>
                                      </Label>
                                      <Select
                                        value={product.product_id.toString()}
                                        onValueChange={(value) => {
                                          const selectedProduct = products.find(p => p.id === Number.parseInt(value));
                                          updateProduct(index, 'product_id', Number.parseInt(value));
                                          if (selectedProduct) {
                                            updateProduct(index, 'price_per_vial', selectedProduct.price_per_vial);
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                          <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {products.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                              <div className="flex items-center space-x-3">
                                                {p.image_url
                                                  ? (
                                                      <img src={p.image_url} alt={p.name} className="h-8 w-8 rounded-lg object-cover" />
                                                    )
                                                  : (
                                                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-sm font-bold text-white">
                                                        {p.name.charAt(0)}
                                                      </div>
                                                    )}
                                                <div>
                                                  <div className="font-medium">{p.name}</div>
                                                  <div className="text-xs text-gray-500">{p.category}</div>
                                                </div>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      {selectedProduct && (
                                        <p className="text-xs text-gray-500">
                                          Regular price: ₱
                                          {selectedProduct.price_per_vial}
                                          /vial
                                        </p>
                                      )}
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="flex items-center text-sm font-medium text-gray-700">
                                        <span>Target Vials</span>
                                        <span className="ml-1 text-red-500">*</span>
                                      </Label>
                                      <Input
                                        type="number"
                                        value={product.target_vials}
                                        onChange={e => updateProduct(index, 'target_vials', Number.parseInt(e.target.value) || 0)}
                                        min="1"
                                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="e.g., 50"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">Price per Vial (₱)</Label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={product.price_per_vial}
                                        onChange={e => updateProduct(index, 'price_per_vial', Number.parseFloat(e.target.value) || 0)}
                                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="0.00"
                                      />
                                      <p className="text-xs text-gray-500">
                                        Official product price
                                      </p>
                                    </div>
                                    <div className="flex items-end">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => removeProduct(index)}
                                        className="h-12 w-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="flex flex-shrink-0 items-center justify-between border-t border-gray-200 bg-gray-50 px-8 py-6">
                <div className="text-sm text-gray-500">
                  {formData.products.length > 0 && (
                    <span>
                      {formData.products.length}
                      {' '}
                      products selected • Total target:
                      {' '}
                      {formData.products.reduce((sum, p) => sum + p.target_vials, 0)}
                      {' '}
                      vials
                    </span>
                  )}
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                    className="h-12 border-gray-300 px-6 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="h-12 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-8 font-medium text-white shadow-sm hover:from-purple-700 hover:to-purple-800 disabled:opacity-50"
                  >
                    {isSubmitting
                      ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                            {editingBatch ? 'Updating...' : 'Creating...'}
                          </>
                        )
                      : (
                          <>
                            <Package className="mr-2 h-4 w-4" />
                            {editingBatch ? 'Update Batch' : 'Create Batch'}
                          </>
                        )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {batches.map(batch => (
            <Card
              key={batch.id}
              className={`group border-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                batch.status === 'active'
                  ? 'border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                  : 'bg-white/80'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-lg font-bold text-white">
                        {batch.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">{batch.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={`mt-1 text-xs ${batchStatuses.find(s => s.value === batch.status)?.color}`}>
                            {getStatusIcon(batch.status)}
                            <span className="ml-1">{batchStatuses.find(s => s.value === batch.status)?.label}</span>
                          </Badge>
                          {batch.status === 'active' && (
                            <Badge className="animate-pulse bg-green-500 px-2 py-1 text-xs text-white">
                              LIVE
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(batch)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(batch.id)}
                      className="text-red-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {batch.description && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {batch.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold">
                          {getProgressPercentage(batch)}
                          %
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
                          style={{ width: `${getProgressPercentage(batch)}%` }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-xs text-gray-500">
                        <span>
                          {batch.current_vials}
                          {' '}
                          vials
                        </span>
                        <span>
                          {batch.target_vials}
                          {' '}
                          target
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Products:</span>
                        <span className="ml-1 font-semibold">{batch.batch_products?.length || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Target:</span>
                        <span className="ml-1 font-semibold">
                          {batch.target_vials}
                          {' '}
                          vials
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      <div>
                        Start:
                        {new Date(batch.start_date).toLocaleDateString()}
                      </div>
                      <div>
                        End:
                        {new Date(batch.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {batches.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200">
              <Users className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900">No batches yet</h3>
            <p className="mx-auto mb-8 max-w-md text-gray-600">
              Create your first group buying batch to start offering discounted products to customers.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Batch
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
