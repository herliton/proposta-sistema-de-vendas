-- CreateTable
CREATE TABLE `FichaRecuperacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lojaId` INTEGER NOT NULL DEFAULT 1,
    `clienteId` INTEGER NOT NULL,
    `oportunidadeId` INTEGER NULL,
    `propostaId` INTEGER NULL,
    `gerenteId` INTEGER NULL,
    `vendedorId` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ABERTA',
    `dataEntradaFicha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `rg` VARCHAR(30) NULL,
    `orgaoEmissor` VARCHAR(30) NULL,
    `ufEmissor` VARCHAR(2) NULL,
    `dataEmissaoRg` DATE NULL,
    `naturalidade` VARCHAR(100) NULL,
    `naturalidadeUf` VARCHAR(2) NULL,
    `dataNascimento` DATE NULL,
    `cnhNumero` VARCHAR(20) NULL,
    `cnhValidade` DATE NULL,
    `cnhCategoria` VARCHAR(5) NULL,
    `sexo` VARCHAR(20) NULL,
    `estadoCivil` VARCHAR(30) NULL,
    `residenciaTipo` VARCHAR(20) NULL,
    `tempoResidencia` VARCHAR(60) NULL,
    `telefoneFixo` VARCHAR(20) NULL,
    `telefoneCelular` VARCHAR(20) NULL,
    `whatsapp` VARCHAR(20) NULL,
    `empresaCnpj` VARCHAR(20) NULL,
    `empresaNome` VARCHAR(150) NULL,
    `dataAdmissao` DATE NULL,
    `renda` DECIMAL(12, 2) NULL,
    `cargoFuncao` VARCHAR(100) NULL,
    `classificacaoTrabalho` VARCHAR(30) NULL,
    `valorVeiculo` DECIMAL(12, 2) NULL,
    `valorEntrada` DECIMAL(12, 2) NULL,
    `valorFinanciado` DECIMAL(12, 2) NULL,
    `valorTarifaTramite` DECIMAL(12, 2) NULL,
    `scoreInicio` INTEGER NULL,
    `scoreInicioEm` DATETIME(3) NULL,
    `scoreTermino` INTEGER NULL,
    `scoreTerminoEm` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FichaRecuperacao_oportunidadeId_key`(`oportunidadeId`),
    INDEX `FichaRecuperacao_lojaId_status_idx`(`lojaId`, `status`),
    INDEX `FichaRecuperacao_clienteId_status_idx`(`clienteId`, `status`),
    INDEX `FichaRecuperacao_vendedorId_status_idx`(`vendedorId`, `status`),
    INDEX `FichaRecuperacao_gerenteId_status_idx`(`gerenteId`, `status`),
    INDEX `FichaRecuperacao_propostaId_idx`(`propostaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FichaReferencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fichaId` INTEGER NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `telefone` VARCHAR(20) NOT NULL,
    `tipo` VARCHAR(20) NOT NULL,

    INDEX `FichaReferencia_fichaId_idx`(`fichaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FichaOpcaoVeiculo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fichaId` INTEGER NOT NULL,
    `ordem` INTEGER NOT NULL,
    `marca` VARCHAR(100) NOT NULL,
    `modelo` VARCHAR(100) NOT NULL,
    `anoModelo` INTEGER NULL,
    `anoFabricacao` INTEGER NULL,

    UNIQUE INDEX `FichaOpcaoVeiculo_fichaId_ordem_key`(`fichaId`, `ordem`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FichaOpcaoParcela` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opcaoId` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `parcelaMinima` DECIMAL(12, 2) NOT NULL,
    `parcelaMaxima` DECIMAL(12, 2) NOT NULL,

    INDEX `FichaOpcaoParcela_opcaoId_idx`(`opcaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FichaContato` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fichaId` INTEGER NOT NULL,
    `ordem` INTEGER NOT NULL,
    `data` DATE NOT NULL,
    `dataLigacaoPosVenda` DATE NULL,
    `inicio` VARCHAR(5) NULL,
    `termino` VARCHAR(5) NULL,
    `protocolo` VARCHAR(30) NULL,
    `spc` VARCHAR(60) NULL,
    `dividaValor` DECIMAL(12, 2) NULL,
    `dividaObservacao` VARCHAR(120) NULL,
    `consultorNome` VARCHAR(120) NOT NULL,
    `setor` VARCHAR(80) NULL,
    `tratativa` VARCHAR(500) NULL,
    `registradoPorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FichaContato_fichaId_ordem_key`(`fichaId`, `ordem`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FichaAnaliseBancaria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fichaId` INTEGER NOT NULL,
    `instituicao` VARCHAR(120) NOT NULL,
    `submetidaEm` DATETIME(3) NOT NULL,
    `submetidoPorId` INTEGER NULL,
    `resposta` VARCHAR(20) NOT NULL DEFAULT 'EM_ANALISE',
    `respostaDetalhe` VARCHAR(500) NULL,
    `respondidaEm` DATETIME(3) NULL,
    `veiculoMarca` VARCHAR(100) NULL,
    `veiculoModelo` VARCHAR(100) NULL,
    `anoModelo` INTEGER NULL,
    `anoFabricacao` INTEGER NULL,
    `valorVeiculo` DECIMAL(12, 2) NULL,
    `valorEntrada` DECIMAL(12, 2) NULL,
    `valorFinanciado` DECIMAL(12, 2) NULL,
    `quantidadeParcelas` INTEGER NULL,
    `valorParcela` DECIMAL(12, 2) NULL,
    `observacoes` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FichaAnaliseBancaria_fichaId_submetidaEm_idx`(`fichaId`, `submetidaEm`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FichaAcompanhamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fichaId` INTEGER NOT NULL,
    `ordem` INTEGER NOT NULL,
    `realizadoEm` DATETIME(3) NOT NULL,
    `realizadoPorId` INTEGER NULL,
    `observacoes` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FichaAcompanhamento_fichaId_ordem_key`(`fichaId`, `ordem`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FichaAcompanhamentoItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `acompanhamentoId` INTEGER NOT NULL,
    `requisito` VARCHAR(191) NOT NULL,
    `cumprido` BOOLEAN NOT NULL DEFAULT false,

    INDEX `FichaAcompanhamentoItem_acompanhamentoId_idx`(`acompanhamentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FichaRecuperacao` ADD CONSTRAINT `FichaRecuperacao_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FichaRecuperacao` ADD CONSTRAINT `FichaRecuperacao_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FichaRecuperacao` ADD CONSTRAINT `FichaRecuperacao_oportunidadeId_fkey` FOREIGN KEY (`oportunidadeId`) REFERENCES `OportunidadeCredito`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FichaRecuperacao` ADD CONSTRAINT `FichaRecuperacao_propostaId_fkey` FOREIGN KEY (`propostaId`) REFERENCES `Proposta`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FichaRecuperacao` ADD CONSTRAINT `FichaRecuperacao_gerenteId_fkey` FOREIGN KEY (`gerenteId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FichaRecuperacao` ADD CONSTRAINT `FichaRecuperacao_vendedorId_fkey` FOREIGN KEY (`vendedorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FichaReferencia` ADD CONSTRAINT `FichaReferencia_fichaId_fkey` FOREIGN KEY (`fichaId`) REFERENCES `FichaRecuperacao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FichaOpcaoVeiculo` ADD CONSTRAINT `FichaOpcaoVeiculo_fichaId_fkey` FOREIGN KEY (`fichaId`) REFERENCES `FichaRecuperacao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FichaOpcaoParcela` ADD CONSTRAINT `FichaOpcaoParcela_opcaoId_fkey` FOREIGN KEY (`opcaoId`) REFERENCES `FichaOpcaoVeiculo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FichaContato` ADD CONSTRAINT `FichaContato_fichaId_fkey` FOREIGN KEY (`fichaId`) REFERENCES `FichaRecuperacao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FichaContato` ADD CONSTRAINT `FichaContato_registradoPorId_fkey` FOREIGN KEY (`registradoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FichaAnaliseBancaria` ADD CONSTRAINT `FichaAnaliseBancaria_fichaId_fkey` FOREIGN KEY (`fichaId`) REFERENCES `FichaRecuperacao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FichaAnaliseBancaria` ADD CONSTRAINT `FichaAnaliseBancaria_submetidoPorId_fkey` FOREIGN KEY (`submetidoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FichaAcompanhamento` ADD CONSTRAINT `FichaAcompanhamento_fichaId_fkey` FOREIGN KEY (`fichaId`) REFERENCES `FichaRecuperacao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FichaAcompanhamento` ADD CONSTRAINT `FichaAcompanhamento_realizadoPorId_fkey` FOREIGN KEY (`realizadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FichaAcompanhamentoItem` ADD CONSTRAINT `FichaAcompanhamentoItem_acompanhamentoId_fkey` FOREIGN KEY (`acompanhamentoId`) REFERENCES `FichaAcompanhamento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Migra para fichas as oportunidades de recuperação já existentes (clientes com crédito recusado).
INSERT INTO `FichaRecuperacao` (`lojaId`, `clienteId`, `oportunidadeId`, `propostaId`, `gerenteId`, `vendedorId`, `status`, `dataEntradaFicha`, `telefoneCelular`, `renda`, `valorVeiculo`, `valorEntrada`, `valorFinanciado`, `updatedAt`)
SELECT o.`lojaId`, o.`clienteId`, o.`id`, o.`propostaId`,
  CASE WHEN u.`perfil` IN ('MANAGER', 'GERENTE') THEN u.`id` ELSE u.`gerenteId` END,
  o.`responsavelId`,
  CASE o.`status` WHEN 'CONVERTIDA' THEN 'CONCLUIDA' WHEN 'SEM_INTERESSE' THEN 'CANCELADA' WHEN 'ABERTA' THEN 'ABERTA' ELSE 'EM_ANDAMENTO' END,
  o.`createdAt`, c.`telefone`, c.`rendaMensal`, p.`valorProposta`, p.`entrada`, p.`totalFinanciado`, CURRENT_TIMESTAMP(3)
FROM `OportunidadeCredito` o
JOIN `Cliente` c ON c.`id` = o.`clienteId`
LEFT JOIN `Proposta` p ON p.`id` = o.`propostaId`
LEFT JOIN `Usuario` u ON u.`id` = o.`responsavelId`;

INSERT INTO `FichaOpcaoVeiculo` (`fichaId`, `ordem`, `marca`, `modelo`, `anoModelo`, `anoFabricacao`)
SELECT f.`id`, 1, v.`marca`, v.`modelo`, COALESCE(v.`anoModelo`, v.`ano`), v.`anoFabricacao`
FROM `FichaRecuperacao` f
JOIN `Proposta` p ON p.`id` = f.`propostaId`
JOIN `Veiculo` v ON v.`id` = p.`veiculoId`;

