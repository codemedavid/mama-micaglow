# Admin Setup Instructions

## Quick Setup Guide

### 1. Database Setup
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-setup.sql`
4. Run the script to create all necessary tables

### 2. Create Your First Admin User
1. Start your development server: `npm run dev`
2. Sign in to your application
3. Navigate to `/admin/setup`
4. Click "Make Me Admin" to promote your current account to admin
5. Refresh the page to access the admin panel

### 3. Access Admin Features
Once you're an admin, you can:
- Navigate to `/admin/products` to manage products
- Access the admin panel from the user dropdown menu
- Add, edit, and delete products
- Manage product categories and pricing

## Troubleshooting

### "Error fetching user profile" Error
This happens when a user signs up but doesn't have a profile in Supabase yet. The system will automatically create a profile for new users.

### "Access Denied" Error
- Make sure you've run the SQL setup script
- Ensure you've created an admin user
- Check that your user role is set to 'admin' in the database

### Database Connection Issues
- Verify your Supabase credentials in `.env.local`
- Check that your Supabase project is active
- Ensure the database tables were created successfully

## Database Schema

The system creates these main tables:
- `users` - User profiles with roles (admin, host, customer)
- `products` - Product catalog
- `group_buy_batches` - Group buy campaigns
- `group_buy_products` - Products in group buys
- `sub_groups` - Regional sub-groups

## Role Permissions

- **Admin**: Full access to all features, can manage products and users
- **Host**: Can manage regional sub-groups and group buys
- **Customer**: Standard user access to purchase products

## Next Steps

1. Add your first products through the admin panel
2. Set up group buy batches
3. Create regional sub-groups
4. Configure your product categories and pricing
