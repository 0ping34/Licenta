const request = require('supertest');
const bcrypt = require('bcrypt');
const { app, server, closeDatabaseConnection, closeServer } = require('../server.js');

describe('Express Server API Tests', () => {
  // Închide serverul și conexiunea la baza de date după ce toate testele s-au terminat
  afterAll(async () => {
    await closeServer();
    await closeDatabaseConnection();
  });

  // Test pentru endpoint-ul de bază
  describe('GET /', () => {
    it('should return status 200', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'success');
    });
  });

  // Teste pentru înregistrarea utilizatorilor
  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        birthDate: '1990-01-01',
        position: 'user'
      };

      // Verifică dacă utilizatorul există deja
      const checkUserRes = await request(app).get(`/utilizatori/exista/${newUser.username}/${newUser.email}`);
      if (checkUserRes.body.exists) {
        console.log('User already exists, skipping creation');
      } else {
        const res = await request(app).post('/inregistrare').send(newUser);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'success');
      }
    });

    it('should return an error for password mismatch', async () => {
      const newUser = {
        username: 'testuser2',
        email: 'testuser2@example.com',
        password: 'password123',
        confirmPassword: 'password456',
        birthDate: '1990-01-01',
        position: 'user'
      };

      const res = await request(app).post('/inregistrare').send(newUser);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('status', 'error');
    });
  });

  // Teste pentru autentificarea utilizatorilor
  describe('User Login', () => {
    it('should login successfully with correct credentials', async () => {
      const credentials = {
        email: 'testuser@example.com',
        password: 'password123'
      };

      const userRes = await request(app).post('/login').send(credentials);
      expect(userRes.statusCode).toEqual(200);
      expect(userRes.body).toHaveProperty('status', 'success');
    });

    it('should return an error for incorrect credentials', async () => {
      const credentials = {
        email: 'wronguser@example.com',
        password: 'wrongpassword'
      };

      const res = await request(app).post('/login').send(credentials);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('status', 'error');
    });
  });

  // Teste pentru verificarea existenței unui utilizator
  describe('Check if User Exists', () => {
    it('should return true if user exists', async () => {
      const username = 'testuser';
      const email = 'testuser@example.com';

      const res = await request(app).get(`/utilizatori/exista/${username}/${email}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.exists).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      const username = 'nonexistentuser';
      const email = 'nonexistent@example.com';

      const res = await request(app).get(`/utilizatori/exista/${username}/${email}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.exists).toBe(false);
    });
  });

  // Test pentru confirmarea email-ului
  describe('Email Confirmation', () => {
    it('should confirm user email successfully', async () => {
      const userId = 85290437; // Folosește un ID real din baza ta de date pentru test

      const res = await request(app).get(`/confirm?userId=${userId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.text).toBe('Email confirmat cu succes! Puteți acum să vă autentificați.');
    });
  });

  // Test pentru obținerea codurilor de verificare
  describe('GET /coduri-verificare', () => {
    it('should return status 200 and the verification codes', async () => {
      const res = await request(app).get('/coduri-verificare');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  // Teste pentru obținerea și actualizarea detaliilor unui utilizator după ID
  describe('GET /users/id/:userId', () => {
    it('should return 404 for an invalid userId', async () => {
      const userId = 99999999; // Un ID inexistent
      const res = await request(app).get(`/users/id/${userId}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PATCH /users/id/:userId', () => {
    it('should return 404 for an invalid userId', async () => {
      const userId = 99999999; // Un ID inexistent
      const updates = { username: 'updateduser', email: 'updated@example.com' };
      const res = await request(app).patch(`/users/id/${userId}`).send(updates);
      expect(res.statusCode).toEqual(404);
    });
  });

  // Teste pentru ștergerea unui utilizator după ID
  describe('DELETE /users/id/:userId', () => {
    it('should return 404 for an invalid userId', async () => {
      const userId = 99999999; // Un ID inexistent
      const res = await request(app).delete(`/users/id/${userId}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  // Test pentru mutarea unui meci în istoric
  describe('POST /move-to-history', () => {
    it('should return 404 for an invalid matchId', async () => {
      const matchDetails = { matchId: 99999999, winningOptions: ['option1', 'option2'] }; // Un ID inexistent
      const res = await request(app).post('/move-to-history').send(matchDetails);
      expect(res.statusCode).toEqual(404);
    });
  });

  // Test pentru obținerea istoricului meciurilor
  describe('GET /match-history', () => {
    it('should return status 200 and the match history', async () => {
      const res = await request(app).get('/match-history');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  // Test pentru ștergerea unui meci din istoric
  describe('DELETE /match-history/:id', () => {
    it('should return 404 for an invalid matchId', async () => {
      const matchId = 99999999; // Un ID inexistent
      const res = await request(app).delete(`/match-history/${matchId}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  // Test pentru colectarea unui pariu
  describe('PATCH /bets/:betId/collect', () => {
    it('should collect a bet successfully', async () => {
      const betId = 652992836; // Folosește un ID real din baza ta de date pentru test
      const res = await request(app).patch(`/bets/${betId}/collect`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Pariul a fost colectat cu succes');
    });

    it('should return 404 for an invalid betId', async () => {
      const betId = 99999999; // Un ID inexistent
      const res = await request(app).patch(`/bets/${betId}/collect`);
      expect(res.statusCode).toEqual(404);
    });
  });

  // Test pentru obținerea evenimentelor curente
  describe('GET /events', () => {
    it('should return status 200 and the events', async () => {
      const res = await request(app).get('/events');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  // Test pentru obținerea și actualizarea contorului unui utilizator
  describe('GET /counter/:userId', () => {
    it('should return the counter details for a valid userId', async () => {
      const userId = 732474291; // Folosește un ID real din baza ta de date pentru test
      const res = await request(app).get(`/counter/${userId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('Counter');
      expect(res.body).toHaveProperty('Currency');
    });

    it('should return 404 for an invalid userId', async () => {
      const userId = 99999999; // Un ID inexistent
      const res = await request(app).get(`/counter/${userId}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /counter/:userId', () => {
    it('should update the counter details successfully', async () => {
      const userId = 85290437; // Folosește un ID real din baza ta de date pentru test
      const updates = { Counter: 100, Currency: 'RON' };
      const res = await request(app).put(`/counter/${userId}`).send(updates);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Counter updated successfully');
    });
  });

  // Test pentru obținerea pariurilor unui utilizator după username
  describe('GET /users/:username/bets', () => {
    it('should return the bets for a valid username', async () => {
      const username = 'testuser'; // Folosește un username real din baza ta de date pentru test
      const res = await request(app).get(`/users/${username}/bets`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });

    it('should return 404 for an invalid username', async () => {
      const username = 'nonexistentuser'; // Un username inexistent
      const res = await request(app).get(`/users/${username}/bets`);
      expect(res.statusCode).toEqual(404);
    });
  });

  // Test pentru adăugarea unui bilet
  describe('POST /add-ticket', () => {
    it('should add a ticket successfully', async () => {
      const ticketData = {
        description: 'Test ticket',
        betKey: 'TestKey',
        odds: '2.0',
        ID: '1',
        category: 'TestCategory',
        betAmounts: '100',
        totalAmount: 100,
        userId: 1,
        currency: 'RON',
        orderId: 'TestOrder',
        isCombinedBet: false
      };

      const res = await request(app).post('/add-ticket').send(ticketData);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Transaction, bets, and invoice created successfully');
    });
  });

  // Test pentru procesarea unei retrageri
  describe('POST /withdraw', () => {
    it('should process a withdrawal successfully', async () => {
      const withdrawalData = {
        betId: 1,
        userId: 1,
        amount: 100,
        currency: 'RON'
      };

      const res = await request(app).post('/withdraw').send(withdrawalData);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Payout successful and counter updated');
    });
  });

  // Test pentru procesarea unei rambursări
  describe('POST /refund', () => {
    it('should process a refund successfully', async () => {
      const refundData = {
        betId: 1,
        userId: 1,
        amount: 100,
        currency: 'RON'
      };

      const res = await request(app).post('/refund').send(refundData);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Refund and deletion successful');
    });
  });

  // Test pentru ștergerea unui pariu și a tranzacției sale
  describe('DELETE /delete-bet/:betId/:transactionId', () => {
    it('should delete a bet and its transaction successfully', async () => {
      const betId = 1;
      const transactionId = 1;

      const res = await request(app).delete(`/delete-bet/${betId}/${transactionId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Bet and transaction deleted successfully');
    });
  });

  // Test pentru obținerea operațiunilor înregistrate
  describe('GET /logged-operations', () => {
    it('should return all logged operations', async () => {
      const res = await request(app).get('/logged-operations');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  // Test pentru obținerea utilizatorilor admin
  describe('GET /admin-users', () => {
    it('should return all admin users', async () => {
      const res = await request(app).get('/admin-users');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  // Test pentru obținerea utilizatorilor angajați
  describe('GET /employee-users', () => {
    it('should return all employee users', async () => {
      const res = await request(app).get('/employee-users');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  // Test pentru obținerea tuturor pariurilor și tranzacțiilor
  describe('GET /all-bets', () => {
    it('should return all bets and transactions', async () => {
      const res = await request(app).get('/all-bets');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  // Test pentru obținerea tuturor facturilor
  describe('GET /invoices', () => {
    it('should return all invoices', async () => {
      const res = await request(app).get('/invoices');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  // Test pentru înregistrarea unei operațiuni
  describe('POST /log-operation', () => {
    it('should log an operation successfully', async () => {
      const logData = {
        username: 'testuser',
        role: 'admin',
        operation: 'create',
        table: 'utilizatori'
      };

      const res = await request(app).post('/log-operation').send(logData);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Operation logged successfully');
    });
  });
});
