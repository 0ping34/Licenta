import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './IstoricMeciuriPage.css';

function IstoricMeciuriPage() {
  const [matchHistory, setMatchHistory] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();
  const username = localStorage.getItem('username'); // Obține username-ul din localStorage

  useEffect(() => {
    axios.get('https://localhost:8081/match-history')
      .then(response => {
        setMatchHistory(response.data);
        setFilteredMatches(response.data); // Set initial filtered matches
        const uniqueEventTypes = [...new Set(response.data.map(match => match.Tip_Eveniment))];
        setEventTypes(uniqueEventTypes);
      })
      .catch(error => {
        console.error('Error fetching match history:', error);
      });

    if (username) {
      axios.get('https://localhost:8081/user-role', { params: { username } })
        .then(response => {
          setUserRole(response.data.role);
        })
        .catch(error => {
          console.error('Error fetching user role:', error);
        });
    }
  }, [username]);

  useEffect(() => {
    if (selectedEventType) {
      const matchesForEventType = matchHistory.filter(match => match.Tip_Eveniment === selectedEventType);
      const uniqueCategories = [...new Set(matchesForEventType.flatMap(match => {
        const options = JSON.parse(match.Optiuni_Castigatoare);
        return Object.keys(options);
      }))];
      setCategories(uniqueCategories);
    } else {
      setCategories([]);
      setSelectedCategory('');
    }
  }, [selectedEventType, matchHistory]);

  const handleDeleteMatch = (matchId) => {
    const confirmDelete = window.confirm('Ești sigur că vrei să ștergi acest meci?');
    if (confirmDelete) {
      axios.delete(`https://localhost:8081/match-history/${matchId}`)
        .then(() => {
          setMatchHistory(prevHistory => prevHistory.filter(match => match.ID_Meci2 !== matchId));
          setFilteredMatches(prevMatches => prevMatches.filter(match => match.ID_Meci2 !== matchId));
          window.location.reload(false);

          // Log the delete operation
          axios.post('https://localhost:8081/log-operation', {
            username,
            role: 'admin',
            operation: 'delete',
            table: 'meciuri_istoric'
          }).catch(error => console.error('Error logging operation:', error));
        })
        .catch(error => {
          console.error('Error deleting match:', error);
        });
    }
  };

  const extractRezultatFinal = (options) => {
    try {
      const parsedOptions = JSON.parse(options);
      if (parsedOptions['Rezultat Final']) {
        const result = parsedOptions['Rezultat Final'];
        if (typeof result === 'object') {
          const [option, odds] = Object.entries(result)[0];
          return `Rezultat Final: ${option} - Cota: ${odds}`;
        } else {
          return `Rezultat Final: ${result}`;
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing winning options:', error);
      return null;
    }
  };

  const filterMatches = () => {
    let newFilteredMatches = matchHistory;

    if (selectedEventType) {
      newFilteredMatches = newFilteredMatches.filter(match => match.Tip_Eveniment === selectedEventType);
    }

    if (selectedCategory) {
      newFilteredMatches = newFilteredMatches.filter(match => {
        const options = JSON.parse(match.Optiuni_Castigatoare);
        return options[selectedCategory];
      });
    }

    if (startDate) {
      newFilteredMatches = newFilteredMatches.filter(match => new Date(match.Data_Eveniment) >= new Date(startDate));
    }

    if (endDate) {
      newFilteredMatches = newFilteredMatches.filter(match => new Date(match.Data_Eveniment) <= new Date(endDate));
    }

    setFilteredMatches(newFilteredMatches);
  };

  return (
    <div className="history-container">
      <div className="header">
      <button className="back-button" onClick={() => { navigate('/'); window.location.reload(false); }}>Back</button>
        <Link to="/bet-history" className="bet-history-link">Pariuri Page</Link>
        <h1 className="title">Istoric meciuri</h1>
        {userRole === 'admin' && (
          <div className="admin-link">
            <a href="/admin">Admin Page</a>
          </div>
        )}
      </div>
      <div className="filters2">
        <label>
          Tip Eveniment:
          <select value={selectedEventType} onChange={(e) => setSelectedEventType(e.target.value)}>
            <option value="">Select Tip Eveniment</option>
            {eventTypes.map((eventType, index) => (
              <option key={index} value={eventType}>{eventType}</option>
            ))}
          </select>
        </label>
        <label>
          Categorie:
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} disabled={!selectedEventType}>
            <option value="">Select Categorie</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </label>
        <label>
          Start Date:
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date:
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button onClick={filterMatches}>Filter</button>
      </div>
      <div className="match-history-list">
        {filteredMatches.length > 0 ? (
          <ul>
            {filteredMatches.map((match, index) => (
              <li key={index}>
                <p><strong>Meci:</strong> {match.Echipa_unu} vs {match.Echipa_doi}</p>
                <p><strong>Data:</strong> {new Date(match.Data_Eveniment).toLocaleString()}</p>
                <p><strong>Tip Eveniment:</strong> {match.Tip_Eveniment}</p>
                <p><strong>Locație:</strong> {match.Locatie}</p>
                <p><strong>Opțiuni Câștigătoare:</strong></p>
                <p><strong>{extractRezultatFinal(match.Optiuni_Castigatoare)}</strong></p>
                {userRole === 'admin' && (
                  <button className="delete-button" onClick={() => handleDeleteMatch(match.ID_Meci2)}>Delete</button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nu există meciuri anterioare.</p>
        )}
      </div>
    </div>
  );
}

export default IstoricMeciuriPage;
