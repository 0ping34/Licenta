const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY); 
const fs = require('fs');
const https = require('https');
const path = require('path');
const app = express();
app.use(cors({
    origin: 'https://localhost:5173', // Înlocuiește cu portul frontend-ului tău
    credentials: true
  }));
app.use(express.json()); // Middleware pentru a interpreta corpul cererii ca JSON

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'ADMIN',
    password: '123456789',
    database: 'casa_de_pariuri'
});

app.get('/', (req, res) => {
    connection.ping((error) => {
        if (error) {
            res.status(500).json({ status: 'error', message: 'Eroare la conectarea la bază de date' });
        } else {
            res.json({ status: 'success', message: 'Conexiune la bază de date reușită' });
        }
    });
});

// Verifică dacă numele de utilizator sau adresa de email există deja în baza de date
app.get('/utilizatori/exista/:username/:email', (req, res) => {
    const { username, email } = req.params;
    const query = 'SELECT COUNT(*) AS count FROM utilizatori WHERE Nume_Utilizator = ? OR Email = ?';
    connection.query(query, [username, email], (error, results) => {
      if (error) {
        console.error('Eroare la verificarea existenței utilizatorului:', error);
        res.status(500).json({ exists: false, error: 'Eroare la verificarea existenței utilizatorului' });
        return;
      }
      const count = results[0].count;
      res.json({ exists: count > 0 });
    });
  });
  

  app.post('/inregistrare', (req, res) => {
    const { username, email, password, confirmPassword, position } = req.body;

    // Verifică dacă parola și confirmarea parolei sunt identice
    if (password !== confirmPassword) {
        res.status(400).json({ status: 'error', message: 'Parola și confirmarea parolei nu coincid' });
        return;
    }

    // Inserează datele în baza de date
    const query = 'INSERT INTO utilizatori (ID_Utilizator, Nume_Utilizator, Parola_Hash, Email, Pozitie, Data_Inregistrare) VALUES (?, ?, ?, ?, ?, NOW())';
    const randomNumbers = Math.floor(Math.random() * 1000000000); // Generează un număr aleatoriu de 9 cifre pentru ID_Utilizator
    connection.query(query, [randomNumbers, username, password, email, position], (error, results) => {
        if (error) {
            console.error('Eroare la înregistrare:', error);
            res.status(500).json({ status: 'error', message: 'Eroare la înregistrare' });
            return;
        }
        console.log('Utilizator înregistrat cu succes!');
        res.status(200).json({ status: 'success', message: 'Utilizator înregistrat cu succes' });
    });
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT ID_Utilizator, Nume_Utilizator, Pozitie FROM utilizatori WHERE Email = ? AND Parola_Hash = ?';
  connection.query(query, [email, password], (error, results) => {
    if (error) {
      console.error('Eroare la autentificare:', error);
      res.status(500).json({ status: 'error', message: 'Eroare la autentificare' });
      return;
    }

    if (results.length === 1) {
      console.log('Autentificare reușită!');
      const { ID_Utilizator, Nume_Utilizator, Pozitie } = results[0];
      res.status(200).json({ status: 'success', message: 'Autentificare reușită', userId: ID_Utilizator, username: Nume_Utilizator, role: Pozitie  });
    } else {
      console.log('Nume de utilizator sau parolă incorecte');
      res.status(401).json({ status: 'error', message: 'Nume de utilizator sau parolă incorecte' });
    }
  });
});


app.get('/user/username/:email', (req, res) => {
    const { email } = req.params;
    
    // Realizează o interogare către baza de date pentru a obține username-ul și ID-ul asociat cu email-ul
    const query = 'SELECT ID_Utilizator, Nume_Utilizator FROM utilizatori WHERE Email = ?';
    connection.query(query, [email], (error, results) => {
        if (error) {
            console.error('Eroare la obținerea informațiilor utilizatorului:', error);
            res.status(500).json({ status: 'error', message: 'Eroare la obținerea informațiilor utilizatorului' });
            return;
        }
        
        // Verifică dacă s-au găsit informații despre utilizator
        if (results.length === 0) {
            res.status(404).json({ status: 'error', message: 'Utilizatorul nu a fost găsit' });
            return;
        }

        // Returnează ID-ul și username-ul utilizatorului în răspuns
        const userId = results[0].ID_Utilizator;
        const username = results[0].Nume_Utilizator;
        res.status(200).json({ status: 'success', userId: userId, username: username });
    });
});

// Endpointuri CRUD pentru evenimente sportive

// Create
app.post('/events', (req, res) => {
  const { Tip_Eveniment, Echipa_unu, Echipa_doi, Data_Eveniment, Locatie, Optiuni_Pariuri } = req.body;
  const query = 'INSERT INTO eveniment_sportiv (Tip_Eveniment, Echipa_unu, Echipa_doi, Data_Eveniment, Locatie, Optiuni_Pariuri) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(query, [Tip_Eveniment, Echipa_unu, Echipa_doi, Data_Eveniment, Locatie, Optiuni_Pariuri], (error, results) => {
      if (error) {
          console.error('Error creating event:', error);
          return res.status(500).json({ status: 'error', message: 'Error creating event' });
      }
      res.status(201).json({ status: 'success', message: 'Event created successfully' });
  });
});

