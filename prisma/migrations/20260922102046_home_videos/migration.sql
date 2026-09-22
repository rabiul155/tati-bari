-- CreateEnum
CREATE TYPE "HomeVideoSlot" AS ENUM ('AFTER_HERO', 'BEFORE_FOOTER');

-- CreateTable
CREATE TABLE "HomeVideo" (
    "slot" "HomeVideoSlot" NOT NULL,
    "title" TEXT,
    "url" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeVideo_pkey" PRIMARY KEY ("slot")
);
