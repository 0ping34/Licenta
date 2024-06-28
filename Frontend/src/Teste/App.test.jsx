import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axiosInstance from '../axiosConfig';
import App from '../App';

// Mock axios instance
jest.mock('../axiosConfig');

// Mock jsPDF library
jest.mock('jspdf', () => {
  const jsPDF = jest.fn(() => ({
    text: jest.fn(),
    save: jest.fn(),
    autoTable: jest.fn(),
    addImage: jest.fn(),
  }));
  return jsPDF;
});

describe('App Component', () => {
  // Before each test, clear all mocks and localStorage
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // Mock axios GET requests
    axiosInstance.get.mockImplementation((url) => {
      switch (url) {
        case 'https://localhost:8081/events':
          return Promise.resolve({ data: [] });
        case 'https://localhost:8081/':
          return Promise.resolve({ data: { message: 'Connected' } });
        default:
          return Promise.reject(new Error('not found'));
      }
    });
  });

  // Test for logging out the user
  test('logs out the user', async () => {
    // Set initial localStorage values
    localStorage.setItem('authToken', 'fake-token');
    localStorage.setItem('username', 'testuser');
    localStorage.setItem('role', 'user');

    // Suppress console error output
    const consoleError = console.error;
    console.error = jest.fn();

    // Render the App component
    render(<App />);

    // Wait for the welcome message to be displayed
    await waitFor(() => {
      expect(screen.getByText((content, element) => content.includes('Welcome, testuser!'))).toBeInTheDocument();
    });

    // Click the "Log out" button
    fireEvent.click(screen.getByText('Log out'));

    // Wait for the "Log in" and "Register" buttons to be displayed
    await waitFor(() => {
      expect(screen.getByText('Log in')).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    // Check that localStorage values have been cleared
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();

    // Restore console error output
    console.error = consoleError;
  });
});
