'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { Bell, Home, Layers, LogOut, MapPin, Menu, Package, Settings, Shield, ShoppingBag, User, Users as UsersIcon, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin, isHost, userProfile, loading } = useRole();
  const { user } = useUser();
  const { signOut } = useClerk();

  // Debug logging
  console.warn('Dashboard Layout Debug:', {
    isAdmin,
    isHost,
    userProfile,
    loading,
    userEmail: user?.emailAddresses?.[0]?.emailAddress,
  });

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: Package },
    { name: 'Profile', href: '/dashboard?tab=profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ...(isHost
      ? [
          { name: '— Host —', href: '#', icon: MapPin },
          { name: 'Host Overview', href: '/host', icon: MapPin },
          { name: 'My Batches', href: '/host/batches', icon: Layers },
        ]
      : []),
    ...(isAdmin
      ? [
          { name: '— Admin —', href: '#', icon: Shield },
          { name: 'Admin Overview', href: '/admin', icon: Shield },
          { name: 'Products', href: '/admin/products', icon: Package },
          { name: 'Batches', href: '/admin/batches', icon: Layers },
          { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
          { name: 'Users', href: '/admin/users', icon: UsersIcon },
          { name: 'Analytics', href: '/admin/analytics', icon: Settings },
        ]
      : []),
  ];

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
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">Your Account</h2>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="space-y-1 p-4">
              {navigation.map((item) => {
                if (item.name.startsWith('—')) {
                  const sectionName = item.name.includes('Host') ? 'Host' : 'Admin';
                  return (
                    <div
                      key={item.name}
                      className="mt-3 mb-1 px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                    >
                      {sectionName}
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-grow flex-col border-r border-gray-200/50 bg-white/80 shadow-xl backdrop-blur-xl">
            {/* Brand */}
            <div className="flex items-center border-b border-gray-200/50 px-6 py-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 text-white">
                  M
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Mama_MicaGlow</h1>
                  <p className="text-xs text-gray-500">Account</p>
                </div>
              </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 px-4 py-6">
              {navigation.map((item) => {
                if (item.name.startsWith('—')) {
                  const sectionName = item.name.includes('Host') ? 'Host' : 'Admin';
                  return (
                    <div
                      key={item.name}
                      className="mt-4 mb-1 px-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
                    >
                      {sectionName}
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Help */}
            <div className="border-t border-gray-200/50 p-4">
              <p className="text-xs text-gray-500">Need help? Email support@mamamicalglow.com</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
          {/* Top Bar */}
          <div className="sticky top-0 z-40 border-b border-border bg-white">
            <div className="flex h-14 items-center justify-between px-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <h2 className="text-lg font-semibold">Dashboard</h2>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">2</Badge>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-xs font-semibold text-white">
                        {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
                      </div>
                      <div className="hidden text-left sm:block">
                        <p className="text-sm font-medium">{user?.firstName || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user?.emailAddresses?.[0]?.emailAddress || 'user@example.com'}</p>
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
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
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

          {/* Page content area */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
