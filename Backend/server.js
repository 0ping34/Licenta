const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const https = require('https');
const path = require('path');
const axios = require('axios');
const qs = require('qs');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Numărul de rounds pentru generarea salt-ului
const app = express();
require('./cronJob.js');
const { sendConfirmationEmail } = require('./emailService'); // Correct import
const { sendTicketCreationEmail } = require('./emailService'); // Adjust the path to your emailService.js
const { sendRefundEmail, sendWithdrawEmail } = require('./emailService');

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

app.get('/coduri-verificare', (req, res) => {
  const query = 'SELECT * FROM coduri_rol';
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Eroare la interogarea bazei de date:', err);
      res.status(500).json({ error: 'Eroare la interogarea bazei de date' });
    } else {
      res.json(results);
    }
  });
});

app.post('/inregistrare', async (req, res) => {
  const { username, email, password, confirmPassword, birthDate, position } = req.body;

  if (password !== confirmPassword) {
    res.status(400).json({ status: 'error', message: 'Parola și confirmarea parolei nu coincid' });
    return;
  }

  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDifference = today.getMonth() - birthDateObj.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO utilizatori (ID_Utilizator, Nume_Utilizator, Parola_Hash, Email, Varsta, Pozitie, Data_Inregistrare, Confirmare) VALUES (?, ?, ?, ?, ?, ?, NOW(), 0)';
    const randomNumbers = Math.floor(Math.random() * 1000000000);
    connection.query(query, [randomNumbers, username, hashedPassword, email, age, position], (error, results) => {
      if (error) {
        console.error('Eroare la înregistrare:', error);
        res.status(500).json({ status: 'error', message: 'Eroare la înregistrare' });
        return;
      }

      const counterQuery = 'INSERT INTO counter (Counter, Currency, ID_Utilizator) VALUES (?, ?, ?)';
      const counterValues = [0, 'RON', randomNumbers];
      connection.query(counterQuery, counterValues, (counterError, counterResults) => {
        if (counterError) {
          console.error('Eroare la inserarea în tabela counter:', counterError);
          res.status(500).json({ status: 'error', message: 'Eroare la inserarea în tabela counter' });
          return;
        }

        sendConfirmationEmail(email, username, randomNumbers); // Call the function to send confirmation email

        console.log('Utilizator înregistrat cu succes!');
        res.status(200).json({ status: 'success', message: 'Utilizator înregistrat cu succes. Vă rugăm să verificați emailul pentru confirmare.' });
      });
    });
  } catch (error) {
    console.error('Eroare la hash-uirea parolei:', error);
    res.status(500).json({ status: 'error', message: 'Eroare la hash-uirea parolei' });
  }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Interogarea pentru a selecta hash-ul parolei și alte detalii ale utilizatorului
    const query = 'SELECT ID_Utilizator, Nume_Utilizator, Pozitie, Parola_Hash FROM utilizatori WHERE Email = ?';
    connection.query(query, [email], async (error, results) => {
        if (error) {
            console.error('Eroare la autentificare:', error);
            res.status(500).json({ status: 'error', message: 'Eroare la autentificare' });
            return;
        }

        if (results.length === 1) {
            const { ID_Utilizator, Nume_Utilizator, Pozitie, Parola_Hash } = results[0];

            // Compară parola furnizată cu hash-ul din baza de date
            const isPasswordValid = await bcrypt.compare(password, Parola_Hash);

            if (isPasswordValid) {
                console.log('Autentificare reușită!');
                res.status(200).json({ status: 'success', message: 'Autentificare reușită', userId: ID_Utilizator, username: Nume_Utilizator, role: Pozitie });
            } else {
                console.log('Nume de utilizator sau parolă incorecte');
                res.status(401).json({ status: 'error', message: 'Nume de utilizator sau parolă incorecte' });
            }
        } else {
            console.log('Nume de utilizator sau parolă incorecte');
            res.status(401).json({ status: 'error', message: 'Nume de utilizator sau parolă incorecte' });
        }
    });
});

// Confirmation route
app.get('/confirm', (req, res) => {
  const { userId } = req.query;

  const query = 'UPDATE utilizatori SET Confirmare = 1 WHERE ID_Utilizator = ?';
  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Eroare la confirmarea emailului:', error);
      res.status(500).send('Eroare la confirmarea emailului.');
      return;
    }

    res.send('Email confirmat cu succes! Puteți acum să vă autentificați.');
  });
});

app.get('/confirm-status/:userId', (req, res) => {
  const { userId } = req.params;

  const query = 'SELECT Confirmare FROM utilizatori WHERE ID_Utilizator = ?';
  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching confirmation status:', error);
      res.status(500).json({ status: 'error', message: 'Error fetching confirmation status' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    const isConfirmed = results[0].Confirmare === 1;
    res.status(200).json({ isConfirmed });
  });
});

