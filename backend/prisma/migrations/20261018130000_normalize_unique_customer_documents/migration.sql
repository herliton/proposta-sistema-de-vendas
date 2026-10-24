UPDATE `Cliente`
SET `documento` = NULLIF(REGEXP_REPLACE(`documento`, '[^0-9]', ''), '')
WHERE `documento` IS NOT NULL;

DROP INDEX `Cliente_documento_idx` ON `Cliente`;

CREATE UNIQUE INDEX `Cliente_documento_key` ON `Cliente`(`documento`);
