/*
  Warnings:

  - Added the required column `rate` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "country" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "rate" INTEGER NOT NULL;
