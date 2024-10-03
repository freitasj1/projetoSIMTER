const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const saltRounds = 10;
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');
const uploadDir = path.join(__dirname, 'uploads');
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

port = 3000;

let results = [];
var state = 0;



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
    secret: 'projetoSimter',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'pages')));


// middleware de autenticação
function authMiddleware(req, res, next) {
    if (req.session.loggedin) {
        next(); 
    } else {
        res.redirect('/'); 
    }
}


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login', 'login.html'));
});

//autenticação
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
    const ID = null; 
    const nivel = 1;

    // console.log('Dados recebidos:', { nome, email, password, funcao });

    
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
        // console.log('Foto salva:', fullPath);
    } else if (req.body.photo) {
        const base64Data = req.body.photo.replace(/^data:image\/png;base64,/, "");
        const fileName = `photo_${Date.now()}.png`; // Cria um nome único
        photoPath = path.join('uploads', fileName); // Caminho relativo
        const fullPath = path.join(__dirname, 'public', photoPath); // Caminho completo
        fs.writeFileSync(fullPath, base64Data, 'base64');
        // console.log('Foto salva da base64:', fullPath);
    } else {
        console.log('Nenhuma foto enviada. O restante dos dados será salvo.');
    }

    
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Erro ao criptografar a senha:', err);
            return res.status(500).json({ success: false, message: 'Erro ao processar a senha' });
        }

        
        const sql = 'INSERT INTO employees (nome, email, password, nivel, funcao, foto, ID) VALUES (?, ?, ?, ?, ?, ?, ?)';
        connection.query(sql, [nome, email, hashedPassword, nivel, funcao, photoPath || null, ID], (err, result) => {
            if (err) {
                console.error('Erro ao salvar no banco de dados:', err);
                return res.status(500).json({ success: false, message: 'Erro ao salvar no banco de dados' });
            }

            console.log('Cadastro realizado com sucesso!');
            
            res.redirect('/'); 
        });
    });
});

app.get('/api/equipamentos2', (req, res) => {
    // console.log('65');
    connection.query('SELECT nome, ID, responsavel, ORIGEM, STATUS, ATUAL FROM devices WHERE ORIGEM = 65', (error, results) => {
        if (error) throw error;
        res.json(results);
        // console.log('Equipamentos solicitados - sala 65'); 
    });
})

app.get('/api/equipamentos3', (req, res) => {
    // console.log('todos');
    connection.query('SELECT nome, ID, responsavel, ORIGEM, STATUS, ATUAL FROM devices', (error, results) => {
        if (error) throw error;
        res.json(results);
        // console.log('Equipamentos solicitados - geral'); 
    });
})

app.put('/api/equipamentos/:id', (req, res) => {
    const id = req.params.id;
    const { nome, status, origem, responsavel } = req.body;

    const sql = 'UPDATE devices SET nome = ?, STATUS = ?, ORIGEM = ?, responsavel = ? WHERE ID = ?';
    const values = [nome, status, origem, responsavel, id];

    connection.query(sql, values, (error, results) => {
        if (error) {
            console.error('Erro ao atualizar o equipamento:', error);
            return res.status(500).send('Erro ao atualizar o equipamento');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Equipamento não encontrado');
        }
        res.status(200).send('Equipamento atualizado com sucesso');
    });
});


app.post('/addDevice', (req, res) => {
    const { nome, ID, sala } = req.body;
    const responsavel = null; 
    const status = null;

    connection.query('INSERT INTO devices (nome, ID, ORIGEM, responsavel, status) VALUES (?, ?, ?, ?, ?)', 
        [nome, ID, sala, responsavel, status], 
        (error, results) => {
            if (error) {
                console.error('Erro ao salvar no banco de dados:', error);
                return res.status(500).json({ success: false, message: 'Erro ao salvar no banco de dados' });
            }
            return res.status(200).json({ success: true, message: 'Equipamento cadastrado com sucesso!' });
        }
    );
});



