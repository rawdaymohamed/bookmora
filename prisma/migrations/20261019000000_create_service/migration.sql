CREATE TABLE "Service" (
 "id" TEXT NOT NULL,
 "businessId" TEXT NOT NULL,
 "name" TEXT NOT NULL,
 "durationMinutes" INTEGER NOT NULL CHECK ("durationMinutes" > 0),
 "isActive" BOOLEAN NOT NULL DEFAULT true,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Service_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "Service_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "Service_businessId_isActive_idx" ON "Service"("businessId", "isActive");
