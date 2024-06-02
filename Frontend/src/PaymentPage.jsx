import React from 'react';
import { useLocation } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe('pk_test_51PMY0wRoEATKtgjwWbw1M5Hb8hONzeNUDtDA2gpURtMHU6OEcjRkcFkBhCAKnYrVBG7x8wGp9A3HEMLXILCqCEv2002hftG8Hi');

const PaymentPage = () => {
  const location = useLocation();
  const { bets, userId } = location.state || { bets: [], userId: null };

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm bets={bets} userId={userId} />
    </Elements>
  );
};

export default PaymentPage;
