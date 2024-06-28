import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import ManagerPage from '../Manager/ManagerPage';
import '@testing-library/jest-dom';
import 'whatwg-fetch'; // Add this line to polyfill fetch API in the testing environment

// Mock axios pentru a intercepta cererile HTTP
jest.mock('axios');

// Date mock pentru diverse secțiuni din ManagerPage
const mockMatchHistory = [
  {
    id: '1',
    Tip_Eveniment: 'Fotbal',
    Echipa_unu: 'Team A',
    Echipa_doi: 'Team B',
    Data_Eveniment: '2023-06-01T18:00:00Z',
    Locatie: 'Stadium 1',
    Optiuni_Castigatoare: JSON.stringify({ 'Rezultat Final': { '1': 1.5 } })
  },
  {
    id: '2',
    Tip_Eveniment: 'Tenis',
    Echipa_unu: 'Team C',
    Echipa_doi: 'Team D',
    Data_Eveniment: '2023-06-02T18:00:00Z',
    Locatie: 'Stadium 2',
    Optiuni_Castigatoare: JSON.stringify({ 'Castigator Meci': { '1': 1.8 } })
  },
];

const mockCurrentEvents = [
  {
    ID_Eveniment: '1',
    Tip_Eveniment: 'Fotbal',
    Echipa_unu: 'Team E',
    Echipa_doi: 'Team F',
    Data_Eveniment: '2023-06-03T18:00:00Z',
    Locatie: 'Stadium 3'
  },
  {
    ID_Eveniment: '2',
    Tip_Eveniment: 'Tenis',
    Echipa_unu: 'Team G',
    Echipa_doi: 'Team H',
    Data_Eveniment: '2023-06-04T18:00:00Z',
    Locatie: 'Stadium 4'
  },
];

const mockLoggedOperations = [
  {
    ID: '1',
    Nume: 'Admin',
    Operatie: 'create',
    Tabela: 'eveniment_sportiv',
    Data: '2023-06-01T12:00:00Z',
    Pozitie: 'admin'
  },
  {
    ID: '2',
    Nume: 'Manager',
    Operatie: 'update',
    Tabela: 'utilizatori',
    Data: '2023-06-02T12:00:00Z',
    Pozitie: 'manager'
  },
];

const mockAdminUsers = [
  {
    ID_Utilizator: '1',
    Nume_Utilizator: 'AdminUser1',
    Email: 'admin1@example.com',
    Pozitie: 'admin'
  },
  {
    ID_Utilizator: '2',
    Nume_Utilizator: 'AdminUser2',
    Email: 'admin2@example.com',
    Pozitie: 'admin'
  },
];

const mockEmployeeUsers = [
  {
    ID_Utilizator: '3',
    Nume_Utilizator: 'EmployeeUser1',
    Email: 'employee1@example.com',
    Pozitie: 'employee'
  },
  {
    ID_Utilizator: '4',
    Nume_Utilizator: 'EmployeeUser2',
    Email: 'employee2@example.com',
    Pozitie: 'employee'
  },
];

const mockBets = [
  {
    ID_Pariu: '1',
    Descriere: 'Team A vs Team B',
    Categorie: 'Rezultat Final',
    Cheia_Selectata: '1',
    Cota: 1.5,
    Suma: 100,
    Moneda: 'RON',
    ID_Tranzactie: '12345',
    Data_Tranzactie: '2023-06-01T12:00:00Z'
  },
  {
    ID_Pariu: '2',
    Descriere: 'Team C vs Team D',
    Categorie: 'Castigator Meci',
    Cheia_Selectata: '1',
    Cota: 1.8,
    Suma: 200,
    Moneda: 'RON',
    ID_Tranzactie: '12346',
    Data_Tranzactie: '2023-06-02T12:00:00Z'
  },
];

const mockInvoices = [
  {
    ID_Factura: '1',
    Nume_Facturare: 'John Doe',
    Email_Factura: 'john@example.com',
    Adresa_Facturare: '123 Main St',
    Oras_Facturare: 'Bucharest',
    Cod_Postal: '010101',
    ID_Utilizator: '1',
    Data_Facturare: '2023-06-01T12:00:00Z'
  },
  {
    ID_Factura: '2',
    Nume_Facturare: 'Jane Smith',
    Email_Factura: 'jane@example.com',
    Adresa_Facturare: '456 Elm St',
    Oras_Facturare: 'Cluj',
    Cod_Postal: '020202',
    ID_Utilizator: '2',
    Data_Facturare: '2023-06-02T12:00:00Z'
  },
];