app.post('/resend-confirmation-email', (req, res) => {
  const { userId } = req.body;

  // Get the user's email and username from the database
  const query = 'SELECT Email, Nume_Utilizator FROM utilizatori WHERE ID_Utilizator = ?';
  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching user details:', error);
      return res.status(500).json({ status: 'error', message: 'Error fetching user details' });
    }

    if (results.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const userEmail = results[0].Email;
    const username = results[0].Nume_Utilizator;

    // Resend the confirmation email
    sendConfirmationEmail(userEmail, username);
    res.status(200).json({ status: 'success', message: 'Confirmation email resent successfully' });
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

// Endpoint pentru a obține detaliile utilizatorului
app.get('/users/id/:userId', (req, res) => {
    const { userId } = req.params;
    const query = 'SELECT Nume_Utilizator AS username, Email AS email, Parola_Hash AS password, Data_Inregistrare AS registrationDate FROM utilizatori WHERE ID_Utilizator = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user details:', err);
            res.status(500).json({ error: 'Error fetching user details' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(results[0]);
    });
}); 

// Endpoint pentru actualizarea parțială a detaliilor utilizatorului
app.patch('/users/id/:userId', (req, res) => {
    const { userId } = req.params;
    const { username, email, oldPassword, newPassword } = req.body;
  
    console.log(`Received request to update user details for userId: ${userId}`);
    console.log(`Request body: ${JSON.stringify(req.body)}`);
  
    if (newPassword && !oldPassword) {
      console.log('Old password is required to change the password');
      res.status(400).json({ error: 'Old password is required to change the password' });
      return;
    }
  
    const updates = {};
    if (username) updates.Nume_Utilizator = username;
    if (email) updates.Email = email;
  
    if (newPassword) {
      const getPasswordQuery = 'SELECT Parola_Hash FROM utilizatori WHERE ID_Utilizator = ?';
      console.log(`Executing query: ${getPasswordQuery} with userId: ${userId}`);
  
      connection.query(getPasswordQuery, [userId], (err, results) => {
        if (err) {
          console.error('Error fetching user password:', err);
          res.status(500).json({ error: 'Error fetching user password' });
          return;
        }
  
        if (results.length === 0) {
          console.log('User not found');
          res.status(404).json({ error: 'User not found' });
          return;
        }
  
        const currentPasswordHash = results[0].Parola_Hash;
        console.log(`Current password hash: ${currentPasswordHash}`);
  
        bcrypt.compare(oldPassword, currentPasswordHash, (err, isMatch) => {
          if (err) {
            console.error('Error comparing passwords:', err);
            res.status(500).json({ error: 'Error comparing passwords' });
            return;
          }
  
          if (!isMatch) {
            res.status(400).json({ error: 'Old password is incorrect' });
            return;
          }
  
          bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
            if (err) {
              console.error('Error hashing password:', err);
              res.status(500).json({ error: 'Error hashing password' });
              return;
            }
  
            updates.Parola_Hash = hashedPassword;
            console.log(`New hashed password: ${hashedPassword}`);
  
            const updateQuery = 'UPDATE utilizatori SET ? WHERE ID_Utilizator = ?';
            console.log(`Executing query: ${updateQuery} with updates: ${JSON.stringify(updates)} and userId: ${userId}`);
  
            connection.query(updateQuery, [updates, userId], (err, results) => {
              if (err) {
                console.error('Error updating user details:', err);
                res.status(500).json({ error: 'Error updating user details' });
                return;
              }
  
              if (results.affectedRows === 0) {
                console.log('User not found');
                res.status(404).json({ error: 'User not found' });
                return;
              }
  
              console.log('User details updated successfully');
              res.json({ username: updates.Nume_Utilizator || undefined, email: updates.Email || undefined });
            });
          });
        });
      });
    } else {
      const updateQuery = 'UPDATE utilizatori SET ? WHERE ID_Utilizator = ?';
      console.log(`Executing query: ${updateQuery} with updates: ${JSON.stringify(updates)} and userId: ${userId}`);
  
      connection.query(updateQuery, [updates, userId], (err, results) => {
        if (err) {
          console.error('Error updating user details:', err);
          res.status(500).json({ error: 'Error updating user details' });
          return;
        }
  
        if (results.affectedRows === 0) {
          console.log('User not found');
          res.status(404).json({ error: 'User not found' });
          return;
        }
  
        console.log('User details updated successfully');
        res.json({ username: updates.Nume_Utilizator || undefined, email: updates.Email || undefined });
      });
    }
  });
     
