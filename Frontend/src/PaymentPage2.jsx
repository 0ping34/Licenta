import React from 'react';
import { useLocation } from 'react-router-dom';
import CheckoutForm2 from './CheckoutForm2';

const PaymentPage2 = () => {
  const location = useLocation();
  const { bets, userId, isCombinedBet } = location.state || { bets: [], userId: null, isCombinedBet: false };

  return (
    <div>
      <CheckoutForm2 bets={bets} userId={userId} isCombinedBet={isCombinedBet} />
    </div>
  );
};

export default PaymentPage2;