// Test suite pentru componenta ManagerPage
describe('ManagerPage Component', () => {
  // Se rulează înainte de fiecare test pentru a reseta mock-urile și a configura mock-ul axios
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockImplementation(url => {
      switch (url) {
        case 'https://localhost:8081/match-history':
          return Promise.resolve({ data: mockMatchHistory });
        case 'https://localhost:8081/events':
          return Promise.resolve({ data: mockCurrentEvents });
        case 'https://localhost:8081/logged-operations':
          return Promise.resolve({ data: mockLoggedOperations });
        case 'https://localhost:8081/admin-users':
          return Promise.resolve({ data: mockAdminUsers });
        case 'https://localhost:8081/employee-users':
          return Promise.resolve({ data: mockEmployeeUsers });
        case 'https://localhost:8081/all-bets':
          return Promise.resolve({ data: mockBets });
        case 'https://localhost:8081/invoices':
          return Promise.resolve({ data: mockInvoices });
        default:
          return Promise.reject(new Error('not found'));
      }
    });
  });

  // Funcție de ajutor pentru a reda componenta cu contextul necesar
  const renderComponent = () => {
    render(
      <Router>
        <ManagerPage />
      </Router>
    );
  };

  // Test pentru a verifica dacă componenta este redată corect
  test('renders the component correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Manager Page')).toBeInTheDocument();
      expect(screen.getByText('Welcome to the manager dashboard, Manager.')).toBeInTheDocument();
    });
  });

  // Test pentru a verifica dacă secțiunea Logged Operations este redată corect
  test('renders logged operations section', async () => {
    renderComponent();

    fireEvent.click(screen.getAllByText('Logged Operations')[0]);

    await waitFor(() => {
      expect(screen.getAllByText('Logged Operations').length).toBeGreaterThan(0);
      expect(screen.getByText((content, element) => content.includes('Admin') && content.includes('create'))).toBeInTheDocument();
      expect(screen.getByText((content, element) => content.includes('Manager') && content.includes('update'))).toBeInTheDocument();
    });
  });

  // Test pentru a verifica dacă secțiunea Current Events este redată corect
  test('renders current events section', async () => {
    renderComponent();

    fireEvent.click(screen.getAllByText('Current Events')[0]);

    await waitFor(() => {
      expect(screen.getAllByText('Current Events').length).toBeGreaterThan(0);
      expect(screen.getByText((content, element) => content.includes('Team E') && content.includes('Team F'))).toBeInTheDocument();
      expect(screen.getByText((content, element) => content.includes('Team G') && content.includes('Team H'))).toBeInTheDocument();
    });
  });

  // Test pentru a verifica dacă secțiunea Match History este redată corect
  test('renders match history section', async () => {
    renderComponent();

    fireEvent.click(screen.getAllByText('Match History')[0]);

    await waitFor(() => {
      expect(screen.getAllByText('Match History').length).toBeGreaterThan(0);
      expect(screen.getByText((content, element) => content.includes('Team A') && content.includes('Team B'))).toBeInTheDocument();
      expect(screen.getByText((content, element) => content.includes('Team C') && content.includes('Team D'))).toBeInTheDocument();
    });
  });

  // Test pentru a verifica dacă secțiunea Admin Users este redată corect
  test('renders admin users section', async () => {
    renderComponent();

    fireEvent.click(screen.getAllByText('Admin Users')[0]);

    await waitFor(() => {
      expect(screen.getAllByText('Admin Users').length).toBeGreaterThan(0);
      expect(screen.getByText((content, element) => content.includes('AdminUser1') && content.includes('admin1@example.com'))).toBeInTheDocument();
      expect(screen.getByText((content, element) => content.includes('AdminUser2') && content.includes('admin2@example.com'))).toBeInTheDocument();
    });
  });

  // Test pentru a verifica dacă secțiunea Employee Users este redată corect
  test('renders employee users section', async () => {
    renderComponent();

    fireEvent.click(screen.getAllByText('Employee Users')[0]);

    await waitFor(() => {
      expect(screen.getAllByText('Employee Users').length).toBeGreaterThan(0);
      expect(screen.getByText((content, element) => content.includes('EmployeeUser1') && content.includes('employee1@example.com'))).toBeInTheDocument();
      expect(screen.getByText((content, element) => content.includes('EmployeeUser2') && content.includes('employee2@example.com'))).toBeInTheDocument();
    });
  });

  // Test pentru a verifica dacă secțiunea All Bets este redată corect
  test('renders all bets section', async () => {
    renderComponent();

    fireEvent.click(screen.getAllByText('All Bets')[0]);

    await waitFor(() => {
      expect(screen.getAllByText('All Bets').length).toBeGreaterThan(0);
      expect(screen.getByText((content, element) => content.includes('Team A vs Team B') && content.includes('Rezultat Final'))).toBeInTheDocument();
      expect(screen.getByText((content, element) => content.includes('Team C vs Team D') && content.includes('Castigator Meci'))).toBeInTheDocument();
    });
  });

  // Test pentru a verifica dacă secțiunea Invoices este redată corect
  test('renders invoices section', async () => {
    renderComponent();

    fireEvent.click(screen.getAllByText('Invoices')[0]);

    await waitFor(() => {
      expect(screen.getAllByText('Invoices').length).toBeGreaterThan(0);
      expect(screen.getByText((content, element) => content.includes('Invoice ID: 1') && content.includes('John Doe') && content.includes('john@example.com'))).toBeInTheDocument();
      expect(screen.getByText((content, element) => content.includes('Invoice ID: 2') && content.includes('Jane Smith') && content.includes('jane@example.com'))).toBeInTheDocument();
    });
  });
});
