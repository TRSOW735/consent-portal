-- Add missing column. If it already exists, SQLite will throw. We'll handle that.
ALTER TABLE "Organization" ADD COLUMN "updatedAt" DATETIME;
UPDATE "Organization" SET "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP);