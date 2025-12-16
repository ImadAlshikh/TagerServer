/*
  Warnings:

  - You are about to alter the column `price` on the `Post` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "price" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT;
