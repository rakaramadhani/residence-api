-- CreateTable
CREATE TABLE "GuestPermission" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "guestName" TEXT NOT NULL,
    "startVisitDate" TIMESTAMP(3) NOT NULL,
    "endVisitDate" TIMESTAMP(3) NOT NULL,
    "qrUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestPermission_pkey" PRIMARY KEY ("id")
);
