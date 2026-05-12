ALTER TYPE "public"."user_status" ADD VALUE 'deleted';--> statement-breakpoint
ALTER TABLE "winemakers" ALTER COLUMN "phone" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_role_unique" UNIQUE("user_id","role");