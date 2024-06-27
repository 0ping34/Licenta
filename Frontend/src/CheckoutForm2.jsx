import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CheckoutForm.css';

const CheckoutForm2 = ({ bets, isCombinedBet }) => {
  const navigate = useNavigate();
  const [totalAmount, setTotalAmount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [formData, setFormData] = useState({
    nume: '',
    email: '',
    adresa: '',
    oras: '',
    codPostal: '',
  });

  useEffect(() => {
    const amount = bets.reduce((sum, bet) => sum + parseFloat(bet.betAmount || 0), 0);
    setTotalAmount(amount);
  }, [bets]);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setError('User ID not found. Please log in again.');
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://localhost:8081/add-ticket2', {
        description: bets.map(bet => bet.description).join(', '),
        betKey: bets.map(bet => bet.betKey).join(', '),
        odds: bets.map(bet => bet.odds).join(', '),
        ID: bets.map(bet => bet.ID).join(', '),
        category: bets.map(bet => bet.category).join(', '),
        betAmounts: bets.map(bet => bet.betAmount).join(', '),
        totalAmount,
        userId,
        currency: bets[0]?.currency || 'RON',
        ...formData,
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

  return (
    <div className="checkout-page">
      <button className="back-button" onClick={() => { navigate('/'); window.location.reload(false); }}>Back</button>
      <div className="checkout-form-container">
        <h1 className="checkout-title">CHECKOUT</h1>
        <form id="payment-form" className="checkout-form" onSubmit={handleSubmit}>
          <h3>Detalii Pariuri</h3>
          <div className={`bet-details ${isCombinedBet ? 'combined-bet' : ''}`}>
            {isCombinedBet ? (
              <div className="bet-item combined-bet-item">
                <p><strong>Pariu combinat</strong></p>
                <p><strong>Meciuri și pariuri:</strong> {bets.map(bet => `${bet.description} (${bet.betKey} - ${bet.category})`).join(', ')}</p>
                <p><strong>Cote:</strong> {bets.map(bet => bet.odds).join(', ')}</p>
                <p><strong>Suma totală:</strong> {totalAmount.toFixed(2)} RON</p>
              </div>
            ) : (
              bets.map((bet, index) => (
                <div key={index} className="bet-item">
                  <p><strong>Meci:</strong> {bet.description}</p>
                  <p><strong>Pariu:</strong> {bet.betKey} <strong>Categorie:</strong> {bet.category} <strong>Cota:</strong> {bet.odds}</p>
                  <p><strong>Suma:</strong> {bet.betAmount} RON</p>
                </div>
              ))
            )}
          </div>
          <h4>Total de plată: {totalAmount.toFixed(2)} RON</h4>
          <h3>Detalii Facturare</h3>
          <div className="form-group">
            <label htmlFor="nume">Nume și Prenume:</label>
            <input type="text" id="nume" name="nume" value={formData.nume} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="adresa">Adresă:</label>
            <input type="text" id="adresa" name="adresa" value={formData.adresa} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="oras">Oraș:</label>
            <input type="text" id="oras" name="oras" value={formData.oras} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="codPostal">Cod Poștal:</label>
            <input type="text" id="codPostal" name="codPostal" value={formData.codPostal} onChange={handleChange} required />
          </div>
          <button type="submit">Trimite</button>
        </form>
        {error && <div className="card-error" role="alert">{error}</div>}
        {succeeded && (
          <div className="result-message">
            Tranzacția a fost realizată cu succes. Veți fi redirecționat în 3 secunde...
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutForm2;
