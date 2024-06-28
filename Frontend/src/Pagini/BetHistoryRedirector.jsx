import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function BetHistoryRedirector({ resetRedirect }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/bet-history');
    resetRedirect();
  }, [navigate, resetRedirect]);

  return null;
}

export default BetHistoryRedirector;
