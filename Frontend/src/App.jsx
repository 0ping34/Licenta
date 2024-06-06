import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import RegistrationModal from './RegistrationModal';
import LoginModal from './LoginModal';
import MatchList from './MatchList';
import SidePanel from './SidePanel';
import PaymentPage from './PaymentPage';
import AdminPage from './AdminPage';
import './App.css';

function App() {
  const [connectionStatus, setConnectionStatus] = useState('');
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState('');
  const [matches, setMatches] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState([]);
  const [deletionDetails, setDeletionDetails] = useState({ key: null, mID: null, type: 'none' });

  useEffect(() => {
    // Check if there's a token in localStorage
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');

    if (token && username) {
      setIsLoggedIn(true);
      setLoggedInUsername(username);
      // You may also want to set the userId if you stored it in localStorage
      // setUserId(localStorage.getItem('userId'));
    }

    axios.get('https://localhost:8081/events')
      .then(response => {
        setEvents(response.data);
        const uniqueEventTypes = [...new Set(response.data.map(event => event.Tip_Eveniment))];
        setEvents(uniqueEventTypes);
        if (response.data.length > 0) {
          setSelectedEventType(response.data[0].Tip_Eveniment);
        }
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });
  }, []);

  useEffect(() => {
    if (selectedEventType) {
      axios.get(`https://localhost:8081/events/by-type?type=${encodeURIComponent(selectedEventType)}`)
        .then(response => {
          setMatches(response.data);
        })
        .catch(error => {
          console.error('Error fetching matches for event type:', selectedEventType, error);
        });
    }
  }, [selectedEventType]);

  useEffect(() => {
    axios.get('https://localhost:8081/')
      .then(response => {
        setConnectionStatus(response.data.message);
      })
      .catch(error => {
        setConnectionStatus('Error connecting to database');
      });
  }, []);

  const openRegistrationModal = () => setIsRegistrationModalOpen(true);
  const closeRegistrationModal = () => setIsRegistrationModalOpen(false);
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUsername('');
    setUserId(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    // localStorage.removeItem('userId'); // Uncomment if you store userId
  };

  const handleLoginSuccess = (username, userId) => {
    setIsLoggedIn(true);
    setLoggedInUsername(username);
    setUserId(userId);
    localStorage.setItem('username', username);
    // localStorage.setItem('userId', userId); // Uncomment if you store userId
  };

  const handleEventTypeSelect = (eventType) => {
    setSelectedEventType(eventType);
  };

  const handleSelection = (MatchID, teamNames, selectedOption, isDeselected) => {
    const newBet = {
      description: teamNames,
      betKey: selectedOption.key,
      odds: selectedOption.odds,
      ID: MatchID
    };
    if (isDeselected) {
      setSelectedInfo(prevInfo => prevInfo.filter(info =>
        !(info.ID === newBet.ID && info.description === newBet.description && info.betKey === newBet.betKey)
      ));
    } else {
      setSelectedInfo(prevInfo => [...prevInfo, newBet]);
    }
  };

  const handleDeleteTicket = (index) => {
    const betToRemove = selectedInfo[index];
    setSelectedInfo(prevInfo => prevInfo.filter((_, i) => i !== index));

    setDeletionDetails({
      key: betToRemove.betKey,
      ID: betToRemove.ID,
      type: 'single'
    });
  };

  const handleDeleteAllTickets = () => {
    setSelectedInfo([]);
    setDeletionDetails({ key: null, type: 'all' });
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="App">
            <header className="Navbar">
              <div className="LeftNavbarItems">
                <span className="alphas">ALPHAS.</span><span className="bet">BET</span>
              </div>
              <div className="RightNavbarItems">
                {isLoggedIn ? (
                  <>
                    <p>Welcome, {loggedInUsername}!</p>
                    <button onClick={handleLogout}>Log out</button>
                  </>
                ) : (
                  <>
                    <button onClick={openRegistrationModal} style={{ display: isLoggedIn ? 'none' : 'block' }}>Register</button>
                    <button onClick={openLoginModal} style={{ display: isLoggedIn ? 'none' : 'block' }}>Log in</button>
                  </>
                )}
              </div>
            </header>
            <div className="MainContainer">
              <main className="MainPanel">
                <nav className="PageBar">
                  <ul className="PageBarItems">
                    {events.map((eventType, index) => (
                      <li
                        key={index}
                        className={`PageBarItem ${selectedEventType === eventType ? 'active' : ''}`}
                        onClick={() => handleEventTypeSelect(eventType)}
                      >
                        {eventType}
                      </li>
                    ))}
                  </ul>
                </nav>
                <MatchList matches={matches} onSelection={handleSelection} deletionDetails={deletionDetails} />
              </main>
              <SidePanel
                selectedInfo={selectedInfo}
                onDeleteTicket={handleDeleteTicket}
                onDeleteAllTickets={handleDeleteAllTickets}
                isLoggedIn={isLoggedIn}
                openLoginModal={openLoginModal}
                userId={userId}
              />
            </div>
            <RegistrationModal isOpen={isRegistrationModalOpen} onClose={closeRegistrationModal} />
            <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />
          </div>
        } />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
