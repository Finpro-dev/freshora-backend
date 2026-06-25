-- AlterTable
ALTER TABLE "stockJournals" ADD COLUMN     "updatedBy" TEXT;

-- AddForeignKey
ALTER TABLE "stockJournals" ADD CONSTRAINT "stockJournals_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
