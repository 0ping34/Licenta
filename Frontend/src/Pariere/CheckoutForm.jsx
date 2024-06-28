import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CheckoutForm.css';

// Custom hook to load PayPal script
const usePayPalScript = (clientId, currency) => {
  const [isScriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const scriptId = 'paypal-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }

    return () => {
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [clientId, currency]);

  return isScriptLoaded;
};

const CheckoutForm = ({ bets, isCombinedBet }) => {
  const navigate = useNavigate();
  const clientId = "AVN_WZSTCjPLhRR37HbfsNhTDcjbUUpQPeJGt4x5oRkm-JUyXJc2hjOmLdY3iaVIy7nEJyQSPBxAs1Tn";
  const currency = bets[0]?.currency || 'USD';
  const isScriptLoaded = usePayPalScript(clientId, 'EUR');
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [userId, setUserId] = useState(null);

  const EXCHANGE_RATE_RON_TO_EUR = 4.98;

  // Calculate total amount from bets
  useEffect(() => {
    const amount = bets.reduce((sum, bet) => sum + parseFloat(bet.betAmount || 0), 0);
    setTotalAmount(amount);
  }, [bets]);

  // Get user ID from localStorage and set error if not found
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setError('User ID not found. Please log in again.');
      navigate('/');
    }
  }, [navigate]);

  // Handle successful payment approval
  const handleApprove = async (orderId) => {
    try {
      await axios.post('https://localhost:8081/add-ticket', {
        description: bets.map(bet => bet.description).join(', '),
        betKey: bets.map(bet => bet.betKey).join(', '),
        odds: bets.map(bet => bet.odds).join(', '),
        ID: bets.map(bet => bet.ID).join(', '),
        category: bets.map(bet => bet.category).join(', '),
        betAmounts: bets.map(bet => bet.betAmount).join(', '),
        totalAmount,
        userId,
        currency,
        orderId,
        isCombinedBet
      });

      setError(null);
      setSucceeded(true);

      setTimeout(() => {
        navigate('/');
        window.location.reload(false);
      }, 3000);
    } catch (error) {
      setError(`Failed to save bet: ${error.message}`);
    }
  };

  // Convert amount if currency is RON
  const convertedAmount = currency === 'RON' ? (totalAmount / EXCHANGE_RATE_RON_TO_EUR).toFixed(2) : totalAmount.toFixed(2);

  return (
    <div className="checkout-page">
      <button className="back-button" onClick={() => { navigate('/'); window.location.reload(false); }}>Back</button>
      <div className="checkout-form-container">
        <h1 className="checkout-title">CHECKOUT</h1>
        <form id="payment-form" className="checkout-form">
          <h3>Detalii Pariuri</h3>
          <div className={`bet-details ${isCombinedBet ? 'combined-bet' : ''}`}>
            {isCombinedBet ? (
              <div className="bet-item combined-bet-item">
                <p><strong>Pariu combinat</strong></p>
                <p><strong>Meciuri și pariuri:</strong> {bets.map(bet => `${bet.description} (${bet.betKey} - ${bet.category})`).join(', ')}</p>
                <p><strong>Cote:</strong> {bets.map(bet => bet.odds).join(', ')}</p>
                <p><strong>Suma totală:</strong> {totalAmount.toFixed(2)} {currency}</p>
              </div>
            ) : (
              bets.map((bet, index) => (
                <div key={index} className="bet-item">
                  <p><strong>Meci:</strong> {bet.description}</p>
                  <p><strong>Pariu:</strong> {bet.betKey} <strong>Categorie:</strong> {bet.category} <strong>Cota:</strong> {bet.odds}</p>
                  <p><strong>Suma:</strong> {bet.betAmount} {bet.currency}</p>
                </div>
              ))
            )}
          </div>
          <h4>Total de plată: {totalAmount.toFixed(2)} {currency}</h4>
        </form>
        {error && <div className="card-error" role="alert">{error}</div>}
        {succeeded && <div className="result-message">Payment succeeded</div>}

        {isScriptLoaded ? (
          <PayPalScriptProvider options={{ "client-id": clientId, currency: 'EUR' }}>
            <PayPalButtons
              style={{ layout: "vertical" }}
              createOrder={(data, actions) => {
                if (totalAmount <= 0) {
                  setError('Total amount must be greater than zero.');
                  return;
                }
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: convertedAmount,
                      currency_code: 'EUR'
                    }
                  }]
                });
              }}
              onApprove={(data, actions) => {
                return actions.order.capture().then(details => {
                  handleApprove(details.id);
                });
              }}
              onError={(err) => {
                setError(`Payment failed ${err.message}`);
              }}
            />
          </PayPalScriptProvider>
        ) : (
          <div>Loading PayPal buttons...</div>
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;
