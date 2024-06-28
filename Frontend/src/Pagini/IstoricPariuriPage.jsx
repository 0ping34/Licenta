import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import './IstoricPariuriPage.css';

function IstoricPariuriPage() {
  // State variables to manage the bet history, match history, current events, and various UI elements
  const location = useLocation();
  const [betHistory, setBetHistory] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [counter, setCounter] = useState(0);
  const [currency, setCurrency] = useState('');
  const [processingPayout, setProcessingPayout] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role'); // Get the user's role from localStorage
  const navigate = useNavigate();

  // Fetch data when the component mounts
  useEffect(() => {
    if (username) {
      // Fetch bet history for the user
      axios.get(`https://localhost:8081/users/${username}/bets`)
        .then(response => {
          setBetHistory(response.data);
        })
        .catch(error => console.error('Error fetching bet history:', error));

      // Fetch match history
      axios.get('https://localhost:8081/match-history')
        .then(response => {
          setMatchHistory(response.data);
        })
        .catch(error => console.error('Error fetching match history:', error));

      // Fetch current events
      axios.get('https://localhost:8081/events')
        .then(response => {
          setCurrentEvents(response.data);
        })
        .catch(error => console.error('Error fetching current events:', error));

      // Fetch user's counter and currency
      axios.get(`https://localhost:8081/counter/${userId}`)
        .then(response => {
          setCounter(response.data.Counter);
          setCurrency(response.data.Currency);
        })
        .catch(error => console.error('Error fetching counter:', error));
    }
  }, [username, userId]);

  // Function to update the counter
  const updateCounter = async () => {
    try {
      const response = await axios.get(`https://localhost:8081/counter/${userId}`);
      setCounter(response.data.Counter);
      setCurrency(response.data.Currency);
      console.log(response.data);
    } catch (error) {
      console.error('Error updating counter:', error);
    }
  };

  // Function to handle payout of a bet
  const handlePayout = (bet) => {
    setProcessingPayout(true);

    const payoutAmount = bet.Suma * bet.Cota;
    const endpoint = role === 'angajat' ? 'https://localhost:8081/withdraw2' : 'https://localhost:8081/withdraw';
    
    axios.post(endpoint, {
      betId: bet.ID_Pariu,
      userId: bet.ID_Utilizator,
      amount: payoutAmount,
      currency: bet.Moneda
    })
    .then(response => {
      console.log('Payout successful:', response.data);
      alert('Payout successful');
      updateBetCollectionStatus(bet.ID_Pariu);
      updateCounter();  // Update counter after successful payout
    })
    .catch(error => {
      console.error('Error processing payout:', error.response ? error.response.data : error.message);
      alert('Error processing payout');
    })
    .finally(() => {
      setProcessingPayout(false);
    });
  };

  // Function to handle refund of a bet
  const handleRefund = (bet) => {
    setProcessingRefund(true);

    const endpoint = role === 'angajat' ? 'https://localhost:8081/refund2' : 'https://localhost:8081/refund';

    axios.post(endpoint, {
      betId: bet.ID_Pariu,
      userId: bet.ID_Utilizator,
      amount: bet.Suma,
      currency: bet.Moneda
    })
    .then(response => {
      console.log('Refund successful:', response.data);
      alert('Refund successful');
      setBetHistory(prevHistory =>
        prevHistory.filter(b => b.ID_Pariu !== bet.ID_Pariu)
      );
    })
    .catch(error => {
      console.error('Error processing refund:', error.response ? error.response.data : error.message);
      alert('Error processing refund');
    })
    .finally(() => {
      setProcessingRefund(false);
    });
  };

  // Function to handle deletion of a bet
  const handleDelete = (betId, transactionId) => {
    axios.delete(`https://localhost:8081/delete-bet/${betId}/${transactionId}`)
      .then(response => {
        console.log('Bet and transaction deleted:', response.data);
        setBetHistory(prevHistory =>
          prevHistory.filter(bet => bet.ID_Pariu !== betId)
        );
      })
      .catch(error => {
        console.error('Error deleting bet and transaction:', error.response ? error.response.data : error.message);
        alert('Error deleting bet and transaction');
      });
  };

  // Function to update the collection status of a bet
  const updateBetCollectionStatus = (betId) => {
    axios.patch(`https://localhost:8081/bets/${betId}/collect`)
      .then(response => {
        console.log('Bet collection status updated:', response.data);
        setBetHistory(prevHistory =>
          prevHistory.map(bet =>
            bet.ID_Pariu === betId ? { ...bet, Colectat: 1 } : bet
          )
        );
      })
      .catch(error => {
        console.error('Error updating bet collection status:', error.response ? error.response.data : error.message);
        alert('Error updating bet collection status');
      });
  };

  // Function to check if a bet is a winning bet
  const isWinningBet = (bet) => {
    const match = matchHistory.find(match => {
      const winningOptions = JSON.parse(match.Optiuni_Castigatoare);
      return match.ID_Eveniment === bet.ID_Eveniment && winningOptions[bet.Categorie] && winningOptions[bet.Categorie][bet.Cheia_Selectata];
    });
    return match !== undefined;
  };

  // Function to check if a combined bet is a winning bet
  const isWinningCombinedBet = (betGroup) => {
    return betGroup.bets.every(bet => isWinningBet(bet));
  };

  // Function to check if a match has already played
  const hasMatchPlayed = (bet) => {
    const match = matchHistory.find(match => match.ID_Eveniment === bet.ID_Eveniment) ||
                  currentEvents.find(event => event.ID_Eveniment === bet.ID_Eveniment);
    return match ? moment(match.Data_Eveniment).isBefore(moment()) : false;
  };

  // Group bet history by transaction ID for combined bets
  const groupedBetHistory = betHistory.reduce((acc, bet) => {
    if (bet.Combinat === 1) {
      const transactionGroup = acc.find(group => group.ID_Tranzactie === bet.ID_Tranzactie && group.Combinat === 1);
      if (transactionGroup) {
        transactionGroup.bets.push(bet);
      } else {
        acc.push({ ...bet, bets: [bet] });
      }
    } else {
      acc.push({ ...bet, bets: [bet] });
    }
    return acc;
  }, []);

  // Filter bet history based on selected category and date range
  const filteredBetHistory = groupedBetHistory.filter(betGroup => {
    const betDate = new Date(betGroup.Data_Tranzactie);
    const isWithinDateRange = (!startDate || betDate >= new Date(startDate)) && (!endDate || betDate <= new Date(endDate));
    const isCategoryMatch = !selectedCategory || betGroup.bets.some(bet => bet.Categorie === selectedCategory);
    return isWithinDateRange && isCategoryMatch;
  });

  const uniqueCategories = [...new Set(betHistory.map(bet => bet.Categorie))];

  return (
    <div className="bet-history-container">
      <div className="header">
        <div className="buttons-container">
          <button className="back-button" onClick={() => { navigate('/'); window.location.reload(false); }}>Back</button>
          <Link to="/istoric" className="istoric-link">Istoric Meciuri</Link>
        </div>
        <div className="counter">
          <p><strong>Counter:</strong> {counter} {currency}</p>
        </div>
      </div>
      <h1>Istoric Pariuri</h1>
      <div className="filters2">
        <label>
          Categorie:
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Toate categoriile</option>
            {uniqueCategories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </label>
        <label>
          Data de început:
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          Data de sfârșit:
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>
      <div className="bet-history-list">
        {filteredBetHistory.length > 0 ? (
          <ul>
            {filteredBetHistory.map((betGroup, index) => (
              <li key={index}>
                <p><strong>Data Tranzacției:</strong> {new Date(betGroup.Data_Tranzactie).toLocaleString()}</p>
                <p><strong>Suma totală a tranzacției:</strong> {betGroup.Suma_Totala} {betGroup.Currency}</p>
                {betGroup.Combinat === 1 ? (
                  <div className="combined-bet">
                    <p><strong>Pariu combinat</strong></p>
                    {betGroup.bets.map((bet, idx) => (
                      <div key={idx} className="bet-item">
                        <p><strong>Meci:</strong> {bet.Descriere}</p>
                        <p><strong>Categorie:</strong> {bet.Categorie}</p>
                        <p><strong>Cheia Selectată:</strong> {bet.Cheia_Selectata}</p>
                        <p><strong>Cotă:</strong> {bet.Cota}</p>
                        <p><strong>Suma per meci:</strong> {bet.Suma} {bet.Moneda}</p>
                      </div>
                    ))}
                    <p><strong>Suma totală combinată:</strong> {betGroup.bets.reduce((sum, bet) => sum + parseFloat(bet.Suma), 0)} {betGroup.Currency}</p>
                    <p><strong>ID Tranzacție:</strong> {betGroup.ID_Tranzactie}</p>
                    {isWinningCombinedBet(betGroup) && betGroup.Colectat === 0 ? (
                      <button
                        className="payout-button"
                        onClick={() => handlePayout(betGroup)}
                        disabled={processingPayout}
                      >
                        Payout
                      </button>
                    ) : !hasMatchPlayed(betGroup) ? (
                      <button
                        className="refund-button"
                        onClick={() => handleRefund(betGroup)}
                        disabled={processingRefund}
                      >
                        Refund
                      </button>
                    ) : (
                      <>
                        {betGroup.Colectat === 1 ? (
                          <p className="collected-message">Bilet Colectat</p>
                        ) : (
                          <p className="lost-bet-message">Pariu necâștigător</p>
                        )}
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(betGroup.ID_Pariu, betGroup.ID_Tranzactie)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <p><strong>Meci:</strong> {betGroup.Descriere}</p>
                    <p><strong>Categorie:</strong> {betGroup.Categorie}</p>
                    <p><strong>Cheia Selectată:</strong> {betGroup.Cheia_Selectata}</p>
                    <p><strong>Cotă:</strong> {betGroup.Cota}</p>
                    <p><strong>Suma per meci:</strong> {betGroup.Suma} {betGroup.Moneda}</p>
                    <p><strong>ID Tranzacție:</strong> {betGroup.ID_Tranzactie}</p>
                    {isWinningBet(betGroup) && betGroup.Colectat === 0 ? (
                      <button
                        className="payout-button"
                        onClick={() => handlePayout(betGroup)}
                        disabled={processingPayout}
                      >
                        Payout
                      </button>
                    ) : !hasMatchPlayed(betGroup) ? (
                      <button
                        className="refund-button"
                        onClick={() => handleRefund(betGroup)}
                        disabled={processingRefund}
                      >
                        Refund
                      </button>
                    ) : (
                      <>
                        {betGroup.Colectat === 1 ? (
                          <p className="collected-message">Bilet Colectat</p>
                        ) : (
                          <p className="lost-bet-message">Pariu necâștigător</p>
                        )}
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(betGroup.ID_Pariu, betGroup.ID_Tranzactie)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nu există pariuri anterioare.</p>
        )}
      </div>
    </div>
  );
}

export default IstoricPariuriPage;
