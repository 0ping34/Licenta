import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginModal from '../LoginModal';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import 'whatwg-fetch'; // Add this line to polyfill fetch API in the testing environment
jest.mock('axios'); // Mock axios pentru a intercepta cererile HTTP

// Test suite pentru componenta LoginModal
describe('LoginModal Component', () => {
  // Mocks pentru funcțiile de callback
  const onCloseMock = jest.fn();
  const onLoginSuccessMock = jest.fn();
  const onLogoutMock = jest.fn();

  // Se rulează înainte de fiecare test pentru a reseta mock-urile și a configura localStorage
  beforeEach(() => {
    onCloseMock.mockClear();
    onLoginSuccessMock.mockClear();
    onLogoutMock.mockClear();
    localStorage.clear(); // Curăță localStorage înainte de fiecare test
    render(
      <MemoryRouter>
        <LoginModal
          isOpen={true}
          onClose={onCloseMock}
          onLoginSuccess={onLoginSuccessMock}
          onLogout={onLogoutMock}
        />
      </MemoryRouter>
    );
  });

  // Test pentru a verifica dacă formularul de autentificare este afișat corect
  test('should display login form', () => {
    expect(screen.getByRole('heading', { name: /autentificare/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /autentificare/i })).toBeInTheDocument();
  });

  // Test pentru a verifica dacă autentificarea se realizează cu succes
  test('should handle login successfully', async () => {
    // Simulează răspunsul pozitiv de la server pentru autentificare
    axios.post.mockResolvedValue({
      status: 200,
      data: {
        userId: 1,
        username: 'testuser',
        role: 'user',
        token: 'mockToken'
      }
    });

    // Simulează completarea câmpurilor de email și parolă și click pe butonul de autentificare
    fireEvent.change(screen.getByLabelText(/adresă de email/i), {
      target: { value: 'testuser@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/parolă/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /autentificare/i }));

    // Așteaptă finalizarea operațiunii asincrone
    await waitFor(() => {
      expect(onLoginSuccessMock).toHaveBeenCalledWith('testuser', 1, 'user');
      expect(onCloseMock).toHaveBeenCalled();
    });

    // Verifică dacă datele de autentificare sunt stocate corect în localStorage
    expect(localStorage.getItem('authToken')).toBe('mockToken');
    expect(localStorage.getItem('UserID')).toBe('1');
    expect(localStorage.getItem('username')).toBe('testuser');
    expect(localStorage.getItem('role')).toBe('user');
  });

  // Test pentru a verifica dacă eroarea de autentificare este tratată corect
  test('should handle login error', async () => {
    // Simulează răspunsul negativ de la server pentru autentificare
    axios.post.mockRejectedValue({
      response: {
        status: 401,
        data: {
          message: 'Invalid credentials'
        }
      }
    });

    // Simulează completarea câmpurilor de email și parolă greșite și click pe butonul de autentificare
    fireEvent.change(screen.getByLabelText(/adresă de email/i), {
      target: { value: 'wronguser@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/parolă/i), {
      target: { value: 'wrongpassword' }
    });

    fireEvent.click(screen.getByRole('button', { name: /autentificare/i }));

    // Așteaptă finalizarea operațiunii asincrone
    await waitFor(() => {
      expect(screen.getByText('A apărut o eroare la trimiterea cererii. Vă rugăm să încercați din nou.')).toBeInTheDocument();
    });

    // Verifică dacă datele de autentificare nu sunt stocate în localStorage
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('UserID')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
  });

  // Test pentru a verifica dacă modalul se închide când se face click pe butonul de închidere
  test('should close modal when close button is clicked', () => {
    fireEvent.click(screen.getByText('×'));
    expect(onCloseMock).toHaveBeenCalled();
  });
});
