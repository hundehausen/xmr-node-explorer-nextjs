-- CreateEnum
CREATE TYPE "Network" AS ENUM ('MAINNET', 'STAGENET', 'TESTNET');

-- CreateTable
CREATE TABLE "Node" (
    "id" SERIAL NOT NULL,
    "country" TEXT,
    "countryCode" TEXT,
    "height" INTEGER NOT NULL,
    "ip" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "port" INTEGER NOT NULL,
    "url" TEXT,
    "network" "Network" NOT NULL DEFAULT 'MAINNET',
    "version" TEXT,
    "fee" INTEGER DEFAULT 0,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Node_url_port_key" ON "Node"("url", "port");
