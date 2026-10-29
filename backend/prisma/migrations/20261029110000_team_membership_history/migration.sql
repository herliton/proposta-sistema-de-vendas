CREATE TABLE `EquipeVinculo` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `equipeId` INTEGER NOT NULL,
  `vendedorId` INTEGER NOT NULL,
  `iniciadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `encerradoEm` DATETIME(3) NULL,
  `atribuidoPorId` INTEGER NULL,
  `removidoPorId` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `EquipeVinculo_equipeId_iniciadoEm_idx` (`equipeId`, `iniciadoEm`),
  INDEX `EquipeVinculo_vendedorId_iniciadoEm_idx` (`vendedorId`, `iniciadoEm`),
  INDEX `EquipeVinculo_vendedorId_encerradoEm_idx` (`vendedorId`, `encerradoEm`),
  PRIMARY KEY (`id`),
  CONSTRAINT `EquipeVinculo_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `Equipe` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `EquipeVinculo_vendedorId_fkey` FOREIGN KEY (`vendedorId`) REFERENCES `Usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `EquipeVinculo_atribuidoPorId_fkey` FOREIGN KEY (`atribuidoPorId`) REFERENCES `Usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `EquipeVinculo_removidoPorId_fkey` FOREIGN KEY (`removidoPorId`) REFERENCES `Usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `EquipeVinculo` (`equipeId`, `vendedorId`, `iniciadoEm`, `createdAt`)
SELECT `equipeId`, `id`, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `Usuario`
WHERE `equipeId` IS NOT NULL;
