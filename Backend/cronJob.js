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

// Configurarea și pornirea sarcinii cron pentru curățarea datelor vechi
cron.schedule('0 0 * * *', () => {
  const cleanupQuery = `
    DELETE FROM facturare WHERE Data_Facturare < DATE_SUB(NOW(), INTERVAL 30 DAY);
    DELETE FROM operati WHERE Data < DATE_SUB(NOW(), INTERVAL 30 DAY);
    DELETE FROM tranzactie WHERE Data_Tranzactie < DATE_SUB(NOW(), INTERVAL 30 DAY);
    DELETE FROM meci2 WHERE Data_Eveniment < DATE_SUB(NOW(), INTERVAL 30 DAY);
  `;

  connection.query(cleanupQuery, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return;
    }
    console.log('Cleanup completed successfully');
  });
}, {
  scheduled: true,
  timezone: "Europe/Bucharest"
});

console.log('Scripul pentru gestionarea datelor a pornit.');

module.exports = {};
