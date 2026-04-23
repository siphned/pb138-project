CREATE TYPE "public"."event_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "capacity" smallint NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "status" "event_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;