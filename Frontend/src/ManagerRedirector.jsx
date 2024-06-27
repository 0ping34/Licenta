import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ManagerRedirector = ({ resetRedirect }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/manager');
    resetRedirect();
  }, [navigate, resetRedirect]);

  return null;
};

export default ManagerRedirector;
