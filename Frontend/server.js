// server.js
const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt'); // Biblioteca para criptografar e verificar senhas
const saltRounds = 10;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'projetoSimter',
    database: 'simter'
});

const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve arquivos estáticos a partir da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rota para servir a página de login
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'public', 'login', 'login.html'));
});

// Rota para autenticação de login
app.post('/auth', function(request, response) {
    let email = request.body.email;
    let password = request.body.password;

    if (email && password) {
        connection.query('SELECT * FROM employees WHERE email = ?', [email], async function(error, results) {
            if (error) throw error;

            if (results.length > 0) {
                const storedPassword = results[0].password;

                // Comparar a senha fornecida com a senha criptografada armazenada
                const match = await bcrypt.compare(password, storedPassword);
                
                if (match) {
                    request.session.loggedin = true;
                    request.session.email = email;
                    // Redireciona para o /home/index.html após login bem-sucedido
                    return response.redirect('/home/index.html');
                } else {
                    return response.send('Senha incorreta!');
                }
            } else {
                return response.send('Usuário não encontrado!');
            }
        });
    } else {
        return response.send('Por favor, insira o email e a senha!');
    }
});

// Página inicial para usuários logados
app.get('/home', function(request, response) {
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname, 'public', 'home', 'index.html'));
    } else {
        response.send('Por favor, faça login para acessar esta página!');
    }
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
