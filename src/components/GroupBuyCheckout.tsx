'use client';

import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  Loader2,
  Phone,
  ShoppingCart,
  User,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
import { supabase } from '@/lib/supabase';

type GroupBuyCheckoutProps = {
  batchId: number;
  batchName: string;
  isOpen: boolean;
  onClose: () => void;
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

export default function GroupBuyCheckout({ batchId, batchName, isOpen, onClose, prefillItems, prefillTotal }: GroupBuyCheckoutProps) {
  const { state: cartState, dispatch } = useCart();
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
  const updateCheckoutItems = useCallback(() => {
    if (isOpen) {
      setCheckoutItems(sourceItems as OrderItem[]);
    } else {
      setCheckoutItems([]);
    }
  }, [isOpen, sourceItems]);

  useEffect(() => {
    updateCheckoutItems();
  }, [updateCheckoutItems]);

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

    // Starting order creation process

    // Snapshot items for this checkout to avoid race conditions
    const itemsForCheckout = checkoutItems.length > 0 ? checkoutItems : sourceItems as OrderItem[];
    // Items for checkout (snapshot)

    if (itemsForCheckout.length === 0) {
      return;
    }

    const totalForCheckout = (typeof prefillTotal === 'number') ? prefillTotal : itemsForCheckout.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    setIsSubmitting(true);

    try {
      // Generate order code
      // Generating order code
      const { data: orderCodeData, error: codeError } = await supabase
        .rpc('generate_order_code');

      if (codeError) {
        throw codeError;
      }

      const generatedOrderCode = orderCodeData;

      // Create order with comprehensive details
      const orderData = {
        order_code: generatedOrderCode,
        customer_name: customerName.trim(),
        whatsapp_number: whatsappNumber.trim(),
        batch_id: batchId,
        total_amount: totalForCheckout,
        status: 'pending',
        payment_status: 'pending',
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

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
      const { data: currentBatch, error: batchError } = await supabase
        .from('group_buy_batches')
        .select('current_vials')
        .eq('id', batchId)
        .single();

      if (batchError) {
        // Don't throw here, order is already created
      } else {
        // Update batch current_vials
        const { error: updateError } = await supabase
          .from('group_buy_batches')
          .update({
            current_vials: (currentBatch.current_vials || 0) + totalVials,
          })
          .eq('id', batchId);

        if (updateError) {
          // Don't throw here, order is already created
        }
      }

      // Update individual product progress in group_buy_products via RPC
      for (const item of itemsForCheckout) {
        const { error: productUpdateError } = await supabase
          .rpc('increment_group_buy_product_vials', {
            p_batch_id: batchId,
            p_product_id: item.productId,
            p_delta: item.quantity,
          });

        if (productUpdateError) {
          // Don't throw here, order is already created
        }
      }

      // Snapshot ordered items and total before clearing cart
      setOrderedItems(itemsForCheckout as OrderItem[]);
      setOrderedTotal(totalForCheckout);

      // Clear group buy items from cart
      dispatch({ type: 'CLEAR_GROUP_BUY' });

      setOrderCode(generatedOrderCode);
      setOrderSuccess(true);

      // Wait for persistence confirmation before redirecting to WhatsApp
      try {
        const orderId = order.id;
        const expectedItems = itemsForCheckout.length;
        const persisted = await waitForPersistence(orderId, expectedItems);
        if (!persisted) {
          // Handle persistence failure if needed
        }
        const orderSummaryLines = itemsForCheckout.map(item =>
          `• ${item.name}: ${item.quantity} vial(s) × ₱${item.price} = ₱${(item.price * item.quantity).toLocaleString()}`,
        );
        const orderSummaryText = orderSummaryLines.join('\n');

        const message = `Hi! I'd like to place an order for the group buy batch "${batchName}".\n\n`
          + `Order Code: ${generatedOrderCode}\n`
          + `Customer: ${customerName}\n`
          + `WhatsApp: ${whatsappNumber}\n\n`
          + `Order Details:\n${orderSummaryText}\n\n`
          + `Total Amount: ₱${totalForCheckout.toLocaleString()}\n\n`
          + `Please confirm my order and provide payment details. Thank you!`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/6391549012244?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        onClose();
      } catch {
        // Silently ignore WhatsApp redirect errors
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        // Handle error message if needed
      }
      if (error && typeof error === 'object' && 'code' in error) {
        // Handle error code if needed
      }
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
    const whatsappUrl = `https://wa.me/6391549012244?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const handleClose = () => {
    setCustomerName('');
    setWhatsappNumber('');
    setOrderCode('');
    setOrderSuccess(false);
    setOrderedItems([]);
    setOrderedTotal(0);
    setCheckoutItems([]);
    onClose();
  };

  if (orderSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Order Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Your order has been created and batch progress has been updated.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-800">Order Code</div>
                <div className="text-2xl font-bold text-green-900">{orderCode}</div>
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
                <span className="text-sm text-muted-foreground">Total Amount:</span>
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
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Phone className="mr-2 h-4 w-4" />
                Contact via WhatsApp
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
                  <span className="text-lg font-bold text-green-600">
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
                        Creating Order...
                      </>
                    )
                  : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Create Order
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
