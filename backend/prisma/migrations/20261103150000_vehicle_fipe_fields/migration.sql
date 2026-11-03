ALTER TABLE `Veiculo`
  ADD COLUMN `tipoVeiculo` VARCHAR(20) NOT NULL DEFAULT 'cars',
  ADD COLUMN `combustivel` VARCHAR(50) NULL,
  ADD COLUMN `mesReferencia` VARCHAR(40) NULL;
