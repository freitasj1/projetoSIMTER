const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const port = 8000;
let results = [];
var state = 0;

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'simter',
  database: 'simter',
  connectionTimeout: 10000
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados');
  }
});

const checkMissingIds = (dbIds, jsonIds) => {
  const missingIds = dbIds.filter(dbId => !jsonIds.includes(dbId.ID));
  missingIds.forEach(missingId => {
    results.push(`ID ${missingId.ID} não está presente na sala`);
    db.query(`UPDATE devices SET ATUAL = '0', STATUS = 'desaparecido', HORARIO = NOW() WHERE ID = ?;`, [missingId.ID]);
  });
};

app.post('/api', (req, res) => {
  console.log("Requisição recebida: ", req.body);
  const { ids, lab } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    console.log('Nenhum beacon detectado na sala');
  }

  const sqlQuery = 'SELECT ID FROM devices WHERE ORIGEM = ?';
  db.query(sqlQuery, [lab], (err, dbResult) => {
    if (err) {
      console.log('Erro na consulta ao banco de dados');
    }

    if (dbResult.length > 0 && Array.isArray(ids)) {
      console.log(dbResult);
      checkMissingIds(dbResult, ids);

      let processed = 0;

      ids.forEach(id => {
        const sqlCheckQuery = 'SELECT * FROM devices WHERE ORIGEM = ? AND ID = ?';
        
        db.query(sqlCheckQuery, [lab, id], (err, result) => {
          if (err) {
            results.push(`Erro na consulta do ID ${id}: ${err}`);

          } else if (result.length > 0) {
            results.push(`ID ${id} está presente na sala`);
            db.query(`UPDATE devices SET ATUAL = ?, STATUS = 'presente', HORARIO = NOW() WHERE ID = ?`, [lab, id]);

          } else {
            results.push(`ID ${id} não é dessa sala`);
            db.query(`UPDATE devices SET ATUAL = ?, STATUS = 'deslocado', HORARIO = NOW() WHERE ID = ?;`, [lab, id]);

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
  console.log(`Servidor rodando na porta ${port}`);
});