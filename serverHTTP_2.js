const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const port = 8000;
let results = [];

app.use(bodyParser.json());

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

const checkMissingIds = (dbIds, jsonIds) => {
  const missingIds = dbIds.filter(dbId => !jsonIds.includes(dbId.UUID));
  missingIds.forEach(missingId => {
    results.push(`ID ${missingId.UUID} não esta presente na sala`);
  });
};

app.post('/api', (req, res) => {
  console.log("Requisição recebida: ", req.body);
  const { ids, lab } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    console.log('Nenhum beacon detectado na sala');
  }

  const sqlQuery = 'SELECT UUID FROM devices WHERE SALA = ?';
  db.query(sqlQuery, [lab], (err, dbResult) => {
    if (err) {
      console.log('Erro na consulta ao banco de dados');
    }

    if (dbResult.length > 0 && Array.isArray(ids)) {
      checkMissingIds(dbResult, ids);

      let processed = 0;

      ids.forEach(id => {
        const sqlCheckQuery = 'SELECT * FROM devices WHERE SALA = ? AND UUID = ?';
        
        db.query(sqlCheckQuery, [lab, id], (err, result) => {
          if (err) {
            results.push(`Erro na consulta do ID ${id}: ${err}`);
          } else if (result.length > 0) {
            results.push(`ID ${id} está presente na sala`);
          } else {
            results.push(`ID ${id} não é dessa sala`);
          }

          processed++;

          if (processed === ids.length) {
            console.log(results);
            results = []; 
          }
        });
      });
    } else {
      res.json({ message: 'Nenhum dispositivo encontrado no banco de dados para a sala especificada.' });
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
