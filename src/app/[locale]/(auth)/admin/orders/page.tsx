'use client';

import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';

type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_per_vial: number;
  total_price: number;
  created_at: string;
  product: {
    id: number;
    name: string;
    category: string;
  };
};

type Order = {
  id: number;
  order_code: string;
  customer_name: string;
  whatsapp_number?: string;
  customer_phone?: string;
  customer_email?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_province?: string;
  shipping_zip_code?: string;
  batch_id?: number;
  subtotal?: number;
  shipping_cost?: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
  user_id?: number;
  batch?: {
    id: number;
    name: string;
    status: string;
  };
  user?: {
    id: number;
    clerk_id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
  order_items?: OrderItem[];
};

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: RefreshCw },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'bg-purple-100 text-purple-800', icon: Package },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle },
];

const paymentStatusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'paid', label: 'Paid', color: 'bg-purple-100 text-purple-800' },
  { value: 'refunded', label: 'Refunded', color: 'bg-red-100 text-red-800' },
];

type SortField = 'order_code' | 'customer_name' | 'total_amount' | 'created_at' | 'status' | 'payment_status';
type SortDirection = 'asc' | 'desc';

export default function OrdersPage() {
  const { isAdmin, loading: roleLoading } = useRole();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtering states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [batchFilter, setBatchFilter] = useState<string>('all');

  // Sorting states
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Selection states
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Fetch group buy orders
      const { data: groupBuyOrders, error: groupBuyError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch individual orders
      const { data: individualOrders, error: individualError } = await supabase
        .from('individual_orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch sub-group orders - simplified query first
      const { data: subGroupOrders, error: subGroupError } = await supabase
        .from('sub_group_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (groupBuyError && individualError && subGroupError) {
        // All failed
        setOrders([]);
      } else {
        // Combine all order types
        const combined = [
          ...(groupBuyOrders || []),
          ...(individualOrders || []),
          ...(subGroupOrders || []),
        ];

        // Sort by created_at descending
        combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setOrders(combined);
      }
    } catch {
      // Handle error if needed
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }

    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin, roleLoading, router]);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      // Try updating group buy orders first
      const { error: groupBuyError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      // If group buy order update failed, try individual orders
      if (groupBuyError) {
        const { error: individualError } = await supabase
          .from('individual_orders')
          .update({ status: newStatus })
          .eq('id', orderId);

        // If individual order update failed, try sub-group orders
        if (individualError) {
          await supabase
            .from('sub_group_orders')
            .update({ status: newStatus })
            .eq('id', orderId);
        }
      }

      await fetchOrders();
    } catch {
      // Handle error if needed
    }
  };

  const updatePaymentStatus = async (orderId: number, newPaymentStatus: string) => {
    try {
      // Try updating group buy orders first
      const { error: groupBuyError } = await supabase
        .from('orders')
        .update({ payment_status: newPaymentStatus })
        .eq('id', orderId);

      // If group buy order update failed, try individual orders
      if (groupBuyError) {
        const { error: individualError } = await supabase
          .from('individual_orders')
          .update({ payment_status: newPaymentStatus })
          .eq('id', orderId);

        // If individual order update failed, try sub-group orders
        if (individualError) {
          await supabase
            .from('sub_group_orders')
            .update({ payment_status: newPaymentStatus })
            .eq('id', orderId);
        }
      }

      await fetchOrders();
    } catch {
      // Handle error if needed
    }
  };

  const deleteOrder = async (orderId: number) => {
    try {
      setIsDeleting(true);

      // Try to delete from group buy orders first
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      const { error: groupBuyError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      // If group buy order deletion failed, try individual orders
      if (groupBuyError) {
        await supabase
          .from('individual_order_items')
          .delete()
          .eq('order_id', orderId);

        const { error: individualError } = await supabase
          .from('individual_orders')
          .delete()
          .eq('id', orderId);

        // If individual order deletion failed, try sub-group orders
        if (individualError) {
          await supabase
            .from('sub_group_order_items')
            .delete()
            .eq('order_id', orderId);

          await supabase
            .from('sub_group_orders')
            .delete()
            .eq('id', orderId);
        }
      }

      await fetchOrders();
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    } catch {
      // Handle error if needed
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteSelectedOrders = async () => {
    try {
      setIsDeleting(true);

      // Delete from all order types
      // Group buy orders
      await supabase
        .from('order_items')
        .delete()
        .in('order_id', selectedOrders);

      await supabase
        .from('orders')
        .delete()
        .in('id', selectedOrders);

      // Individual orders
      await supabase
        .from('individual_order_items')
        .delete()
        .in('order_id', selectedOrders);

      await supabase
        .from('individual_orders')
        .delete()
        .in('id', selectedOrders);

      // Sub-group orders
      await supabase
        .from('sub_group_order_items')
        .delete()
        .in('order_id', selectedOrders);

      await supabase
        .from('sub_group_orders')
        .delete()
        .in('id', selectedOrders);

      await fetchOrders();
      setSelectedOrders([]);
      setDeleteDialogOpen(false);
    } catch {
      // Handle error if needed
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (orderId?: number) => {
    if (orderId) {
      setOrderToDelete(orderId);
    } else {
      setOrderToDelete(null);
    }
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (orderToDelete) {
      deleteOrder(orderToDelete);
    } else {
      deleteSelectedOrders();
    }
  };

  const openWhatsApp = (order: Order) => {
    const batchName = order.batch?.name || 'Individual Order';
    const message = `Hi! I'm following up on order ${order.order_code} for ${batchName}. Please provide an update on the status.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/639154901224?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // Get unique batches for filter
  const uniqueBatches = Array.from(new Set(orders.map(order => order.batch?.name || 'Individual Order')));

  // Advanced filtering logic
  const filteredOrders = orders.filter((order) => {
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    const paymentMatch = paymentFilter === 'all' || order.payment_status === paymentFilter;
    const batchMatch = batchFilter === 'all' || (order.batch?.name || 'Individual Order') === batchFilter;

    const searchMatch = searchQuery === ''
      || order.order_code.toLowerCase().includes(searchQuery.toLowerCase())
      || order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
      || (order.whatsapp_number || order.customer_phone || '').includes(searchQuery)
      || (order.batch?.name || 'Individual Order').toLowerCase().includes(searchQuery.toLowerCase());

    const dateMatch = (!dateRange.from || new Date(order.created_at) >= new Date(dateRange.from))
      && (!dateRange.to || new Date(order.created_at) <= new Date(dateRange.to));

    const amountMatch = (!amountRange.min || order.total_amount >= Number(amountRange.min))
      && (!amountRange.max || order.total_amount <= Number(amountRange.max));

    return statusMatch && paymentMatch && batchMatch && searchMatch && dateMatch && amountMatch;
  });

  // Sorting logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'created_at') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle selection
  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId],
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map(order => order.id));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setPaymentFilter('all');
    setSearchQuery('');
    setDateRange({ from: '', to: '' });
    setAmountRange({ min: '', max: '' });
    setBatchFilter('all');
    setCurrentPage(1);
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter !== 'all') {
      count++;
    }
    if (paymentFilter !== 'all') {
      count++;
    }
    if (searchQuery) {
      count++;
    }
    if (dateRange.from || dateRange.to) {
      count++;
    }
    if (amountRange.min || amountRange.max) {
      count++;
    }
    if (batchFilter !== 'all') {
      count++;
    }
    return count;
  };

  const getStatusIcon = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    const IconComponent = statusOption?.icon || Clock;
    return <IconComponent className="h-4 w-4" />;
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'refunded': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="text-muted-foreground">
            {roleLoading ? 'Checking permissions...' : 'Loading orders...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-gray-900">Orders Management</h1>
              <p className="text-xl text-gray-600">
                Manage group buy orders and track their status
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Bulk Delete Button */}
              {selectedOrders.length > 0 && (
                <Button
                  onClick={() => openDeleteDialog()}
                  variant="destructive"
                  className="bg-red-600 shadow-lg hover:bg-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected (
                  {selectedOrders.length}
                  )
                </Button>
              )}
              {/* Quick Batch Filter */}
              <div className="hidden items-center gap-2 md:flex">
                <Label htmlFor="batch-filter-quick" className="text-sm text-muted-foreground">Batch</Label>
                <Select value={batchFilter} onValueChange={setBatchFilter}>
                  <SelectTrigger id="batch-filter-quick" className="w-48 bg-white/80 shadow-lg backdrop-blur-sm">
                    <SelectValue placeholder="All Batches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    {uniqueBatches.map(batch => (
                      <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={fetchOrders} variant="outline" className="bg-white/80 shadow-lg backdrop-blur-sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" className="bg-white/80 shadow-lg backdrop-blur-sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-0 bg-white/80 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Search & Filters</CardTitle>
              <div className="flex items-center gap-2">
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {getActiveFiltersCount()}
                    {' '}
                    active
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                {getActiveFiltersCount() > 0 && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search orders, customers, or batch names..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="status-filter" className="mb-2 block text-sm font-medium">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="payment-filter" className="mb-2 block text-sm font-medium">Payment Status</Label>
                  <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Payment Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payment Statuses</SelectItem>
                      {paymentStatusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {getPaymentStatusIcon(option.value)}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="batch-filter" className="mb-2 block text-sm font-medium">Batch</Label>
                  <Select value={batchFilter} onValueChange={setBatchFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Batches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batches</SelectItem>
                      {uniqueBatches.map(batch => (
                        <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date-from" className="mb-2 block text-sm font-medium">Date From</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateRange.from}
                    onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="date-to" className="mb-2 block text-sm font-medium">Date To</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateRange.to}
                    onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="amount-min" className="mb-2 block text-sm font-medium">Amount Range</Label>
                  <div className="flex gap-2">
                    <Input
                      id="amount-min"
                      type="number"
                      placeholder="Min"
                      value={amountRange.min}
                      onChange={e => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={amountRange.max}
                      onChange={e => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing
            {' '}
            {startIndex + 1}
            -
            {Math.min(endIndex, sortedOrders.length)}
            {' '}
            of
            {' '}
            {sortedOrders.length}
            {' '}
            orders
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="items-per-page" className="text-sm">Items per page:</Label>
            <Select value={itemsPerPage.toString()} onValueChange={value => setItemsPerPage(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders Table */}
        {paginatedOrders.length === 0
          ? (
              <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">No Orders Found</h3>
                  <p className="text-gray-600">
                    {orders.length === 0
                      ? 'No orders have been placed yet.'
                      : 'No orders match the current filters.'}
                  </p>
                </CardContent>
              </Card>
            )
          : (
              <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b">
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                            onChange={handleSelectAll}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('order_code')}
                        >
                          <div className="flex items-center gap-2">
                            Order Code
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('customer_name')}
                        >
                          <div className="flex items-center gap-2">
                            Customer
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('total_amount')}
                        >
                          <div className="flex items-center gap-2">
                            Amount
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center gap-2">
                            Status
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('payment_status')}
                        >
                          <div className="flex items-center gap-2">
                            Payment
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('created_at')}
                        >
                          <div className="flex items-center gap-2">
                            Date
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="w-12">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOrders.map(order => (
                        <TableRow key={order.id} className="hover:bg-gray-50">
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => handleSelectOrder(order.id)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{order.order_code}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customer_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {order.whatsapp_number || order.customer_phone || 'No contact'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {order.batch?.name || 'Individual Order'}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₱
                            {order.total_amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusOptions.find(s => s.value === order.status)?.color} flex w-fit items-center gap-1`}>
                              {getStatusIcon(order.status)}
                              {statusOptions.find(s => s.value === order.status)?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${paymentStatusOptions.find(s => s.value === order.payment_status)?.color} flex w-fit items-center gap-1`}>
                              {getPaymentStatusIcon(order.payment_status)}
                              {paymentStatusOptions.find(s => s.value === order.payment_status)?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openWhatsApp(order)}
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(order.id)}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Select value={order.status} onValueChange={value => updateOrderStatus(order.id, value)}>
                                <SelectTrigger className="h-8 w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      <div className="flex items-center gap-2">
                                        <option.icon className="h-4 w-4" />
                                        {option.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select value={order.payment_status} onValueChange={value => updatePaymentStatus(order.id, value)}>
                                <SelectTrigger className="h-8 w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {paymentStatusOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      <div className="flex items-center gap-2">
                                        {getPaymentStatusIcon(option.value)}
                                        {option.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page
              {' '}
              {currentPage}
              {' '}
              of
              {' '}
              {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                {orderToDelete
                  ? 'Are you sure you want to delete this order? This action cannot be undone.'
                  : `Are you sure you want to delete ${selectedOrders.length} selected order(s)? This action cannot be undone.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setOrderToDelete(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
