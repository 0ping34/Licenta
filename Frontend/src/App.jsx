import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import RegistrationModal from './RegistrationModal';
import LoginModal from './LoginModal';
import MatchList from './MatchList';
import SidePanel from './SidePanel';
import PaymentPage from './PaymentPage';
import PaymentPage2 from './PaymentPage2';
import AdminPage from './AdminPage';
import AdminRedirector from './AdminRedirector';
import ProfilRedirector from './ProfilRedirector';
import ProfilPage from './ProfilPage';
import IstoricRedirector from './IstoricRedirector';
import BetHistoryRedirector from './BetHistoryRedirector';
import IstoricMeciuriPage from './IstoricMeciuriPage';
import IstoricPariuriPage from './IstoricPariuriPage';
import ManagerRedirector from './ManagerRedirector'; // Import ManagerRedirector
import ManagerPage from './ManagerPage'; // Import ManagerPage
import Footer from './Footer'; // Importăm componenta Footer
import TermeniSiConditiiPage from './TermeniSiConditiiPage'; // Importăm componenta TermeniSiConditiiPage
import './App.css';

function App() {
  const [connectionStatus, setConnectionStatus] = useState('');
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState('');
  const [matches, setMatches] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState([]);
  const [deletionDetails, setDeletionDetails] = useState({ key: null, ID: null, type: 'none' });
  const [redirectToAdmin, setRedirectToAdmin] = useState(false);
  const [redirectToProfil, setRedirectToProfil] = useState(false);
  const [redirectToIstoric, setRedirectToIstoric] = useState(false);
  const [redirectToBetHistory, setRedirectToBetHistory] = useState(false);
  const [redirectToManager, setRedirectToManager] = useState(false); // Add state for manager redirect
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('role');
    const storedUserId = localStorage.getItem('userId');

    if (token && username) {
      setIsLoggedIn(true);
      setLoggedInUsername(username);
      setRole(userRole);
      setUserId(storedUserId);
    }

    axios.get('https://localhost:8081/events')
      .then(response => {
        const eventTypes = response.data.map(event => event.Tip_Eveniment);
        const uniqueEventTypes = [...new Set(eventTypes)];
        setEvents(uniqueEventTypes);
        setSelectedEventType(uniqueEventTypes[0] || '');
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
    setRole('');
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  };

  const handleLoginSuccess = (username, userId, userRole) => {
    setIsLoggedIn(true);
    setLoggedInUsername(username);
    setUserId(userId);
    setRole(userRole);
    localStorage.setItem('username', username);
    localStorage.setItem('role', userRole);
    localStorage.setItem('userId', userId);
  };

  const handleEventTypeSelect = (eventType) => {
    setSelectedEventType(eventType);
  };

  const handleSelection = (MatchID, teamNames, selectedOption, isDeselected, category) => {
    const newBet = {
      description: teamNames,
      betKey: selectedOption.key,
      odds: selectedOption.odds,
      ID: MatchID,
      category: category
    };
    if (isDeselected) {
      setSelectedInfo(prevInfo => prevInfo.filter(info =>
        !(info.ID === newBet.ID && info.description === newBet.description && info.betKey === newBet.betKey && info.category === newBet.category)
      ));
    } else {
      setSelectedInfo(prevInfo => [...prevInfo, newBet]);
    }
  };

  const handleDeleteTicket = (index, category) => {
    const betToRemove = selectedInfo[index];
    setSelectedInfo(prevInfo => prevInfo.filter((_, i) => i !== index));

    setDeletionDetails({
      key: betToRemove.betKey,
      ID: betToRemove.ID,
      category: category,
      type: 'single'
    });
  };

  const handleDeleteAllTickets = () => {
    setSelectedInfo([]);
    setDeletionDetails({ key: null, type: 'all' });
  };

  const handleWelcomeClick = () => {
    if (role === 'admin') {
      setRedirectToAdmin(true);
    } else if (role === 'manager') { // Add logic for manager role
      setRedirectToManager(true);
    }
  };

  const handleProfileClick = () => {
    setRedirectToProfil(true);
  };

  const handleIstoricClick = () => {
    setRedirectToIstoric(true);
  };

  const handleBetHistoryClick = () => {
    setRedirectToBetHistory(true);
  };

  const resetRedirect = () => {
    setRedirectToAdmin(false);
    setRedirectToProfil(false);
    setRedirectToIstoric(false);
    setRedirectToBetHistory(false);
    setRedirectToManager(false); // Reset manager redirect
  };

  return (
    <Router>
      {redirectToAdmin && <AdminRedirector username={loggedInUsername} resetRedirect={resetRedirect} />}
      {redirectToManager && <ManagerRedirector resetRedirect={resetRedirect} />} {/* Add manager redirect */}
      {redirectToProfil && <ProfilRedirector resetRedirect={resetRedirect} />}
      {redirectToIstoric && <IstoricRedirector resetRedirect={resetRedirect} />}
      {redirectToBetHistory && <BetHistoryRedirector resetRedirect={resetRedirect} />}
      <Routes>
        <Route path="/" element={
          <div className="App">
            <header className="Navbar">
            <div className="LeftNavbarItems">
                <span className="alphas" onClick={() => window.location.reload()} style={{ cursor: 'pointer' }}>
                  ALPHAS.
                </span>
                <span className="bet" onClick={() => window.location.reload()} style={{ cursor: 'pointer' }}>
                  BET
                </span>
              </div>
              <div className="RightNavbarItems">
                {isLoggedIn ? (
                  <>
                    <div
                      onClick={handleWelcomeClick}
                      className="Adminfade"
                      style={{ cursor: 'pointer' }}
                    >
                      Welcome, {loggedInUsername}!
                    </div>
                    <div className="dropdown">
                      <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="dropdown-toggle">
                        ▼
                      </button>
                      {isDropdownOpen && (
                        <ul className="dropdown-menu">
                          <li onClick={handleProfileClick}>Profil utilizator</li>
                          <li onClick={handleIstoricClick}>Istoric meciuri</li>
                          <li onClick={handleBetHistoryClick}>Istoric pariuri</li>
                        </ul>
                      )}
                    </div>
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
                    {events.map((event, index) => (
                      <li
                        key={index}
                        className={`PageBarItem ${selectedEventType === event ? 'active' : ''}`}
                        onClick={() => handleEventTypeSelect(event)}
                      >
                        {event}
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
            <Footer /> 
          </div>
        } />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment2" element={<PaymentPage2/>} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/manager" element={<ManagerPage />} /> {/* Add route for manager page */}
        <Route path="/profile" element={
          <ProfilPage
            setIsLoggedIn={setIsLoggedIn}
            setLoggedInUsername={setLoggedInUsername}
            setUserId={setUserId}
            setRole={setRole}
          />
        } />
        <Route path="/istoric" element={<IstoricMeciuriPage />} />
        <Route path="/bet-history" element={<IstoricPariuriPage />} />
        <Route path="/termeni-si-conditii" element={<TermeniSiConditiiPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;
