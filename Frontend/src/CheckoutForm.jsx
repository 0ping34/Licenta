import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CheckoutForm.css';

const CheckoutForm = ({ bets, userId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [currency, setCurrency] = useState(bets[0]?.currency || 'usd');

  useEffect(() => {
    const amount = bets.reduce((sum, bet) => sum + bet.betAmount * 100, 0); // Amount in cents
    setTotalAmount(amount / 100); // Setați suma totală în dolari/euro/etc.

    axios.post('https://localhost:8081/create-payment-intent', {
      amount,
      currency
    }).then((result) => {
      if (result.data.clientSecret) {
        setClientSecret(result.data.clientSecret);
        console.log('Client Secret:', result.data.clientSecret); // Log clientSecret pentru a verifica valoarea
      } else {
        console.error('Client Secret is missing in the response.');
      }
    }).catch((error) => {
      console.error('Error creating PaymentIntent:', error);
    });
  }, [bets, currency]);

  const handleChange = async (event) => {
    setDisabled(event.empty);
    setError(event.error ? event.error.message : '');
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setProcessing(true);

    if (!clientSecret) {
      setError('Client secret is not available.');
      setProcessing(false);
      return;
    }

    if (!/^[A-Z][a-z]*([ ][A-Z][a-z]*)*$/.test(name)) {
      setError('Name must start with a capital letter and each word must start with a capital letter.');
      setProcessing(false);
      return;
    }

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name,
          email,
          address: {
            line1: address,
            city,
            postal_code: postalCode,
          },
        },
      }
    });

    if (payload.error) {
      setError(`Payment failed ${payload.error.message}`);
      setProcessing(false);
    } else {
      try {
        await axios.post('https://localhost:8081/add-ticket', {
          description: bets.map(bet => bet.description).join(', '),
          betKey: bets.map(bet => bet.betKey).join(', '),
          odds: bets.map(bet => bet.odds).join(', '),
          ID: bets.map(bet => bet.ID).join(', '),
          betAmount: totalAmount,
          userId,
          currency,
          name,
          email,
          address,
          city,
          postalCode
        });

        setError(null);
        setProcessing(false);
        setSucceeded(true);

        // Adaugă întârzierea înainte de redirecționare
        setTimeout(() => {
          navigate('/');
        }, 3000); // Întârziere de 3 secunde
      } catch (error) {
        setError(`Failed to save bet: ${error.message}`);
        setProcessing(false);
      }
    }
  };

  return (
    <div className="checkout-page">
      <button className="back-button" onClick={() => navigate('/')}>Back</button>
      <div className="checkout-form-container">
        <h1 className="checkout-title">CHECKOUT</h1>
        <form id="payment-form" onSubmit={handleSubmit} className="checkout-form">
          <h3>Detalii Pariuri</h3>
          <div className="bet-details">
            {bets.map((bet, index) => (
              <div key={index} className="bet-item">
                <p><strong>Meci:</strong> {bet.description}</p>
                <p><strong>Pariu:</strong> {bet.betKey} <strong>Cota:</strong> {bet.odds}</p>
                <p><strong>Suma:</strong> {bet.betAmount} {bet.currency}</p>
              </div>
            ))}
          </div>
          <h4>Total de plată: {totalAmount.toFixed(2)} {currency}</h4>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Postal Code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
          />
          <CardElement id="card-element" onChange={handleChange} />
          <button disabled={processing || disabled || succeeded} id="submit">
            <span id="button-text">
              {processing ? <div className="spinner" id="spinner"></div> : 'Pay'}
            </span>
          </button>
          {error && <div className="card-error" role="alert">{error}</div>}
          {succeeded && <div className="result-message">Payment succeeded</div>}
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
