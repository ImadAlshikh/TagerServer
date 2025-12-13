/*
  Warnings:

  - A unique constraint covering the columns `[userId,postId,ownerId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Chat_userId_postId_key";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Chat_userId_postId_ownerId_key" ON "Chat"("userId", "postId", "ownerId");
