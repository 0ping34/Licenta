// Sidebar.js
import React from 'react';
import './Sidebar.css';

const Sidebar = ({ onSelect, selectedItem }) => {
  return (
    <div className="sidebar">
      <button onClick={() => onSelect('back')}>Back</button>
      <button className={selectedItem === 'operations' ? 'active' : ''} onClick={() => onSelect('operations')}>Logged Operations</button>
      <button className={selectedItem === 'events' ? 'active' : ''} onClick={() => onSelect('events')}>Current Events</button>
      <button className={selectedItem === 'matchHistory' ? 'active' : ''} onClick={() => onSelect('matchHistory')}>Match History</button>
      <button className={selectedItem === 'adminUsers' ? 'active' : ''} onClick={() => onSelect('adminUsers')}>Admin Users</button>
      <button className={selectedItem === 'employeeUsers' ? 'active' : ''} onClick={() => onSelect('employeeUsers')}>Employee Users</button>
      <button className={selectedItem === 'bets' ? 'active' : ''} onClick={() => onSelect('bets')}>All Bets</button>
      <button className={selectedItem === 'invoices' ? 'active' : ''} onClick={() => onSelect('invoices')}>Invoices</button>
      <button className={selectedItem === 'reports' ? 'active' : ''} onClick={() => onSelect('reports')}>Reports</button>
    </div>
  );
};

export default Sidebar;

