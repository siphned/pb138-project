ALTER TABLE "guest_sessions" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "guest_sessions" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "role_requests" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "supply_agreements" ADD COLUMN "updated_at" timestamp with time zone;