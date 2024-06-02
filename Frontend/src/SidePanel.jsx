import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function SidePanel({ selectedInfo, onAddTicket, onDeleteTicket, onDeleteAllTickets, isLoggedIn, openLoginModal, userId }) {
  const [betAmounts, setBetAmounts] = useState({});
  const [profits, setProfits] = useState({});
  const [betInputs, setBetInputs] = useState({});
  const [totalBetAmount, setTotalBetAmount] = useState('');
  const [totalWinAmount, setTotalWinAmount] = useState(0);
  const [currency, setCurrency] = useState('RON');

  const navigate = useNavigate();

  useEffect(() => {
    let totalWin = 0;
    selectedInfo.forEach((info, index) => {
      const amount = betInputs[index] || 0;
      const total = amount * info.odds;
      totalWin += total;
    });
    setTotalWinAmount(totalWin);
  }, [betInputs, selectedInfo]);

  const handleAmountChange = (amount, index, odds) => {
    const total = amount * odds;
    setBetInputs(prevInputs => ({ ...prevInputs, [index]: amount }));
    setBetAmounts(prevAmounts => ({ ...prevAmounts, [index]: total }));
    setProfits(prevProfits => ({ ...prevProfits, [index]: total - amount }));

    setTotalBetAmount('');
  };

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);

    // Actualizează toate câmpurile de pariu cu noua monedă
    selectedInfo.forEach((info, index) => {
      info.currency = newCurrency; // Actualizează moneda în info
      handleAmountChange(betInputs[index], index, info.odds);
    });
  };

  const handleAddTicket = (info, index) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    const betAmount = betInputs[index];
    onAddTicket({ ...info, betAmount, currency });
    navigate('/payment', { state: { bets: [{ ...info, betAmount, currency }], userId } });  // Redirecționare la pagina de plată cu datele biletului și userId
  };

  const handleAddAllTickets = () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    const bets = selectedInfo.map((info, index) => ({
      ...info,
      betAmount: betInputs[index],
      currency
    }));
    navigate('/payment', { state: { bets, userId } });  // Redirecționare la pagina de plată cu toate biletele și userId
  };

  const handleDeleteTicket = (index) => {
    onDeleteTicket(index);

    setBetInputs(prevInputs => {
      const newInputs = Object.fromEntries(
        Object.entries(prevInputs)
          .filter(([key]) => key !== String(index))
          .map(([key, value]) => [key > index ? key - 1 : key, value])
      );
      return newInputs;
    });

    setBetAmounts(prevAmounts => {
      const newAmounts = Object.fromEntries(
        Object.entries(prevAmounts)
          .filter(([key]) => key !== String(index))
          .map(([key, value]) => [key > index ? key - 1 : key, value])
      );
      return newAmounts;
    });

    setProfits(prevProfits => {
      const newProfits = Object.fromEntries(
        Object.entries(prevProfits)
          .filter(([key]) => key !== String(index))
          .map(([key, value]) => [key > index ? key - 1 : key, value])
      );
      return newProfits;
    });

    setTotalBetAmount('');
    setTotalWinAmount(0);
  };

  const handleDeleteAllTickets = () => {
    onDeleteAllTickets();
    setBetInputs({});
    setBetAmounts({});
    setProfits({});
    setTotalBetAmount('');
    setTotalWinAmount(0);
  };

  const handleTotalBetAmountChange = (e) => {
    const amount = e.target.value;
    setTotalBetAmount(amount);

    let totalWin = 0;
    selectedInfo.forEach((info, index) => {
      const total = amount * info.odds;
      totalWin += total;
      setBetInputs(prevInputs => ({ ...prevInputs, [index]: amount }));
      setBetAmounts(prevAmounts => ({ ...prevAmounts, [index]: total }));
      setProfits(prevProfits => ({ ...prevProfits, [index]: total - amount }));
    });

    setTotalWinAmount(totalWin);
  };

  return (
    <div className="side-panel">
      <h3 className="side-panel-title">BILETE</h3>
      {selectedInfo.length > 0 && (
        <div className="total-bet-section">
          <div className="bet-input-group">
            <input
              type="number"
              onChange={handleTotalBetAmountChange}
              placeholder={`Suma Totală ${currency}`}
              value={totalBetAmount}
              className="total-bet-input"
              min="0"
              step="0.01"
            />
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="currency-select"
            >
              <option value="RON">RON</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <input
            type="text"
            placeholder={`Câștig Total ${currency}`}
            value={totalWinAmount ? `Total: ${totalWinAmount.toFixed(2)}` : ''}
            readOnly
            className="total-display"
          />
          <button onClick={handleAddAllTickets}>Adaugă toate biletele</button>
        </div>
      )}
      {selectedInfo.length > 0 ? (
        <>
          {selectedInfo.map((info, index) => (
            <div key={index} className="ticket-info">
              <h2>Detalii Meci: {info.description}</h2>
              <p>Opțiune selectată: {info.betKey} cu cota {info.odds}</p>
              <div className="bet-details">
                <div className="bet-input-group">
                  <input
                    type="number"
                    onChange={(e) => handleAmountChange(e.target.value, index, info.odds)}
                    placeholder={`Suma ${currency}`}
                    value={betInputs[index] ? betInputs[index] : ''}  // Resetare input
                    className="bet-input"
                    min="0"
                    step="0.01"
                  />
                  <select
                    value={currency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="currency-select"
                  >
                    <option value="RON">RON</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder={`Câștig ${currency}`}
                  value={betAmounts[index] ? `Total: ${betAmounts[index].toFixed(2)}` : ''}
                  readOnly
                  className="total-display"
                />
              </div>
              <button onClick={() => handleAddTicket(info, index)}>Adaugă bilet</button>
              <button onClick={() => handleDeleteTicket(index)}>Șterge bilet</button>
            </div>
          ))}
        </>
      ) : (
        <p>Nici o selecție.</p>
      )}
      <button className="delete-all-button" onClick={handleDeleteAllTickets} style={{ marginTop: 'auto' }}>
        Șterge toate biletele
      </button>
    </div>
  );
}

export default SidePanel;
