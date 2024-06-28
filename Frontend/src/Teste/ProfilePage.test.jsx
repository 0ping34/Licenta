import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import ProfilPage from '../Pagini/ProfilPage';
import '@testing-library/jest-dom';

// Mock axios pentru a intercepta cererile HTTP
jest.mock('axios');

// Mock pentru window.alert și window.confirm
global.alert = jest.fn();
global.confirm = jest.fn(() => true); // Always confirm

// Date mock pentru detaliile utilizatorului
const mockUserDetails = {
  username: 'testuser',
  email: 'testuser@example.com',
  registrationDate: '2023-06-01T12:00:00Z'
};

// Date mock pentru statusul de confirmare al utilizatorului
const mockConfirmationStatus = {
  isConfirmed: false
};

// Funcție pentru a seta localStorage
const setUpLocalStorage = () => {
  localStorage.setItem('userId', '1');
  localStorage.setItem('username', 'testuser');
  localStorage.setItem('role', 'user');
};

// Test suite pentru componenta ProfilPage
describe('ProfilPage Component', () => {
  // Se rulează înainte de fiecare test pentru a reseta mock-urile și a configura localStorage și mock-ul axios
  beforeEach(() => {
    jest.clearAllMocks();
    setUpLocalStorage();
    axios.get.mockImplementation((url) => {
      switch (url) {
        case `https://localhost:8081/users/id/1`:
          return Promise.resolve({ data: mockUserDetails });
        case `https://localhost:8081/confirm-status/1`:
          return Promise.resolve({ data: mockConfirmationStatus });
        default:
          return Promise.reject(new Error('not found'));
      }
    });
  });

  // Funcție de ajutor pentru a reda componenta cu contextul necesar
  const renderComponent = () => {
    render(
      <Router>
        <ProfilPage
          setIsLoggedIn={jest.fn()}
          setLoggedInUsername={jest.fn()}
          setUserId={jest.fn()}
          setRole={jest.fn()}
        />
      </Router>
    );
  };

  // Test pentru a verifica dacă componenta este redată corect
  test('renders the component correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Profilul utilizatorului')).toBeInTheDocument();
      expect(screen.getByText(/Username:/i)).toBeInTheDocument();
      expect(screen.getByText(/Email:/i)).toBeInTheDocument();
      expect(screen.getByText(/Data înregistrării:/i)).toBeInTheDocument();
    });
  });

  // Test pentru a verifica dacă detaliile utilizatorului sunt afișate corect
  test('fetches and displays user details', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('testuser@example.com')).toBeInTheDocument();
      expect(screen.getByText(/Data înregistrării:/i)).toBeInTheDocument();
    });
  });

  // Test pentru a verifica dacă mesajul de confirmare și butonul de retrimitere sunt afișate dacă emailul nu este confirmat
  test('shows confirmation message and resend button if email is not confirmed', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Your email is not confirmed. Please check your email for the confirmation link.')).toBeInTheDocument();
      expect(screen.getByText('Resend Confirmation Email')).toBeInTheDocument();
    });
  });

  // Test pentru a verifica dacă emailul de confirmare este retrimis
  test('resends confirmation email', async () => {
    axios.post.mockResolvedValue({});

    renderComponent();

    await waitFor(() => {
      fireEvent.click(screen.getByText('Resend Confirmation Email'));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('https://localhost:8081/resend-confirmation-email', { userId: '1' });
      expect(global.alert).toHaveBeenCalledWith('Confirmation email resent successfully.');
    });
  });

  // Test pentru a verifica dacă profilul utilizatorului este șters
  test('deletes user profile', async () => {
    axios.delete.mockResolvedValue({});

    const setIsLoggedIn = jest.fn();
    const setLoggedInUsername = jest.fn();
    const setUserId = jest.fn();
    const setRole = jest.fn();

    render(
      <Router>
        <ProfilPage
          setIsLoggedIn={setIsLoggedIn}
          setLoggedInUsername={setLoggedInUsername}
          setUserId={setUserId}
          setRole={setRole}
        />
      </Router>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText('Delete Profile'));
    });

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete your profile? This action cannot be undone.');
      expect(global.confirm).toHaveBeenCalledWith('Are you absolutely sure?');
    });

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('https://localhost:8081/users/id/1');
      expect(setIsLoggedIn).toHaveBeenCalledWith(false);
      expect(setLoggedInUsername).toHaveBeenCalledWith('');
      expect(setUserId).toHaveBeenCalledWith(null);
      expect(setRole).toHaveBeenCalledWith('');
    });
  });
});
