'use client';

import { SignOutButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Button } from '@/components/ui/button';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Orders',
    href: '/dashboard/orders',
    icon: Package,
  },
  {
    name: 'Group Buys',
    href: '/dashboard/group-buys',
    icon: Users,
  },
  {
    name: 'Sub-Groups',
    href: '/dashboard/sub-groups',
    icon: MapPin,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

const quickActions = [
  {
    name: 'New Order',
    href: '/products',
    icon: ShoppingCart,
  },
  {
    name: 'Join Group Buy',
    href: '/products/group-buy',
    icon: Users,
  },
  {
    name: 'Find Sub-Groups',
    href: '/products/sub-groups',
    icon: MapPin,
  },
];

export function DashboardNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-background transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:static lg:inset-0 lg:translate-x-0
      `}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between border-b p-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="gradient-purple flex h-8 w-8 items-center justify-center rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="gradient-text-purple text-xl font-bold">
                Mama_MicaGlow
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                      ${isActive
                    ? 'border border-purple-200 bg-purple-100 text-purple-700'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="pt-6">
              <h3 className="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Quick Actions
              </h3>
              <div className="space-y-1">
                {quickActions.map(action => (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    <action.icon className="h-4 w-4" />
                    <span>{action.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <Package className="h-4 w-4 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">User Account</p>
                <p className="truncate text-xs text-muted-foreground">user@example.com</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Language</span>
                <LocaleSwitcher />
              </div>

              <SignOutButton>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
