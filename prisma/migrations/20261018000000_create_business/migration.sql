CREATE TABLE "Business" (
  "id" TEXT NOT NULL,
  "ownerClerkUserId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "timezone" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Business_ownerClerkUserId_key" ON "Business"("ownerClerkUserId");
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");
