const cron = require('node-cron');
const mysql = require('mysql');

// Configurarea conexiunii la baza de date
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'ADMIN',
    password: '123456789',
    database: 'casa_de_pariuri'
});

// Conectarea la baza de date
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Configurarea și pornirea sarcinii cron
cron.schedule('0 0 * * *', () => {
  const query = 'DELETE FROM facturare WHERE Data_Facturare < NOW() - INTERVAL 30 DAY';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return;
    }
    console.log('Deleted rows:', results.affectedRows);
  });
}, {
});

console.log('Scripul pentru gestionarea facturilor a pornit.');

module.exports = {};
