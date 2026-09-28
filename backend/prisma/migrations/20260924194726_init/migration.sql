-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "razaoSocial" TEXT,
    "documento" TEXT,
    "tipoPessoa" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendedor" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "cargo" TEXT,
    "equipe" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "usuarioId" INTEGER,

    CONSTRAINT "Vendedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Veiculo" (
    "id" SERIAL NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "placa" TEXT,
    "valor" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disponivel',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Veiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposta" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "valorProposta" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" SERIAL NOT NULL,
    "propostaId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    "valorTotal" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "dataAssinatura" TIMESTAMP(3),
    "documentoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Financeiro" (
    "id" SERIAL NOT NULL,
    "contratoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "dataVencimento" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Financeiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aprovacao" (
    "id" SERIAL NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "acao" TEXT NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aprovacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vendedor_email_key" ON "Vendedor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Contrato_propostaId_key" ON "Contrato"("propostaId");

-- AddForeignKey
ALTER TABLE "Vendedor" ADD CONSTRAINT "Vendedor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Vendedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "Proposta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Vendedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aprovacao" ADD CONSTRAINT "Aprovacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
