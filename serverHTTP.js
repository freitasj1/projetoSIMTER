const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const port = 8000;

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'simter',
  database: 'simter'
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
  } else {
    console.log("Conectado ao banco de dados");
  }
});

app.post('/api', (req, res) => {
  console.log("Requisição recebida: ", req.body);
  const { ids, lab } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    console.log("Nenhum beacon detectado");
  }

  const sqlQuery = 'SELECT * FROM devices WHERE sala = ? AND UUID IN (?)';
  db.query(sqlQuery, [lab, ids], (err, result) => {
    if (err) {
      console.log("Erro na consulta ao banco de dados", err);
    }

    if (result && result.length > 0) {
      console.log("Informação encontrada no banco de dados', data: result");
    } else {
      console.log("Nenhum dispositivo encontrado para os parâmetros fornecidos");
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
  console.log(`Servidor rodando na porta ${port}`);
});