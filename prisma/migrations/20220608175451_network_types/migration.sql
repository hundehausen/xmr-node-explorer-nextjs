-- CreateEnum
CREATE TYPE "Network" AS ENUM ('MAINNET', 'STAGENET', 'TESTNET');

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "network" "Network" NOT NULL DEFAULT E'MAINNET';
