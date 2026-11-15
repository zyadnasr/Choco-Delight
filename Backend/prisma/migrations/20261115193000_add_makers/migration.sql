CREATE TABLE "Maker" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "image" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Maker_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Maker_slug_key" ON "Maker"("slug");

ALTER TABLE "Product" ADD COLUMN "makerId" TEXT;

ALTER TABLE "Product" ADD CONSTRAINT "Product_makerId_fkey" FOREIGN KEY ("makerId") REFERENCES "Maker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
