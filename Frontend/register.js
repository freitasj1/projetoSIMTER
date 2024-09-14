const mysql = require('mysql');
const bcrypt = require('bcrypt');
const readline = require('readline');

// Configura o número de rounds para o salt do bcrypt
const saltRounds = 10;

// Configuração do banco de dados MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'projetoSimter',
    database: 'simter'
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar no banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados.');
});

// Interface de entrada do terminal para obter dados do usuário
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Função para registrar o usuário
function registerUser() {
    rl.question('Digite seu email: ', (email) => {
        rl.question('Digite seu nome de usuário: ', (nome) => {
            rl.question('Digite sua senha: ', (password) => {
                
                // Criptografar a senha antes de salvar no banco de dados
                bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
                    if (err) {
                        console.error('Erro ao criptografar a senha:', err);
                        rl.close();
                        return;
                    }

                    // Inserir o usuário no banco de dados
                    const sql = 'INSERT INTO employees (email, nome, password) VALUES (?, ?, ?)';
                    connection.query(sql, [email,nome, hashedPassword], (err, result) => {
                        if (err) {
                            console.error('Erro ao inserir o usuário no banco de dados:', err);
                        } else {
                            console.log('Usuário registrado com sucesso!');
                        }
                        rl.close();
                        connection.end();
                    });
                });
            });
        });
    });
}

// Chama a função para iniciar o registro
registerUser();
