import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from '../axiosConfig';
import AdminPage from '../Admin/AdminPage';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom';
import moment from 'moment';

// Mock axios
jest.mock('../axiosConfig');

const mockEvents = [
  {
    ID_Eveniment: '1',
    Tip_Eveniment: 'Fotbal',
    Echipa_unu: 'Team A',
    Echipa_doi: 'Team B',
    Data_Eveniment: moment().add(1, 'days').toISOString(),
    Locatie: 'Stadium 1',
    Optiuni_Pariuri: JSON.stringify({
      cote: {
        'Rezultat Final': {
          '1': 1.5,
          'X': 3.6,
          '2': 2.1,
        },
      },
    }),
  },
  {
    ID_Eveniment: '2',
    Tip_Eveniment: 'Tenis',
    Echipa_unu: 'Team C',
    Echipa_doi: 'Team D',
    Data_Eveniment: moment().add(2, 'days').toISOString(),
    Locatie: 'Stadium 2',
    Optiuni_Pariuri: JSON.stringify({
      cote: {
        'Castigator Meci': {
          '1': 1.8,
          '2': 2.0,
        },
      },
    }),
  },
];

// Descrierea testelor pentru componenta AdminPage
describe('AdminPage Component', () => {
  // Curăță toate mock-urile și setează valoarea returnată de axios.get înainte de fiecare test
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockEvents });
  });

  // Funcție pentru a reda componenta AdminPage în cadrul Router-ului
  const renderComponent = () => {
    render(
      <Router>
        <AdminPage />
      </Router>
    );
  };

  // Test pentru a verifica dacă componenta se redă corect
  test('renders the component correctly', async () => {
    renderComponent();

    // Așteaptă ca textele "Gestionare Evenimente Sportive" și "Creare Eveniment Nou" să fie în document
    await waitFor(() => {
      expect(screen.getByText('Gestionare Evenimente Sportive')).toBeInTheDocument();
      expect(screen.getByText('Creare Eveniment Nou')).toBeInTheDocument();
    });
  });
});
