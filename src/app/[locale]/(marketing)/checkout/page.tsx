'use client';

import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  MapPin,
  Package,
  Search,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';

type BatchProduct = {
  product_id: number;
  product: {
    id: number;
    name: string;
    description: string | null;
    category: string;
    price_per_vial: number;
    price_per_box: number;
    vials_per_box: number;
    image_url: string | null;
  };
  target_vials: number;
  current_vials: number;
  price_per_vial: number;
};

type SubGroupBatch = {
  id: number;
  name: string;
  description: string | null;
  status: string;
  target_vials: number;
  current_vials: number;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  host_id: number;
  region_id: number | null;
  created_at: string;
  updated_at: string;
  batch_products: BatchProduct[];
  region?: {
    id: number;
    name: string;
    whatsapp_number: string | null;
  };
};

function CheckoutPageContent() {
  const { state, dispatch } = useCart();
  const { userProfile } = useRole();
  const searchParams = useSearchParams();
  const batchId = searchParams.get('batchId');
  const batchType = searchParams.get('type');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [batchData, setBatchData] = useState<SubGroupBatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderCode, setOrderCode] = useState('');

  // Fetch batch data when batchId is provided
  useEffect(() => {
    if (batchId && batchType === 'subgroup') {
      const fetchBatchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const { data, error: batchError } = await supabase
            .from('sub_group_batches')
            .select(`
              *,
              batch_products:sub_group_batch_products(
                product_id,
                target_vials,
                current_vials,
                price_per_vial,
                product:products(
                  id,
                  name,
                  description,
                  category,
                  price_per_vial,
                  price_per_box,
                  vials_per_box,
                  image_url
                )
              ),
              region:sub_groups(
                id,
                name,
                whatsapp_number
              )
            `)
            .eq('id', batchId)
            .eq('status', 'active')
            .single();

          if (batchError) {
            setError('Failed to load batch data');
            console.error('Error fetching batch:', batchError);
          } else {
            setBatchData(data);
          }
        } catch (err) {
          setError('Failed to load batch data');
          console.error('Error fetching batch:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchBatchData();
    }
  }, [batchId, batchType]);

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
      case 'subgroup':
        return 'Sub-Group Batch';
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
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const groupItemsByType = () => {
    const grouped = state.items.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type]?.push(item);
      return acc;
    }, {} as Record<string, typeof state.items>);

    return grouped;
  };

  const groupedItems = groupItemsByType();

  const getIndividualItems = () => state.items.filter(item => item.type === 'individual');
  const getTotalBoxes = () => getIndividualItems().reduce((sum, item) => sum + item.quantity, 0);
  const calculateShipping = () => {
    const boxes = getTotalBoxes();
    if (boxes === 0) {
      return 0;
    }
    const units = Math.ceil(boxes / 4);
    return units * 2600;
  };
  const itemsTotal = state.total;
  const shipping = calculateShipping();
  const grandTotal = itemsTotal + shipping;

  const buildWhatsappMessage = () => {
    const individualItems = getIndividualItems();
    const itemLines = individualItems.map(it => `• ${it.name} — ${it.quantity} box(es) × ₱${it.price.toLocaleString()} = ₱${(it.price * it.quantity).toLocaleString()}`);
    const summary = [
      'New Individual Purchase Order',
      '',
      'Customer Details:',
      `Name: ${firstName} ${lastName}`.trim(),
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Address: ${address}, ${city}, ${province} ${zipCode}`.replace(/,\s*,/g, ', ').trim(),
      '',
      'Order Items:',
      ...itemLines,
      '',
      `Shipping (₱2,600 per up to 4 boxes): ₱${shipping.toLocaleString()}`,
      `Total: ₱${grandTotal.toLocaleString()}`,
    ].join('\n');
    return encodeURIComponent(summary);
  };

  const buildSubGroupWhatsappMessage = () => {
    const subgroupItems = state.items.filter(item => item.type === 'subgroup');
    const itemLines = subgroupItems.map(it => `• ${it.name} — ${it.quantity} vial(s) × ₱${it.price.toLocaleString()} = ₱${(it.price * it.quantity).toLocaleString()}`);
    const totalAmount = subgroupItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const summary = [
      `Hi! I'd like to place an order for the sub-group batch "${batchData?.name}" in ${batchData?.region?.name}.`,
      '',
      'Order Details:',
      `Sub-Group: ${batchData?.region?.name}`,
      `Batch: ${batchData?.name}`,
      '',
      'Customer Details:',
      `Name: ${firstName} ${lastName}`.trim(),
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Address: ${address}, ${city}, ${province} ${zipCode}`.replace(/,\s*,/g, ', ').trim(),
      '',
      'Order Items:',
      ...itemLines,
      '',
      `Total Amount: ₱${totalAmount.toLocaleString()}`,
      '',
      'Please confirm my order and provide payment details. Thank you!',
    ].join('\n');
    return encodeURIComponent(summary);
  };

  const handlePlaceOrder = async () => {
    // Basic customer detail validation (minimal)
    if (!firstName || !lastName || !phone || !address) {
      return;
    }

    // Handle sub-group orders - for now, just redirect to WhatsApp
    // TODO: Implement full database integration when tables are ready
    if (batchType === 'subgroup' && batchData?.region?.whatsapp_number) {
      const encoded = buildSubGroupWhatsappMessage();
      const whatsappUrl = `https://wa.me/${batchData.region.whatsapp_number}?text=${encoded}`;
      window.open(whatsappUrl, '_blank');
      return;
    }

    // Handle individual orders - save to database
    if (getTotalBoxes() === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const individualItems = getIndividualItems();

      // Prepare items for the database
      const items = individualItems.map(item => ({
        product_id: Number.parseInt(item.id), // Assuming item.id is the product ID
        quantity: item.quantity,
        price_per_box: item.price,
        total_price: item.price * item.quantity,
      }));

      // Create order using the RPC function
      const { data: orderId, error: createError } = await supabase
        .rpc('create_individual_order', {
          p_customer_name: `${firstName} ${lastName}`.trim(),
          p_customer_email: email || null,
          p_customer_phone: phone,
          p_shipping_address: address,
          p_shipping_city: city,
          p_shipping_province: province,
          p_shipping_zip_code: zipCode || null,
          p_subtotal: itemsTotal,
          p_shipping_cost: shipping,
          p_total_amount: grandTotal,
          p_user_id: userProfile?.id || null,
          p_items: items,
        });

      if (createError || !orderId) {
        throw createError ?? new Error('Failed to create individual order');
      }

      // Fetch the created order to get the order code
      const { data: order, error: fetchError } = await supabase
        .from('individual_orders')
        .select('order_code')
        .eq('id', orderId)
        .single();

      if (fetchError || !order) {
        throw fetchError ?? new Error('Failed to fetch created order');
      }

      // Set success state
      setOrderCode(order.order_code);
      setOrderSuccess(true);

      // Clear individual items from cart
      dispatch({ type: 'CLEAR_INDIVIDUAL' });

      // Redirect to WhatsApp with order details
      const encoded = buildWhatsappMessage();
      const whatsappUrl = `https://wa.me/639154901224?text=${encoded}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error creating individual order:', error);
      setError('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-md text-center">
            <Package className="mx-auto mb-4 h-16 w-16 animate-pulse text-muted-foreground" />
            <h1 className="mb-2 text-2xl font-bold">Loading batch...</h1>
            <p className="mb-6 text-muted-foreground">
              Please wait while we load the batch information
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-md text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h1 className="mb-2 text-2xl font-bold">Error loading batch</h1>
            <p className="mb-6 text-muted-foreground">{error}</p>
            <Button asChild>
              <Link href="/products/sub-groups">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Regions
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show order success state
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-md text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h1 className="mb-2 text-2xl font-bold">Order Created Successfully!</h1>
            <p className="mb-6 text-muted-foreground">
              Your individual purchase order has been created and saved to our system.
            </p>

            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-800">Order Code</div>
                <div className="text-2xl font-bold text-green-900">{orderCode}</div>
              </div>
            </div>

            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/track-order">
                  <Search className="mr-2 h-4 w-4" />
                  Track Your Order
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart if no items and no batch data
  if (state.items.length === 0 && !batchData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-md text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h1 className="mb-2 text-2xl font-bold">Your cart is empty</h1>
            <p className="mb-6 text-muted-foreground">
              Add some products to your cart before checking out
            </p>
            <Button asChild>
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">Review your order and complete your purchase</p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Order Summary */}
            <div className="space-y-6 lg:col-span-2">
              {/* Batch Products */}
              {batchData && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {getTypeIcon('subgroup')}
                      <CardTitle className="text-lg">{getTypeLabel('subgroup')}</CardTitle>
                      <Badge className={getTypeColor('subgroup')}>
                        {batchData.batch_products.length}
                        {' '}
                        product
                        {batchData.batch_products.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <CardDescription>
                      {batchData.name}
                      {' '}
                      -
                      {' '}
                      {batchData.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {batchData.batch_products.map(batchProduct => (
                        <div key={batchProduct.product_id} className="flex items-center justify-between border-b py-4 last:border-b-0">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                              <Package className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-medium">{batchProduct.product.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {batchProduct.product.description}
                              </p>
                              <div className="mt-1 flex items-center gap-4 text-sm">
                                <span className="font-medium text-green-600">
                                  ₱
                                  {batchProduct.price_per_vial.toLocaleString()}
                                  {' '}
                                  per vial
                                </span>
                                <span className="text-muted-foreground">
                                  {batchProduct.current_vials}
                                  /
                                  {batchProduct.target_vials}
                                  {' '}
                                  vials
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold">
                              Available
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {batchProduct.target_vials - batchProduct.current_vials}
                              {' '}
                              vials left
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Items by Type */}
              {Object.entries(groupedItems).map(([type, items]) => (
                <Card key={type}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(type)}
                      <CardTitle className="text-lg">{getTypeLabel(type)}</CardTitle>
                      <Badge className={getTypeColor(type)}>
                        {items.length}
                        {' '}
                        item
                        {items.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {items.map(item => (
                        <div key={`${item.id}-${item.type}`} className="flex items-center justify-between border-b py-2 last:border-b-0">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                              {getTypeIcon(item.type)}
                            </div>
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.type === 'individual'
                                  ? `₱${item.price.toLocaleString()} per box (${item.vialsPerBox} vials)`
                                  : `₱${item.price.toLocaleString()} per vial`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ₱
                              {(item.price * item.quantity).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Qty:
                              {' '}
                              {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                  <CardDescription>
                    Enter your delivery details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Enter first name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Enter last name" value={lastName} onChange={e => setLastName(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter email address" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="Enter phone number" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" placeholder="Enter complete address" value={address} onChange={e => setAddress(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="Enter city" value={city} onChange={e => setCity(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="province">Province</Label>
                      <Input id="province" placeholder="Enter province" value={province} onChange={e => setProvince(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input id="zipCode" placeholder="Enter ZIP code" value={zipCode} onChange={e => setZipCode(e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>
                        Items (
                        {state.itemCount}
                        )
                      </span>
                      <span>
                        ₱
                        {state.total.toLocaleString()}
                      </span>
                    </div>

                    {/* Show shipping only for individual orders */}
                    {batchType !== 'subgroup' && (
                      <>
                        <div className="flex justify-between">
                          <span>Shipping (₱2,600 / up to 4 boxes)</span>
                          <span>
                            ₱
                            {shipping.toLocaleString()}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span>
                            ₱
                            {grandTotal.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Show total for sub-group orders */}
                    {batchType === 'subgroup' && (
                      <>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span>
                            ₱
                            {state.total.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handlePlaceOrder}
                      disabled={
                        isSubmitting
                        || (batchType === 'subgroup'
                          ? state.items.filter(item => item.type === 'subgroup').length === 0
                          : getTotalBoxes() === 0)
                      }
                    >
                      {isSubmitting
                        ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Processing Order...
                            </>
                          )
                        : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4" />
                              {batchType === 'subgroup' ? 'Contact Region Host' : 'Place Order'}
                            </>
                          )}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      {batchType === 'subgroup'
                        ? 'You will be redirected to the region host\'s WhatsApp to complete your order'
                        : 'By placing this order, you agree to our terms and conditions'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Security Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Security & Guarantees</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span>Secure payment processing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span>Free shipping on all orders</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span>Discrete packaging</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}
