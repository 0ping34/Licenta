import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function IstoricRedirector({ resetRedirect }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/istoric');
    resetRedirect();
  }, [navigate, resetRedirect]);

  return null;
}

export default IstoricRedirector;
