import React, { useState, useEffect } from 'react';
import './RegistrationModal.css';

const RegistrationModal = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerificationChecked, setIsVerificationChecked] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [validCodes, setValidCodes] = useState({});

  useEffect(() => {
    const fetchVerificationCodes = async () => {
      try {
        const response = await fetch('https://localhost:8081/coduri-verificare');
        const data = await response.json();
        const codes = {};
        data.forEach(item => {
          codes[item.Valoare] = item.Pozitie_Cod;
        });
        setValidCodes(codes);
      } catch (error) {
        console.error('Eroare la obținerea codurilor de verificare:', error);
        setError('A apărut o eroare la obținerea codurilor de verificare.');
      }
    };

    fetchVerificationCodes();
  }, []);

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const handleVerificationCodeChange = (event) => {
    setVerificationCode(event.target.value);
  };

  const handleVerificationCheckChange = (event) => {
    setIsVerificationChecked(event.target.checked);
  };

  const handleBirthDateChange = (event) => {
    setBirthDate(event.target.value);
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDifference = today.getMonth() - birthDateObj.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (calculateAge(birthDate) < 18) {
      setError('Trebuie să aveți cel puțin 18 ani pentru a vă înregistra.');
      return;
    }

    if (isVerificationChecked && !verificationCode) {
      setError('Codul de verificare este necesar dacă caseta este bifată.');
      return;
    }

    let position = 'utilizator';

    if (isVerificationChecked) {
      if (validCodes[verificationCode]) {
        position = validCodes[verificationCode];
      } else {
        setError('Codul de verificare este incorect.');
        return;
      }
    }

    const data = {
      username,
      email,
      password,
      confirmPassword,
      birthDate,
      position,
    };

    try {
      const checkResponse = await fetch(`https://localhost:8081/utilizatori/exista/${username}/${email}`);
      const checkData = await checkResponse.json();

      if (checkData.exists) {
        setError('Numele de utilizator sau adresa de email sunt deja utilizate.');
        return;
      }

      const response = await fetch('https://localhost:8081/inregistrare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Utilizator înregistrat cu succes!');
        onClose();
      } else {
        const errorMessage = await response.text();
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Eroare la trimiterea cererii:', error.message);
      setError('A apărut o eroare la trimiterea cererii. Vă rugăm să încercați din nou.');
    }
  };

  return (
    <>
      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={onClose}>&times;</span>
            <h2>Formular de Înregistrare</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Nume de Utilizator:</label>
                <input type="text" id="username" name="username" onChange={handleUsernameChange} value={username} />
              </div>
              <div className="form-group">
                <label htmlFor="email">Adresă de Email:</label>
                <input type="text" id="email" name="email" className="email-input" onChange={handleEmailChange} value={email} />
              </div>
              <div className="form-group">
                <label htmlFor="password">Parolă:</label>
                <input type="password" id="password" name="password" onChange={handlePasswordChange} value={password} />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmare Parolă:</label>
                <input type="password" id="confirmPassword" name="confirmPassword" onChange={handleConfirmPasswordChange} value={confirmPassword} />
              </div>
              <div className="form-group">
                <label htmlFor="birthDate">Data Nașterii:</label>
                <input type="date" id="birthDate" name="birthDate" onChange={handleBirthDateChange} value={birthDate} />
              </div>
              <div className="form-group">
                <label htmlFor="verificationCodeCheck">
                  <input
                    type="checkbox"
                    id="verificationCodeCheck"
                    onChange={handleVerificationCheckChange}
                    checked={isVerificationChecked}
                  />
                  Pozitie
                </label>
              </div>
              {isVerificationChecked && (
                <div className="form-group">
                  <label htmlFor="verificationCode">Cod de Verificare:</label>
                  <input
                    type="password"
                    id="verificationCode"
                    name="verificationCode"
                    onChange={handleVerificationCodeChange}
                    value={verificationCode}
                  />
                </div>
              )}
              <button type="submit">Înregistrare</button>
              {error && <p className="error-message">{error}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RegistrationModal;
