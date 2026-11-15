-- Allow orders to be placed by guests without a User record.
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;
