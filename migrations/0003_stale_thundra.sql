CREATE TABLE "sub_group_batch_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"target_vials" integer NOT NULL,
	"current_vials" integer DEFAULT 0 NOT NULL,
	"price_per_vial" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_group_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"target_vials" integer NOT NULL,
	"current_vials" integer DEFAULT 0 NOT NULL,
	"discount_percentage" numeric(5, 2) DEFAULT '20' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"host_id" integer NOT NULL,
	"region_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_group_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"price_per_vial" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_group_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_code" varchar(50) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"whatsapp_number" varchar(50) NOT NULL,
	"batch_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sub_group_orders_order_code_unique" UNIQUE("order_code")
);
--> statement-breakpoint
ALTER TABLE "sub_group_batch_products" ADD CONSTRAINT "sub_group_batch_products_batch_id_sub_group_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."sub_group_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_group_batch_products" ADD CONSTRAINT "sub_group_batch_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_group_batches" ADD CONSTRAINT "sub_group_batches_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_group_batches" ADD CONSTRAINT "sub_group_batches_region_id_sub_groups_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."sub_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_group_order_items" ADD CONSTRAINT "sub_group_order_items_order_id_sub_group_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."sub_group_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_group_order_items" ADD CONSTRAINT "sub_group_order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_group_orders" ADD CONSTRAINT "sub_group_orders_batch_id_sub_group_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."sub_group_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_group_orders" ADD CONSTRAINT "sub_group_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;