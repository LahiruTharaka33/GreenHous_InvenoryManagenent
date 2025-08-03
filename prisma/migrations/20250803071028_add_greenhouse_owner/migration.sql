-- AlterTable
ALTER TABLE "Greenhouse" ADD COLUMN     "ownerId" TEXT;

-- AddForeignKey
ALTER TABLE "Greenhouse" ADD CONSTRAINT "Greenhouse_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
