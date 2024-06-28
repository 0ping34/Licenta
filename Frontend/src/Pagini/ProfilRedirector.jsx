import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProfilRedirector({ resetRedirect }) {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId'); // Obține userId-ul din localStorage
    if (storedUserId) {
      navigate('/profile', { state: { userId: storedUserId } });
    }
    resetRedirect();
  }, [navigate, resetRedirect]);

  return null;
}

export default ProfilRedirector;
