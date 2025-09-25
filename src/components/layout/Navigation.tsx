'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { LogOut, Menu, Package, Search, Settings, Shield, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Cart } from '@/components/cart/Cart';
import { FloatingCart } from '@/components/cart/FloatingCart';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useRole } from '@/hooks/useRole';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const { isAdmin } = useRole();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="gradient-purple flex h-8 w-8 items-center justify-center rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="gradient-text-purple text-xl font-bold">
              Mama_MicaGlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px]">
                    <NavigationMenuLink asChild>
                      <Link
                        href="/products"
                        className="block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm leading-none font-medium">All Products</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Browse our complete peptide catalog
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/products"
                        className="block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm leading-none font-medium">Individual Purchase</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Buy complete boxes directly
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/products/group-buy"
                        className="block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm leading-none font-medium">Group Buy</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Join group purchases for better prices
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/products/sub-groups"
                        className="block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm leading-none font-medium">Regional Sub-Groups</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Connect with local hosts
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/track-order" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                    Track Order
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/peptide-dosing-guide" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                    Dosing Guide
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/faq" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                    FAQ
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop Actions */}
          <div className="hidden items-center space-x-4 md:flex">
            <Cart />
            {isSignedIn
              ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{user?.firstName || 'Account'}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard?tab=profile" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="flex items-center ">
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
                )
              : (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/sign-in">
                        <User className="mr-2 h-4 w-4" />
                        Sign In
                      </Link>
                    </Button>
                    <Button size="sm" className="gradient-purple text-white hover:opacity-90" asChild>
                      <Link href="/sign-up">
                        Get Started
                      </Link>
                    </Button>
                  </>
                )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative z-50 transition-colors duration-200 hover:bg-purple-50 md:hidden"
                aria-label="Open mobile menu"
              >
                <Menu className="h-5 w-5 transition-transform duration-200" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[320px] border-l-0 bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 backdrop-blur-xl sm:w-[380px]"
            >
              <div className="flex h-full flex-col">
                {/* Header with Close Button */}
                <div className="mb-8 flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-3">
                    <div className="gradient-purple flex h-8 w-8 items-center justify-center rounded-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <span className="gradient-text-purple text-lg font-bold">Menu</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 rounded-full p-0 hover:bg-purple-100"
                    aria-label="Close menu"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 space-y-2">
                  {/* Products Section */}
                  <div className="space-y-1">
                    <div className="px-3 py-2">
                      <h3 className="text-xs font-semibold tracking-wider text-purple-600 uppercase">Products</h3>
                    </div>
                    <Link
                      href="/products"
                      className="group flex items-center space-x-3 rounded-xl px-4 py-3 text-gray-700 transition-all duration-200 hover:bg-white/60 hover:shadow-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-200">
                        <Package className="h-4 w-4" />
                      </div>
                      <span className="font-medium">Individual Purchase</span>
                    </Link>
                    <Link
                      href="/products/group-buy"
                      className="group flex items-center space-x-3 rounded-xl px-4 py-3 text-gray-700 transition-all duration-200 hover:bg-white/60 hover:shadow-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-200">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">Group Buy</span>
                    </Link>
                    <Link
                      href="/products/sub-groups"
                      className="group flex items-center space-x-3 rounded-xl px-4 py-3 text-gray-700 transition-all duration-200 hover:bg-white/60 hover:shadow-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-colors group-hover:bg-green-200">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <span className="font-medium">Regional Sub-Groups</span>
                    </Link>
                  </div>

                  {/* Services Section */}
                  <div className="space-y-1 pt-4">
                    <div className="px-3 py-2">
                      <h3 className="text-xs font-semibold tracking-wider text-purple-600 uppercase">Services</h3>
                    </div>
                    <Link
                      href="/track-order"
                      className="group flex items-center space-x-3 rounded-xl px-4 py-3 text-gray-700 transition-all duration-200 hover:bg-white/60 hover:shadow-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-200">
                        <Search className="h-4 w-4" />
                      </div>
                      <span className="font-medium">Track Order</span>
                    </Link>
                    <Link
                      href="/peptide-dosing-guide"
                      className="group flex items-center space-x-3 rounded-xl px-4 py-3 text-gray-700 transition-all duration-200 hover:bg-white/60 hover:shadow-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition-colors group-hover:bg-orange-200">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">Dosing Guide</span>
                    </Link>
                    <Link
                      href="/faq"
                      className="group flex items-center space-x-3 rounded-xl px-4 py-3 text-gray-700 transition-all duration-200 hover:bg-white/60 hover:shadow-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100 text-pink-600 transition-colors group-hover:bg-pink-200">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">FAQ</span>
                    </Link>
                  </div>
                </div>

                {/* User Actions Section */}
                <div className="mt-6 border-t border-purple-200/50 pt-6">
                  <div className="space-y-3">
                    {isSignedIn
                      ? (
                          <>
                            <div className="px-3 py-2">
                              <h3 className="text-xs font-semibold tracking-wider text-purple-600 uppercase">Account</h3>
                            </div>
                            <Button variant="outline" className="h-12 w-full justify-start border-purple-200 bg-white/60 hover:bg-white hover:shadow-sm" asChild>
                              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                                <ShoppingBag className="mr-3 h-4 w-4" />
                                Dashboard
                              </Link>
                            </Button>
                            <Button variant="outline" className="h-12 w-full justify-start border-purple-200 bg-white/60 hover:bg-white hover:shadow-sm" asChild>
                              <Link href="/dashboard?tab=profile" onClick={() => setIsOpen(false)}>
                                <Settings className="mr-3 h-4 w-4" />
                                Profile Settings
                              </Link>
                            </Button>
                            {isAdmin && (
                              <Button variant="outline" className="h-12 w-full justify-start border-purple-200 bg-white/60 hover:bg-white hover:shadow-sm" asChild>
                                <Link href="/admin/products" onClick={() => setIsOpen(false)}>
                                  <Shield className="mr-3 h-4 w-4" />
                                  Admin Panel
                                </Link>
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              className="h-12 w-full justify-start border-purple-200 bg-white/60 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                              onClick={() => {
                                signOut();
                                setIsOpen(false);
                              }}
                            >
                              <LogOut className="mr-3 h-4 w-4" />
                              Sign Out
                            </Button>
                          </>
                        )
                      : (
                          <>
                            <div className="px-3 py-2">
                              <h3 className="text-xs font-semibold tracking-wider text-purple-600 uppercase">Account</h3>
                            </div>
                            <Button variant="outline" className="h-12 w-full justify-start border-purple-200 bg-white/60 hover:bg-white hover:shadow-sm" asChild>
                              <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                                <User className="mr-3 h-4 w-4" />
                                Sign In
                              </Link>
                            </Button>
                            <Button className="gradient-purple h-12 w-full text-white shadow-lg transition-all duration-200 hover:opacity-90 hover:shadow-xl" asChild>
                              <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                                Get Started
                              </Link>
                            </Button>
                          </>
                        )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Floating Cart for Mobile */}
      <div className="hidden md:hidden">
        <FloatingCart />
      </div>

    </header>
  );
}
