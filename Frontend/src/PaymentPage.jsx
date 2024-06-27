import React from 'react';
import { useLocation } from 'react-router-dom';
import CheckoutForm from './CheckoutForm';

const PaymentPage = () => {
  const location = useLocation();
  const { bets, userId, isCombinedBet } = location.state || { bets: [], userId: null, isCombinedBet: false };

  return (
    <div>
      <CheckoutForm bets={bets} userId={userId} isCombinedBet={isCombinedBet} />
    </div>
  );
};

export default PaymentPage;
