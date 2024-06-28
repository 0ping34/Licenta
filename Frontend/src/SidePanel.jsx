import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function SidePanel({ selectedInfo, onDeleteTicket, onDeleteAllTickets, isLoggedIn, openLoginModal, userId }) {
  const [betAmounts, setBetAmounts] = useState({});
  const [profits, setProfits] = useState({});
  const [betInputs, setBetInputs] = useState({});
  const [totalBetAmount, setTotalBetAmount] = useState('');
  const [totalWinAmount, setTotalWinAmount] = useState(0);
  const [currency, setCurrency] = useState('RON');
  const [isCombinedBet, setIsCombinedBet] = useState(false);
  const [canCombineBets, setCanCombineBets] = useState(false);

  const navigate = useNavigate();

  // Recalculează suma totală a câștigurilor și verifică dacă pariurile pot fi combinate de fiecare dată când se schimbă selecțiile sau sumele pariurilor
  useEffect(() => {
    let totalWin = 0;
    selectedInfo.forEach((info, index) => {
      const amount = betInputs[index] || 0;
      const total = amount * info.odds;
      totalWin += total;
    });
    setTotalWinAmount(totalWin);
    checkCombineBetsCondition();
  }, [betInputs, selectedInfo]);

  // Gestionează schimbarea sumei unui pariu
  const handleAmountChange = (amount, index, odds) => {
    const total = amount * odds;
    setBetInputs(prevInputs => ({ ...prevInputs, [index]: amount }));
    setBetAmounts(prevAmounts => ({ ...prevAmounts, [index]: total }));
    setProfits(prevProfits => ({ ...prevProfits, [index]: total - amount }));

    setTotalBetAmount('');
  };

  // Gestionează schimbarea monedei și recalculează sumele și câștigurile pentru fiecare pariu
  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);

    selectedInfo.forEach((info, index) => {
      info.currency = newCurrency;
      handleAmountChange(betInputs[index], index, info.odds);
    });
  };

  // Gestionează adăugarea unui bilet individual
  const handleAddTicket = (info, index) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    const betAmount = betInputs[index];
    const role = localStorage.getItem('role');
    const targetPath = role === 'angajat' ? '/payment2' : '/payment';
    navigate(targetPath, { state: { bets: [{ ...info, betAmount, currency }], userId, isCombinedBet: false } });
  };

  // Gestionează adăugarea tuturor biletelor
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
    const role = localStorage.getItem('role');
    const targetPath = role === 'angajat' ? '/payment2' : '/payment';
    navigate(targetPath, { state: { bets, userId, isCombinedBet } });
  };

  // Gestionează ștergerea unui bilet individual și actualizează sumele și câștigurile
  const handleDeleteTicket = (index) => {
    const betToRemove = selectedInfo[index];
    onDeleteTicket(index, betToRemove.category);

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
    checkCombineBetsCondition();
  };

  // Gestionează ștergerea tuturor biletelor
  const handleDeleteAllTickets = () => {
    onDeleteAllTickets();
    setBetInputs({});
    setBetAmounts({});
    setProfits({});
    setTotalBetAmount('');
    setTotalWinAmount(0);
    setCanCombineBets(false);
  };

  // Gestionează schimbarea sumei totale a pariurilor și actualizează sumele și câștigurile pentru fiecare pariu
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

  // Calculează cota combinată pentru toate pariurile selectate
  const calculateCombinedOdds = () => {
    return selectedInfo.reduce((totalOdds, info) => totalOdds * info.odds, 1);
  };

  // Gestionează comutarea stării de pariu combinat și recalculează suma câștigurilor
  const handleCombinedBetToggle = () => {
    setIsCombinedBet(!isCombinedBet);
    if (!isCombinedBet) {
      const combinedOdds = calculateCombinedOdds();
      let combinedWin = 0;
      selectedInfo.forEach((info, index) => {
        const amount = betInputs[index] || 0;
        const total = amount * combinedOdds;
        combinedWin += total;
      });
      setTotalWinAmount(combinedWin);
    } else {
      let totalWin = 0;
      selectedInfo.forEach((info, index) => {
        const amount = betInputs[index] || 0;
        const total = amount * info.odds;
        totalWin += total;
      });
      setTotalWinAmount(totalWin);
    }
  };

  // Verifică dacă pariurile pot fi combinate
  const checkCombineBetsCondition = () => {
    const categoryMap = new Map();

    selectedInfo.forEach(info => {
      if (!categoryMap.has(info.category)) {
        categoryMap.set(info.category, new Set());
      }
      categoryMap.get(info.category).add(info.ID);
    });

    let canCombine = true;
    categoryMap.forEach((matchIds, category) => {
      if (matchIds.size !== selectedInfo.filter(info => info.category === category).length) {
        canCombine = false;
      }
    });

    setCanCombineBets(selectedInfo.length > 1 && canCombine);
  };

  return (
    <div className="side-panel">
      <h3 className="side-panel-title">BILETE</h3>
      <button className="delete-all-button" onClick={handleDeleteAllTickets}>
        Șterge toate biletele
      </button>
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
          {canCombineBets && (
            <label className="combined-bet-toggle">
              <input
                type="checkbox"
                checked={isCombinedBet}
                onChange={handleCombinedBetToggle}
              />
              Pariază combinat
            </label>
          )}
        </div>
      )}
      {selectedInfo.length > 0 ? (
        <>
          {selectedInfo.map((info, index) => (
            <div key={index} className="ticket-info">
              <h2>Detalii Meci: {info.description}</h2>
              <p>Opțiune selectată: {info.category} - {info.betKey} cu cota {info.odds}</p>
              <div className="bet-details">
                <div className="bet-input-group">
                  <input
                    type="number"
                    onChange={(e) => handleAmountChange(e.target.value, index, info.odds)}
                    placeholder={`Suma ${currency}`}
                    value={betInputs[index] ? betInputs[index] : ''}
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
    </div>
  );
}

export default SidePanel;
