import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { DashboardTabs } from '@/components/DashboardTabs';
import { RoleDebugger } from '@/components/RoleDebugger';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Dashboard - Mama_MicaGlow',
    description: 'Manage your peptide purchases and orders.',
  };
}

export default async function Dashboard() {
  const user = await currentUser();

  // Fetch user's orders from database
  const stats = {
    totalOrders: 0,
    totalSpent: 0,
  };

  let recentOrders: any[] = [];

  if (user) {
    try {
      // Get user profile to find user_id
      const { data: userProfile } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();

      if (userProfile) {
        // Fetch user's orders
        const { data: orders } = await supabase
          .from('orders')
          .select(`
            *,
            batch:group_buy_batches(id, name, status),
            order_items(
              *,
              product:products(id, name, category)
            )
          `)
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false });

        if (orders) {
          stats.totalOrders = orders.length;
          stats.totalSpent = orders
            .filter(order => order.payment_status === 'paid')
            .reduce((sum, order) => sum + order.total_amount, 0);

          // Transform orders for display - show all order items
          recentOrders = orders.slice(0, 5).map((order: any) => {
            const orderItems = order.order_items || [];
            const totalQuantity = orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

            return {
              id: order.order_code,
              product: orderItems.length === 1
                ? orderItems[0]?.product?.name || 'Unknown Product'
                : `${orderItems.length} Items`,
              type: 'Group Buy',
              quantity: totalQuantity,
              total: order.total_amount,
              status: order.status,
              date: order.created_at.split('T')[0],
              orderId: order.id,
              batchName: order.batch?.name,
              orderItems,
              paymentStatus: order.payment_status,
            };
          });
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 py-8 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Welcome back!</h1>
              <p className="text-purple-100">Manage your peptide purchases and orders</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="/track-order">
                  <Search className="mr-2 h-4 w-4" />
                  Track Order
                </Link>
              </Button>
              <Button variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100" asChild>
                <Link href="/products">
                  <Plus className="mr-2 h-4 w-4" />
                  New Order
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-6">
        <RoleDebugger />
        <DashboardTabs
          recentOrders={recentOrders}
          totalOrders={stats.totalOrders}
          totalSpent={stats.totalSpent}
        />
      </div>
    </div>
  );
}
