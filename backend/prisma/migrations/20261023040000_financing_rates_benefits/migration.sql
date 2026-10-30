-- Modelo inicial (spec 5.10): pendente de validação comercial.
CREATE TABLE `TabelaFinanciamento` (
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

CREATE TABLE `Beneficio` (
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
INSERT INTO `TabelaFinanciamento` (`instituicao`, `produto`, `taxa`, `parcelasMin`, `parcelasMax`, `vigenciaInicio`, `updatedAt`) VALUES
  ('Padrão VFC', 'Financiamento - taxa 0,99%', 0.9900, 24, 60, CURRENT_DATE, CURRENT_TIMESTAMP(3)),
  ('Padrão VFC', 'Financiamento - taxa 1,39%', 1.3900, 24, 60, CURRENT_DATE, CURRENT_TIMESTAMP(3)),
  ('Padrão VFC', 'Financiamento - taxa 1,59%', 1.5900, 24, 60, CURRENT_DATE, CURRENT_TIMESTAMP(3));

INSERT INTO `Beneficio` (`nome`, `updatedAt`) VALUES
  ('IPVA pago', CURRENT_TIMESTAMP(3)), ('Tanque cheio', CURRENT_TIMESTAMP(3)),
  ('Transferência', CURRENT_TIMESTAMP(3)), ('Seguro 3 meses', CURRENT_TIMESTAMP(3));
