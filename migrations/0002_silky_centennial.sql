ALTER TABLE "sub_groups" ALTER COLUMN "host_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sub_groups" ADD COLUMN "whatsapp_number" varchar(50);