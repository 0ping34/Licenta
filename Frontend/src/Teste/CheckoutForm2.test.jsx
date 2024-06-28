import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import CheckoutForm2 from '../Pariere/CheckoutForm2';
import '@testing-library/jest-dom';

// Mock axios pentru a intercepta și a simula cererile HTTP
jest.mock('axios');

// Date mock pentru testare
const mockBets = [
  {
    description: 'Team A vs Team B',
    betKey: '1',
    odds: 1.5,
    ID: '1',
    category: 'Win',
    betAmount: '100',
    currency: 'RON'
  },
  {
    description: 'Team C vs Team D',
    betKey: 'X',
    odds: 2.0,
    ID: '2',
    category: 'Draw',
    betAmount: '200',
    currency: 'RON'
  }
];

describe('CheckoutForm2 Component', () => {
  // Se rulează înainte de fiecare test pentru a reseta mock-urile și localStorage
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('userId', '1');
    localStorage.setItem('username', 'testuser');
    localStorage.setItem('role', 'admin');
  });

  // Funcție de ajutor pentru a reda componenta cu contextul necesar
  const renderComponent = (props) => {
    render(
      <Router>
        <CheckoutForm2 {...props} />
      </Router>
    );
  };

  // Test pentru a verifica dacă componenta se redă corect
  test('renders the component correctly', () => {
    renderComponent({ bets: mockBets, isCombinedBet: false });

    // Se verifică dacă elementele necesare sunt afișate pe ecran
    expect(screen.getByText('CHECKOUT')).toBeInTheDocument();
    expect(screen.getByText('Detalii Pariuri')).toBeInTheDocument();
    expect(screen.getByText('Team A vs Team B')).toBeInTheDocument();
    expect(screen.getByText('Team C vs Team D')).toBeInTheDocument();
    expect(screen.getByText('Total de plată: 300.00 RON')).toBeInTheDocument();
  });

  // Test pentru a verifica dacă inputurile din formular se actualizează corect
  test('handles form input changes', () => {
    renderComponent({ bets: mockBets, isCombinedBet: false });

    // Se simulează schimbarea valorilor inputurilor
    fireEvent.change(screen.getByLabelText('Nume și Prenume:'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Adresă:'), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText('Oraș:'), { target: { value: 'Bucharest' } });
    fireEvent.change(screen.getByLabelText('Cod Poștal:'), { target: { value: '010101' } });

    // Se verifică dacă valorile inputurilor au fost actualizate corect
    expect(screen.getByLabelText('Nume și Prenume:').value).toBe('John Doe');
    expect(screen.getByLabelText('Email:').value).toBe('john@example.com');
    expect(screen.getByLabelText('Adresă:').value).toBe('123 Main St');
    expect(screen.getByLabelText('Oraș:').value).toBe('Bucharest');
    expect(screen.getByLabelText('Cod Poștal:').value).toBe('010101');
  });

  // Test pentru a verifica dacă formularul se trimite cu succes
  test('submits the form successfully', async () => {
    // Se simulează răspunsul cu succes de la server
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    renderComponent({ bets: mockBets, isCombinedBet: false });

    // Se simulează schimbarea valorilor inputurilor
    fireEvent.change(screen.getByLabelText('Nume și Prenume:'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Adresă:'), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText('Oraș:'), { target: { value: 'Bucharest' } });
    fireEvent.change(screen.getByLabelText('Cod Poștal:'), { target: { value: '010101' } });

    // Se simulează trimiterea formularului
    fireEvent.click(screen.getByText('Trimite'));

    await waitFor(() => {
      // Se verifică dacă cererea POST a fost trimisă corect
      expect(axios.post).toHaveBeenCalledWith('https://localhost:8081/add-ticket2', {
        description: 'Team A vs Team B, Team C vs Team D',
        betKey: '1, X',
        odds: '1.5, 2',
        ID: '1, 2',
        category: 'Win, Draw',
        betAmounts: '100, 200',
        totalAmount: 300,
        userId: '1',
        currency: 'RON',
        nume: 'John Doe',
        email: 'john@example.com',
        adresa: '123 Main St',
        oras: 'Bucharest',
        codPostal: '010101',
        isCombinedBet: false
      });
      // Se verifică dacă operația a fost înregistrată corect
      expect(axios.post).toHaveBeenCalledWith('https://localhost:8081/log-operation', {
        username: 'testuser',
        role: 'admin',
        operation: 'create',
        table: 'pariu'
      });
      // Se verifică dacă mesajul de succes este afișat
      expect(screen.getByText('Tranzacția a fost realizată cu succes. Veți fi redirecționat în 3 secunde...')).toBeInTheDocument();
    });
  });

  // Test pentru a verifica dacă se afișează un mesaj de eroare dacă trimiterea formularului eșuează
  test('displays an error message if form submission fails', async () => {
    // Se simulează răspunsul cu eroare de la server
    axios.post.mockRejectedValueOnce(new Error('Submission failed'));

    renderComponent({ bets: mockBets, isCombinedBet: false });

    // Se simulează schimbarea valorilor inputurilor
    fireEvent.change(screen.getByLabelText('Nume și Prenume:'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Adresă:'), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText('Oraș:'), { target: { value: 'Bucharest' } });
    fireEvent.change(screen.getByLabelText('Cod Poștal:'), { target: { value: '010101' } });

    // Se simulează trimiterea formularului
    fireEvent.click(screen.getByText('Trimite'));

    await waitFor(() => {
      // Se verifică dacă mesajul de eroare este afișat
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to save bet: Submission failed');
    });
  });
});
