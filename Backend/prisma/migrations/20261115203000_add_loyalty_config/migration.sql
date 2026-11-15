CREATE TABLE "LoyaltyConfig" (
    "id" TEXT NOT NULL,
    "pointsPerUnit" INTEGER NOT NULL DEFAULT 10,
    "rewardThreshold" INTEGER NOT NULL DEFAULT 1500,
    "rewardLabel" TEXT NOT NULL DEFAULT '10% off',
    "freeDeliveryEnabled" BOOLEAN NOT NULL DEFAULT true,
    "memberOffersLabel" TEXT NOT NULL DEFAULT 'every month',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LoyaltyConfig_pkey" PRIMARY KEY ("id")
);
INSERT INTO "LoyaltyConfig" ("id", "updatedAt") VALUES ('default', CURRENT_TIMESTAMP);
