-- CreateTable
CREATE TABLE "MedicineTakerOnViewer" (
    "medicineTakerId" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicineTakerOnViewer_pkey" PRIMARY KEY ("viewerId","medicineTakerId")
);

-- AddForeignKey
ALTER TABLE "MedicineTakerOnViewer" ADD CONSTRAINT "MedicineTakerOnViewer_medicineTakerId_fkey" FOREIGN KEY ("medicineTakerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicineTakerOnViewer" ADD CONSTRAINT "MedicineTakerOnViewer_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
