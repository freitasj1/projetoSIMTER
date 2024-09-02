const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'projetoSimter',
    database : 'nodelogin'
});

const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve arquivos estáticos da pasta 'Frontend'
app.use(express.static(path.join(__dirname, 'Frontend')));

// Rota para login.html
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'login', 'login.html'));
});

// Rota para autenticação
app.post('/auth', function(request, response) {
    let username = request.body.username;
    let password = request.body.password;
    
    if (username && password) {
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (error) throw error;

            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                response.redirect('/home/index.html'); 
            } else {
                response.send('Incorrect Username and/or Password!');
            }           
        });
    } else {
        response.send('Please enter Username and Password!');
    }
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
