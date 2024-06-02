// LogoutButton.js
import React from 'react';

const LogoutButton = ({ onLogout }) => {
  return (
    <button onClick={onLogout}>Deconectare</button>
  );
}

export default LogoutButton;
