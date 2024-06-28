import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminRedirector = ({ username, resetRedirect }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      navigate('/admin', { state: { username } });
      resetRedirect();
    }
  }, [username, navigate, resetRedirect]);

  return null;
};

export default AdminRedirector;
