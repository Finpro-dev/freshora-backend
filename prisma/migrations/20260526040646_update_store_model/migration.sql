-- DropForeignKey
ALTER TABLE "stores" DROP CONSTRAINT "stores_userId_fkey";

-- AlterTable
ALTER TABLE "stores" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
