-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('PRIMARY', 'SECONDARY');

-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "storeId" TEXT NOT NULL DEFAULT 'f0b8cade-383e-4c1a-ab6b-768004a25cc9';

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "storeStatus" "StoreStatus" NOT NULL DEFAULT 'SECONDARY';

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("storeId") ON DELETE RESTRICT ON UPDATE CASCADE;