// Endpoint pentru ștergerea profilului utilizatorului
app.delete('/users/id/:userId', (req, res) => {
    const { userId } = req.params;
  
    // Begin a transaction to ensure all operations complete successfully
    connection.beginTransaction((transactionErr) => {
      if (transactionErr) {
        console.error('Error starting transaction:', transactionErr);
        return res.status(500).json({ error: 'Error starting transaction' });
      }
  
      // Delete data from the `facturare` table
      const deleteFacturareQuery = 'DELETE FROM facturare WHERE ID_Utilizator = ?';
      connection.query(deleteFacturareQuery, [userId], (facturareErr, facturareResults) => {
        if (facturareErr) {
          console.error('Error deleting from facturare table:', facturareErr);
          return connection.rollback(() => {
            res.status(500).json({ error: 'Error deleting from facturare table' });
          });
        }
  
        // Delete data from the `counter` table
        const deleteCounterQuery = 'DELETE FROM counter WHERE ID_Utilizator = ?';
        connection.query(deleteCounterQuery, [userId], (counterErr, counterResults) => {
          if (counterErr) {
            console.error('Error deleting from counter table:', counterErr);
            return connection.rollback(() => {
              res.status(500).json({ error: 'Error deleting from counter table' });
            });
          }
  
          // Delete data from the `transactions` table
          const deleteTransactionsQuery = 'DELETE FROM tranzactie WHERE ID_Utilizator = ?';
          connection.query(deleteTransactionsQuery, [userId], (transactionsErr, transactionsResults) => {
            if (transactionsErr) {
              console.error('Error deleting from transactions table:', transactionsErr);
              return connection.rollback(() => {
                res.status(500).json({ error: 'Error deleting from transactions table' });
              });
            }
  
            // Finally, delete the user profile
            const deleteUserQuery = 'DELETE FROM utilizatori WHERE ID_Utilizator = ?';
            connection.query(deleteUserQuery, [userId], (userErr, userResults) => {
              if (userErr) {
                console.error('Error deleting user profile:', userErr);
                return connection.rollback(() => {
                  res.status(500).json({ error: 'Error deleting user profile' });
                });
              }
              if (userResults.affectedRows === 0) {
                return connection.rollback(() => {
                  res.status(404).json({ error: 'User not found' });
                });
              }
  
              // Commit the transaction
              connection.commit((commitErr) => {
                if (commitErr) {
                  console.error('Error committing transaction:', commitErr);
                  return connection.rollback(() => {
                    res.status(500).json({ error: 'Error committing transaction' });
                  });
                }
  
                res.status(200).json({ message: 'User profile and related data deleted successfully' });
              });
            });
          });
        });
      });
    });
  });
  
app.get('/user-role', (req, res) => {
    const { username } = req.query;
    const query = 'SELECT Pozitie FROM utilizatori WHERE Nume_Utilizator = ?';
    connection.query(query, [username], (error, results) => {
        if (error) {
            console.error('Error fetching user role:', error);
            return res.status(500).json({ status: 'error', message: 'Error fetching user role' });
        }
        if (results.length === 0) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        res.status(200).json({ role: results[0].Pozitie });
    });
});

app.post('/move-to-history', (req, res) => {
    const { matchId, winningOptions } = req.body;
    const query = 'SELECT * FROM eveniment_sportiv WHERE ID_Eveniment = ?';
    connection.query(query, [matchId], (err, results) => {
        if (err) {
            console.error('Error fetching match details:', err);
            res.status(500).json({ error: 'Error fetching match details' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Match not found' });
            return;
        }

        const match = results[0];
        const optionsCastigatoare = JSON.stringify(winningOptions);

        const insertQuery = 'INSERT INTO meciuri_istoric (Tip_Eveniment, Echipa_unu, Echipa_doi, Data_Eveniment, Locatie, Optiuni_Castigatoare, ID_Eveniment) VALUES (?, ?, ?, ?, ?, ?, ?)';
        connection.query(insertQuery, [match.Tip_Eveniment, match.Echipa_unu, match.Echipa_doi, match.Data_Eveniment, match.Locatie, optionsCastigatoare, match.ID_Eveniment], (insertError, insertResults) => {
            if (insertError) {
                console.error('Error inserting into history:', insertError);
                res.status(500).json({ error: 'Error inserting into history' });
                return;
            }

            const deleteQuery = 'DELETE FROM eveniment_sportiv WHERE ID_Eveniment = ?';
            connection.query(deleteQuery, [matchId], (deleteError, deleteResults) => {
                if (deleteError) {
                    console.error('Error deleting match:', deleteError);
                    res.status(500).json({ error: 'Error deleting match' });
                    return;
                }

                res.status(200).json({ message: 'Match moved to history successfully' });
            });
        });
    });
});


// Endpoint pentru a obține toate meciurile istorice
app.get('/match-history', (req, res) => {
    const query = 'SELECT * FROM meciuri_istoric';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching match history:', err);
            res.status(500).json({ error: 'Error fetching match history' });
            return;
        }
        res.status(200).json(results);
    });
});

