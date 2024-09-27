const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');

// Configurando conexão com o banco de dados MySQL
const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'projetoSimter',  // Sua senha do banco de dados
    database : 'nodelogin'        // O nome do banco de dados
});

const app = express();

// Middleware para processar JSON e dados de formulários
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rota para receber dados via POST e comparar com o banco de dados
app.post('/compare', function(request, response) {
    const dataReceived = request.body;  // Recebe os dados enviados na requisição POST
    const username = dataReceived.username;
    const password = dataReceived.password;

    // Verifica se os dados foram enviados corretamente
    if (username && password) {
        // Consulta SQL para comparar com os dados do banco de dados
        const query = 'SELECT * FROM accounts WHERE username = ? AND password = ?';

        connection.query(query, [username, password], function(error, results) {
            if (error) {
                response.status(500).json({ error: 'Erro ao acessar o banco de dados' });
            } else {
                // Verifica se os valores batem com algum registro no banco de dados
                if (results.length > 0) {
                    response.json({ message: 'Dados coincidem com o banco de dados', data: results });
                } else {
                    response.json({ message: 'Dados não encontrados no banco de dados' });
                }
            }
        });
    } else {
        response.status(400).json({ message: 'Por favor, envie um nome de usuário e senha' });
    }
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});