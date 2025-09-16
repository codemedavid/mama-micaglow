'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { LogOut, Menu, Package, Settings, Shield, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Cart } from '@/components/cart/Cart';
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
                        href="/products/individual"
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
                  <Link href="/about" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                    About
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/contact" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                    Contact
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
                            <Link href="/admin/products" className="flex items-center">
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
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="mt-8 flex flex-col space-y-4">
                <Link
                  href="/products"
                  className="flex items-center space-x-2 text-lg font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <Package className="h-5 w-5" />
                  <span>Products</span>
                </Link>
                <Link
                  href="/products/individual"
                  className="ml-4 flex items-center space-x-2 text-lg font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <span>Individual Purchase</span>
                </Link>
                <Link
                  href="/products/group-buy"
                  className="ml-4 flex items-center space-x-2 text-lg font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <span>Group Buy</span>
                </Link>
                <Link
                  href="/products/sub-groups"
                  className="ml-4 flex items-center space-x-2 text-lg font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <span>Regional Sub-Groups</span>
                </Link>
                <Link
                  href="/about"
                  className="flex items-center space-x-2 text-lg font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <span>About</span>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center space-x-2 text-lg font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <span>Contact</span>
                </Link>
                <div className="border-t pt-4">
                  <div className="mb-2 w-full">
                    <Cart />
                  </div>
                  {isSignedIn
                    ? (
                        <>
                          <Button variant="outline" className="mb-2 w-full justify-start" asChild>
                            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                              <ShoppingBag className="mr-2 h-4 w-4" />
                              Dashboard
                            </Link>
                          </Button>
                          <Button variant="outline" className="mb-2 w-full justify-start" asChild>
                            <Link href="/dashboard?tab=profile" onClick={() => setIsOpen(false)}>
                              <Settings className="mr-2 h-4 w-4" />
                              Profile Settings
                            </Link>
                          </Button>
                          {isAdmin && (
                            <Button variant="outline" className="mb-2 w-full justify-start" asChild>
                              <Link href="/admin/products" onClick={() => setIsOpen(false)}>
                                <Shield className="mr-2 h-4 w-4" />
                                Admin Panel
                              </Link>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                              signOut();
                              setIsOpen(false);
                            }}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                          </Button>
                        </>
                      )
                    : (
                        <>
                          <Button variant="outline" className="mb-2 w-full justify-start" asChild>
                            <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                              <User className="mr-2 h-4 w-4" />
                              Sign In
                            </Link>
                          </Button>
                          <Button className="gradient-purple w-full text-white hover:opacity-90" asChild>
                            <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                              Get Started
                            </Link>
                          </Button>
                        </>
                      )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