// Endpoint pentru ștergerea unui meci din istoric
app.delete('/match-history/:id', (req, res) => {
    const matchId = req.params.id;
    const query = 'DELETE FROM meciuri_istoric WHERE ID_Meci2 = ?';

    connection.query(query, [matchId], (error, results) => {
        if (error) {
            console.error('Error deleting match from history:', error);
            return res.status(500).json({ status: 'error', message: 'Error deleting match from history' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Match not found' });
        }
        res.status(200).json({ status: 'success', message: 'Match deleted successfully' });
    });
});

app.get('/users/:username/bets', (req, res) => {
    const { username } = req.params;
    const queryUserId = 'SELECT ID_Utilizator FROM utilizatori WHERE Nume_Utilizator = ?';

    connection.query(queryUserId, [username], (err, results) => {
        if (err) {
            console.error('Error fetching user ID:', err);
            res.status(500).json({ error: 'Error fetching user ID' });
            return;
        }
        
        if (results.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const userId = results[0].ID_Utilizator;
        const queryBets = `
        SELECT t.ID_Tranzactie, t.Data_Tranzactie, t.Suma_Totala, t.Currency, t.ID_Utilizator, p.ID_Pariu, p.Descriere, p.Categorie, p.Cheia_Selectata, p.Cota, p.Suma, p.Moneda, p.Colectat, p.Combinat, p.ID_Eveniment
        FROM tranzactie t
        JOIN pariu p ON t.ID_Tranzactie = p.ID_Tranzactie
        WHERE t.ID_Utilizator = ?`;

        connection.query(queryBets, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching bets:', err);
            res.status(500).json({ error: 'Error fetching bets' });
            return;
        }

        res.json(results);
        });
    });
});

app.patch('/bets/:betId/collect', (req, res) => {
    const { betId } = req.params;
    const query = 'UPDATE pariu SET Colectat = 1 WHERE ID_Pariu = ?';

    connection.query(query, [betId], (error, results) => {
        if (error) {
            console.error('Eroare la actualizarea pariului:', error);
            return res.status(500).json({ status: 'error', message: 'Eroare la actualizarea pariului' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Pariul nu a fost găsit' });
        }

        res.status(200).json({ status: 'success', message: 'Pariul a fost colectat cu succes' });
    });
});

// Endpointuri CRUD pentru evenimente sportive

// Create
app.post('/events', (req, res) => {
    const { Tip_Eveniment, Echipa_unu, Echipa_doi, Data_Eveniment, Locatie, Optiuni_Pariuri } = req.body;

    const query = `
        INSERT INTO eveniment_sportiv (Tip_Eveniment, Echipa_unu, Echipa_doi, Data_Eveniment, Locatie, Optiuni_Pariuri)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    connection.query(query, [Tip_Eveniment, Echipa_unu, Echipa_doi, Data_Eveniment, Locatie, Optiuni_Pariuri], (error, results) => {
        if (error) {
            console.error('Error creating event:', error);
            return res.status(500).json({ status: 'error', message: 'Error creating event' });
        }

        const createdEventId = results.insertId;

        res.status(201).json({ status: 'success', message: 'Event created', ID_Eveniment: createdEventId });
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

async function getPayPalAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
    const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
    try {
      const response = await axios.post('https://api-m.sandbox.paypal.com/v1/oauth2/token', qs.stringify({
        grant_type: 'client_credentials'
      }), {
        headers: {
          'Authorization': `Basic ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
  
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting PayPal access token:', error);
      throw new Error('Could not get PayPal access token');
    }
  }

app.get('/counter/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = 'SELECT Counter, Currency FROM counter WHERE ID_Utilizator = ? LIMIT 1';
    connection.query(query, [userId], (error, results) => {
      if (error) {
        console.error('Error fetching counter:', error);
        return res.status(500).json({ status: 'error', message: 'Error fetching counter' });
      }
      if (results.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Counter not found' });
      }
      res.status(200).json(results[0]);
    });
});
  
app.put('/counter/:userId', (req, res) => {
    const { userId } = req.params;
    const { Counter, Currency } = req.body;
    
    const query = 'UPDATE counter SET Counter = ?, Currency = ? WHERE ID_Utilizator = ?';
    connection.query(query, [Counter, Currency, userId], (error, results) => {
      if (error) {
        console.error('Error updating counter:', error);
        return res.status(500).json({ status: 'error', message: 'Error updating counter' });
      }
      res.status(200).json({ status: 'success', message: 'Counter updated successfully' });
    });
  });
    
  app.post('/add-ticket', async (req, res) => {
    const { description, betKey, odds, ID, category, betAmounts, totalAmount, userId, currency, orderId, isCombinedBet } = req.body;

    try {
        const accessToken = await getPayPalAccessToken();

        // Verificarea și salvarea detaliilor de plată cu PayPal
        const response = await axios.get(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const order = response.data;
        if (order.status !== 'COMPLETED') {
            return res.status(400).json({ status: 'error', message: 'Payment not completed' });
        }

        console.log('Payment verified successfully.');

        // Extragerea detaliilor de facturare de la PayPal
        const payer = order.payer;
        const purchaseUnit = order.purchase_units[0];
        const shipping = purchaseUnit.shipping;
        const captureId = purchaseUnit.payments.captures[0].id; // ID-ul de captură PayPal
        
        const invoiceId = Math.floor(Math.random() * 1000000000);
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Data facturării

        // Detalii facturare din obiectul PayPal
        const invoiceValues = [
            invoiceId,
            payer.name.given_name + ' ' + payer.name.surname,
            payer.email_address,
            shipping.address.address_line_1,
            shipping.address.admin_area_2,
            shipping.address.postal_code,
            userId,
            currentDate
        ];

        // Creați tranzacția
        const transactionId = Math.floor(Math.random() * 1000000000);
        console.log('Inserting transaction with ID:', transactionId);
        const transactionQuery = 'INSERT INTO tranzactie (ID_Tranzactie, Data_Tranzactie, Suma_Totala, Currency, ID_Utilizator, Capture_ID) VALUES (?, NOW(), ?, ?, ?, ?)';
        const transactionValues = [transactionId, totalAmount, currency, userId, captureId]; // Adăugăm captureId

        connection.query(transactionQuery, transactionValues, (error, transactionResults) => {
            if (error) {
                console.error('Error creating transaction:', error);
                return res.status(500).json({ status: 'error', message: 'Error creating transaction' });
            }

            console.log('Transaction created successfully:', transactionResults);

            // Creați pariurile
            const betQueries = [];
            const numBets = description.split(', ').length;

            for (let i = 0; i < numBets; i++) {
                const betId = Math.floor(Math.random() * 1000000000);
                console.log('Inserting bet with ID:', betId);
                const betQuery = 'INSERT INTO pariu (ID_Pariu, Descriere, Cheia_Selectata, Cota, Suma, Moneda, ID_Tranzactie, Categorie, Combinat, ID_Eveniment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                const betValues = [betId, description.split(', ')[i], betKey.split(', ')[i], odds.split(', ')[i], betAmounts.split(', ')[i], currency, transactionId, category.split(', ')[i], isCombinedBet ? 1 : 0, ID.split(', ')[i]];
                betQueries.push({ query: betQuery, values: betValues });
            }

            const executeBetQueries = betQueries.map(betQuery => new Promise((resolve, reject) => {
                connection.query(betQuery.query, betQuery.values, (error, betResults) => {
                    if (error) {
                        console.error('Error adding bet:', error);
                        return reject(error);
                    }
                    resolve(betResults);
                });
            }));

            Promise.all(executeBetQueries)
                .then(betResults => {
                    console.log('Bets added successfully:', betResults);

                    // Creați factura
                    console.log('Inserting invoice with ID:', invoiceId);
                    const invoiceQuery = 'INSERT INTO facturare (ID_Factura, Nume_Facturare, Email_Factura, Adresa_Facturare, Oras_Facturare, Cod_Postal, ID_Utilizator, Data_Facturare) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

                    connection.query(invoiceQuery, invoiceValues, (error, invoiceResults) => {
                        if (error) {
                            console.error('Error adding invoice:', error);
                            return res.status(500).json({ status: 'error', message: 'Error adding invoice' });
                        }

                        console.log('Invoice added successfully:', invoiceResults);
                        res.status(200).json({ status: 'success', message: 'Transaction, bets, and invoice created successfully' });
                    });
                })
                .catch(error => {
                    console.error('Error adding bets:', error);
                    res.status(500).json({ status: 'error', message: 'Error adding bets' });
                });
        });

    } catch (error) {
        console.error('Error retrieving PayPal order:', error);
        res.status(500).json({ status: 'error', message: 'Error retrieving PayPal order' });
    }
});


app.post('/add-ticket2', (req, res) => {
  const { description, betKey, odds, ID, category, betAmounts, totalAmount, userId, currency, isCombinedBet, nume, email, adresa, oras, codPostal } = req.body;

  try {
    const invoiceId = Math.floor(Math.random() * 1000000000);
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Data facturării

    // Valori pentru inserarea facturii
    const invoiceValues = [
      invoiceId,
      nume,
      email,
      adresa,
      oras,
      codPostal,
      userId,
      currentDate
    ];

    // Creați tranzacția
    const transactionId = Math.floor(Math.random() * 1000000000);
    console.log('Inserting transaction with ID:', transactionId);
    const transactionQuery = 'INSERT INTO tranzactie (ID_Tranzactie, Data_Tranzactie, Suma_Totala, Currency, ID_Utilizator) VALUES (?, NOW(), ?, ?, ?)';
    const transactionValues = [transactionId, totalAmount, currency, userId];

    connection.query(transactionQuery, transactionValues, (error, transactionResults) => {
      if (error) {
        console.error('Error creating transaction:', error);
        return res.status(500).json({ status: 'error', message: 'Error creating transaction' });
      }

      console.log('Transaction created successfully:', transactionResults);

      // Creați pariurile
      const betQueries = [];
      const numBets = description.split(', ').length;

      for (let i = 0; i < numBets; i++) {
        const betId = Math.floor(Math.random() * 1000000000);
        console.log('Inserting bet with ID:', betId);
        const betQuery = 'INSERT INTO pariu (ID_Pariu, Descriere, Cheia_Selectata, Cota, Suma, Moneda, ID_Tranzactie, Categorie, Combinat, ID_Eveniment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const betValues = [betId, description.split(', ')[i], betKey.split(', ')[i], odds.split(', ')[i], betAmounts.split(', ')[i], currency, transactionId, category.split(', ')[i], isCombinedBet ? 1 : 0, ID.split(', ')[i]];
        betQueries.push({ query: betQuery, values: betValues });
      }

      const executeBetQueries = betQueries.map(betQuery => new Promise((resolve, reject) => {
        connection.query(betQuery.query, betQuery.values, (error, betResults) => {
          if (error) {
            console.error('Error adding bet:', error);
            return reject(error);
          }
          resolve(betResults);
        });
      }));

      Promise.all(executeBetQueries)
        .then(betResults => {
          console.log('Bets added successfully:', betResults);

          // Creați factura
          console.log('Inserting invoice with ID:', invoiceId);
          const invoiceQuery = 'INSERT INTO facturare (ID_Factura, Nume_Facturare, Email_Factura, Adresa_Facturare, Oras_Facturare, Cod_Postal, ID_Utilizator, Data_Facturare) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

          connection.query(invoiceQuery, invoiceValues, (error, invoiceResults) => {
            if (error) {
              console.error('Error adding invoice:', error);
              return res.status(500).json({ status: 'error', message: 'Error adding invoice' });
            }

            console.log('Invoice added successfully:', invoiceResults);

            // Prepare ticket details for email
            const ticketDetails = `
              <ul>
                <li>Invoice ID: ${invoiceId}</li>
                <li>Transaction ID: ${transactionId}</li>
                <li>Total Amount: ${totalAmount} ${currency}</li>
                <li>Bets: ${description}</li>
              </ul>
            `;

            // Send email
            sendTicketCreationEmail(email, nume, ticketDetails);

            res.status(200).json({ status: 'success', message: 'Transaction, bets, and invoice created successfully' });
          });
        })
        .catch(error => {
          console.error('Error adding bets:', error);
          res.status(500).json({ status: 'error', message: 'Error adding bets' });
        });
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status: 'error', message: 'Error processing request' });
  }
});

app.post('/withdraw', async (req, res) => {
    const { betId, userId, amount, currency } = req.body;
    const EXCHANGE_RATES = {
        RON: 1,
        EUR: 4.98,
        USD: 4.65,
        GBP: 5.89
    };
    
    console.log('Processing payout for betId:', betId, 'userId:', userId, 'amount:', amount, 'currency:', currency);

    if (!betId) {
        return res.status(400).json({ status: 'error', message: 'Missing betId' });
    }

    try {
        let finalAmount = amount;
        let finalCurrency = currency;

        if (currency in EXCHANGE_RATES) {
            finalAmount = amount / EXCHANGE_RATES[currency];
            finalCurrency = 'EUR'; // For PayPal payout
        }

        const accessToken = await getPayPalAccessToken();

        // Verifică detaliile utilizatorului pentru payout
        const query = 'SELECT Email_Factura FROM facturare WHERE ID_Utilizator = ?';
        connection.query(query, [userId], async (err, results) => {
            if (err) {
                console.error('Error fetching user details:', err);
                return res.status(500).json({ status: 'error', message: 'Error fetching user details' });
            }
            if (results.length === 0) {
                return res.status(404).json({ status: 'error', message: 'User not found' });
            }

            const userEmail = results[0].Email_Factura;
            console.log('User email for payout:', userEmail);

            // Crearea cererii de payout folosind PayPal Payouts API
            try {
                const payoutResponse = await axios.post(
                    'https://api-m.sandbox.paypal.com/v1/payments/payouts',
                    {
                        sender_batch_header: {
                            sender_batch_id: `Payouts_${Date.now()}`,
                            email_subject: "You have a payout!",
                        },
                        items: [
                            {
                                recipient_type: "EMAIL",
                                amount: {
                                    value: finalAmount.toFixed(2),
                                    currency: finalCurrency,
                                },
                                receiver: userEmail,
                                note: "Thank you for your business.",
                                sender_item_id: betId,
                            },
                        ],
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`,
                        },
                    }
                );

                console.log('Payout response:', payoutResponse.data);

                if (payoutResponse.data.batch_header.batch_status === 'SUCCESS' || payoutResponse.data.batch_header.batch_status === 'PENDING') {
                    // Calcularea sumei convertite în RON
                    const amountInRON = amount * EXCHANGE_RATES[currency];

                    // Actualizează counter-ul utilizatorului în tabela `counter`
                    const updateQuery = 'UPDATE counter SET Counter = Counter + ?, Currency = ? WHERE ID_Utilizator = ?';
                    connection.query(updateQuery, [amountInRON, 'RON', userId], (updateErr, updateResults) => {
                        if (updateErr) {
                            console.error('Error updating user counter:', updateErr);
                            return res.status(500).json({ status: 'error', message: 'Payout successful but error updating user counter' });
                        }

                        res.status(200).json({ status: 'success', message: 'Payout successful and counter updated' });
                    });
                } else {
                    res.status(500).json({ status: 'error', message: 'Payout failed' });
                }
            } catch (payoutError) {
                console.error('Error processing payout:', payoutError.response ? payoutError.response.data : payoutError.message);
                res.status(500).json({ status: 'error', message: 'Error processing payout' });
            }
        });
    } catch (error) {
        console.error('Error retrieving PayPal order:', error);
        res.status(500).json({ status: 'error', message: 'Error retrieving PayPal order' });
    }
});

// Withdraw endpoint
app.post('/withdraw2', async (req, res) => {
  const { betId, userId, amount, currency } = req.body;
  const EXCHANGE_RATES = {
    RON: 1,
    EUR: 4.98,
    USD: 4.65,
    GBP: 5.89
  };

  console.log('Processing payout for betId:', betId, 'userId:', userId, 'amount:', amount, 'currency:', currency);

  if (!betId) {
    return res.status(400).json({ status: 'error', message: 'Missing betId' });
  }

  try {
    let finalAmount = amount;
    let finalCurrency = currency;

    if (currency in EXCHANGE_RATES) {
      finalAmount = amount / EXCHANGE_RATES[currency];
    }

    // Calcularea sumei convertite în RON
    const amountInRON = amount * EXCHANGE_RATES[currency];

    // Actualizează counter-ul utilizatorului în tabela `counter`
    const updateQuery = 'UPDATE counter SET Counter = Counter + ?, Currency = ? WHERE ID_Utilizator = ?';
    connection.query(updateQuery, [amountInRON, 'RON', userId], (updateErr, updateResults) => {
      if (updateErr) {
        console.error('Error updating user counter:', updateErr);
        return res.status(500).json({ status: 'error', message: 'Payout successful but error updating user counter' });
      }

      // Fetch user details for email
      const userQuery = 'SELECT Email_Factura FROM facturare WHERE ID_Utilizator = ?';
      connection.query(userQuery, [userId], (userErr, userResults) => {
        if (userErr) {
          console.error('Error fetching user details:', userErr);
          return res.status(500).json({ status: 'error', message: 'Error fetching user details' });
        }

        if (!userResults.length) {
          console.error('No user found with given userId:', userId);
          return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        const email = userResults[0].Email_Factura;
        console.log('User email:', email); // Log the email to verify

        const withdrawDetails = `Bet ID: ${betId}, Amount: ${amount}, Currency: ${currency}`;
        sendWithdrawEmail(email, withdrawDetails);

        res.status(200).json({ status: 'success', message: 'Payout successful and counter updated' });
      });
    });

  } catch (error) {
    console.error('Error processing payout:', error);
    res.status(500).json({ status: 'error', message: 'Error processing payout' });
  }
});
 
app.post('/refund', async (req, res) => {
  const { betId, userId, amount, currency } = req.body;
  const EXCHANGE_RATE_RON_TO_EUR = 4.98;

  let finalAmount = amount;
  let finalCurrency = currency;

  if (currency === 'RON') {
    finalAmount = amount / EXCHANGE_RATE_RON_TO_EUR;
    finalCurrency = 'EUR';
  }

  try {
    const accessToken = await getPayPalAccessToken();

    // Obțineți detaliile tranzacției
    const query = 'SELECT Capture_ID FROM tranzactie WHERE ID_Tranzactie = (SELECT ID_Tranzactie FROM pariu WHERE ID_Pariu = ?)';
    connection.query(query, [betId], async (err, results) => {
      if (err) {
        console.error('Error fetching transaction details:', err);
        return res.status(500).json({ status: 'error', message: 'Error fetching transaction details' });
      }
      if (results.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Transaction not found' });
      }

      const captureId = results[0].Capture_ID;

      try {
        const refundResponse = await axios.post(
          `https://api-m.sandbox.paypal.com/v2/payments/captures/${captureId}/refund`,
          {
            amount: {
              value: finalAmount.toFixed(2),
              currency_code: finalCurrency
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        if (refundResponse.data.status === 'COMPLETED') {
          const deleteTransactionQuery = 'DELETE FROM tranzactie WHERE ID_Tranzactie = (SELECT ID_Tranzactie FROM pariu WHERE ID_Pariu = ?)';
          connection.query(deleteTransactionQuery, [betId], (deleteTransactionErr, deleteTransactionResults) => {
            if (deleteTransactionErr) {
              console.error('Error deleting transaction:', deleteTransactionErr);
              return res.status(500).json({ status: 'error', message: 'Error deleting transaction' });
            }
            res.status(200).json({ status: 'success', message: 'Refund and deletion successful' });
          });
        } else {
          res.status(500).json({ status: 'error', message: 'Refund failed' });
        }
      } catch (refundError) {
        console.error('Error processing refund:', refundError.response ? refundError.response.data : refundError.message);
        res.status(500).json({ status: 'error', message: 'Error processing refund' });
      }
    });
  } catch (error) {
    console.error('Error retrieving PayPal access token:', error);
    res.status(500).json({ status: 'error', message: 'Error retrieving PayPal access token' });
  }
});

// Refund endpoint
app.post('/refund2', async (req, res) => {
  const { betId, userId, amount, currency } = req.body;
  const EXCHANGE_RATES = {
    RON: 1,
    EUR: 4.98,
    USD: 4.65,
    GBP: 5.89
  };

  console.log('Processing refund for betId:', betId, 'userId:', userId, 'amount:', amount, 'currency:', currency);

  if (!betId) {
    return res.status(400).json({ status: 'error', message: 'Missing betId' });
  }

  try {
    let finalAmount = amount;
    let finalCurrency = currency;

    if (currency in EXCHANGE_RATES) {
      finalAmount = amount / EXCHANGE_RATES[currency];
    }

    // Șterge tranzacție
    const deleteTransactionQuery = 'DELETE FROM tranzactie WHERE ID_Tranzactie = (SELECT ID_Tranzactie FROM pariu WHERE ID_Pariu = ?)';
    connection.query(deleteTransactionQuery, [betId], (deleteTransactionErr, deleteTransactionResults) => {
      if (deleteTransactionErr) {
        console.error('Error deleting transaction:', deleteTransactionErr);
        return res.status(500).json({ status: 'error', message: 'Error deleting transaction' });
      }

      // Fetch user details for email
      const userQuery = 'SELECT Email_Factura FROM facturare WHERE ID_Utilizator = ?';
      connection.query(userQuery, [userId], (userErr, userResults) => {
        if (userErr) {
          console.error('Error fetching user details:', userErr);
          return res.status(500).json({ status: 'error', message: 'Error fetching user details' });
        }

        if (!userResults.length) {
          console.error('No user found with given userId:', userId);
          return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        const email = userResults[0].Email_Factura;
        console.log('User email:', email); // Log the email to verify

        const refundDetails = `Bet ID: ${betId}, Amount: ${amount}, Currency: ${currency}`;
        sendRefundEmail(email, refundDetails);

        res.status(200).json({ status: 'success', message: 'Refund and deletion successful' });
      });
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ status: 'error', message: 'Error processing refund' });
  }
});

app.delete('/delete-bet/:betId/:transactionId', (req, res) => {
    const { betId, transactionId } = req.params;
  
      // Șterge tranzacția asociată
      const deleteTransactionQuery = 'DELETE FROM tranzactie WHERE ID_Tranzactie = ?';
      connection.query(deleteTransactionQuery, [transactionId], (transactionError, transactionResults) => {
        if (transactionError) {
          console.error('Error deleting transaction:', transactionError);
          return res.status(500).json({ error: 'Error deleting transaction' });
        }
  
        res.status(200).json({ message: 'Bet and transaction deleted successfully' });
      });
  });
    
  app.post('/log-operation', (req, res) => {
    const { username, role, operation, table } = req.body;
    
    const query = 'INSERT INTO operati (Nume, Pozitie, Operatie, Tabela, Data) VALUES (?, ?, ?, ?, NOW())';
    connection.query(query, [username, role, operation, table], (error, results) => {
      if (error) {
        console.error('Error logging operation:', error);
        res.status(500).json({ status: 'error', message: 'Error logging operation' });
      } else {
        res.status(200).json({ status: 'success', message: 'Operation logged successfully' });
      }
    });
  });

  // Endpoint to get all logged operations
app.get('/logged-operations', (req, res) => {
  const query = 'SELECT * FROM operati';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching logged operations:', error);
      res.status(500).json({ status: 'error', message: 'Error fetching logged operations' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Endpoint to get all users with the role of 'admin'
app.get('/admin-users', (req, res) => {
  const query = 'SELECT * FROM utilizatori WHERE Pozitie = ?';
  connection.query(query, ['admin'], (error, results) => {
    if (error) {
      console.error('Error fetching admin users:', error);
      res.status(500).json({ status: 'error', message: 'Error fetching admin users' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Endpoint to get all transactions and bets
app.get('/all-bets', (req, res) => {
  const queryAllBets = `
  SELECT t.ID_Tranzactie, t.Data_Tranzactie, t.Suma_Totala, t.Currency, t.ID_Utilizator, 
         p.ID_Pariu, p.Descriere, p.Categorie, p.Cheia_Selectata, p.Cota, p.Suma, 
         p.Moneda, p.Colectat, p.Combinat, p.ID_Eveniment
  FROM tranzactie t
  JOIN pariu p ON t.ID_Tranzactie = p.ID_Tranzactie`;

  connection.query(queryAllBets, (err, results) => {
      if (err) {
          console.error('Error fetching all bets:', err);
          res.status(500).json({ error: 'Error fetching all bets' });
          return;
      }

      res.json(results);
  });
});

// Endpoint to get all records from the facturare table
app.get('/invoices', (req, res) => {
  const queryAllInvoices = 'SELECT * FROM facturare';

  connection.query(queryAllInvoices, (err, results) => {
      if (err) {
          console.error('Error fetching invoices:', err);
          res.status(500).json({ error: 'Error fetching invoices' });
          return;
      }

      res.status(200).json(results);
  });
});

const options = {
    key: fs.readFileSync(path.join('localhost-key.pem')),
    cert: fs.readFileSync(path.join('localhost.pem'))
};

https.createServer(options, app).listen(8081, () => {
    console.log('Serverul HTTPS a pornit pe portul 8081');
});
