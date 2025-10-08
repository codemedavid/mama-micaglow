'use client';

import type { CartItem } from '@/contexts/CartContext';
import {
  CreditCard,
  MapPin,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import GroupBuyCheckout from '@/components/GroupBuyCheckout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';

export function FloatingCart() {
  const { state, dispatch } = useCart();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } else {
      const item = state.items.find(item => item.id === id);
      if (item && item.type === 'group-buy' && item.maxQuantity) {
        const clampedQuantity = Math.min(newQuantity, item.maxQuantity);
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: clampedQuantity } });
      } else {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity } });
      }
    }
  };

  const handleRemoveItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const getGroupBuyItems = () => state.items.filter(item => item.type === 'group-buy');
  const getIndividualItems = () => state.items.filter(item => item.type === 'individual');
  const getGroupBuyTotal = () => getGroupBuyItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const hasGroupBuyItems = () => getGroupBuyItems().length > 0;
  const hasIndividualItems = () => getIndividualItems().length > 0;
  const openGroupBuyCheckout = () => setIsCheckoutOpen(true);
  const closeGroupBuyCheckout = () => setIsCheckoutOpen(false);
  const handleIndividualCheckout = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'individual':
        return <Package className="h-4 w-4" />;
      case 'group-buy':
        return <Users className="h-4 w-4" />;
      case 'regional-group':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'individual':
        return 'Individual Purchase';
      case 'group-buy':
        return 'Group Buy';
      case 'regional-group':
        return 'Regional Group';
      default:
        return 'Purchase';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'individual':
        return 'bg-blue-100 text-blue-800';
      case 'group-buy':
        return 'bg-purple-100 text-purple-800';
      case 'regional-group':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const groupItemsByType = () => {
    const grouped = state.items.reduce((acc: Record<string, CartItem[]>, item: CartItem) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type]?.push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);

    return grouped;
  };

  const groupedItems = groupItemsByType();

  if (state.itemCount === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed right-6 bottom-6 z-50 md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 shadow-2xl hover:from-purple-700 hover:to-purple-800"
            >
              <ShoppingCart className="h-6 w-6 text-white" />
              {state.itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 p-0 text-xs font-bold text-white">
                  {state.itemCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full p-0 sm:w-[400px]">
            <div className="flex h-full flex-col">
              <div className="sticky top-0 z-10 border-b bg-background p-6">
                <SheetHeader>
                  <SheetTitle>Shopping Cart</SheetTitle>
                  <SheetDescription>Review your items before checkout</SheetDescription>
                </SheetHeader>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                {state.items.length === 0
                  ? (
                      <div className="py-8 text-center">
                        <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">Your cart is empty</p>
                        <Button asChild className="mt-4">
                          <Link href="/products">Browse Products</Link>
                        </Button>
                      </div>
                    )
                  : (
                      <>
                        {Object.entries(groupedItems).map(([type, items]) => (
                          <div key={type} className="space-y-4">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(type)}
                              <h3 className="font-semibold">{getTypeLabel(type)}</h3>
                              <Badge className={getTypeColor(type)}>
                                {items.length}
                                {' '}
                                item
                                {items.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>

                            <div className="space-y-3">
                              {items.map(item => (
                                <Card key={`${item.id}-${item.type}`} className="p-4">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                                      {getTypeIcon(item.type)}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <h4 className="truncate text-sm font-medium">{item.name}</h4>
                                      <p className="text-xs text-muted-foreground">
                                        {item.type === 'individual' ? `₱${item.price.toLocaleString()} per box` : `₱${item.price.toLocaleString()} per vial`}
                                      </p>
                                      {item.type === 'group-buy' && item.maxQuantity && (
                                        <p className="text-xs font-medium text-orange-600">
                                          Max:
                                          {item.maxQuantity}
                                          {' '}
                                          vials remaining
                                        </p>
                                      )}

                                      <div className="mt-2 flex items-center gap-2">
                                        <div className="flex items-center rounded-md border">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                          >
                                            <Minus className="h-3 w-3" />
                                          </Button>
                                          <Input
                                            value={item.quantity}
                                            onChange={e => handleQuantityChange(item.id, Number.parseInt(e.target.value) || 0)}
                                            className="h-8 w-12 border-0 text-center"
                                            min="0"
                                            max={item.type === 'group-buy' && item.maxQuantity ? item.maxQuantity : undefined}
                                          />
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                            disabled={item.type === 'group-buy' && item.maxQuantity ? item.quantity >= (item.maxQuantity as number) : false}
                                          >
                                            <Plus className="h-3 w-3" />
                                          </Button>
                                        </div>

                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 text-destructive"
                                          onClick={() => handleRemoveItem(item.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <p className="text-sm font-semibold">
                                        ₱
                                        {(item.price * item.quantity).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
              </div>

              <div className="sticky bottom-0 z-10 border-t bg-background p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total Items:</span>
                    <span>{state.itemCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-lg font-bold text-primary">
                      ₱
                      {state.total.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <AuthGuard
                      requireAuth={true}
                      fallback={(
                        <div className="space-y-2">
                          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-center">
                            <p className="text-sm text-orange-800">
                              Please sign in to proceed with checkout
                            </p>
                          </div>
                          <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                            Continue Shopping
                          </Button>
                        </div>
                      )}
                    >
                      {hasGroupBuyItems()
                        ? (
                            <Button className="w-full" onClick={openGroupBuyCheckout}>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Checkout Group Buy Items
                            </Button>
                          )
                        : hasIndividualItems()
                          ? (
                              <Button className="w-full" onClick={handleIndividualCheckout}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Proceed to Checkout
                              </Button>
                            )
                          : (
                              <Button className="w-full" disabled>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Cart is Empty
                              </Button>
                            )}
                      <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                        Continue Shopping
                      </Button>
                    </AuthGuard>
                  </div>
                </div>
              </div>
            </div>
            {hasGroupBuyItems() && (
              <GroupBuyCheckout
                batchId={Number.parseInt((getGroupBuyItems()[0]?.batchId as string) || (getGroupBuyItems()[0]?.id.split('-')[2] || '0'))}
                batchName={`Group Buy Batch #${(getGroupBuyItems()[0]?.batchId as string) || getGroupBuyItems()[0]?.id.split('-')[2] || ''}`}
                isOpen={isCheckoutOpen}
                onCloseAction={closeGroupBuyCheckout}
                prefillItems={getGroupBuyItems().map(it => ({
                  id: String(it.id),
                  name: it.name,
                  price: Number(it.price),
                  quantity: Number(it.quantity),
                  type: 'group-buy' as const,
                  batchId: String(it.batchId ?? (typeof it.id === 'string' ? it.id.split('-')[2] : '')),
                  productId: Number(it.productId ?? 0),
                }))}
                prefillTotal={getGroupBuyTotal()}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
