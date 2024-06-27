// Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="Footer">
      <Link to="/termeni-si-conditii">Termeni și Condiții</Link>
    </footer>
  );
};

export default Footer;
