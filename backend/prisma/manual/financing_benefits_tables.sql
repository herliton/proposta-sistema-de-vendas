-- Script manual e repetível: cria as tabelas de configuração da proposta, taxas/tabelas de financiamento,
-- benefícios e benefícios por proposta. Pode ser executado mais de uma vez sem duplicar dados.
-- Use quando `npm run db:migrate:deploy` não puder ser executado.

-- 20261023030000_proposal_settings
CREATE TABLE IF NOT EXISTS `ConfiguracaoProposta` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `lojaId` INTEGER NOT NULL,
  `validadeDias` INTEGER NOT NULL DEFAULT 7,
  `prazoEntrega` VARCHAR(255) NOT NULL,
  `documentacaoTransferencia` VARCHAR(255) NOT NULL,
  `textoPrazos` TEXT NOT NULL,
  `textoGarantia` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `ConfiguracaoProposta_lojaId_key` (`lojaId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `ConfiguracaoProposta_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- 20261023040000_financing_rates_benefits
-- Modelo inicial (spec 5.10): pendente de validação comercial.
CREATE TABLE IF NOT EXISTS `TabelaFinanciamento` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `instituicao` VARCHAR(120) NOT NULL,
  `produto` VARCHAR(120) NOT NULL,
  `taxa` DECIMAL(7, 4) NOT NULL,
  `periodicidade` VARCHAR(20) NOT NULL DEFAULT 'mensal',
  `parcelasMin` INTEGER NOT NULL,
  `parcelasMax` INTEGER NOT NULL,
  `vigenciaInicio` DATE NOT NULL,
  `vigenciaFim` DATE NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'ativo',
  `atualizadoPorId` INTEGER NULL,
  `deletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `TabelaFinanciamento_status_vigenciaInicio_idx` (`status`, `vigenciaInicio`),
  PRIMARY KEY (`id`),
  CONSTRAINT `TabelaFinanciamento_atualizadoPorId_fkey` FOREIGN KEY (`atualizadoPorId`) REFERENCES `Usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Beneficio` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(120) NOT NULL,
  `descricao` VARCHAR(255) NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'ativo',
  `atualizadoPorId` INTEGER NULL,
  `deletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `Beneficio_status_idx` (`status`),
  PRIMARY KEY (`id`),
  CONSTRAINT `Beneficio_atualizadoPorId_fkey` FOREIGN KEY (`atualizadoPorId`) REFERENCES `Usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Valores que antes estavam fixos na simulação, preservados como ponto de partida editável.
INSERT INTO `TabelaFinanciamento` (`instituicao`, `produto`, `taxa`, `parcelasMin`, `parcelasMax`, `vigenciaInicio`, `updatedAt`)
SELECT * FROM (
  SELECT 'Padrão VFC' AS i, 'Financiamento - taxa 0,99%' AS p, 0.9900 AS t, 24 AS pmin, 60 AS pmax, CURRENT_DATE AS v, CURRENT_TIMESTAMP(3) AS u
  UNION ALL SELECT 'Padrão VFC', 'Financiamento - taxa 1,39%', 1.3900, 24, 60, CURRENT_DATE, CURRENT_TIMESTAMP(3)
  UNION ALL SELECT 'Padrão VFC', 'Financiamento - taxa 1,59%', 1.5900, 24, 60, CURRENT_DATE, CURRENT_TIMESTAMP(3)
) AS seed WHERE NOT EXISTS (SELECT 1 FROM `TabelaFinanciamento`);

INSERT INTO `Beneficio` (`nome`, `updatedAt`)
SELECT * FROM (
  SELECT 'IPVA pago' AS n, CURRENT_TIMESTAMP(3) AS u UNION ALL SELECT 'Tanque cheio', CURRENT_TIMESTAMP(3)
  UNION ALL SELECT 'Transferência', CURRENT_TIMESTAMP(3) UNION ALL SELECT 'Seguro 3 meses', CURRENT_TIMESTAMP(3)
) AS seed WHERE NOT EXISTS (SELECT 1 FROM `Beneficio`);


-- 20261023050000_proposal_benefits
CREATE TABLE IF NOT EXISTS `PropostaBeneficio` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `propostaId` INTEGER NOT NULL,
  `beneficioId` INTEGER NOT NULL,
  `nome` VARCHAR(120) NOT NULL,
  `descricao` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `PropostaBeneficio_propostaId_beneficioId_key` (`propostaId`, `beneficioId`),
  INDEX `PropostaBeneficio_beneficioId_idx` (`beneficioId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `PropostaBeneficio_propostaId_fkey` FOREIGN KEY (`propostaId`) REFERENCES `Proposta` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `PropostaBeneficio_beneficioId_fkey` FOREIGN KEY (`beneficioId`) REFERENCES `Beneficio` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

