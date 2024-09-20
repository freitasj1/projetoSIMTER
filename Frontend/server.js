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

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));
// Serve arquivos estáticos da pasta 'home'
app.use(express.static(path.join(__dirname, 'home')));

app.use

// Rota para a página de login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login', 'login.html'));
});

// Rota para autenticação de login
app.post('/auth', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    if (email && password) {
        connection.query('SELECT * FROM employees WHERE email = ?', [email], async (error, results) => {
            if (error) throw error;

            if (results.length > 0) {
                const storedPassword = results[0].password;

                // Comparar a senha fornecida com a senha criptografada armazenada
                const match = await bcrypt.compare(password, storedPassword);

                if (match) {
                    req.session.loggedin = true;
                    req.session.email = email;
                    // Redireciona para o dashboard após login bem-sucedido
                    return res.redirect('/pages');
                } else {
                    return res.send('Senha incorreta!');
                }
            } else {
                return res.send('Usuário não encontrado!');
            }
        });
    } else {
        res.send('Por favor, insira o email e a senha!');
    }
});

// Rota protegida: Redireciona para /home/dashboard/index.html apenas se o usuário estiver logado
app.get('/pages', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
    } else {
        res.redirect('/');
    }
});

// Rota protegida: Exemplo para acessar 'table.html'
app.get('/home/table.html', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'home', 'dashboard', 'table.html'));
    } else {
        res.redirect('/');
    }
});

// Rotas protegidas para outras páginas
app.get('/config', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public', 'pages', 'config.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/edit', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public', 'pages', 'edit.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/users', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public', 'pages', 'users.html'));
    } else {
        res.redirect('/');
    }
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
