-- AddForeignKey
ALTER TABLE "GuestPermission" ADD CONSTRAINT "GuestPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
