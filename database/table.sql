CREATE TABLE sua_tabela (
    Nome VARCHAR(64) NOT NULL CHECK (Nome REGEXP '^[A-Za-z]+$'), -- Aceita apenas letras, no máximo 64 caracteres
    ID CHAR(6) NOT NULL UNIQUE, -- Exatamente 6 dígitos, sem valores repetidos
    UUID CHAR(XX) NOT NULL UNIQUE, -- Substitua XX pelo número de dígitos desejado para o UUID
    SALA VARCHAR(255), -- Aqui você pode especificar o tipo de dado da SALA, ajustei para VARCHAR
    CORRETO BOOLEAN NOT NULL -- Apenas valores TRUE ou FALSE (booleano)
);
