-- Audit Findings A-01, A-06 fixes

-- 1. Table renames
ALTER TABLE "event_invites" RENAME TO "event_invitations";
-- (reviews were already handled or are new, I will assume schema matches DB for now for the renames Drizzle was asking about if I can)

-- 2. Add deleted_at and convert to timestamptz
ALTER TABLE "addresses" ALTER COLUMN "created_at" TYPE timestamptz;
ALTER TABLE "addresses" ALTER COLUMN "updated_at" TYPE timestamptz;
ALTER TABLE "addresses" ALTER COLUMN "deleted_at" TYPE timestamptz;

ALTER TABLE "availability_regular" ADD COLUMN "created_at" timestamptz DEFAULT now() NOT NULL;
ALTER TABLE "availability_regular" ADD COLUMN "deleted_at" timestamptz;
ALTER TABLE "availability_regular" ALTER COLUMN "start_time" TYPE timestamptz;
ALTER TABLE "availability_regular" ALTER COLUMN "end_time" TYPE timestamptz;

ALTER TABLE "availability_exceptions" ADD COLUMN "created_at" timestamptz DEFAULT now() NOT NULL;
ALTER TABLE "availability_exceptions" ADD COLUMN "deleted_at" timestamptz;
ALTER TABLE "availability_exceptions" ALTER COLUMN "starts_at" TYPE timestamptz;
ALTER TABLE "availability_exceptions" ALTER COLUMN "ends_at" TYPE timestamptz;

ALTER TABLE "orders" ALTER COLUMN "created_at" TYPE timestamptz;
ALTER TABLE "orders" ALTER COLUMN "updated_at" TYPE timestamptz;
ALTER TABLE "orders" ALTER COLUMN "deleted_at" TYPE timestamptz;
ALTER TABLE "order_items" ADD COLUMN "deleted_at" timestamptz;

ALTER TABLE "winemakers" RENAME COLUMN "websiteurl" TO "website_url";
ALTER TABLE "winemakers" ALTER COLUMN "created_at" TYPE timestamptz;
ALTER TABLE "winemakers" ALTER COLUMN "updated_at" TYPE timestamptz;
ALTER TABLE "winemakers" ALTER COLUMN "deleted_at" TYPE timestamptz;

ALTER TABLE "shops" ALTER COLUMN "created_at" TYPE timestamptz;
ALTER TABLE "shops" ALTER COLUMN "updated_at" TYPE timestamptz;
ALTER TABLE "shops" ALTER COLUMN "deleted_at" TYPE timestamptz;

ALTER TABLE "users" ALTER COLUMN "created_at" TYPE timestamptz;
ALTER TABLE "users" ALTER COLUMN "updated_at" TYPE timestamptz;
ALTER TABLE "users" ALTER COLUMN "deleted_at" TYPE timestamptz;

ALTER TABLE "role_requests" RENAME COLUMN "reviewed_by_admin_id" TO "admin_user_id";
ALTER TABLE "role_requests" ALTER COLUMN "submitted_at" TYPE timestamptz;
ALTER TABLE "role_requests" ALTER COLUMN "reviewed_at" TYPE timestamptz;
ALTER TABLE "role_requests" ADD COLUMN "deleted_at" timestamptz;

ALTER TABLE "supply_agreements" ADD COLUMN "deleted_at" timestamptz;
ALTER TABLE "supply_agreements" ALTER COLUMN "created_at" TYPE timestamptz;
ALTER TABLE "supply_agreements" ALTER COLUMN "responded_at" TYPE timestamptz;

ALTER TABLE "images" ALTER COLUMN "created_at" TYPE timestamptz;
ALTER TABLE "images" ALTER COLUMN "updated_at" TYPE timestamptz;
ALTER TABLE "images" ADD COLUMN "deleted_at" timestamptz;
