'use client';

import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle,
  Clock,
  Filter,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShoppingCart,
  TrendingUp,
  Truck,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

type Order = {
  id: number;
  order_code: string;
  customer_name: string;
  whatsapp_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  total_amount: number;
  created_at: string;
  updated_at: string;
  batch: {
    id: number;
    name: string;
    status: string;
    host_id: number;
  };
  order_items: Array<{
    id: number;
    quantity: number;
    product: {
      id: number;
      name: string;
      category: string;
    };
  }>;
};

type OrderStats = {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  paidOrders: number;
  pendingPayments: number;
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

export default function HostOrdersPage() {
  const { isHost, loading, userProfile } = useRole();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    paidOrders: 0,
    pendingPayments: 0,
  });
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // New state for enhanced functionality
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isHost || !userProfile) {
      return;
    }

    const fetchOrders = async () => {
      try {
        // Fetch orders for this host's region
        const { data: ordersData, error } = await supabase
          .from('sub_group_orders')
          .select(`
            *,
            batch:sub_group_batches!inner(
              id,
              name,
              status,
              host_id
            ),
            order_items:sub_group_order_items(
              id,
              quantity,
              product:products(
                id,
                name,
                category
              )
            )
          `)
          .eq('batch.host_id', userProfile.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error);
          return;
        }

        setOrders(ordersData || []);

        // Calculate stats
        const totalOrders = ordersData?.length || 0;
        const pendingOrders = ordersData?.filter(order => order.status === 'pending').length || 0;
        const confirmedOrders = ordersData?.filter(order => order.status === 'confirmed').length || 0;
        const processingOrders = ordersData?.filter(order => order.status === 'processing').length || 0;
        const shippedOrders = ordersData?.filter(order => order.status === 'shipped').length || 0;
        const deliveredOrders = ordersData?.filter(order => order.status === 'delivered').length || 0;
        const cancelledOrders = ordersData?.filter(order => order.status === 'cancelled').length || 0;
        const totalRevenue = ordersData?.reduce((sum, order) =>
          order.payment_status === 'paid' ? sum + order.total_amount : sum, 0) || 0;
        const paidOrders = ordersData?.filter(order => order.payment_status === 'paid').length || 0;
        const pendingPayments = ordersData?.filter(order => order.payment_status === 'pending').length || 0;

        setStats({
          totalOrders,
          pendingOrders,
          confirmedOrders,
          processingOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue,
          paidOrders,
          pendingPayments,
        });
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchOrders();
  }, [isHost, userProfile]);
  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'refunded': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('sub_group_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
      } else {
        // Refresh orders
        const { data: ordersData } = await supabase
          .from('sub_group_orders')
          .select(`
            *,
            batch:sub_group_batches!inner(
              id,
              name,
              status,
              host_id
            ),
            order_items:sub_group_order_items(
              id,
              quantity,
              product:products(
                id,
                name,
                category
              )
            )
          `)
          .eq('batch.host_id', userProfile?.id)
          .order('created_at', { ascending: false });

        if (ordersData) {
          setOrders(ordersData);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const updatePaymentStatus = async (orderId: number, newPaymentStatus: string) => {
    try {
      const { error } = await supabase
        .from('sub_group_orders')
        .update({ payment_status: newPaymentStatus })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating payment status:', error);
      } else {
        // Refresh orders
        const { data: ordersData } = await supabase
          .from('sub_group_orders')
          .select(`
            *,
            batch:sub_group_batches!inner(
              id,
              name,
              status,
              host_id
            ),
            order_items:sub_group_order_items(
              id,
              quantity,
              product:products(
                id,
                name,
                category
              )
            )
          `)
          .eq('batch.host_id', userProfile?.id)
          .order('created_at', { ascending: false });

        if (ordersData) {
          setOrders(ordersData);
        }
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const openWhatsApp = (order: Order) => {
    const message = `Hi ${order.customer_name}! I'm following up on your order ${order.order_code} for batch "${order.batch.name}". Please provide an update on the status.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${order.whatsapp_number}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      || order.order_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
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

  const bulkUpdateStatus = async (newStatus: string) => {
    if (selectedOrders.length === 0) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sub_group_orders')
        .update({ status: newStatus })
        .in('id', selectedOrders);

      if (error) {
        console.error('Error bulk updating status:', error);
      } else {
        // Refresh orders
        const { data: ordersData } = await supabase
          .from('sub_group_orders')
          .select(`
            *,
            batch:sub_group_batches!inner(
              id,
              name,
              status,
              host_id
            ),
            order_items:sub_group_order_items(
              id,
              quantity,
              product:products(
                id,
                name,
                category
              )
            )
          `)
          .eq('batch.host_id', userProfile?.id)
          .order('created_at', { ascending: false });

        if (ordersData) {
          setOrders(ordersData);
        }
        setSelectedOrders([]);
      }
    } catch (error) {
      console.error('Error bulk updating status:', error);
    }
  };

  const bulkUpdatePaymentStatus = async (newPaymentStatus: string) => {
    if (selectedOrders.length === 0) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sub_group_orders')
        .update({ payment_status: newPaymentStatus })
        .in('id', selectedOrders);

      if (error) {
        console.error('Error bulk updating payment status:', error);
      } else {
        // Refresh orders
        const { data: ordersData } = await supabase
          .from('sub_group_orders')
          .select(`
            *,
            batch:sub_group_batches!inner(
              id,
              name,
              status,
              host_id
            ),
            order_items:sub_group_order_items(
              id,
              quantity,
              product:products(
                id,
                name,
                category
              )
            )
          `)
          .eq('batch.host_id', userProfile?.id)
          .order('created_at', { ascending: false });

        if (ordersData) {
          setOrders(ordersData);
        }
        setSelectedOrders([]);
      }
    } catch (error) {
      console.error('Error bulk updating payment status:', error);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setPaymentFilter('all');
    setSearchTerm('');
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
    if (searchTerm) {
      count++;
    }
    return count;
  };

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!isHost) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Orders</h1>
          <p className="text-xl text-gray-600">Manage orders from your regional customers</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Total Orders</p>
                  <p className="text-3xl font-bold">{stats.totalOrders}</p>
                </div>
                <div className="rounded-full bg-blue-400/20 p-3">
                  <ShoppingCart className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-100">Pending Orders</p>
                  <p className="text-3xl font-bold">{stats.pendingOrders}</p>
                </div>
                <div className="rounded-full bg-yellow-400/20 p-3">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-100">Delivered</p>
                  <p className="text-3xl font-bold">{stats.deliveredOrders}</p>
                </div>
                <div className="rounded-full bg-green-400/20 p-3">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">Total Revenue</p>
                  <p className="text-3xl font-bold">
                    ₱
                    {stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-full bg-purple-400/20 p-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
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
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
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

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border bg-blue-50 p-3">
            <span className="text-sm font-medium text-blue-800">
              {selectedOrders.length}
              {' '}
              order(s) selected
            </span>
            <div className="flex gap-2">
              <Select onValueChange={bulkUpdateStatus}>
                <SelectTrigger className="h-8 w-32">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={bulkUpdatePaymentStatus}>
                <SelectTrigger className="h-8 w-32">
                  <SelectValue placeholder="Update Payment" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrders([])}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

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
                              <div className="text-sm text-muted-foreground">{order.whatsapp_number}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{order.batch.name}</div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₱
                            {order.total_amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell>
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
                                title="Contact via WhatsApp"
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
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
      </div>
    </div>
  );
}
