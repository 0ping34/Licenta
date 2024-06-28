import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import IstoricMeciuriPage from '../Pagini/IstoricMeciuriPage';
import '@testing-library/jest-dom';

// Mock axios pentru a intercepta și a simula cererile HTTP
jest.mock('axios');

// Date mock pentru istoricul meciurilor
const mockMatchHistory = [
  {
    ID_Meci2: '1',
    Echipa_unu: 'Team A',
    Echipa_doi: 'Team B',
    Data_Eveniment: '2023-06-01T18:00:00Z',
    Tip_Eveniment: 'Fotbal',
    Locatie: 'Stadium 1',
    Optiuni_Castigatoare: JSON.stringify({ 'Rezultat Final': { '1': 1.5 } })
  },
  {
    ID_Meci2: '2',
    Echipa_unu: 'Team C',
    Echipa_doi: 'Team D',
    Data_Eveniment: '2023-06-02T18:00:00Z',
    Tip_Eveniment: 'Tenis',
    Locatie: 'Stadium 2',
    Optiuni_Castigatoare: JSON.stringify({ 'Castigator Meci': { '1': 1.8 } })
  },
];

// Test suite pentru componenta IstoricMeciuriPage
describe('IstoricMeciuriPage Component', () => {
  // Se rulează înainte de fiecare test pentru a reseta mock-urile și a configura mock-ul axios
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockImplementation((url) => {
      switch (url) {
        case 'https://localhost:8081/match-history':
          return Promise.resolve({ data: mockMatchHistory });
        case 'https://localhost:8081/user-role':
          return Promise.resolve({ data: { role: 'admin' } });
        default:
          return Promise.reject(new Error('not found'));
      }
    });
  });

  // Funcție de ajutor pentru a reda componenta cu contextul necesar
  const renderComponent = () => {
    render(
      <Router>
        <IstoricMeciuriPage />
      </Router>
    );
  };

  // Test pentru a verifica dacă componenta se redă corect
  test('renders the component correctly', async () => {
    renderComponent();

    expect(screen.getByText('Istoric meciuri')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Team A vs Team B')).toBeInTheDocument();
      expect(screen.getByText('Team C vs Team D')).toBeInTheDocument();
    });
  });

  // Test pentru a verifica dacă datele sunt preluate și afișate corect
  test('fetches and displays data correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Team A vs Team B')).toBeInTheDocument();
      expect(screen.getByText('Team C vs Team D')).toBeInTheDocument();
    });
  });

  // Test pentru a verifica dacă navigarea la pagina de istoric al pariurilor funcționează corect
  test('navigates to bet history page', async () => {
    renderComponent();

    fireEvent.click(screen.getByText('Pariuri Page'));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/bet-history');
    });
  });
});
