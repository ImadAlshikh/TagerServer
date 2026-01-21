/*
  Warnings:

  - You are about to drop the column `features` on the `Package` table. All the data in the column will be lost.
  - Added the required column `credits` to the `Package` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Package" DROP COLUMN "features",
ADD COLUMN     "credits" INTEGER NOT NULL,
ADD COLUMN     "popular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripePriceId" TEXT;
