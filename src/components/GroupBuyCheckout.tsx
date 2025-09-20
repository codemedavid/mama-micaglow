'use client';

import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  Loader2,
  Phone,
  Search,
  ShoppingCart,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';

type GroupBuyCheckoutProps = {
  batchId: number;
  batchName: string;
  isOpen: boolean;
  onCloseAction: () => void;
  prefillItems?: OrderItem[];
  prefillTotal?: number;
};

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'group-buy';
  batchId: string;
  productId: number;
};

export default function GroupBuyCheckout({ batchId, batchName, isOpen, onCloseAction, prefillItems, prefillTotal }: GroupBuyCheckoutProps) {
  const { state: cartState, dispatch } = useCart();
  const { userProfile } = useRole();
  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderedItems, setOrderedItems] = useState<OrderItem[]>([]);
  const [orderedTotal, setOrderedTotal] = useState(0);
  const [checkoutItems, setCheckoutItems] = useState<OrderItem[]>([]);

  // Filter group buy items for this batch (normalize batch id)
  const groupBuyItems = cartState.items.filter((item: any) => {
    if (item.type !== 'group-buy') {
      return false;
    }
    const itemIdStr = String((item as any).id ?? '');
    const itemBatchId = (item as any).batchId ?? (itemIdStr.startsWith('group-buy-')
      ? itemIdStr.split('-')[2]
      : undefined);
    const matchesByProp = String(itemBatchId ?? '') === String(batchId);
    const matchesById = itemIdStr.includes(`group-buy-${String(batchId)}-`);
    return matchesByProp || matchesById;
  });

  const sourceItems: OrderItem[] = (prefillItems && prefillItems.length > 0)
    ? (prefillItems as OrderItem[])
    : (groupBuyItems as unknown as OrderItem[]);
  // Calculate total amount for display
  // const _totalAmount = (typeof prefillTotal === 'number')
  //   ? prefillTotal
  //   : (sourceItems as OrderItem[]).reduce((sum: number, item: OrderItem) => sum + (item.price * item.quantity), 0);

  // Snapshot current items for this batch when dialog opens, clear on close
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setCheckoutItems(_prev => sourceItems as OrderItem[]);
    } else {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setCheckoutItems(_prev => []);
    }
  }, [isOpen, sourceItems]);

  // Small utility: wait then check order + items persisted
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const waitForPersistence = async (orderId: number, expectedItems: number) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: persistedOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .single();

      const { count: itemsCount } = await supabase
        .from('order_items')
        .select('id', { count: 'exact', head: true })
        .eq('order_id', orderId);

      if (persistedOrder && (itemsCount ?? 0) >= expectedItems) {
        return true;
      }
      await delay(300);
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !whatsappNumber.trim()) {
      return;
    }

    // Snapshot items for this checkout to avoid race conditions
    const itemsForCheckout = checkoutItems.length > 0 ? checkoutItems : sourceItems as OrderItem[];

    if (itemsForCheckout.length === 0) {
      return;
    }

    const totalForCheckout = (typeof prefillTotal === 'number') ? prefillTotal : itemsForCheckout.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    setIsSubmitting(true);

    try {
      let existingOrder: any = null;
      let orderCode = '';
      let isOrderUpdate = false;
      let order: any = null;

      // ONLY check for existing orders if user is logged in
      if (userProfile?.id) {
        console.warn('🔍 Checking for existing orders for user:', userProfile.id, 'batch:', batchId);
        const { data: existingOrders, error: existingOrdersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userProfile.id)
          .eq('batch_id', batchId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1);

        console.warn('📋 Existing orders query result:', { existingOrders, existingOrdersError });

        // If we found an existing order, use it
        if (!existingOrdersError && existingOrders && existingOrders.length > 0) {
          existingOrder = existingOrders[0];
          console.warn('✅ Found existing order to update:', existingOrder);
        } else {
          console.warn('❌ No existing order found, will create new order');
        }
      } else {
        console.warn('👤 User not logged in, creating new order');
      }

      if (existingOrder && userProfile?.id) {
        // Update existing order - ONLY for logged-in users
        console.warn('🔄 CONSOLIDATING order - updating existing order:', existingOrder.id);
        isOrderUpdate = true;
        orderCode = existingOrder.order_code;

        // Get existing order items
        const { data: existingOrderItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', existingOrder.id);

        // Create a map of existing items by product_id
        const existingItemsMap = new Map();
        existingOrderItems?.forEach((item) => {
          existingItemsMap.set(item.product_id, item);
        });

        // Calculate total vials to add to batch progress
        let totalVialsToAdd = 0;
        const itemsToInsert = [];
        const itemsToUpdate = [];

        // Process new items
        for (const item of itemsForCheckout) {
          const existingItem = existingItemsMap.get(item.productId);

          if (existingItem) {
            // Update existing item quantity
            const newQuantity = existingItem.quantity + item.quantity;
            const newTotalPrice = newQuantity * item.price;

            itemsToUpdate.push({
              id: existingItem.id,
              quantity: newQuantity,
              total_price: newTotalPrice,
            });

            totalVialsToAdd += item.quantity;
          } else {
            // Insert new item
            itemsToInsert.push({
              order_id: existingOrder.id,
              product_id: item.productId,
              quantity: item.quantity,
              price_per_vial: item.price,
              total_price: item.price * item.quantity,
            });

            totalVialsToAdd += item.quantity;
          }
        }

        // Update existing items
        for (const itemUpdate of itemsToUpdate) {
          await supabase
            .from('order_items')
            .update({
              quantity: itemUpdate.quantity,
              total_price: itemUpdate.total_price,
            })
            .eq('id', itemUpdate.id);
        }

        // Insert new items
        if (itemsToInsert.length > 0) {
          await supabase
            .from('order_items')
            .insert(itemsToInsert);
        }

        // Update order total
        const newTotalAmount = existingOrder.total_amount + totalForCheckout;
        const newSubtotal = (existingOrder.subtotal || 0) + totalForCheckout;
        await supabase
          .from('orders')
          .update({
            subtotal: newSubtotal,
            total_amount: newTotalAmount,
            customer_name: customerName.trim(),
            whatsapp_number: whatsappNumber.trim(),
          })
          .eq('id', existingOrder.id);

        // Update batch progress
        if (totalVialsToAdd > 0) {
          // Get current batch progress
          const { data: currentBatch } = await supabase
            .from('group_buy_batches')
            .select('current_vials')
            .eq('id', batchId)
            .single();

          if (currentBatch) {
            await supabase
              .from('group_buy_batches')
              .update({
                current_vials: (currentBatch.current_vials || 0) + totalVialsToAdd,
              })
              .eq('id', batchId);
          }

          // Update individual product progress
          for (const item of itemsForCheckout) {
            await supabase
              .rpc('increment_group_buy_product_vials', {
                p_batch_id: batchId,
                p_product_id: item.productId,
                p_delta: item.quantity,
              });
          }
        }
      } else {
        // Create new order - for both guest users and logged-in users without existing orders
        console.warn('🆕 CREATING NEW ORDER - no existing order found');
        const { data: orderCodeData, error: codeError } = await supabase
          .rpc('generate_order_code');

        if (codeError) {
          throw codeError;
        }

        orderCode = orderCodeData;

        // Create order with comprehensive details
        const orderData = {
          order_code: orderCode,
          customer_name: customerName.trim(),
          whatsapp_number: whatsappNumber.trim(),
          batch_id: batchId,
          subtotal: totalForCheckout,
          shipping_cost: 0,
          total_amount: totalForCheckout,
          status: 'pending',
          payment_status: 'pending',
          // Only add user_id if user is logged in
          ...(userProfile?.id && { user_id: userProfile.id }),
        };

        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert(orderData)
          .select()
          .single();

        if (orderError) {
          throw orderError;
        }

        order = newOrder;

        // Create order items with detailed information
        const orderItems = itemsForCheckout.map(item => ({
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          price_per_vial: item.price,
          total_price: item.price * item.quantity,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          throw itemsError;
        }

        // Update batch progress
        const totalVials = itemsForCheckout.reduce((sum, item) => sum + item.quantity, 0);

        // Get current batch progress
        const { data: currentBatch } = await supabase
          .from('group_buy_batches')
          .select('current_vials')
          .eq('id', batchId)
          .single();

        if (currentBatch) {
          await supabase
            .from('group_buy_batches')
            .update({
              current_vials: (currentBatch.current_vials || 0) + totalVials,
            })
            .eq('id', batchId);
        }

        // Update individual product progress in group_buy_products via RPC
        for (const item of itemsForCheckout) {
          await supabase
            .rpc('increment_group_buy_product_vials', {
              p_batch_id: batchId,
              p_product_id: item.productId,
              p_delta: item.quantity,
            });
        }
      }

      // Set success state
      setOrderedItems(itemsForCheckout as OrderItem[]);
      setOrderedTotal(totalForCheckout);
      setOrderCode(orderCode);
      setOrderSuccess(true);

      // Clear group buy items from cart
      dispatch({ type: 'CLEAR_GROUP_BUY' });

      // Wait for persistence confirmation before redirecting to WhatsApp
      try {
        const orderId = isOrderUpdate && existingOrder ? existingOrder.id : order.id;
        const expectedItems = itemsForCheckout.length;
        await waitForPersistence(orderId, expectedItems);

        const orderSummaryLines = itemsForCheckout.map(item =>
          `• ${item.name}: ${item.quantity} vial(s) × ₱${item.price} = ₱${(item.price * item.quantity).toLocaleString()}`,
        );
        const orderSummaryText = orderSummaryLines.join('\n');

        const message = `Hi! I'd like to ${isOrderUpdate ? 'update my existing order' : 'place an order'} for the group buy batch "${batchName}".\n\n`
          + `Order Code: ${orderCode}\n`
          + `Customer: ${customerName}\n`
          + `WhatsApp: ${whatsappNumber}\n\n`
          + `Order Details:\n${orderSummaryText}\n\n`
          + `Total Amount: ₱${totalForCheckout.toLocaleString()}\n\n`
          + `Please confirm my order and provide payment details. Thank you!`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/639154901224?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        onCloseAction();
      } catch {
        // Silently ignore WhatsApp redirect errors
      }
    } catch (error) {
      console.error('Error processing order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    if (!orderCode) {
      return;
    }

    // Create order summary from snapshot
    const orderSummary = orderedItems.map(item =>
      `• ${item.name}: ${item.quantity} vial(s) × ₱${item.price} = ₱${(item.price * item.quantity).toLocaleString()}`,
    ).join('\n');

    const message = `Hi! I'd like to place an order for the group buy batch "${batchName}".

Order Code: ${orderCode}
Customer: ${customerName}
WhatsApp: ${whatsappNumber}

Order Details:
${orderSummary}

Total Amount: ₱${orderedTotal.toLocaleString()}

Please confirm my order and provide payment details. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/639154901224?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    onCloseAction();
  };

  const handleClose = () => {
    setCustomerName('');
    setWhatsappNumber('');
    setOrderCode('');
    setOrderSuccess(false);
    setOrderedItems([]);
    setOrderedTotal(0);
    setCheckoutItems([]);
    onCloseAction();
  };

  if (orderSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-purple-600" />
              {userProfile?.id ? 'Order Updated Successfully!' : 'Order Created Successfully!'}
            </DialogTitle>
            <DialogDescription>
              {userProfile?.id
                ? 'Your order has been updated and batch progress has been updated.'
                : 'Your order has been created and batch progress has been updated.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-800">Order Code</div>
                <div className="text-2xl font-bold text-purple-900">{orderCode}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Customer:</span>
                <span className="font-medium">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">WhatsApp:</span>
                <span className="font-medium">{whatsappNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {userProfile?.id ? 'Additional Amount:' : 'Total Amount:'}
                </span>
                <span className="font-bold">
                  ₱
                  {orderedTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Next Steps</span>
              </div>
              <p className="text-sm text-blue-700">
                Payment will be processed once the batch reaches processing status.
                You'll be contacted via WhatsApp for payment details.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleWhatsAppRedirect}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Phone className="mr-2 h-4 w-4" />
                Contact via WhatsApp
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1"
              >
                <Link href="/track-order">
                  <Search className="mr-2 h-4 w-4" />
                  Track Order
                </Link>
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader className="sticky top-0 z-10 border-b bg-background pb-4">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Group Buy Checkout
          </DialogTitle>
          <DialogDescription>
            Complete your order for batch:
            {' '}
            <strong>{batchName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(checkoutItems.length > 0 ? checkoutItems : sourceItems as OrderItem[]).map(item => (
                <div key={item.id} className="flex items-center justify-between rounded bg-gray-50 p-2">
                  <div>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      ₱
                      {item.price.toLocaleString()}
                      {' '}
                      per vial
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {item.quantity}
                      {' '}
                      vial(s)
                    </div>
                    <div className="text-sm font-bold">
                      ₱
                      {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-lg font-bold text-purple-600">
                    ₱
                    {(
                      typeof prefillTotal === 'number'
                        ? prefillTotal
                        : (checkoutItems.length > 0 ? checkoutItems : sourceItems as OrderItem[]).reduce((sum, item) => sum + (item.price * item.quantity), 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                <Input
                  id="whatsappNumber"
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  placeholder="Enter your WhatsApp number (e.g., +639123456789)"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded border border-yellow-200 bg-yellow-50 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Payment Process</span>
                </div>
                <p className="text-xs text-yellow-700">
                  Payment will be processed once the batch reaches processing status.
                  You'll be contacted via WhatsApp for payment details and order confirmation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="sticky bottom-0 border-t bg-background pt-4">
            <div className="flex gap-3">
              <Button
                type="button"

                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !customerName.trim() || !whatsappNumber.trim()}
                className="flex-1"
              >
                {isSubmitting
                  ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Order...
                      </>
                    )
                  : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {userProfile?.id ? 'Update Order' : 'Create Order'}
                      </>
                    )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
