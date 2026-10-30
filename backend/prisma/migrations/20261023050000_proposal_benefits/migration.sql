CREATE TABLE `PropostaBeneficio` (
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
