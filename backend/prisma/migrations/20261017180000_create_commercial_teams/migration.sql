CREATE TABLE `Equipe` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(120) NOT NULL,
  `gerenteId` INTEGER NOT NULL,
  `lojaId` INTEGER NOT NULL DEFAULT 1,
  `status` VARCHAR(191) NOT NULL DEFAULT 'ativo',
  `deletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `Equipe_lojaId_status_idx` (`lojaId`, `status`),
  UNIQUE INDEX `Equipe_nome_lojaId_key` (`nome`, `lojaId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `Equipe_gerenteId_fkey` FOREIGN KEY (`gerenteId`) REFERENCES `Usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Equipe_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Usuario`
  ADD COLUMN `equipeId` INTEGER NULL,
  ADD INDEX `Usuario_equipeId_status_idx` (`equipeId`, `status`),
  ADD CONSTRAINT `Usuario_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `Equipe` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
