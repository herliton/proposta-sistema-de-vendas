-- AlterTable
ALTER TABLE "Veiculo" ALTER COLUMN "precoSugerido" DROP NOT NULL;

-- CreateTable
CREATE TABLE "OportunidadeCredito" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "propostaId" INTEGER,
    "responsavelId" INTEGER,
    "tipo" TEXT NOT NULL DEFAULT 'REANALISE_CREDITO',
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "motivo" TEXT,
    "proximoContatoEm" TIMESTAMP(3),
    "observacoes" TEXT,
    "encerradaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OportunidadeCredito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OportunidadeCredito_propostaId_key" ON "OportunidadeCredito"("propostaId");

-- CreateIndex
CREATE INDEX "OportunidadeCredito_responsavelId_status_proximoContatoEm_idx" ON "OportunidadeCredito"("responsavelId", "status", "proximoContatoEm");

-- CreateIndex
CREATE INDEX "OportunidadeCredito_clienteId_status_idx" ON "OportunidadeCredito"("clienteId", "status");

-- AddForeignKey
ALTER TABLE "OportunidadeCredito" ADD CONSTRAINT "OportunidadeCredito_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OportunidadeCredito" ADD CONSTRAINT "OportunidadeCredito_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "Proposta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OportunidadeCredito" ADD CONSTRAINT "OportunidadeCredito_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
