import type { Metadata } from 'next';
import { UserProfile } from '@clerk/nextjs';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Dashboard - Mama_MicaGlow',
    description: 'Manage your peptide purchases, group buys, and regional sub-groups.',
  };
}

export default function Dashboard() {
  // Mock data - in real app, this would come from Supabase
  const stats = {
    totalOrders: 12,
    activeGroupBuys: 3,
    subGroupsJoined: 2,
    totalSpent: 45600,
  };

  const recentOrders = [
    {
      id: 'ORD-001',
      product: 'BPC-157',
      type: 'Individual',
      quantity: 1,
      total: 2500,
      status: 'delivered',
      date: '2024-01-15',
    },
    {
      id: 'ORD-002',
      product: 'TB-500',
      type: 'Group Buy',
      quantity: 2,
      total: 640,
      status: 'shipped',
      date: '2024-01-20',
    },
    {
      id: 'ORD-003',
      product: 'Ipamorelin',
      type: 'Individual',
      quantity: 1,
      total: 1800,
      status: 'processing',
      date: '2024-01-25',
    },
  ];

  const activeGroupBuys = [
    {
      id: 'GB-001',
      name: 'Healing Peptides Batch #001',
      progress: 75,
      products: ['BPC-157', 'TB-500'],
      endDate: '2024-02-15',
      participants: 24,
    },
    {
      id: 'GB-002',
      name: 'Growth Hormone Batch #002',
      progress: 30,
      products: ['Ipamorelin', 'Sermorelin'],
      endDate: '2024-02-20',
      participants: 12,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 py-8 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Welcome back!</h1>
              <p className="text-purple-100">Manage your peptide purchases and group buys</p>
            </div>
            <Button variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-6">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Group Buys</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeGroupBuys}</div>
              <p className="text-xs text-muted-foreground">3 batches in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sub-Groups Joined</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.subGroupsJoined}</div>
              <p className="text-xs text-muted-foreground">2 regional groups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₱
                {stats.totalSpent.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="group-buys">Group Buys</TabsTrigger>
            <TabsTrigger value="sub-groups">Sub-Groups</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest peptide purchases and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{order.product}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.type}
                            {' '}
                            •
                            {order.quantity}
                            {' '}
                            {order.quantity > 1 ? 'boxes' : 'box'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ₱
                          {order.total.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={order.status === 'delivered'
                              ? 'default'
                              : order.status === 'shipped' ? 'secondary' : 'outline'}
                          >
                            {order.status === 'delivered' && <CheckCircle className="mr-1 h-3 w-3" />}
                            {order.status === 'shipped' && <Clock className="mr-1 h-3 w-3" />}
                            {order.status === 'processing' && <AlertCircle className="mr-1 h-3 w-3" />}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline">
                    View All Orders
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="group-buys" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Group Buys</CardTitle>
                <CardDescription>Your participation in group buy batches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeGroupBuys.map(groupBuy => (
                    <div key={groupBuy.id} className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-medium">{groupBuy.name}</h3>
                        <Badge variant="outline">
                          {groupBuy.progress}
                          % complete
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Progress</span>
                          <span>
                            {groupBuy.progress}
                            %
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${groupBuy.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>
                            Products:
                            {groupBuy.products.join(', ')}
                          </span>
                          <span>
                            Ends:
                            {new Date(groupBuy.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button className="gradient-purple text-white hover:opacity-90">
                    <Users className="mr-2 h-4 w-4" />
                    Join New Group Buy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sub-groups" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Sub-Groups</CardTitle>
                <CardDescription>Your participation in regional communities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">No Sub-Groups Joined</h3>
                  <p className="mb-4 text-muted-foreground">
                    Join regional sub-groups to participate in local group purchases
                  </p>
                  <Button variant="outline">
                    <MapPin className="mr-2 h-4 w-4" />
                    Find Local Groups
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <UserProfile
                  appearance={{
                    elements: {
                      rootBox: 'w-full',
                      card: 'shadow-none border-0 bg-transparent',
                      navbar: 'hidden',
                      navbarMobileMenuButton: 'hidden',
                      headerTitle: 'text-2xl font-bold text-gray-900',
                      headerSubtitle: 'text-gray-600',
                      profileSectionTitle: 'text-lg font-semibold text-gray-900',
                      formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200',
                      formFieldInput: 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg py-2 px-3 transition-all duration-200',
                      formFieldLabel: 'text-gray-700 font-medium text-sm mb-1',
                      identityPreviewText: 'text-gray-600',
                      formFieldSuccessText: 'text-green-600 text-sm',
                      formFieldErrorText: 'text-red-600 text-sm',
                      footerActionLink: 'text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200',
                      formResendCodeLink: 'text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200',
                      otpCodeFieldInput: 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg py-2 px-3 text-base',
                      formFieldInputShowPasswordButton: 'text-gray-400 hover:text-gray-600 transition-colors duration-200',
                      formFieldInputShowPasswordIcon: 'text-gray-400',
                      formFieldInputHidePasswordButton: 'text-gray-400 hover:text-gray-600 transition-colors duration-200',
                      formFieldInputHidePasswordIcon: 'text-gray-400',
                    },
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
