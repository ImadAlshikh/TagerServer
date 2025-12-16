-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_reporterId_fkey";

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "userId" TEXT;