// Read
app.get('/events', (req, res) => {
  const query = 'SELECT * FROM eveniment_sportiv';
  connection.query(query, (error, results) => {
      if (error) {
          console.error('Error fetching events:', error);
          return res.status(500).json({ status: 'error', message: 'Error fetching events' });
      }
      res.status(200).json(results);
      console.log(results)
  });
});

// Update
app.put('/events/:id', (req, res) => {
  const { id } = req.params;
  const { Tip_Eveniment, Echipa_unu, Echipa_doi, Data_Eveniment, Locatie, Optiuni_Pariuri } = req.body;
  const query = 'UPDATE eveniment_sportiv SET Tip_Eveniment = ?, Echipa_unu = ?, Echipa_doi = ?, Data_Eveniment = ?, Locatie = ?, Optiuni_Pariuri = ? WHERE ID_Eveniment = ?';
  connection.query(query, [Tip_Eveniment, Echipa_unu, Echipa_doi, Data_Eveniment, Locatie, Optiuni_Pariuri, id], (error, results) => {
      if (error) {
          console.error('Error updating event:', error);
          return res.status(500).json({ status: 'error', message: 'Error updating event' });
      }
      res.status(200).json({ status: 'success', message: 'Event updated successfully' });
  });
});

// Delete
app.delete('/events/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM eveniment_sportiv WHERE ID_Eveniment = ?';
  connection.query(query, [id], (error, results) => {
      if (error) {
          console.error('Error deleting event:', error);
          return res.status(500).json({ status: 'error', message: 'Error deleting event' });
      }
      res.status(200).json({ status: 'success', message: 'Event deleted successfully' });
  });
});

app.get('/events/by-type', (req, res) => {
    const { type } = req.query;
    const query = "SELECT * FROM eveniment_sportiv WHERE Tip_Eveniment = ?";

    connection.query(query, [type], (error, results) => {
        if (error) {
            console.error('Error fetching events by type:', error);
            return res.status(500).json({ status: 'error', message: 'Error fetching events' });
        }

        const parsedResults = results.map(event => ({
            ...event,
            Optiuni_Pariere: JSON.parse(event.Optiuni_Pariere || '{}') // Parse JSON string into an object
        }));

        if (parsedResults.length === 0) {
            return res.status(404).json([]);
        }

        return res.status(200).json(parsedResults);
    });
});

app.post('/add-ticket', (req, res) => {
  const { description, betKey, odds, ID, betAmount, userId, currency, name, email, address, city, postalCode } = req.body;

  // Generează ID-uri unice pentru tranzacție, pariu și factură
  const transactionId = Math.floor(Math.random() * 1000000000);
  const betId = Math.floor(Math.random() * 1000000000);
  const invoiceId = Math.floor(Math.random() * 1000000000);

  console.log('Inserting transaction with ID:', transactionId);

  // Creați tranzacția
  const transactionQuery = 'INSERT INTO tranzactie (ID_Tranzactie, Data_Tranzactie, Suma_Totala, Currency, ID_Utilizator) VALUES (?, NOW(), ?, ?, ?)';
  const transactionValues = [transactionId, betAmount, currency, userId];

  // Executați inserția în tranzactie
  connection.query(transactionQuery, transactionValues, (error, transactionResults) => {
    if (error) {
      console.error('Error creating transaction:', error);
      return res.status(500).json({ status: 'error', message: 'Error creating transaction' });
    }

    console.log('Transaction created successfully:', transactionResults);

    // Creați pariul
    console.log('Inserting bet with ID:', betId);
    const betQuery = 'INSERT INTO pariu (ID_Pariu, Descriere, Cheia_Selectata, Cota, ID_Eveniment, ID_Tranzactie) VALUES (?, ?, ?, ?, ?, ?)';
    const betValues = [betId, description, betKey, odds, ID, transactionId];

    // Executați inserția în pariu
    connection.query(betQuery, betValues, (error, betResults) => {
      if (error) {
        console.error('Error adding bet:', error);
        return res.status(500).json({ status: 'error', message: 'Error adding bet' });
      }

      console.log('Bet added successfully:', betResults);

      // Creați factura
      console.log('Inserting invoice with ID:', invoiceId);
      const invoiceQuery = 'INSERT INTO facturare (ID_Factura, Nume_Facturare, Email_Factura, Adresa_Facturare, Oras_Facturare, Cod_Postal, ID_Utilizator) VALUES (?, ?, ?, ?, ?, ?, ?)';
      const invoiceValues = [invoiceId, name, email, address, city, postalCode, userId];

      // Executați inserția în facturare
      connection.query(invoiceQuery, invoiceValues, (error, invoiceResults) => {
        if (error) {
          console.error('Error adding invoice:', error);
          return res.status(500).json({ status: 'error', message: 'Error adding invoice' });
        }

        console.log('Invoice added successfully:', invoiceResults);
        res.status(200).json({ status: 'success', message: 'Bet and invoice added successfully' });
      });
    });
  });
});

  
app.post('/create-payment-intent', async (req, res) => {
    const { amount, currency } = req.body;
  
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
      });
  
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });
  

const options = {
    key: fs.readFileSync(path.join('localhost-key.pem')),
    cert: fs.readFileSync(path.join('localhost.pem'))
  };

  https.createServer(options, app).listen(8081, () => {
    console.log('Serverul HTTPS a pornit pe portul 8081');
  });
