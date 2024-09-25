CREATE TABLE devices (
    Nome VARCHAR(64) NOT NULL CHECK (Nome REGEXP '^[A-Za-z]+$'), -- Aceita apenas letras, no máximo 64 caracteres
    ID CHAR(6) NOT NULL UNIQUE, -- Exatamente 6 dígitos, sem valores repetidos
    UUID CHAR(36) NOT NULL UNIQUE, -- Substitua XX pelo número de dígitos desejado para o UUID
    SALA VARCHAR(255), -- Aqui você pode especificar o tipo de dado da SALA, ajustei para VARCHAR
    CORRETO BOOLEAN NOT NULL -- Apenas valores TRUE ou FALSE (booleano)
);

 


ALTER TABLE devices MODIFY Nome VARCHAR(64) NOT NULL;


SHOW CREATE TABLE devices;

SELECT * FROM simter.employees;

INSERT INTO devices (Nome, ID, UUID, SALA, CORRETO)
VALUES ('Osciloscópio', '002335', 'xxxxxxxxxx', '82', TRUE);


INSERT INTO employees (Nome, email, nivel, password)
VALUES ('Edigar Morais', 'edigar@hotmail.com', '1', 'enzo');

UPDATE sua_tabela
SET Nome = 'Maria', SALA = 'Sala 2', CORRETO = FALSE
WHERE ID = '123456';

DELETE FROM sua_tabela
WHERE ID = '123456';
