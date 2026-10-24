-- CreateTable
CREATE TABLE `Loja` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `cep` VARCHAR(191) NULL,
    `logradouro` VARCHAR(191) NULL,
    `numero` VARCHAR(191) NULL,
    `complemento` VARCHAR(191) NULL,
    `bairro` VARCHAR(191) NULL,
    `cidade` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ativo',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Loja_nome_key`(`nome`),
    UNIQUE INDEX `Loja_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senhaHash` VARCHAR(191) NOT NULL,
    `perfil` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ativo',
    `telefone` VARCHAR(191) NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `cep` VARCHAR(191) NULL,
    `logradouro` VARCHAR(191) NULL,
    `numero` VARCHAR(191) NULL,
    `complemento` VARCHAR(191) NULL,
    `bairro` VARCHAR(191) NULL,
    `cidade` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NULL,
    `chavePix` VARCHAR(191) NULL,
    `metaMensal` DECIMAL(12, 2) NULL,
    `firstAccess` BOOLEAN NOT NULL DEFAULT true,
    `resetPasswordTokenHash` VARCHAR(191) NULL,
    `resetPasswordExpires` DATETIME(3) NULL,
    `gerenteId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lojaId` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    UNIQUE INDEX `Usuario_resetPasswordTokenHash_key`(`resetPasswordTokenHash`),
    INDEX `Usuario_perfil_status_idx`(`perfil`, `status`),
    INDEX `Usuario_gerenteId_idx`(`gerenteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemModule` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `route` VARCHAR(100) NOT NULL,
    `icon` VARCHAR(50) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RolePermission` (
    `id` VARCHAR(36) NOT NULL,
    `role` VARCHAR(30) NOT NULL,
    `moduleId` VARCHAR(50) NOT NULL,
    `canAccess` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RolePermission_role_idx`(`role`),
    UNIQUE INDEX `RolePermission_role_moduleId_key`(`role`, `moduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `razaoSocial` VARCHAR(191) NULL,
    `nomeFantasia` VARCHAR(191) NULL,
    `documento` VARCHAR(191) NULL,
    `tipoPessoa` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `cep` VARCHAR(191) NULL,
    `logradouro` VARCHAR(191) NULL,
    `numero` VARCHAR(191) NULL,
    `complemento` VARCHAR(191) NULL,
    `bairro` VARCHAR(191) NULL,
    `cidade` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NULL,
    `rendaMensal` DECIMAL(12, 2) NULL,
    `ocupacao` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ativo',
    `vendedorId` INTEGER NULL,
    `gerenteId` INTEGER NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lojaId` INTEGER NOT NULL DEFAULT 1,

    INDEX `Cliente_documento_idx`(`documento`),
    INDEX `Cliente_nome_idx`(`nome`),
    INDEX `Cliente_vendedorId_status_idx`(`vendedorId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vendedor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `cargo` VARCHAR(191) NULL,
    `equipe` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ativo',
    `usuarioId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lojaId` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `Vendedor_email_key`(`email`),
    INDEX `Vendedor_equipe_status_idx`(`equipe`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Veiculo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `marca` VARCHAR(100) NOT NULL,
    `modelo` VARCHAR(100) NOT NULL,
    `ano` INTEGER NOT NULL,
    `anoFabricacao` INTEGER NULL,
    `anoModelo` INTEGER NULL,
    `codigoFipe` VARCHAR(20) NULL,
    `valorFipe` DECIMAL(12, 2) NULL,
    `precoSugerido` DECIMAL(12, 2) NULL,
    `precoMinimo` DECIMAL(12, 2) NULL,
    `placa` VARCHAR(10) NULL,
    `lojaId` INTEGER NOT NULL DEFAULT 1,
    `status` VARCHAR(191) NOT NULL DEFAULT 'disponivel',
    `observacoes` VARCHAR(191) NULL,
    `fotoDireita` VARCHAR(191) NULL,
    `fotoEsquerda` VARCHAR(191) NULL,
    `fotoFrente` VARCHAR(191) NULL,
    `fotoTraseira` VARCHAR(191) NULL,
    `fotoInterior` VARCHAR(191) NULL,
    `videoUrl` VARCHAR(191) NULL,
    `videoDuracao` INTEGER NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Veiculo_marca_modelo_anoFabricacao_anoModelo_status_idx`(`marca`, `modelo`, `anoFabricacao`, `anoModelo`, `status`),
    INDEX `Veiculo_placa_idx`(`placa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proposta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `vendedorId` INTEGER NOT NULL,
    `veiculoId` INTEGER NOT NULL,
    `lojaId` INTEGER NOT NULL DEFAULT 1,
    `valorProposta` DECIMAL(12, 2) NOT NULL,
    `entrada` DECIMAL(12, 2) NULL,
    `parcelas` INTEGER NULL,
    `taxaJuros` DECIMAL(5, 2) NULL,
    `valorParcela` DECIMAL(12, 2) NULL,
    `totalFinanciado` DECIMAL(12, 2) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pendente',
    `motivoRecusa` VARCHAR(191) NULL,
    `observacoes` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Proposta_veiculoId_status_idx`(`veiculoId`, `status`),
    INDEX `Proposta_vendedorId_status_createdAt_idx`(`vendedorId`, `status`, `createdAt`),
    INDEX `Proposta_lojaId_status_createdAt_idx`(`lojaId`, `status`, `createdAt`),
    INDEX `Proposta_clienteId_createdAt_idx`(`clienteId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contrato` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `propostaId` INTEGER NOT NULL,
    `clienteId` INTEGER NOT NULL,
    `vendedorId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'VENDA_VEICULO',
    `lojaId` INTEGER NOT NULL DEFAULT 1,
    `valorTotal` DECIMAL(12, 2) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ativo',
    `dataAssinatura` DATETIME(3) NULL,
    `documentoUrl` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Contrato_propostaId_key`(`propostaId`),
    INDEX `Contrato_status_dataAssinatura_idx`(`status`, `dataAssinatura`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Financeiro` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contratoId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(12, 2) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pendente',
    `dataVencimento` DATETIME(3) NULL,
    `observacoes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Financeiro_status_dataVencimento_idx`(`status`, `dataVencimento`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Aprovacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entidade` VARCHAR(191) NOT NULL,
    `entidadeId` INTEGER NOT NULL,
    `usuarioId` INTEGER NULL,
    `acao` VARCHAR(191) NOT NULL,
    `observacao` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Aprovacao_entidade_entidadeId_createdAt_idx`(`entidade`, `entidadeId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comissao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `propostaId` INTEGER NOT NULL,
    `vendedorId` INTEGER NOT NULL,
    `usuarioId` INTEGER NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(12, 2) NOT NULL,
    `pago` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Comissao_vendedorId_pago_createdAt_idx`(`vendedorId`, `pago`, `createdAt`),
    INDEX `Comissao_propostaId_idx`(`propostaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `actorId` INTEGER NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `details` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_actorId_createdAt_idx`(`actorId`, `createdAt`),
    INDEX `AuditLog_action_createdAt_idx`(`action`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Configuracao` (
    `chave` VARCHAR(100) NOT NULL,
    `valor` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`chave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OportunidadeCredito` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `lojaId` INTEGER NOT NULL DEFAULT 1,
    `propostaId` INTEGER NULL,
    `responsavelId` INTEGER NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'REANALISE_CREDITO',
    `status` VARCHAR(191) NOT NULL DEFAULT 'ABERTA',
    `motivo` VARCHAR(191) NULL,
    `proximoContatoEm` DATETIME(3) NULL,
    `observacoes` VARCHAR(191) NULL,
    `encerradaEm` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OportunidadeCredito_propostaId_key`(`propostaId`),
    INDEX `OportunidadeCredito_responsavelId_status_proximoContatoEm_idx`(`responsavelId`, `status`, `proximoContatoEm`),
    INDEX `OportunidadeCredito_clienteId_status_idx`(`clienteId`, `status`),
    INDEX `OportunidadeCredito_lojaId_status_idx`(`lojaId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_gerenteId_fkey` FOREIGN KEY (`gerenteId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `SystemModule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_vendedorId_fkey` FOREIGN KEY (`vendedorId`) REFERENCES `Vendedor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vendedor` ADD CONSTRAINT `Vendedor_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vendedor` ADD CONSTRAINT `Vendedor_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Veiculo` ADD CONSTRAINT `Veiculo_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proposta` ADD CONSTRAINT `Proposta_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proposta` ADD CONSTRAINT `Proposta_vendedorId_fkey` FOREIGN KEY (`vendedorId`) REFERENCES `Vendedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proposta` ADD CONSTRAINT `Proposta_veiculoId_fkey` FOREIGN KEY (`veiculoId`) REFERENCES `Veiculo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proposta` ADD CONSTRAINT `Proposta_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_propostaId_fkey` FOREIGN KEY (`propostaId`) REFERENCES `Proposta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_vendedorId_fkey` FOREIGN KEY (`vendedorId`) REFERENCES `Vendedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Financeiro` ADD CONSTRAINT `Financeiro_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Aprovacao` ADD CONSTRAINT `Aprovacao_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comissao` ADD CONSTRAINT `Comissao_propostaId_fkey` FOREIGN KEY (`propostaId`) REFERENCES `Proposta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comissao` ADD CONSTRAINT `Comissao_vendedorId_fkey` FOREIGN KEY (`vendedorId`) REFERENCES `Vendedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comissao` ADD CONSTRAINT `Comissao_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OportunidadeCredito` ADD CONSTRAINT `OportunidadeCredito_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OportunidadeCredito` ADD CONSTRAINT `OportunidadeCredito_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OportunidadeCredito` ADD CONSTRAINT `OportunidadeCredito_propostaId_fkey` FOREIGN KEY (`propostaId`) REFERENCES `Proposta`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OportunidadeCredito` ADD CONSTRAINT `OportunidadeCredito_responsavelId_fkey` FOREIGN KEY (`responsavelId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
