-- CreateTable
CREATE TABLE "Verified_Codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Verified_Codes_pkey" PRIMARY KEY ("id")
);
