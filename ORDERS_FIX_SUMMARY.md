# Orders Display Fix - Summary

## Problem
Orders made on the website were not showing up in the admin orders page.

## Root Cause
The application uses **TWO separate order tables** in the database:

1. **`orders`** table - Stores:
   - Group buy orders
   - Individual purchase orders

2. **`sub_group_orders`** table - Stores:
   - Regional sub-group orders

The admin orders page was **only fetching from the `orders` table**, missing all sub-group orders entirely.

## Solution
Updated the admin orders page to fetch from **BOTH** tables and combine the results.

### Changes Made

**File:** `src/app/[locale]/(auth)/admin/orders/page.tsx`

#### 1. Updated `fetchOrders()` function
- Now fetches from both `orders` and `sub_group_orders` tables
- Combines results from both sources
- Sorts all orders by creation date (newest first)

#### 2. Updated `updateOrderStatus()` function
- Tries to update in `orders` table first
- If not found, updates in `sub_group_orders` table
- Works seamlessly with both order types

#### 3. Updated `updatePaymentStatus()` function
- Tries to update in `orders` table first
- If not found, updates in `sub_group_orders` table
- Works seamlessly with both order types

#### 4. Updated `deleteOrder()` function
- Attempts to delete from `orders` and `order_items` first
- If not found, deletes from `sub_group_orders` and `sub_group_order_items`
- Ensures proper cleanup of related records

#### 5. Updated `deleteSelectedOrders()` function
- Deletes from both regular and sub-group order tables
- Handles bulk deletion across both order types

## How It Works Now

### Order Fetching Flow:
```
1. Fetch from `orders` table (group buy + individual)
2. Fetch from `sub_group_orders` table (regional sub-groups)
3. Combine both arrays
4. Sort by created_at (descending)
5. Display all orders together
```

### Status Update Flow:
```
1. Try updating in `orders` table
2. If error (order not found), try `sub_group_orders` table
3. Refresh order list
```

### Delete Flow:
```
Single Order:
1. Try deleting from `orders` + `order_items`
2. If failed, delete from `sub_group_orders` + `sub_group_order_items`

Bulk Delete:
1. Delete from `orders` + `order_items` (for matching IDs)
2. Delete from `sub_group_orders` + `sub_group_order_items` (for matching IDs)
```

## Order Types Displayed

The admin page now shows:

1. **Group Buy Orders** (from `orders` table)
   - Orders placed through group buy batches
   - References `group_buy_batches` table

2. **Individual Orders** (from `orders` table)
   - Direct product purchases
   - No batch association

3. **Sub-Group Orders** (from `sub_group_orders` table)
   - Regional sub-group orders
   - References `sub_group_batches` table

## Data Structure

Both order tables have similar structures:

### Common Fields:
- `order_code` - Unique order identifier
- `customer_name` - Customer name
- `whatsapp_number` - Contact number
- `status` - Order status (pending, confirmed, etc.)
- `payment_status` - Payment status (pending, paid, refunded)
- `total_amount` - Order total
- `user_id` - Associated user (if logged in)
- `created_at` - Order creation date
- `updated_at` - Last update date

### Differences:
- Regular orders → `batch_id` references `group_buy_batches`
- Sub-group orders → `batch_id` references `sub_group_batches`

## Testing

To verify the fix works:

1. **Create a sub-group order:**
   - Visit `/products/sub-groups`
   - Select a region with active batch
   - Add products to cart
   - Complete checkout

2. **Check admin page:**
   - Login as admin
   - Visit `/admin/orders`
   - The sub-group order should now appear

3. **Test operations:**
   - ✅ Update order status
   - ✅ Update payment status
   - ✅ Delete single order
   - ✅ Delete multiple selected orders

## Result

✅ All orders (group buy, individual, and sub-group) now display in the admin orders page
✅ Status updates work for all order types
✅ Payment status updates work for all order types
✅ Delete functionality works for all order types
✅ No linting errors

## Database Tables Involved

- `orders` - Regular and group buy orders
- `order_items` - Items for regular orders
- `sub_group_orders` - Regional sub-group orders
- `sub_group_order_items` - Items for sub-group orders
- `group_buy_batches` - Group buy batches
- `sub_group_batches` - Regional sub-group batches
- `users` - User information
- `products` - Product information
