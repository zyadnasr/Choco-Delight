CREATE TYPE "PaymentMethod" AS ENUM ('CASH_ON_DELIVERY');
CREATE TABLE "DeliveryConfig" (
    "id" TEXT NOT NULL,
    "deliveryFee" INTEGER NOT NULL DEFAULT 0,
    "freeDeliveryThreshold" INTEGER,
    "cashOnDeliveryEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DeliveryConfig_pkey" PRIMARY KEY ("id")
);
INSERT INTO "DeliveryConfig" ("id", "updatedAt") VALUES ('default', CURRENT_TIMESTAMP);
ALTER TABLE "Order" ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH_ON_DELIVERY';
ALTER TABLE "Order" ADD COLUMN "deliveryFee" INTEGER NOT NULL DEFAULT 0;
