import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useNavigate } from 'react-router-dom';
import SidePanel from '../SidePanel';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock data for selected tickets
const mockSelectedInfo = [
  { ID: '1', description: 'Team A vs Team B', betKey: '1', odds: 1.5, category: 'Rezultat Final' },
  { ID: '2', description: 'Team C vs Team D', betKey: '2', odds: 2.0, category: 'Rezultat Final' },
];

// Test suite for SidePanel component
describe('SidePanel Component', () => {
  const mockOnDeleteTicket = jest.fn();
  const mockOnDeleteAllTickets = jest.fn();
  const mockOpenLoginModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // Helper function to render the component with the necessary props
  const renderComponent = (isLoggedIn) => {
    render(
      <Router>
        <SidePanel
          selectedInfo={mockSelectedInfo}
          onDeleteTicket={mockOnDeleteTicket}
          onDeleteAllTickets={mockOnDeleteAllTickets}
          isLoggedIn={isLoggedIn}
          openLoginModal={mockOpenLoginModal}
          userId="1"
        />
      </Router>
    );
  };

  // Test to check if the component renders correctly
  test('renders the component correctly', () => {
    renderComponent(true);
    expect(screen.getByText('BILETE')).toBeInTheDocument();
  });

  // Test to check if the selected tickets are displayed
  test('displays selected tickets', () => {
    renderComponent(true);
    expect(screen.getByText('Detalii Meci: Team A vs Team B')).toBeInTheDocument();
    expect(screen.getByText('Detalii Meci: Team C vs Team D')).toBeInTheDocument();
  });

  // Test to check if the bet amount changes correctly
  test('handles bet amount change', () => {
    renderComponent(true);
    fireEvent.change(screen.getAllByPlaceholderText(/Suma RON/)[0], { target: { value: '10' } });
    expect(screen.getAllByPlaceholderText(/Câștig RON/)[0].value).toBe('Total: 15.00');
  });

  // Test to check if a ticket is deleted correctly
  test('deletes a ticket', () => {
    renderComponent(true);
    fireEvent.click(screen.getAllByText('Șterge bilet')[0]);
    expect(mockOnDeleteTicket).toHaveBeenCalledWith(0, 'Rezultat Final');
  });

  // Test to check if all tickets are deleted correctly
  test('deletes all tickets', () => {
    renderComponent(true);
    fireEvent.click(screen.getByText('Șterge toate biletele'));
    expect(mockOnDeleteAllTickets).toHaveBeenCalled();
  });

  // Test to check if the currency changes correctly
  test('changes currency', () => {
    renderComponent(true);
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'USD' } });
    expect(screen.getAllByRole('combobox')[0].value).toBe('USD');
  });

  // Test to check if the combined bet toggle works correctly
  test('handles combined bet toggle', () => {
    renderComponent(true);
    fireEvent.click(screen.getByLabelText('Pariază combinat'));
    expect(screen.getByLabelText('Pariază combinat').checked).toBe(true);
  });

  // Test to check if the login modal opens if the user is not logged in
  test('opens login modal if user is not logged in', () => {
    renderComponent(false);
    fireEvent.click(screen.getAllByText('Adaugă bilet')[0]);
    expect(mockOpenLoginModal).toHaveBeenCalled();
  });

  // Test to check if the correct payment page is opened based on user role
  test('redirects to correct payment page', async () => {
    localStorage.setItem('role', 'angajat');
    renderComponent(true);
    fireEvent.click(screen.getAllByText('Adaugă bilet')[0]);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/payment2', expect.anything()));

    localStorage.setItem('role', 'user');
    renderComponent(true);
    fireEvent.click(screen.getAllByText('Adaugă bilet')[0]);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/payment', expect.anything()));
  });
});
