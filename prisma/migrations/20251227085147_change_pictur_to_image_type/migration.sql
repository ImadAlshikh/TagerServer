/*
  Warnings:

  - You are about to drop the column `picture` on the `Post` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pictureId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "picture",
ADD COLUMN     "pictureId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Post_pictureId_key" ON "Post"("pictureId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_pictureId_fkey" FOREIGN KEY ("pictureId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
