/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Chat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,postId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Chat_userId_postId_ownerId_key";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "ownerId";

-- CreateIndex
CREATE UNIQUE INDEX "Chat_userId_postId_key" ON "Chat"("userId", "postId");
