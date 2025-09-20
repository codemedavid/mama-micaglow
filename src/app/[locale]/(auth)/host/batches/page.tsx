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
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardImage } from '@/components/ui/OptimizedImage';
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

type HostBatch = {
  id: number;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'payment_collection' | 'ordering' | 'processing' | 'shipped' | 'delivered';
  target_vials: number;
  current_vials: number;
  discount_percentage: number;
  shipping_fee: number;
  start_date: string;
  end_date: string;
  host_id: number;
  created_at: string;
  updated_at: string;
  batch_products: BatchProduct[];
};

const batchStatuses = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'active', label: 'Active', color: 'bg-purple-100 text-purple-800' },
  { value: 'payment_collection', label: 'Payment Collection', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'ordering', label: 'Ordering', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export default function HostBatchesPage() {
  const { isHost, isAdmin, userProfile, loading } = useRole();
  const [batches, setBatches] = useState<HostBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'draft' as 'draft' | 'active' | 'completed' | 'cancelled' | 'payment_collection' | 'ordering' | 'processing' | 'shipped' | 'delivered',
    shipping_fee: 0,
    products: [] as Array<{ product_id: number; target_vials: number; price_per_vial: number }>,
  });

  const canManage = useMemo(() => (isHost || isAdmin) && !!userProfile, [isHost, isAdmin, userProfile]);

  // Function to recalculate current_vials from existing orders
  const recalculateBatchProgress = async (batchId: number) => {
    try {
      // Get all orders for this batch
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          order_items(
            quantity,
            product_id
          )
        `)
        .eq('batch_id', batchId);

      if (ordersError) {
        console.error('Error fetching orders for batch:', ordersError);
        return 0;
      }

      // Calculate total vials from all orders
      const totalVials = orders?.reduce((sum, order) => {
        return sum + (order.order_items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0);
      }, 0) || 0;

      // Update the batch's current_vials
      const { error: updateError } = await supabase
        .from('sub_group_batches')
        .update({ current_vials: totalVials })
        .eq('id', batchId);

      if (updateError) {
        console.error('Error updating batch current_vials:', updateError);
        return 0;
      }

      return totalVials;
    } catch (error) {
      console.error('Error recalculating batch progress:', error);
      return 0;
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

  useEffect(() => {
    const load = async () => {
      if (!userProfile) {
        return;
      }
      try {
        const { data } = await supabase
          .from('sub_group_batches')
          .select(`
            *,
            batch_products:sub_group_batch_products(
              *,
              product:products(*)
            )
          `)
          .eq('host_id', userProfile.id)
          .order('created_at', { ascending: false });
        setBatches((data || []) as HostBatch[]);
      } finally {
        setFetching(false);
      }
    };
    if (!loading && canManage) {
      load();
      fetchProducts();
    }
  }, [loading, canManage, userProfile]);

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      status: 'draft',
      shipping_fee: 0,
      products: [],
    });
  };

  const handleCreate = async () => {
    if (!userProfile) {
      return;
    }
    setIsSaving(true);
    try {
      // First, get the host's sub-group
      const { data: subGroup, error: subGroupError } = await supabase
        .from('sub_groups')
        .select('id')
        .eq('host_id', userProfile.id)
        .eq('is_active', true)
        .single();

      if (subGroupError) {
        console.error('Error fetching host sub-group:', subGroupError);
        setIsSaving(false);
        return;
      }

      if (!subGroup) {
        console.error('No active sub-group found for this host');
        setIsSaving(false);
        return;
      }

      const batchData = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        status: form.status,
        target_vials: form.products.reduce((sum, p) => sum + p.target_vials, 0),
        current_vials: 0,
        discount_percentage: 0, // No discount for host batches
        shipping_fee: form.shipping_fee,
        start_date: new Date().toISOString(), // Set to current date
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        host_id: userProfile.id,
        region_id: subGroup.id, // Add the sub-group ID as region_id
      };

      let batchId: number;

      // For sub-group batches, we only deactivate other active batches from the same host
      // since they are separate from the main group buy batches
      // Each sub-group (host) can have its own active batch, but only one active per host

      // If setting status to 'active', deactivate all other active batches from this host first
      if (form.status === 'active') {
        const { error: deactivateError } = await supabase
          .from('sub_group_batches')
          .update({ status: 'draft' })
          .eq('status', 'active')
          .eq('host_id', userProfile.id);

        if (deactivateError) {
          console.error('Error deactivating other batches:', deactivateError);
          return;
        }
      }

      // Check if we're editing an existing batch by looking for a batch with the same name and host_id
      const existingBatch = batches.find(b => b.name === form.name && b.host_id === userProfile.id);

      if (existingBatch) {
        // If reactivating a batch, recalculate current_vials from existing orders
        if (form.status === 'active' && existingBatch.status !== 'active') {
          const recalculatedVials = await recalculateBatchProgress(existingBatch.id);
          batchData.current_vials = recalculatedVials;
        } else if (form.status === 'active' && existingBatch.status === 'active') {
          // If already active, keep current progress
          batchData.current_vials = existingBatch.current_vials;
        }

        // Update existing batch
        const { data, error } = await supabase
          .from('sub_group_batches')
          .update(batchData)
          .eq('id', existingBatch.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating batch:', error);
          return;
        }
        batchId = data.id;

        // If reactivating a batch, also recalculate individual product progress
        if (form.status === 'active' && existingBatch.status !== 'active') {
          // Recalculate current_vials for each product in the batch
          for (const product of form.products) {
            const { data: productOrders, error: productOrdersError } = await supabase
              .from('orders')
              .select(`
                order_items!inner(
                  quantity,
                  product_id
                )
              `)
              .eq('batch_id', batchId)
              .eq('order_items.product_id', product.product_id);

            if (!productOrdersError && productOrders) {
              const productVials = productOrders.reduce((sum, order) => {
                return sum + (order.order_items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0);
              }, 0);

              // Update the product's current_vials in sub_group_batch_products
              await supabase
                .from('sub_group_batch_products')
                .update({ current_vials: productVials })
                .eq('batch_id', batchId)
                .eq('product_id', product.product_id);
            }
          }
        }

        // Delete existing batch products
        await supabase
          .from('sub_group_batch_products')
          .delete()
          .eq('batch_id', batchId);
      } else {
        // Create new batch
        const { data, error } = await supabase
          .from('sub_group_batches')
          .insert(batchData)
          .select('*')
          .single();

        if (error) {
          console.error('Error creating batch:', error);
          return;
        }
        batchId = data.id;
      }

      // Insert batch products if there are any
      if (form.products.length > 0) {
        const validProducts = form.products.filter(p => p.product_id > 0 && p.target_vials > 0);

        if (validProducts.length > 0) {
          const batchProducts = validProducts.map(p => ({
            batch_id: batchId,
            product_id: p.product_id,
            target_vials: p.target_vials,
            current_vials: 0,
            price_per_vial: p.price_per_vial,
          }));

          const { error: productsError } = await supabase
            .from('sub_group_batch_products')
            .insert(batchProducts);

          if (productsError) {
            console.error('Error creating batch products:', productsError);
            return;
          }
        }
      }

      // Reload batches to get the complete data with products
      const { data: updatedBatches } = await supabase
        .from('sub_group_batches')
        .select(`
          *,
          batch_products:sub_group_batch_products(
            *,
            product:products(*)
          )
        `)
        .eq('host_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (updatedBatches) {
        setBatches(updatedBatches as HostBatch[]);
      }

      setIsOpen(false);
      resetForm();
    } finally {
      setIsSaving(false);
    }
  };

  const addProduct = () => {
    setForm(prev => ({
      ...prev,
      products: [...prev.products, { product_id: 0, target_vials: 0, price_per_vial: 0 }],
    }));
  };

  const addProductFromList = (product: Product) => {
    setForm(prev => ({
      ...prev,
      products: [...prev.products, {
        product_id: product.id,
        target_vials: 10, // Default target vials
        price_per_vial: product.price_per_vial, // Use official product price
      }],
    }));
  };

  const removeProduct = (index: number) => {
    setForm(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      products: prev.products.map((p, i) =>
        i === index ? { ...p, [field]: value } : p,
      ),
    }));
  };

  const handleEdit = (batch: HostBatch) => {
    setForm({
      name: batch.name,
      description: batch.description || '',
      status: batch.status,
      shipping_fee: batch.shipping_fee || 0,
      products: batch.batch_products?.map(bp => ({
        product_id: bp.product_id,
        target_vials: bp.target_vials,
        price_per_vial: bp.price_per_vial,
      })) || [],
    });
    setIsOpen(true);
  };

  const handleDelete = async (batchId: number) => {
    try {
      // First, delete all related batch products
      const { error: productsError } = await supabase
        .from('sub_group_batch_products')
        .delete()
        .eq('batch_id', batchId);

      if (productsError) {
        return;
      }

      // Then delete the batch itself
      const { error: batchError } = await supabase
        .from('sub_group_batches')
        .delete()
        .eq('id', batchId);

      if (batchError) {
        return;
      }

      // Reload batches
      const { data: updatedBatches } = await supabase
        .from('sub_group_batches')
        .select(`
          *,
          batch_products:sub_group_batch_products(
            *,
            product:products(*)
          )
        `)
        .eq('host_id', userProfile?.id)
        .order('created_at', { ascending: false });

      if (updatedBatches) {
        setBatches(updatedBatches as HostBatch[]);
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <TrendingUp className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getProgressPercentage = (batch: HostBatch) => {
    if (batch.target_vials === 0) {
      return 0;
    }
    return Math.round((batch.current_vials / batch.target_vials) * 100);
  };

  // Function to handle batch status changes with progress recalculation
  const handleBatchStatusChange = async (batchId: number, newStatus: string) => {
    try {
      // If activating a batch, recalculate progress from existing orders
      if (newStatus === 'active') {
        // First deactivate other active batches from the same host
        const { error: deactivateError } = await supabase
          .from('sub_group_batches')
          .update({ status: 'draft' })
          .eq('status', 'active')
          .eq('host_id', userProfile?.id);

        if (deactivateError) {
          console.error('Error deactivating other batches:', deactivateError);
          return;
        }

        // Recalculate progress for the batch being activated
        await recalculateBatchProgress(batchId);

        // Recalculate progress for individual products
        const { data: batchProducts } = await supabase
          .from('sub_group_batch_products')
          .select('product_id')
          .eq('batch_id', batchId);

        if (batchProducts) {
          for (const batchProduct of batchProducts) {
            const { data: productOrders, error: productOrdersError } = await supabase
              .from('orders')
              .select(`
                order_items!inner(
                  quantity,
                  product_id
                )
              `)
              .eq('batch_id', batchId)
              .eq('order_items.product_id', batchProduct.product_id);

            if (!productOrdersError && productOrders) {
              const productVials = productOrders.reduce((sum, order) => {
                return sum + (order.order_items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0);
              }, 0);

              await supabase
                .from('sub_group_batch_products')
                .update({ current_vials: productVials })
                .eq('batch_id', batchId)
                .eq('product_id', batchProduct.product_id);
            }
          }
        }
      }

      // Update the batch status
      const { error: updateError } = await supabase
        .from('sub_group_batches')
        .update({ status: newStatus })
        .eq('id', batchId);

      if (updateError) {
        console.error('Error updating batch status:', updateError);
        return;
      }

      // Reload batches to reflect changes
      const { data: updatedBatches } = await supabase
        .from('sub_group_batches')
        .select(`
          *,
          batch_products:sub_group_batch_products(
            *,
            product:products(*)
          )
        `)
        .eq('host_id', userProfile?.id)
        .order('created_at', { ascending: false });

      if (updatedBatches) {
        setBatches(updatedBatches as HostBatch[]);
      }
    } catch (error) {
      console.error('Error handling batch status change:', error);
    }
  };

  if (loading || !canManage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Sub-Group Batches</h1>
            <p className="mt-2 text-gray-600">Manage your regional sub-group buying batches and product allocations</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
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
                      {batches.some(b => b.name === form.name && b.host_id === userProfile?.id) ? 'Edit Sub-Group Batch' : 'Create Sub-Group Batch'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      {batches.some(b => b.name === form.name && b.host_id === userProfile?.id)
                        ? 'Update your regional group buying batch details and product allocations'
                        : 'Set up a new regional group buying batch with products and vial targets'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="space-y-8">
                  {/* Basic Information */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                    <div className="mb-6 flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Batch Information</h3>
                        <p className="text-sm text-gray-500">Basic details for your regional group buy batch</p>
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
                          value={form.name}
                          onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Manila Healing Peptides Batch #001"
                          className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                        <Select
                          value={form.status}
                          onValueChange={(value: any) => setForm(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {batchStatuses.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                <div className="flex items-center space-x-2">
                                  <div className={`h-2 w-2 rounded-full ${status.value === 'active' ? 'bg-purple-500' : status.value === 'completed' ? 'bg-blue-500' : status.value === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
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
                        value={form.description}
                        onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this regional batch includes, its benefits, and any special instructions..."
                        rows={4}
                        className="resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>

                    <div className="mt-8 space-y-2">
                      <Label htmlFor="shipping_fee" className="flex items-center text-sm font-medium text-gray-700">
                        <span>Shipping Fee (₱)</span>
                        <span className="ml-1 text-xs text-gray-500">(Total fee to be split among orders)</span>
                      </Label>
                      <Input
                        id="shipping_fee"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.shipping_fee}
                        onChange={e => setForm(prev => ({ ...prev, shipping_fee: Number.parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                        className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                      <p className="text-xs text-gray-500">
                        This amount will be automatically split equally among all orders when the batch enters payment collection phase.
                      </p>
                    </div>

                  </div>

                  {/* Available Products Section */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">Available Products</h3>
                          <p className="text-sm text-gray-500">Select products to include in this regional batch</p>
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
                        const isAlreadyAdded = form.products.some(p => p.product_id === product.id);
                        return (
                          <div
                            key={product.id}
                            className={`group flex cursor-pointer items-center space-x-4 rounded-xl border-2 p-5 transition-all duration-200 ${
                              isAlreadyAdded
                                ? 'border-gray-200 bg-gray-50 opacity-75'
                                : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 hover:shadow-md'
                            }`}
                            onClick={() => {
                              if (!isAlreadyAdded) {
                                addProductFromList(product);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                if (!isAlreadyAdded) {
                                  addProductFromList(product);
                                }
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            {/* Product Image */}
                            <div className="relative flex-shrink-0">
                              {product.image_url
                                ? (
                                    <CardImage
                                      src={product.image_url}
                                      alt={product.name}
                                      size="medium"
                                      className="rounded-xl shadow-sm"
                                    />
                                  )
                                : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-xl font-bold text-white shadow-sm">
                                      {product.name.charAt(0)}
                                    </div>
                                  )}
                              {isAlreadyAdded && (
                                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500">
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
                                <p className="text-lg font-bold text-purple-600">
                                  ₱
                                  {product.price_per_vial}
                                </p>
                                <p className="text-xs text-gray-500">per vial</p>
                              </div>

                              {isAlreadyAdded
                                ? (
                                    <div className="flex items-center space-x-2 rounded-lg bg-purple-100 px-3 py-2 text-purple-700">
                                      <CheckCircle className="h-4 w-4" />
                                      <span className="text-sm font-medium">Added</span>
                                    </div>
                                  )
                                : (
                                    <Button
                                      type="button"
                                      size="sm"
                                      className="rounded-lg bg-purple-600 px-4 py-2 text-white shadow-sm hover:bg-purple-700"
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
                            {form.products.length}
                            {' '}
                            products selected
                          </p>
                        </div>
                      </div>
                      {form.products.length > 0 && (
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
                      {form.products.length === 0
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
                            form.products.map((product, index) => {
                              const selectedProduct = products.find(p => p.id === product.product_id);
                              return (
                                <div key={`product-${product.product_id}-${product.target_vials}`} className="rounded-xl border border-gray-200 bg-gray-50 p-6">
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
                                                      <CardImage src={p.image_url} alt={p.name} size="small" />
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
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-shrink-0 items-center justify-between border-t border-gray-200 bg-gray-50 px-8 py-6">
                <div className="text-sm text-gray-500">
                  {form.products.length > 0 && (
                    <span>
                      {form.products.length}
                      {' '}
                      products selected • Total target:
                      {' '}
                      {form.products.reduce((sum, p) => sum + p.target_vials, 0)}
                      {' '}
                      vials
                    </span>
                  )}
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="h-12 border-gray-300 px-6 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving || !form.name.trim()}
                    onClick={handleCreate}
                    className="h-12 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-8 font-medium text-white shadow-sm hover:from-purple-700 hover:to-purple-800 disabled:opacity-50"
                  >
                    {isSaving
                      ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                            {batches.some(b => b.name === form.name && b.host_id === userProfile?.id) ? 'Updating...' : 'Creating...'}
                          </>
                        )
                      : (
                          <>
                            <Package className="mr-2 h-4 w-4" />
                            {batches.some(b => b.name === form.name && b.host_id === userProfile?.id) ? 'Update Batch' : 'Create Batch'}
                          </>
                        )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {fetching
          ? (
              <div className="py-20 text-center text-gray-600">Loading your batches…</div>
            )
          : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {batches.map(batch => (
                  <Card
                    key={batch.id}
                    className={`group cursor-pointer border-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                      batch.status === 'active'
                        ? 'border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-50'
                        : 'bg-white/80'
                    }`}
                    onClick={() => window.location.href = `/host/batches/${batch.id}`}
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
                                  <Badge className="animate-pulse bg-purple-500 px-2 py-1 text-xs text-white">
                                    LIVE
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Select
                            value={batch.status}
                            onValueChange={value => handleBatchStatusChange(batch.id, value)}
                          >
                            <SelectTrigger
                              className="h-8 w-32 opacity-0 transition-opacity group-hover:opacity-100"
                              onClick={e => e.stopPropagation()}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {batchStatuses.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                  <div className="flex items-center space-x-2">
                                    <div className={`h-2 w-2 rounded-full ${status.value === 'active' ? 'bg-purple-500' : status.value === 'completed' ? 'bg-blue-500' : status.value === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                                    <span>{status.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(batch);
                            }}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(batch.id);
                            }}
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
                            <div>
                              <span className="text-gray-500">Shipping Fee:</span>
                              <span className="ml-1 font-semibold">
                                ₱
                                {batch.shipping_fee?.toLocaleString() || '0.00'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Status:</span>
                              <span className="ml-1 font-semibold">
                                {batchStatuses.find(s => s.value === batch.status)?.label}
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
                {batches.length === 0 && (
                  <div className="py-16 text-center">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200">
                      <Users className="h-12 w-12 text-purple-600" />
                    </div>
                    <h3 className="mb-3 text-2xl font-bold text-gray-900">No batches yet</h3>
                    <p className="mx-auto mb-8 max-w-md text-gray-600">
                      Create your first regional group buying batch to start offering products to customers in your area.
                    </p>
                    <Button
                      onClick={() => setIsOpen(true)}
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Create Your First Batch
                    </Button>
                  </div>
                )}
              </div>
            )}
      </div>
    </div>
  );
}
