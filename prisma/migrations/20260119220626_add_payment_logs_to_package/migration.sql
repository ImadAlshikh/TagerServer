/*
  Warnings:

  - You are about to drop the `WalletLog` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `discount` to the `Package` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentReason" AS ENUM ('MONTHLY_RESET', 'TOP_UP', 'POST_CREATE', 'POST_PROMOTE');

-- DropForeignKey
ALTER TABLE "WalletLog" DROP CONSTRAINT "WalletLog_walletId_fkey";

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "discount" INTEGER NOT NULL,
ADD COLUMN     "features" TEXT[];

-- DropTable
DROP TABLE "WalletLog";

-- DropEnum
DROP TYPE "WalletLogReason";

-- CreateTable
CREATE TABLE "PaymentLog" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "pointSource" "PointSource" NOT NULL,
    "reason" "PaymentReason" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentLog" ADD CONSTRAINT "PaymentLog_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLog" ADD CONSTRAINT "PaymentLog_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
