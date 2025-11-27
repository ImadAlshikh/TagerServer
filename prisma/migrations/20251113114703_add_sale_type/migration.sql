-- CreateEnum
CREATE TYPE "SaleType" AS ENUM ('ONETIME', 'MULTIPLE');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "saleType" "SaleType" NOT NULL DEFAULT 'ONETIME';
