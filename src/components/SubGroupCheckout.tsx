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
import { useMemo, useState } from 'react';
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

type SubGroupCheckoutProps = {
  batchId: number;
  batchName: string;
  regionWhatsapp: string;
  subGroupId: number;
  subGroupName: string;
  isOpen: boolean;
  onCloseAction: () => void;
  prefillItems?: OrderItem[];
  prefillTotal?: number;
  onOrderSuccessAction?: () => void;
};

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'subgroup';
  batchId: string;
  productId: number;
};

export default function SubGroupCheckout({
  batchId,
  batchName,
  regionWhatsapp,
  subGroupId,
  subGroupName,
  isOpen,
  onCloseAction,
  prefillItems,
  prefillTotal,
  onOrderSuccessAction,
}: SubGroupCheckoutProps) {
  const { state: cartState, dispatch } = useCart();
  const { userProfile } = useRole();
  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderedItems, setOrderedItems] = useState<OrderItem[]>([]);
  const [orderedTotal, setOrderedTotal] = useState(0);

  // Filter sub-group items for this batch
  const subgroupItems = useMemo(() => {
    return cartState.items.filter((item: any) => {
      if (item.type !== 'subgroup') {
        return false;
      }
      const itemIdStr = String((item as any).id ?? '');
      const itemBatchId = (item as any).batchId ?? (itemIdStr.startsWith('subgroup-')
        ? itemIdStr.split('-')[2]
        : undefined);
      const matchesByProp = String(itemBatchId ?? '') === String(batchId);
      const matchesById = itemIdStr.includes(`subgroup-${String(batchId)}-`);
      return matchesByProp || matchesById;
    });
  }, [cartState.items, batchId]);

  const sourceItems: OrderItem[] = useMemo(() => {
    return (prefillItems && prefillItems.length > 0)
      ? (prefillItems as OrderItem[])
      : (subgroupItems as unknown as OrderItem[]);
  }, [prefillItems, subgroupItems]);

  // Snapshot current items for this batch when dialog opens, clear on close
  const checkoutItems = useMemo(() => {
    return isOpen ? (sourceItems as OrderItem[]) : [];
  }, [isOpen, sourceItems]);

  // Small utility: wait then check order + items persisted
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const waitForPersistence = async (orderId: number, expectedItems: number) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: persistedOrder } = await supabase
        .from('sub_group_orders')
        .select('id')
        .eq('id', orderId)
        .single();

      const { count: itemsCount } = await supabase
        .from('sub_group_order_items')
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
      console.warn('No items to checkout');
      return;
    }

    const totalForCheckout = (typeof prefillTotal === 'number') ? prefillTotal : itemsForCheckout.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    setIsSubmitting(true);

    try {
      // Validate required fields early
      if (!batchId || !subGroupId) {
        throw new Error(`Missing batch or sub-group information: batchId=${batchId}, subGroupId=${subGroupId}`);
      }
      if (totalForCheckout <= 0) {
        throw new Error('Invalid total amount');
      }

      // Prepare items for the RPC
      const items = subgroupItems.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        price_per_vial: item.price,
      }));

      // Create order atomically in the DB (unique code generation inside)
      const { data: orderId, error: createError } = await supabase
        .rpc('create_simple_subgroup_order', {
          p_customer_name: customerName.trim(),
          p_whatsapp_number: whatsappNumber.trim(),
          p_batch_id: batchId,
          p_sub_group_id: subGroupId,
          p_items: items,
          p_user_id: userProfile?.id ?? null,
        });

      if (createError || !orderId) {
        throw createError ?? new Error('Failed to create order');
      }

      // Fetch the created order
      const { data: order, error: fetchError } = await supabase
        .from('sub_group_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError || !order) {
        throw fetchError ?? new Error('Failed to fetch created order');
      }

      // Order items are already created by the function

      // Update sub-group batch progress
      const totalVials = itemsForCheckout.reduce((sum, item) => sum + item.quantity, 0);

      // Get current batch progress
      const { data: currentBatch, error: batchError } = await supabase
        .from('sub_group_batches')
        .select('current_vials')
        .eq('id', batchId)
        .single();

      if (batchError) {
        // Don't throw here, order is already created
      } else {
        // Update batch current_vials
        const { error: updateError } = await supabase
          .from('sub_group_batches')
          .update({
            current_vials: (currentBatch.current_vials || 0) + totalVials,
          })
          .eq('id', batchId);

        if (updateError) {
          // Don't throw here, order is already created
        }
      }

      // Update individual product progress in sub_group_batch_products
      for (const item of itemsForCheckout) {
        // Get current vials and update
        const { data: currentProduct, error: fetchError } = await supabase
          .from('sub_group_batch_products')
          .select('current_vials')
          .eq('batch_id', batchId)
          .eq('product_id', item.productId)
          .single();

        if (!fetchError && currentProduct) {
          const { error: productUpdateError } = await supabase
            .from('sub_group_batch_products')
            .update({ current_vials: (currentProduct.current_vials || 0) + item.quantity })
            .eq('batch_id', batchId)
            .eq('product_id', item.productId);

          if (productUpdateError) {
            // Don't throw here, order is already created
          }
        }
      }

      // Snapshot ordered items and total before clearing cart
      setOrderedItems(itemsForCheckout as OrderItem[]);
      setOrderedTotal(totalForCheckout);

      // Clear sub-group items from cart
      dispatch({ type: 'CLEAR_SUBGROUP' });

      setOrderCode(order.order_code as string);
      setOrderSuccess(true);

      // Call the success callback to refresh user's order
      if (onOrderSuccessAction) {
        onOrderSuccessAction();
      }

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

        const message = `Hi! I'd like to place an order for the sub-group batch "${batchName}" in ${subGroupName}.\n\n`
          + `Order Code: ${order.order_code}\n`
          + `Sub-Group: ${subGroupName}\n`
          + `Customer: ${customerName}\n`
          + `WhatsApp: ${whatsappNumber}\n\n`
          + `Order Details:\n${orderSummaryText}\n\n`
          + `Total Amount: ₱${totalForCheckout.toLocaleString()}\n\n`
          + `Please confirm my order and provide payment details. Thank you!`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${regionWhatsapp}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        onCloseAction();
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

    const message = `Hi! I'd like to place an order for the sub-group batch "${batchName}" in ${subGroupName}.

Order Code: ${orderCode}
Sub-Group: ${subGroupName}
Customer: ${customerName}
WhatsApp: ${whatsappNumber}

Order Details:
${orderSummary}

Total Amount: ₱${orderedTotal.toLocaleString()}

Please confirm my order and provide payment details. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${regionWhatsapp}?text=${encodedMessage}`;

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
    onCloseAction();
  };

  if (orderSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-purple-600" />
              Order Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Your sub-group order has been created and batch progress has been updated.
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
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Phone className="mr-2 h-4 w-4" />
                Contact Region Host
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
            Sub-Group Checkout
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
