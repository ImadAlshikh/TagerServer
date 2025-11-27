-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('ACTIVE', 'SOLD', 'EXPIRED', 'HIDDING', 'REMOVED');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'ACTIVE';
