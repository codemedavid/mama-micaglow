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
import { useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import GroupBuyCheckout from '@/components/GroupBuyCheckout';
import SubGroupCheckout from '@/components/SubGroupCheckout';
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

type CartProps = {
  isOpen?: boolean;
  onOpenChangeAction?: (open: boolean) => void;
};

export function Cart({ isOpen: externalIsOpen, onOpenChangeAction: externalOnOpenChange }: CartProps = {}) {
  const { state, dispatch } = useCart();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubGroupCheckoutOpen, setIsSubGroupCheckoutOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnOpenChange || setInternalIsOpen;

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } else {
      // Find the item to check maxQuantity for group buy items
      const item = state.items.find(item => item.id === id);
      if (item && item.type === 'group-buy' && item.maxQuantity) {
        // Clamp quantity to maxQuantity for group buy items
        const clampedQuantity = Math.min(newQuantity, item.maxQuantity);
        if (clampedQuantity !== newQuantity) {
          // Show alert if trying to exceed limit
          // Show user feedback for quantity limit
        }
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: clampedQuantity } });
      } else {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity } });
      }
    }
  };

  const handleRemoveItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  // Group-buy helpers for checkout
  const getGroupBuyItems = () => state.items.filter(item => item.type === 'group-buy');
  const getGroupBuyTotal = () => getGroupBuyItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const hasGroupBuyItems = () => getGroupBuyItems().length > 0;
  const openGroupBuyCheckout = () => setIsCheckoutOpen(true);
  const closeGroupBuyCheckout = () => setIsCheckoutOpen(false);

  // Sub-group helpers for checkout
  const getSubGroupItems = () => {
    const items = state.items.filter(item => item.type === 'subgroup');
    return items;
  };
  const getSubGroupTotal = () => getSubGroupItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const hasSubGroupItems = () => getSubGroupItems().length > 0;
  const openSubGroupCheckout = () => setIsSubGroupCheckoutOpen(true);
  const closeSubGroupCheckout = () => setIsSubGroupCheckoutOpen(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'individual':
        return <Package className="h-4 w-4" />;
      case 'group-buy':
        return <Users className="h-4 w-4" />;
      case 'regional-group':
        return <MapPin className="h-4 w-4" />;
      case 'subgroup':
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
      case 'subgroup':
        return 'Sub-Group';
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
      case 'subgroup':
        return 'bg-green-100 text-green-800';
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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Cart
          {state.itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center p-0 text-xs">
              {state.itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] p-0 sm:w-[540px]">
        <div className="flex h-full flex-col">
          <div className="sticky top-0 z-10 border-b bg-background p-6">
            <SheetHeader>
              <SheetTitle>Shopping Cart</SheetTitle>
              <SheetDescription>
                Review your items before checkout
              </SheetDescription>
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
                    {/* Cart Items by Type */}
                    {Object.entries(groupedItems).map(([type, items]) => (
                      <div key={type} className="space-y-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(type)}
                          <h3 className="font-semibold">{getTypeLabel(type)}</h3>
                          <Badge className={getTypeColor(type)}>
                            {items.length}
                            {' '}
                            item
                            {items.length !== 1
                              ? 's'
                              : ''}
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
                                    {item.type === 'individual'
                                      ? `₱${item.price.toLocaleString()} per box`
                                      : `₱${item.price.toLocaleString()} per vial`}
                                  </p>
                                  {item.type === 'group-buy' && item.maxQuantity && (
                                    <p className="text-xs font-medium text-orange-600">
                                      Max:
                                      {' '}
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
                                        max={item.type === 'group-buy' && item.maxQuantity
                                          ? item.maxQuantity
                                          : undefined}
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

          {/* Sticky Footer Summary */}
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
                    : hasSubGroupItems()
                      ? (
                          <Button className="w-full" onClick={openSubGroupCheckout}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Checkout Sub-Group Items
                          </Button>
                        )
                      : (
                          <Button className="w-full" asChild>
                            <Link href="/checkout">
                              <CreditCard className="mr-2 h-4 w-4" />
                              Proceed to Checkout
                            </Link>
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
        {hasSubGroupItems() && (() => {
          const firstSubGroupItem = getSubGroupItems()[0];

          // Extract batch ID from the item ID if batchId is not available
          const batchId = firstSubGroupItem?.batchId
            || (typeof firstSubGroupItem?.id === 'string'
              ? firstSubGroupItem.id.split('-')[2]
              : '0');

          // Validate that we have the required sub-group information
          if (!firstSubGroupItem?.subGroupId || !batchId) {
            console.error('Missing sub-group information in cart item:', {
              firstSubGroupItem,
              batchId,
              subGroupId: firstSubGroupItem?.subGroupId,
            });
            return null;
          }

          return (
            <SubGroupCheckout
              batchId={Number.parseInt(batchId)}
              batchName={`Sub-Group Batch #${batchId}`}
              regionWhatsapp={firstSubGroupItem.regionWhatsapp || '6391549012244'}
              subGroupId={firstSubGroupItem.subGroupId}
              subGroupName={firstSubGroupItem.subGroupName || 'Sub-Group'}
              isOpen={isSubGroupCheckoutOpen}
              onCloseAction={closeSubGroupCheckout}
              prefillItems={getSubGroupItems().map(it => ({
                id: String(it.id),
                name: it.name,
                price: Number(it.price),
                quantity: Number(it.quantity),
                type: 'subgroup' as const,
                batchId: String(it.batchId ?? (typeof it.id === 'string' ? it.id.split('-')[2] : '')),
                productId: Number(it.productId ?? 0),
              }))}
              prefillTotal={getSubGroupTotal()}
            />
          );
        })()}
      </SheetContent>
    </Sheet>
  );
}
