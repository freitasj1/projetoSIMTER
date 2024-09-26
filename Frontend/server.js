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


app.get('/api/user/:id', (req, res) => {
    const userId = req.params.id; // Captura o ID enviado pelo ESP32 via URL

    // Consulta no banco de dados para verificar o nível do usuário
    connection.query('SELECT nivel FROM users WHERE id = ?', [userId], (error, results) => {
        if (error) {
            console.error('Erro ao acessar o banco de dados:', error);
            return res.status(500).json({ message: 'Erro ao acessar o banco de dados', error: true });
        }

        // Se o ID for encontrado e o nível for >= 2, retorna true, caso contrário false
        if (results.length > 0 && results[0].nivel >= 2) {
            res.json({ access: true }); // Retorna true
        } else {
            res.json({ access: false }); // Retorna false
        }
    });
});

app.get('/api/equipamentos', (req, res) => {
    console.log('rota api funcionando');
    connection.query('SELECT nome, ID, SALA, responsavel, status FROM devices', (error, results) => {
        if (error) throw error;
        res.json(results);
        console.log(results)  // Envia os dados como JSON
    });
    console.log('saiu do query da tabela');
});


// Rota protegida para acessar o dashboard
app.get('/pages', authMiddleware, (req, res) => {
    console.log('/pages aceito')
    res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Outras rotas protegidas
app.get('/config', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'config.html'));
});

app.get('/edit', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'edit.html'));
});

app.get('/users', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'users.html'));
});


// Inicia o servidor
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