app.get('/api/user/:id', (req, res) => {
    const userId = req.params.id; 
    req.session.id = userId;
    console.log('ID recebido: ', userId);
    
    connection.query('SELECT nivel FROM employees WHERE id = ?', [userId], (error, results) => {
        if (error) {
            console.log('Erro ao acessar o banco de dados:', error);
            return res.status(500).json({ message: 'Erro ao acessar o banco de dados', error: true });
        }

        if (results.length > 0 && results[0].nivel >= 2) {
            res.json({ access: true });
            console.log('acesso permitido');
            req.session.id = userId;
            
           
            connection.query('SELECT nome FROM employees WHERE id = ?', [userId], (nameError, nameResults) => {
                if (nameError) {
                    console.log('Erro ao buscar o nome do usuário:', nameError);
                    return res.status(500).json({ message: 'Erro ao buscar o nome do usuário', error: true });
                }

                if (nameResults.length > 0) {
                    const userName = nameResults[0].nome;

                   
                    connection.query('UPDATE devices SET RESPONSAVEL = ? WHERE ORIGEM = 65', [userName], (updateError, updateResults) => {
                        if (updateError) {
                            console.log('Erro ao atualizar os dispositivos:', updateError);
                            return res.status(500).json({ message: 'Erro ao atualizar os dispositivos', error: true });
                        }

                        console.log(`Dispositivos atualizados: ${updateResults.affectedRows}`);
                    });
                } else {
                    console.log('Usuário não encontrado');
                }
            });
        } else {
            res.json({ access: false });
            console.log('acesso negado');
        }
    });
});




  

app.get('/api/equipamentos', (req, res) => {
    // console.log('82');
    connection.query('SELECT nome, ID, responsavel, ORIGEM, STATUS, ATUAL FROM devices WHERE ORIGEM = 82', (error, results) => {
        if (error) throw error;
        if (results.length === 0) {
            return res.json(null); 
        } else {
            return res.json(results);  
        }
    });
})



app.get('/usersTable', (req,res) => {
    // console.log('tabela de users solicitada');
    connection.query('SELECT * FROM employees', (error,results) => {
        if(error) throw error;
        res.json(results);
    })



    
});
app.get('/api/users', (req, res) => {
    const email = req.session.email
    connection.query('SELECT nome, foto, funcao FROM employees WHERE email = ?',[email], (error, results) => {
        if (error) throw error;
        // res.json(results);
        // console.log('infos do user solicitada');
        if (results.length > 0){
            res.json(results[0]);
            // console.log('foto enviada para frontend');
        } 
        else {
            res.status(404).send('Usuário não encontrado!');
            // console.log('infos não achadas');
        }
    });
    
});



// app.get('/api/users', async (req, res) => {
//     try {
//         const userEmail = req.session.email;  
//         const query = 'SELECT nome AS name, funcao AS `function`, foto AS avatar FROM employees WHERE email = ?';

        
//         console.log('email usado: ', userEmail);
//         console.log("getUserInfo requisitado");

//         const [user] = await connection.query(query, [userEmail]);
//         if (user.length > 0) {
//             res.json(user[0]);  // Retorna o primeiro usuário encontrado
//         } else {
//             res.status(404).send('Usuário não encontrado');
//         }
//     } catch (error) {
//         console.error('Erro ao buscar usuário:', error);
//         res.status(500).send('Erro no servidor');
//     }
// });





app.get('/pages', authMiddleware, (req, res) => {
    // console.log('/pages aceito');
    res.sendFile(path.join(__dirname, 'public', 'home','index.html'));
});

// Outras rotas protegidas
app.get('/config', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home','config.html'));
});

app.get('/edit', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'edit.html'));
});

app.get('/users', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'users.html'));
});




// app.post('/api/save', async (req, res) => {
//     const { equipamento, id, sala, newColumn } = req.body;

//     try {
        
