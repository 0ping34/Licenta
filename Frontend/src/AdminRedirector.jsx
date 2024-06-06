// AdminRedirector.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminRedirector = ({ username, resetRedirect }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (username) {
      navigate('/admin', { state: { username } });
      resetRedirect(); // Resetează flag-ul după redirecționare
    }
  }, [username, navigate, resetRedirect]);

  return null; // This component doesn't render anything
};

export default AdminRedirector;
