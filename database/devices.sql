USE devices; /* usa o banco de dados */
INSERT INTO devices (LAB) /* Insere os dados nas colunas */
VALUES (''); /* valores dos dados*/
SELECT nome,id FROM devices;	/* verificar o que há na tabela */
SELECT * FROM devices.devices; -- visualiza a tabela

ALTER TABLE devices ADD COLUMN LAB VARCHAR(25);

ALTER TABLE devices
MODIFY COLUMN ID VARCHAR(6) NOT NULL,
ADD UNIQUE (ID);  -- altera as propriedades(índices da tabela)

SHOW INDEX FROM devices; /* verifica os índices da tabela */

ALTER TABLE devices DROP PRIMARY KEY; -- Remover a chave primária existente

ALTER TABLE devices ADD PRIMARY KEY (ID); -- Adicionar uma nova chave primária apenas na coluna `ID`

ALTER TABLE devices ADD INDEX (nome); -- Adicionar um índice na coluna `nome`

ALTER TABLE devices
MODIFY COLUMN nome VARCHAR(32);

ALTER TABLE devices ADD PRIMARY KEY (ID);

UPDATE devices
SET LAB = '64'
WHERE ID = '987653'; -- Modificar "LAB" que corresponder com o ID

SET SQL_SAFE_UPDATES = 0; 	

DELETE FROM devices
WHERE nome = 'Raspberry Pi 4' AND ID = '84' AND LAB = '84';
