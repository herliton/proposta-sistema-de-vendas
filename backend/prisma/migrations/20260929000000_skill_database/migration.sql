-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "chavePix" TEXT,
ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "estado" TEXT,
ADD COLUMN     "firstAccess" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "gerenteId" INTEGER,
ADD COLUMN     "logradouro" TEXT,
ADD COLUMN     "metaMensal" DECIMAL(12,2),
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN     "resetPasswordTokenHash" TEXT,
ADD COLUMN     "telefone" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "gerenteId" INTEGER,
ADD COLUMN     "logradouro" TEXT,
ADD COLUMN     "nomeFantasia" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "ocupacao" TEXT,
ADD COLUMN     "rendaMensal" DECIMAL(12,2),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "vendedorId" INTEGER;

-- AlterTable
ALTER TABLE "Vendedor" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Veiculo" RENAME COLUMN "valor" TO "precoSugerido";

ALTER TABLE "Veiculo"
ADD COLUMN     "anoFabricacao" INTEGER,
ADD COLUMN     "anoModelo" INTEGER,
ADD COLUMN     "codigoFipe" VARCHAR(20),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "fotoDireita" TEXT,
ADD COLUMN     "fotoEsquerda" TEXT,
ADD COLUMN     "fotoFrente" TEXT,
ADD COLUMN     "fotoInterior" TEXT,
ADD COLUMN     "fotoTraseira" TEXT,
ADD COLUMN     "precoMinimo" DECIMAL(12,2),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "valorFipe" DECIMAL(12,2),
ADD COLUMN     "videoDuracao" INTEGER,
ADD COLUMN     "videoUrl" TEXT,
ALTER COLUMN "precoSugerido" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "marca" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "modelo" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "placa" SET DATA TYPE VARCHAR(10);

-- AlterTable
ALTER TABLE "Proposta" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "entrada" DECIMAL(12,2),
ADD COLUMN     "motivoRecusa" TEXT,
ADD COLUMN     "parcelas" INTEGER,
ADD COLUMN     "taxaJuros" DECIMAL(5,2),
ADD COLUMN     "totalFinanciado" DECIMAL(12,2),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "valorParcela" DECIMAL(12,2),
ALTER COLUMN "valorProposta" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Contrato" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'VENDA_VEICULO',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "valorTotal" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Financeiro" ALTER COLUMN "valor" SET DATA TYPE DECIMAL(12,2);

-- CreateTable
CREATE TABLE "SystemModule" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "route" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(50),

    CONSTRAINT "SystemModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" UUID NOT NULL,
    "role" VARCHAR(30) NOT NULL,
    "moduleId" VARCHAR(50) NOT NULL,
    "canAccess" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comissao" (
    "id" SERIAL NOT NULL,
    "propostaId" INTEGER NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "tipo" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "actorId" INTEGER NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "chave" VARCHAR(100) NOT NULL,
    "valor" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("chave")
);

-- CreateIndex
CREATE INDEX "RolePermission_role_idx" ON "RolePermission"("role");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_role_moduleId_key" ON "RolePermission"("role", "moduleId");

-- CreateIndex
CREATE INDEX "Comissao_vendedorId_pago_createdAt_idx" ON "Comissao"("vendedorId", "pago", "createdAt");

-- CreateIndex
CREATE INDEX "Comissao_propostaId_idx" ON "Comissao"("propostaId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_resetPasswordTokenHash_key" ON "Usuario"("resetPasswordTokenHash");

-- CreateIndex
CREATE INDEX "Usuario_perfil_status_idx" ON "Usuario"("perfil", "status");

-- CreateIndex
CREATE INDEX "Usuario_gerenteId_idx" ON "Usuario"("gerenteId");

-- CreateIndex
CREATE INDEX "Cliente_documento_idx" ON "Cliente"("documento");

-- CreateIndex
CREATE INDEX "Cliente_nome_idx" ON "Cliente"("nome");

-- CreateIndex
CREATE INDEX "Cliente_vendedorId_status_idx" ON "Cliente"("vendedorId", "status");

-- CreateIndex
CREATE INDEX "Vendedor_equipe_status_idx" ON "Vendedor"("equipe", "status");

-- CreateIndex
CREATE INDEX "Veiculo_marca_modelo_anoFabricacao_anoModelo_status_idx" ON "Veiculo"("marca", "modelo", "anoFabricacao", "anoModelo", "status");

-- CreateIndex
CREATE INDEX "Veiculo_placa_idx" ON "Veiculo"("placa");

-- CreateIndex
CREATE INDEX "Proposta_veiculoId_status_idx" ON "Proposta"("veiculoId", "status");

-- CreateIndex
CREATE INDEX "Proposta_vendedorId_status_createdAt_idx" ON "Proposta"("vendedorId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Proposta_clienteId_createdAt_idx" ON "Proposta"("clienteId", "createdAt");

-- CreateIndex
CREATE INDEX "Contrato_status_dataAssinatura_idx" ON "Contrato"("status", "dataAssinatura");

-- CreateIndex
CREATE INDEX "Financeiro_status_dataVencimento_idx" ON "Financeiro"("status", "dataVencimento");

-- CreateIndex
CREATE INDEX "Aprovacao_entidade_entidadeId_createdAt_idx" ON "Aprovacao"("entidade", "entidadeId", "createdAt");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_gerenteId_fkey" FOREIGN KEY ("gerenteId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "SystemModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Vendedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "Proposta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Vendedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
