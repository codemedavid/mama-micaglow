'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Bell,
  Home,
  Layers,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type HostRegion = {
  id: number;
  name: string;
  description: string | null;
  region: string;
  city: string;
  host_id: number | null;
  whatsapp_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isHost, loading, userProfile } = useRole();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hostRegion, setHostRegion] = useState<HostRegion | null>(null);
  const [regionLoading, setRegionLoading] = useState(true);

  const navigation = [
    { name: 'Overview', href: '/host', icon: Home, current: pathname === '/host' },
    { name: 'My Batches', href: '/host/batches', icon: Layers, current: pathname.startsWith('/host/batches') },
    { name: 'Orders', href: '/host/orders', icon: ShoppingCart, current: pathname.startsWith('/host/orders') },
    { name: 'Analytics', href: '/host/analytics', icon: BarChart3, current: pathname.startsWith('/host/analytics') },
    { name: 'Settings', href: '/host/settings', icon: Settings, current: pathname.startsWith('/host/settings') },
  ];

  // Fetch host's region
  useEffect(() => {
    const fetchHostRegion = async () => {
      if (!userProfile || !isHost) {
        setRegionLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('sub_groups')
          .select('*')
          .eq('host_id', userProfile.id)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching host region:', error);
          setHostRegion(null);
        } else {
          setHostRegion(data);
        }
      } catch (error) {
        console.error('Error fetching host region:', error);
        setHostRegion(null);
      } finally {
        setRegionLoading(false);
      }
    };

    if (!loading && isHost && userProfile) {
      fetchHostRegion();
    }
  }, [isHost, loading, userProfile]);

  useEffect(() => {
    if (!loading && !isHost) {
      router.push('/dashboard');
    }
  }, [isHost, loading, router]);

  if (loading || regionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading host dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isHost) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (!hostRegion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="text-center">
          <MapPin className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">No Region Assigned</h1>
          <p className="text-gray-600">You haven't been assigned to any region yet. Contact an administrator.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSidebarOpen(false);
              }
            }}
            role="button"
            tabIndex={0}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">Host Dashboard</h2>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="space-y-2 p-4">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    item.current
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-grow flex-col border-r border-gray-200/50 bg-white/80 shadow-xl backdrop-blur-xl">
            {/* Logo */}
            <div className="flex items-center border-b border-gray-200/50 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Link href="/">
                    <h1 className="text-lg font-bold text-gray-900">Host Dashboard</h1>
                    <p className="text-xs text-gray-500">{hostRegion.name}</p>
                  </Link>
                </div>
              </div>
            </div>

            {/* Region Info */}
            <div className="border-b border-gray-200/50 px-6 py-4">
              <div className="rounded-lg bg-blue-50 p-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">{hostRegion.region}</p>
                    <p className="text-xs text-blue-700">{hostRegion.city}</p>
                  </div>
                </div>
                {hostRegion.whatsapp_number && (
                  <p className="mt-1 text-xs text-blue-600">
                    WhatsApp:
                    {' '}
                    {hostRegion.whatsapp_number}
                  </p>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 px-4 py-6">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    item.current
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700',
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="border-t border-gray-200/50 p-4">
              <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Link href="/host/batches">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Batch
                </Link>
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full" onClick={() => setSidebarOpen(false)}>
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to App
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col lg:pl-64">
          {/* Top Bar */}
          <div className="sticky top-0 z-40 border-b border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="hidden sm:block">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {navigation.find(item => item.current)?.name || 'Host Dashboard'}
                  </h2>
                  <p className="text-sm text-gray-600">{hostRegion.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                    3
                  </Badge>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-semibold text-white">
                        {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'H'}
                      </div>
                      <div className="hidden text-left sm:block">
                        <p className="text-sm font-medium">{user?.firstName || 'Host'}</p>
                        <p className="text-xs text-muted-foreground">{user?.emailAddresses?.[0]?.emailAddress || 'host@example.com'}</p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">
                        {user?.firstName}
                        {' '}
                        {user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{user?.emailAddresses?.[0]?.emailAddress}</p>
                      <p className="text-xs text-blue-600">
                        Host -
                        {hostRegion.name}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard?tab=profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
