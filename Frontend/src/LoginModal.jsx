import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onLoginSuccess, onLogout }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = { email, password };
  
    try {
      const response = await axios.post('https://localhost:8081/login', data);
  
      if (response.status === 200) {
        console.log('Autentificare reușită!');
        const { userId, username, role, token } = response.data;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('UserID', userId);
        localStorage.setItem('username', username);
        localStorage.setItem('role', role); // Stochează rolul în localStorage
  
        onLoginSuccess(username, userId, role); // Transmite și rolul
        if (role === 'admin') {
          navigate('/admin', { state: { username } });
        } else if (role === 'manager') { // Add logic for manager role
          navigate('/manager', { state: { username } });
        }
        onClose();
      } else {
        const errorMessage = response.data.message;
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Eroare la trimiterea cererii:', error.message);
      setError('A apărut o eroare la trimiterea cererii. Vă rugăm să încercați din nou.');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('UserID');
    localStorage.removeItem('username');
    localStorage.removeItem('role'); // Curăță rolul din localStorage
    onLogout(); // Informăm componenta părinte despre deconectare
    setEmail('');
    setPassword('');
    setError('');
  };

  return (
    <>
      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={onClose}>&times;</span>
            <h2>Autentificare</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Adresă de Email:</label>
                <input type="text" id="email" name="email" className="email-input" onChange={handleEmailChange} value={email} />
              </div>
              <div className="form-group">
                <label htmlFor="password">Parolă:</label>
                <input type="password" id="password" name="password" onChange={handlePasswordChange} value={password} />
              </div>
              <button type="submit">Autentificare</button>
              {error && <p className="error-message">{error}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginModal;
