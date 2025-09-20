'use client';

import { CheckCircle, Loader2, Phone, ShoppingCart, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';

type SimpleSubGroupCheckoutProps = {
  batchId: number;
  batchName: string;
  subGroupId: number;
  subGroupName: string;
  regionWhatsapp?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  productId: number;
};

export default function SimpleSubGroupCheckout({
  batchId,
  batchName,
  subGroupId,
  subGroupName,
  regionWhatsapp,
  isOpen,
  onClose,
  onSuccess,
}: SimpleSubGroupCheckoutProps) {
  const { state: cartState, dispatch } = useCart();
  const { userProfile } = useRole();

  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Get subgroup items from cart
  const subgroupItems: CartItem[] = cartState.items
    .filter(item => item.type === 'subgroup' && item.subGroupId === subGroupId)
    .map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      productId: item.productId || 0,
    }));

  const totalAmount = subgroupItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !whatsappNumber.trim() || subgroupItems.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare items for the RPC
      const items = subgroupItems.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        price_per_vial: item.price,
      }));

      // Create order using the simple RPC (FIXED PARAMETER ORDER)
      const { data: order, error } = await supabase.rpc('create_simple_subgroup_order', {
        p_customer_name: customerName.trim(),
        p_whatsapp_number: whatsappNumber.trim(),
        p_batch_id: batchId,
        p_sub_group_id: subGroupId,
        p_items: items,
        p_user_id: userProfile?.id || null,
      });

      if (error) {
        console.error('Error creating order:', error);
        return;
      }

      // Clear subgroup items from cart
      dispatch({ type: 'CLEAR_SUBGROUP' });

      // Set success state
      setCreatedOrder(order);
      setOrderSuccess(true);

      // Call success callback
      onSuccess();
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCustomerName('');
    setWhatsappNumber('');
    setOrderSuccess(false);
    setCreatedOrder(null);
    onClose();
  };

  const handleWhatsAppRedirect = () => {
    if (!createdOrder || !regionWhatsapp) {
      return;
    }

    const orderSummary = subgroupItems
      .map(item => `• ${item.name}: ${item.quantity} vial(s) × ₱${item.price} = ₱${(item.price * item.quantity).toLocaleString()}`)
      .join('\n');

    const message = `Hi! I'd like to place an order for "${batchName}" in ${subGroupName}.

Order Code: ${createdOrder.order_code}
Customer: ${customerName}
WhatsApp: ${whatsappNumber}

Order Details:
${orderSummary}

Total: ₱${totalAmount.toLocaleString()}

Please confirm my order. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${regionWhatsapp}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (orderSuccess && createdOrder) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Order Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Your order has been created with order code:
              {' '}
              {createdOrder.order_code}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-800">Order Code</div>
                <div className="text-2xl font-bold text-green-900">{createdOrder.order_code}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Customer:</span>
                <span className="font-medium">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span className="font-bold">
                  ₱
                  {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              {regionWhatsapp && (
                <Button onClick={handleWhatsAppRedirect} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Host
                </Button>
              )}
              <Button variant="outline" onClick={handleClose} className="flex-1">
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Checkout -
            {' '}
            {batchName}
          </DialogTitle>
          <DialogDescription>
            Complete your order for
            {' '}
            {subGroupName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {subgroupItems.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded bg-gray-50 p-2">
                  <div>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-gray-600">
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
                    {totalAmount.toLocaleString()}
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
                  placeholder="Enter your WhatsApp number"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button type="button" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !customerName.trim() || !whatsappNumber.trim() || subgroupItems.length === 0}
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