//         const query = 'INSERT INTO equipamentos (equipamento, id, sala) VALUES (?, ?, ?, ?, ?)';
//         await connection.query(query, [equipamento, id, sala]);

        
//         if (newColumn && newColumn.name && newColumn.type) {
//             const alterQuery = `ALTER TABLE equipamentos ADD COLUMN ${newColumn.name} ${newColumn.type}`;
//             await connection.query(alterQuery);
//             // console.log(`Nova coluna ${newColumn.name} adicionada com sucesso!`);
//         }

//         res.json({ message: 'Dados salvos com sucesso!' });
//     } catch (error) {
//         console.error('Erro ao salvar os dados:', error);
//         res.status(500).json({ message: 'Erro ao salvar os dados.' });
//     }
// });




const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sistemasimter@gmail.com',
        pass: 'kdef qpol muce epae'
    }
});


app.post('/api/send-email', (req, res) => {
    const { csvContent } = req.body;

    const mailOptions = {
        from: 'sistemasimter@gmail.com',
        to: req.session.email,
        subject: 'CSV da Tabela de Equipamentos',
        text: 'Segue em anexo o CSV gerado',
        attachments: [
            {
                filename: 'equipamentos_tabela.csv',
                content: '\uFEFF' + csvContent, // Adiciona o BOM para UTF-8 no conteúdo do CSV
                contentType: 'text/csv; charset=utf-8'
            }
        ]
    }
    });

    
    const checkMissingIds = (dbIds, jsonIds) => {
        const missingIds = dbIds.filter(dbId => !jsonIds.includes(dbId.ID));
        missingIds.forEach(missingId => {
          results.push(`ID ${missingId.ID} não está presente na sala`);
          connection.query(`UPDATE devices SET ATUAL = '0', STATUS = 'desaparecido', HORARIO = NOW() WHERE ID = ?;`, [missingId.ID]);
        });
      };
      
      app.post('/api', (req, res) => {
        console.log("Requisição recebida: ", req.body);
        const { ids, lab } = req.body;
      
        if (!Array.isArray(ids) || ids.length === 0) {
            console.log('Nenhum beacon detectado na sala');
            
        }
      
        const sqlQuery = 'SELECT ID FROM devices WHERE ORIGEM = ?';
        connection.query(sqlQuery, [lab], (err, dbResult) => {
          if (err) {
            console.log('Erro na consulta ao banco de dados');
          }
      
          if (dbResult.length > 0 && Array.isArray(ids)) {
            console.log(dbResult);
            checkMissingIds(dbResult, ids);
      
            let processed = 0;
      
            ids.forEach(id => {
              const sqlCheckQuery = 'SELECT * FROM devices WHERE ORIGEM = ? AND ID = ?';
              
              connection.query(sqlCheckQuery, [lab, id], (err, result) => {
                if (err) {
                  results.push(`Erro na consulta do ID ${id}: ${err}`);
      
                } else if (result.length > 0) {
                  results.push(`ID ${id} está presente na sala`);
                  res.status(200).json({ success: true, message: 'Equipamento cadastrado com sucesso!' });
                  connection.query(`UPDATE devices SET ATUAL = ?, STATUS = 'presente', HORARIO = NOW() WHERE ID = ?`, [lab, id]);
      
                } else {
                  results.push(`ID ${id} não é dessa sala`);
                  connection.query(`UPDATE devices SET ATUAL = ?, STATUS = 'deslocado', HORARIO = NOW() WHERE ID = ?;`, [lab, id]);
      
                }
      
                processed++;
      
                if (processed === ids.length) {
                  console.log(results);
                  results = []; 
                }
              });
            });
          }
        });
      });
      
      const os = require('os');
      const interfaces = os.networkInterfaces();
      for (let iface in interfaces) {
        interfaces[iface].forEach((details) => {
          if (details.family === 'IPv4' && !details.internal) {
            console.log(`Servidor rodando no IP: ${details.address}:${port}`);
          }
        });
      };

app.listen(port, () => {
    console.log('Servidor rodando em http://localhost:3000');
});

app.listen(8000, () => {
    console.log('Servidor rodando em http://localhost:8000');
});