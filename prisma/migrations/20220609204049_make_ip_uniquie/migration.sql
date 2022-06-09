/*
  Warnings:

  - A unique constraint covering the columns `[ip]` on the table `Node` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Node_ip_key" ON "Node"("ip");
