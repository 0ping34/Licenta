// ConfirmEmailPage.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ConfirmEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get('userId');

    if (userId) {
      axios.get(`https://localhost:8081/confirm?userId=${userId}`)
        .then(response => {
          navigate('/');
        })
        .catch(error => {
          console.error('Error confirming email:', error);
          alert('Failed to confirm email. Please try again.');
        });
    }
  }, [location, navigate]);

};

export default ConfirmEmailPage;
