'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Home,
  Layers,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  User,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading } = useRole();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [hasAdminUsers, setHasAdminUsers] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/admin', icon: Home, current: pathname === '/admin' },
    { name: 'Products', href: '/admin/products', icon: Package, current: pathname.startsWith('/admin/products') },
    { name: 'Batches', href: '/admin/batches', icon: Layers, current: pathname.startsWith('/admin/batches') },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart, current: pathname.startsWith('/admin/orders') },
    { name: 'Regions', href: '/admin/regions', icon: Shield, current: pathname.startsWith('/admin/regions') },
    { name: 'Users', href: '/admin/users', icon: Users, current: pathname.startsWith('/admin/users') },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, current: pathname.startsWith('/admin/analytics') },
    { name: 'Settings', href: '/admin/settings', icon: Settings, current: pathname.startsWith('/admin/settings') },
  ];

  useEffect(() => {
    const checkAdminUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'admin')
          .limit(1);

        if (error) {
          setHasAdminUsers(false);
        } else {
          setHasAdminUsers(data && data.length > 0);
        }
      } catch {
        setHasAdminUsers(false);
      }
    };

    checkAdminUsers();
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin && hasAdminUsers === false) {
      router.push('/admin/setup');
    } else if (!loading && !isAdmin && hasAdminUsers === true) {
      router.push('/dashboard');
    }
  }, [isAdmin, loading, hasAdminUsers, router]);

  if (loading || hasAdminUsers === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
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
              <h2 className="text-lg font-semibold">Admin Panel</h2>
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
                      ? 'bg-purple-100 text-purple-700'
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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-700">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Link href="/">
                    <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-xs text-gray-500">Mama_MicaGlow</p>
                  </Link>
                </div>
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
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700',
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="border-t border-gray-200/50 p-4">
              <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                <Link href="/admin/products">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
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
                    {navigation.find(item => item.current)?.name || 'Admin'}
                  </h2>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-xs font-semibold text-white">
                        {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'A'}
                      </div>
                      <div className="hidden text-left sm:block">
                        <p className="text-sm font-medium">{user?.firstName || 'Admin'}</p>
                        <p className="text-xs text-muted-foreground">{user?.emailAddresses?.[0]?.emailAddress || 'admin@example.com'}</p>
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
