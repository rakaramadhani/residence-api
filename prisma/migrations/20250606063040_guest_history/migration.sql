-- CreateTable
CREATE TABLE "GuestHistory" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "guestName" TEXT NOT NULL,
    "startVisitDate" TIMESTAMP(3) NOT NULL,
    "endVisitDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GuestHistory" ADD CONSTRAINT "GuestHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
