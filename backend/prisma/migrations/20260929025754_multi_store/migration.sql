-- Create the default store first so existing business records remain available.
CREATE TABLE "Loja" (
  "id" SERIAL NOT NULL,
  "nome" TEXT NOT NULL,
  "cnpj" TEXT,
  "telefone" TEXT,
  "email" TEXT,
  "cep" TEXT,
  "logradouro" TEXT,
  "numero" TEXT,
  "complemento" TEXT,
  "bairro" TEXT,
  "cidade" TEXT,
  "estado" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ativo',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Loja_pkey" PRIMARY KEY ("id")
);
INSERT INTO "Loja" ("nome", "updatedAt") VALUES ('Loja Brasília', CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX "Loja_nome_key" ON "Loja"("nome");
CREATE UNIQUE INDEX "Loja_cnpj_key" ON "Loja"("cnpj");

ALTER TABLE "Usuario" ADD COLUMN "lojaId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Cliente" ADD COLUMN "lojaId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Vendedor" ADD COLUMN "lojaId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Veiculo" ADD COLUMN "lojaId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Proposta" ADD COLUMN "lojaId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Contrato" ADD COLUMN "lojaId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "OportunidadeCredito" ADD COLUMN "lojaId" INTEGER NOT NULL DEFAULT 1;

CREATE INDEX "OportunidadeCredito_lojaId_status_idx" ON "OportunidadeCredito"("lojaId", "status");
CREATE INDEX "Proposta_lojaId_status_createdAt_idx" ON "Proposta"("lojaId", "status", "createdAt");

ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Vendedor" ADD CONSTRAINT "Vendedor_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Veiculo" ADD CONSTRAINT "Veiculo_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OportunidadeCredito" ADD CONSTRAINT "OportunidadeCredito_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
