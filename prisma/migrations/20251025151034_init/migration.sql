/*
  Warnings:

  - A unique constraint covering the columns `[userId,postId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[raterId,ratedId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chat_userId_postId_key" ON "Chat"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_raterId_ratedId_key" ON "Rating"("raterId", "ratedId");
