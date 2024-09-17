const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'projetoSimter',
    database : 'simter'
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

// Rota para login.html
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'public', 'login', 'login.html'));
});

// Rota para autenticação
app.post('/auth', function(request, response) {
    let email = request.body.email;
    let password = request.body.password;
    
    if (email && password) {
        connection.query('SELECT * FROM accounts WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
            if (error) throw error;

            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                response.redirect('/home/index.html'); // Redireciona para /home/index.html dentro de 'public'
            } else {
                response.send('Incorrect Email and/or Password!');
            }           
        });
    } else {
        response.send('Please enter Email and Password!');
    }
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
