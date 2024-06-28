import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegistrationModal from '../RegistrationModal';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import 'whatwg-fetch'; // Adaugă acest linie pentru a polyfill fetch API în mediul de testare

// Mock axios pentru a intercepta cererile HTTP
jest.mock('axios');

// Test suite pentru componenta RegistrationModal
describe('RegistrationModal Component', () => {
  const onCloseMock = jest.fn();

  // Se rulează înainte de fiecare test pentru a reseta mock-urile și a reda componenta RegistrationModal
  beforeEach(() => {
    onCloseMock.mockClear();
    render(
      <MemoryRouter>
        <RegistrationModal isOpen={true} onClose={onCloseMock} />
      </MemoryRouter>
    );
  });

  // Test pentru a verifica dacă formularul de înregistrare este afișat corect
  test('should display registration form', () => {
    expect(screen.getByRole('heading', { name: /formular de înregistrare/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /înregistrare/i })).toBeInTheDocument();
  });

  // Test pentru a valida vârsta utilizatorului
  test('should validate age', async () => {
    fireEvent.change(screen.getByLabelText(/data nașterii/i), { target: { value: '2010-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /înregistrare/i }));

    await waitFor(() => {
      expect(screen.getByText('Trebuie să aveți cel puțin 18 ani pentru a vă înregistra.')).toBeInTheDocument();
    });
  });

  // Test pentru a verifica dacă codul de verificare este necesar dacă checkbox-ul este bifat
  test('should require verification code if checkbox is checked', async () => {
    fireEvent.click(screen.getByLabelText(/pozitie/i));
    fireEvent.click(screen.getByRole('button', { name: /înregistrare/i }));

    await waitFor(() => {
      expect(screen.getByText('Codul de verificare este necesar dacă caseta este bifată.')).toBeInTheDocument();
    });
  });

  // Test pentru a valida codul de verificare
  test('should validate verification code', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ Valoare: 'validcode', Pozitie_Cod: 'utilizator' }] });

    fireEvent.click(screen.getByLabelText(/pozitie/i));
    fireEvent.change(screen.getByLabelText(/cod de verificare/i), { target: { value: 'invalidcode' } });
    fireEvent.click(screen.getByRole('button', { name: /înregistrare/i }));

    await waitFor(() => {
      expect(screen.getByText('Codul de verificare este incorect.')).toBeInTheDocument();
    });
  });

  // Test pentru a verifica dacă modalul se închide când se face click pe butonul de închidere
  test('should close modal when close button is clicked', () => {
    fireEvent.click(screen.getByText('×'));
    expect(onCloseMock).toHaveBeenCalled();
  });
});
