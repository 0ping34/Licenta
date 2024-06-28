import React from 'react';
import { render, screen } from '@testing-library/react';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { BrowserRouter as Router } from 'react-router-dom';
import CheckoutForm from '../Pariere/CheckoutForm';
import '@testing-library/jest-dom';

// Mock axios
jest.mock('axios');

// Mock useNavigate hook
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Mock data for bets
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

// Helper function to render the component with required context and props
const renderComponent = (props) => {
  render(
    <Router>
      <PayPalScriptProvider options={{ "client-id": "test", currency: 'EUR' }}>
        <CheckoutForm {...props} />
      </PayPalScriptProvider>
    </Router>
  );
};

// Test suite for CheckoutForm component
describe('CheckoutForm Component', () => {
  // Clear all mocks and set localStorage before each test
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('userId', '1');
  });

  // Test to check if the component renders correctly
  test('renders the component correctly', () => {
    renderComponent({ bets: mockBets, isCombinedBet: false });

    // Assertions to check if various elements are rendered correctly
    expect(screen.getByText('CHECKOUT')).toBeInTheDocument();
    expect(screen.getByText('Detalii Pariuri')).toBeInTheDocument();
    expect(screen.getByText('Team A vs Team B')).toBeInTheDocument();
    expect(screen.getByText('Total de plată: 300.00 RON')).toBeInTheDocument();
  });
});
