BEGIN;
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "phoneNum" DROP NOT NULL;

CREATE TABLE "OAuthAccount" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OAuthAccount_provider_providerAccountId_key"
    ON "OAuthAccount"("provider", "providerAccountId");
CREATE INDEX "OAuthAccount_userId_idx" ON "OAuthAccount"("userId");
ALTER TABLE "OAuthAccount" ADD CONSTRAINT "OAuthAccount_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;
