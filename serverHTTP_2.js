const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const port = 8000;

// Middleware para ler o JSON vindo do ESP32
app.use(bodyParser.json());

// Conexão com o banco de dados MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'simter',
  database: 'simter'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados');
  }
});

// Rota para receber o POST do ESP32
app.post('/api', (req, res) => {
  console.log("Requisição recebida: ", req.body);
  const { ids, lab } = req.body;

  // Verifica se o vetor ids está presente e não está vazio
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Nenhum beacon detectado' });
  }

  // Inicializa um array para armazenar as mensagens
  let results = [];

  // Função para processar cada ID
  const checkID = (id, callback) => {
    const sqlQuery = 'SELECT * FROM devices WHERE SALA = ? AND UUID = ?';
    db.query(sqlQuery, [lab, id], (err, result) => {
      if (err) {
        callback(`Erro na consulta do ID ${id}`);
      } else if (result.length > 0) {
        callback(`ID ${id} está presente`);
      } else {
        callback(`ID ${id} não está presente`);
      }
    });
  };

  // Percorre os ids e verifica cada um deles
  let processed = 0;  // Contador para garantir que todas as consultas foram feitas
  ids.forEach(id => {
    checkID(id, (message) => {
      results.push(message);
      processed++;

      // Quando todas as verificações forem concluídas, enviar a resposta
      if (processed === ids.length) {
        res.json({ message: results });
      }
    });
  });
});

// Função para pegar o IP do servidor
const os = require('os');
const interfaces = os.networkInterfaces();
for (let iface in interfaces) {
  interfaces[iface].forEach((details) => {
    if (details.family === 'IPv4' && !details.internal) {
      console.log(`Servidor rodando no IP: ${details.address}:${port}`);
    }
  });
};

// Inicializa o servidor na porta especificada
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});