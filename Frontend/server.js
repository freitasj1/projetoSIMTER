const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');

const uploadDir = path.join(__dirname, 'uploads');


const storage = multer.memoryStorage(); // Armazenar arquivos na memória
const upload = multer({ storage: storage });

// Crie a pasta de uploads se não existir
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


const app = express();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'projetoSimter',
    database: 'simter'
});



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



app.post('/register', upload.single('photo'), (req, res) => { 
    const nome = req.body.nome;
    const email = req.body.email;
    const password = req.body.password; 
    const funcao = req.body.funcao;
    const ID = null; // Você pode definir manualmente mais tarde
    const nivel = 1;

    console.log('Dados recebidos:', { nome, email, password, funcao });

    // Verifica se os campos essenciais foram enviados
    if (!nome || !email || !password) {
        console.error('Erro: Campos essenciais faltando.');
        return res.status(400).json({ success: false, message: 'Nome, email e senha são obrigatórios' });
    }

    let photoPath = null; // Inicializa a variável photoPath

    // Lidar com a imagem enviada pelo multer
    if (req.file) {
        // Monta o caminho onde a foto será salva
        const fileName = `photo_${Date.now()}_${req.file.originalname}`;
        photoPath = path.join('uploads', fileName); // Caminho relativo
        const fullPath = path.join(__dirname, 'public', photoPath); // Caminho completo
        // Salva o arquivo no sistema de arquivos
        fs.writeFileSync(fullPath, req.file.buffer);
        console.log('Foto salva:', fullPath);
    } else if (req.body.photo) {
        const base64Data = req.body.photo.replace(/^data:image\/png;base64,/, "");
        const fileName = `photo_${Date.now()}.png`; // Cria um nome único
        photoPath = path.join('uploads', fileName); // Caminho relativo
        const fullPath = path.join(__dirname, 'public', photoPath); // Caminho completo
        fs.writeFileSync(fullPath, base64Data, 'base64');
        console.log('Foto salva da base64:', fullPath);
    } else {
        console.log('Nenhuma foto enviada. O restante dos dados será salvo.');
    }

    // Criptografar a senha usando bcrypt
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Erro ao criptografar a senha:', err);
            return res.status(500).json({ success: false, message: 'Erro ao processar a senha' });
        }

        // Inserir os dados no banco de dados
        const sql = 'INSERT INTO employees (nome, email, password, nivel, funcao, foto, ID) VALUES (?, ?, ?, ?, ?, ?, ?)';
        connection.query(sql, [nome, email, hashedPassword, nivel, funcao, photoPath || null, ID], (err, result) => {
            if (err) {
                console.error('Erro ao salvar no banco de dados:', err);
                return res.status(500).json({ success: false, message: 'Erro ao salvar no banco de dados' });
            }

            console.log('Cadastro realizado com sucesso!');
            // Redireciona para a página de sucesso
            res.redirect('/pages'); // Redireciona para a página desejada
        });
    });
});








app.get('/api/user/:id', (req, res) => {
    const userId = req.params.id; // Captura o ID enviado pelo ESP32 via URL

    // Consulta no banco de dados para verificar o nível do usuário
    connection.query('SELECT nivel FROM users WHERE id = ?', [userId], (error, results) => {
        if (error) {
            console.log('Erro ao acessar o banco de dados:', error);
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
