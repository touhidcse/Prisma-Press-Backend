/*
  Warnings:

  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `subsciptions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripeSubscriptionId` to the `subsciptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subsciptions" ADD COLUMN     "stripeSubscriptionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "subsciptions_stripeSubscriptionId_key" ON "subsciptions"("stripeSubscriptionId");
