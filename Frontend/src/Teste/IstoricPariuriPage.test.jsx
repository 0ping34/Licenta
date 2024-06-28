import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import IstoricPariuriPage from '../Pagini/IstoricPariuriPage';
import '@testing-library/jest-dom';

// Mock axios pentru a intercepta și a simula cererile HTTP
jest.mock('axios');

// Date mock pentru istoricul pariurilor
const mockBetHistory = [
  {
    ID_Pariu: '1',
    ID_Utilizator: '1',
    ID_Eveniment: '1',
    Combinat: 0,
    Descriere: 'Team A vs Team B',
    Categorie: 'Rezultat Final',
    Cheia_Selectata: '1',
    Cota: 1.5,
    Suma: 100,
    Moneda: 'RON',
    Data_Tranzactie: '2023-06-01T18:00:00Z',
    Colectat: 0
  },
  {
    ID_Pariu: '2',
    ID_Utilizator: '1',
    ID_Eveniment: '2',
    Combinat: 1,
    Descriere: 'Team C vs Team D',
    Categorie: 'Castigator Meci',
    Cheia_Selectata: '1',
    Cota: 1.8,
    Suma: 200,
    Moneda: 'RON',
    Data_Tranzactie: '2023-06-02T18:00:00Z',
    Colectat: 0
  },
];

// Date mock pentru istoricul meciurilor
const mockMatchHistory = [
  {
    ID_Eveniment: '1',
    Optiuni_Castigatoare: JSON.stringify({ 'Rezultat Final': { '1': 1.5 } }),
    Data_Eveniment: '2023-06-01T18:00:00Z'
  },
  {
    ID_Eveniment: '2',
    Optiuni_Castigatoare: JSON.stringify({ 'Castigator Meci': { '1': 1.8 } }),
    Data_Eveniment: '2023-06-02T18:00:00Z'
  },
];

// Date mock pentru evenimentele curente
const mockCurrentEvents = [
  {
    ID_Eveniment: '3',
    Data_Eveniment: '2023-06-03T18:00:00Z'
  },
];

// Test suite pentru componenta IstoricPariuriPage
describe('IstoricPariuriPage Component', () => {
  // Se rulează înainte de fiecare test pentru a reseta mock-urile și a configura mock-ul axios
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockImplementation((url) => {
      switch (url) {
        case 'https://localhost:8081/users/username/bets':
          return Promise.resolve({ data: mockBetHistory });
        case 'https://localhost:8081/match-history':
          return Promise.resolve({ data: mockMatchHistory });
        case 'https://localhost:8081/events':
          return Promise.resolve({ data: mockCurrentEvents });
        case 'https://localhost:8081/counter/1':
          return Promise.resolve({ data: { Counter: 1000, Currency: 'RON' } });
        default:
          return Promise.reject(new Error('not found'));
      }
    });
  });

  // Funcție de ajutor pentru a reda componenta cu contextul necesar
  const renderComponent = () => {
    render(
      <Router>
        <IstoricPariuriPage />
      </Router>
    );
  };

  // Test pentru a verifica dacă navigarea la pagina de istoric al meciurilor funcționează corect
  test('navigates to istoric meciuri page', async () => {
    renderComponent();

    fireEvent.click(screen.getByText('Istoric Meciuri'));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/istoric');
    });
  });
});
