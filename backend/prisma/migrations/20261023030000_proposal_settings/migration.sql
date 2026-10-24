CREATE TABLE `ConfiguracaoProposta` (
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
