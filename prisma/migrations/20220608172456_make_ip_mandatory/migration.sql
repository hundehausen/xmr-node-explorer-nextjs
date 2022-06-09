-- CreateTable
CREATE TABLE "Node" (
    "id" SERIAL NOT NULL,
    "country" TEXT,
    "height" INTEGER NOT NULL,
    "ip" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "port" INTEGER NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Node_url_key" ON "Node"("url");
