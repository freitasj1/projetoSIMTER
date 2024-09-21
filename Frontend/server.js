const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
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

// Serve apenas arquivos públicos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de autenticação
function authMiddleware(req, res, next) {
    if (req.session.loggedin) {
        next(); // Se estiver logado, continua
    } else {
        res.redirect('/'); // Se não estiver logado, redireciona para a página de login
    }
}

// Rota para a página de login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login', 'login.html'));
});

// Autenticação de login
app.post('/auth', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    if (email && password) {
        connection.query('SELECT * FROM employees WHERE email = ?', [email], async (error, results) => {
            if (error) throw error;

            if (results.length > 0) {
                const storedPassword = results[0].password;
                const match = await bcrypt.compare(password, storedPassword);

                if (match) {
                    req.session.loggedin = true;
                    req.session.email = email;
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

// Aplicar o middleware de autenticação a partir daqui
app.use(authMiddleware);

// Rota protegida para acessar o dashboard
app.get('/pages', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Outras rotas protegidas
app.get('/config', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'config.html'));
});

app.get('/edit', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'edit.html'));
});

app.get('/users', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'users.html'));
});

// Inicia o servidor
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
