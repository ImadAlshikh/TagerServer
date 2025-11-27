-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('PRODUCT', 'SERVICE');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "stock" INTEGER,
ADD COLUMN     "type" "PostType" NOT NULL DEFAULT 'PRODUCT';
