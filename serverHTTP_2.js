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
  user: 'simter',
  password: 'projetoSimter',
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
app.post('/api/data', (req, res) => {
  const data = req.body; // Vetor de informações enviado pelo ESP32
  
  // Aqui você pode comparar os dados com o banco de dados
  // Exemplo: Verificar se um valor específico está presente no banco

  const sqlQuery = 'SELECT * FROM your_table WHERE column_name = ?';
  db.query(sqlQuery, [data.someValue], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erro na consulta ao banco de dados' });
    }

    // Comparar os dados
    if (result.length > 0) {
      res.json({ message: 'Informação encontrada no banco de dados', data: result });
    } else {
      res.json({ message: 'Informação não encontrada' });
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});