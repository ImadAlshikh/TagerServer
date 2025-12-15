/*
  Warnings:

  - You are about to drop the column `country` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pictureId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "country",
DROP COLUMN "picture",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "pictureId" TEXT;

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "publicId" TEXT,
    "secureUrl" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_pictureId_key" ON "User"("pictureId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_pictureId_fkey" FOREIGN KEY ("pictureId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
