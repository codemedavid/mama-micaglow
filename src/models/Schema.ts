import { boolean, decimal, integer, json, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the Next.js initialization process through `instrumentation.ts`.
// Simply restart your Next.js server to apply the database changes.
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

// Need a database for production? Check out https://www.prisma.io/?via=nextjsboilerplate
// Tested and compatible with Next.js Boilerplate

export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// User roles enum
export const userRoleEnum = ['admin', 'host', 'customer'] as const;

// Users table with roles
export const usersSchema = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  role: varchar('role', { length: 20 }).$type<typeof userRoleEnum[number]>().default('customer').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Products table
export const productsSchema = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(),
  pricePerVial: decimal('price_per_vial', { precision: 10, scale: 2 }).notNull(),
  pricePerBox: decimal('price_per_box', { precision: 10, scale: 2 }).notNull(),
  vialsPerBox: integer('vials_per_box').default(10).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  specifications: json('specifications'),
  createdBy: integer('created_by').references(() => usersSchema.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Group buy batches
export const groupBuyBatchesSchema = pgTable('group_buy_batches', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).default('active').notNull(), // active, completed, cancelled
  targetVials: integer('target_vials').notNull(),
  currentVials: integer('current_vials').default(0).notNull(),
  discountPercentage: decimal('discount_percentage', { precision: 5, scale: 2 }).default('20').notNull(),
  startDate: timestamp('start_date', { mode: 'date' }).notNull(),
  endDate: timestamp('end_date', { mode: 'date' }).notNull(),
  createdBy: integer('created_by').references(() => usersSchema.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Group buy products (many-to-many relationship)
export const groupBuyProductsSchema = pgTable('group_buy_products', {
  id: serial('id').primaryKey(),
  batchId: integer('batch_id').references(() => groupBuyBatchesSchema.id).notNull(),
  productId: integer('product_id').references(() => productsSchema.id).notNull(),
  targetVials: integer('target_vials').notNull(),
  currentVials: integer('current_vials').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Regional sub-groups
export const subGroupsSchema = pgTable('sub_groups', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  region: varchar('region', { length: 100 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  hostId: integer('host_id').references(() => usersSchema.id),
  joinFee: decimal('join_fee', { precision: 10, scale: 2 }).default('0').notNull(),
  whatsappNumber: varchar('whatsapp_number', { length: 50 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Sub-group batches
export const subGroupBatchesSchema = pgTable('sub_group_batches', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  targetVials: integer('target_vials').notNull(),
  currentVials: integer('current_vials').default(0).notNull(),
  discountPercentage: decimal('discount_percentage', { precision: 5, scale: 2 }).default('20').notNull(),
  startDate: timestamp('start_date', { mode: 'date' }).notNull(),
  endDate: timestamp('end_date', { mode: 'date' }).notNull(),
  hostId: integer('host_id').references(() => usersSchema.id).notNull(),
  regionId: integer('region_id').references(() => subGroupsSchema.id),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Sub-group batch products
export const subGroupBatchProductsSchema = pgTable('sub_group_batch_products', {
  id: serial('id').primaryKey(),
  batchId: integer('batch_id').references(() => subGroupBatchesSchema.id).notNull(),
  productId: integer('product_id').references(() => productsSchema.id).notNull(),
  targetVials: integer('target_vials').notNull(),
  currentVials: integer('current_vials').default(0).notNull(),
  pricePerVial: decimal('price_per_vial', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Sub-group orders
export const subGroupOrdersSchema = pgTable('sub_group_orders', {
  id: serial('id').primaryKey(),
  orderCode: varchar('order_code', { length: 50 }).unique().notNull(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  whatsappNumber: varchar('whatsapp_number', { length: 50 }).notNull(),
  batchId: integer('batch_id').references(() => subGroupBatchesSchema.id).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  paymentStatus: varchar('payment_status', { length: 20 }).default('pending').notNull(),
  userId: integer('user_id').references(() => usersSchema.id),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Sub-group order items
export const subGroupOrderItemsSchema = pgTable('sub_group_order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => subGroupOrdersSchema.id).notNull(),
  productId: integer('product_id').references(() => productsSchema.id).notNull(),
  quantity: integer('quantity').notNull(),
  pricePerVial: decimal('price_per_vial', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
