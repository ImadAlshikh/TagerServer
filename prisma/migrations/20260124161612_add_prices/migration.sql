-- CreateEnum
CREATE TYPE "PriceKey" AS ENUM ('POST_CREATE', 'POST_PROMOTE');

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Price_key_key" ON "Price"("key");
