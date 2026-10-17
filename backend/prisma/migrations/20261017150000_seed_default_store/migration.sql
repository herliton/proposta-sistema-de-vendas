INSERT INTO `Loja` (`nome`, `status`, `createdAt`, `updatedAt`)
SELECT 'Loja Brasília', 'ativo', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `Loja`);
