-- CreateTable
CREATE TABLE "Residencia" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Residencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispositivo" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'residencia',
    "residenciaId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dispositivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Residencia_numero_key" ON "Residencia"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Dispositivo_token_key" ON "Dispositivo"("token");

-- AddForeignKey
ALTER TABLE "Dispositivo" ADD CONSTRAINT "Dispositivo_residenciaId_fkey" FOREIGN KEY ("residenciaId") REFERENCES "Residencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
