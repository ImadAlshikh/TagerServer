/*
  Warnings:

  - You are about to drop the column `test` on the `Report` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Report" DROP COLUMN "test",
ADD COLUMN     "text" TEXT;
