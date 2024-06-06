import React, { useState, useEffect } from 'react';
import axios from './axiosConfig';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';
import moment from 'moment'; // Importă moment.js

const AdminPage = () => {
  const [events, setEvents] = useState([]);
  const [eventType, setEventType] = useState('');
  const [teamOne, setTeamOne] = useState('');
  const [teamTwo, setTeamTwo] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [betOptions, setBetOptions] = useState([{ id: Date.now(), option: '', odds: '' }]);
  const [eventTypes, setEventTypes] = useState(['Fotbal', 'Tenis', 'Baschet']);
  const [editingEvent, setEditingEvent] = useState(null);
  
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Admin';

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/'); // Redirecționează la pagina de login dacă nu este logat
    } else {
      axios.get('/events')
        .then(response => {
          console.log(response.data); // Adaugă un console.log pentru a verifica datele primite
          setEvents(response.data);
        })
        .catch(error => console.error('Error fetching events:', error));
    }
  }, [navigate]);

  const handleAddBetOption = () => {
    setBetOptions([...betOptions, { id: Date.now(), option: '', odds: '' }]);
  };

  const handleBetOptionChange = (index, field, value) => {
    const updatedBetOptions = [...betOptions];
    updatedBetOptions[index][field] = value;
    setBetOptions(updatedBetOptions);
  };

  const handleCreateEvent = () => {
    if (!eventType || !teamOne || !teamTwo || !eventDate || !location) {
      alert('Toate câmpurile sunt obligatorii!');
      return;
    }

    const options = betOptions.reduce((obj, item) => {
      if (item.option && item.odds) {
        obj[item.option] = parseFloat(item.odds);
      }
      return obj;
    }, {});

    const newEvent = {
      Tip_Eveniment: eventType,
      Echipa_unu: teamOne,
      Echipa_doi: teamTwo,
      Data_Eveniment: eventDate,
      Locatie: location,
      Optiuni_Pariuri: JSON.stringify({ cote: options })
    };

    axios.post('/events', newEvent)
      .then(response => {
        setEvents([...events, response.data]);
        clearForm();
      })
      .catch(error => console.error('Error creating event:', error));
      window.location.reload(false);
  };

  const clearForm = () => {
    setEventType('');
    setTeamOne('');
    setTeamTwo('');
    setEventDate('');
    setLocation('');
    setBetOptions([{ id: Date.now(), option: '', odds: '' }]);
  };

  const handleDeleteEvent = (id) => {
    axios.delete(`/events/${id}`)
      .then(() => setEvents(events.filter(event => event.ID_Eveniment !== id)))
      .catch(error => console.error('Error deleting event:', error));
  };

  const handleUpdateEvent = (id) => {
    const updatedEvent = {
      ...editingEvent,
      Optiuni_Pariuri: JSON.stringify({ cote: editingEvent.cote })
    };

    axios.put(`/events/${id}`, updatedEvent)
      .then(response => {
        setEvents(events.map(event => (event.ID_Eveniment === id ? response.data : event)));
        setEditingEvent(null);
      })
      .catch(error => console.error('Error updating event:', error));
      window.location.reload(false);
  };

  const startEditingEvent = (event) => {
    setEditingEvent({
      ...event,
      cote: JSON.parse(event.Optiuni_Pariuri || '{}').cote || {}
    });
  };

  const handleEditBetOptionChange = (key, value) => {
    setEditingEvent({
      ...editingEvent,
      cote: {
        ...editingEvent.cote,
        [key]: parseFloat(value)
      }
    });
  };

  const renderBettingOptions = (parsedOptions) => {
    return Object.entries(parsedOptions.cote).map(([option, odds]) => (
      <li key={option}><strong>{option}:</strong> {odds}</li>
    ));
  };

  return (
    <div className="admin-page">
      <button className="back-button" onClick={() => navigate('/')}>Back</button>
      <h1>Bine ai venit, {username}!</h1>
      <h2>Gestionare Evenimente Sportive</h2>

      <div className="create-event-form">
        <h3>Creare Eveniment Nou</h3>
        <select value={eventType} onChange={e => setEventType(e.target.value)} className="form-input">
          <option value="">Selectează Tipul Evenimentului</option>
          {eventTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input type="text" placeholder="Echipa unu" value={teamOne} onChange={e => setTeamOne(e.target.value)} className="form-input" />
        <input type="text" placeholder="Echipa doi" value={teamTwo} onChange={e => setTeamTwo(e.target.value)} className="form-input" />
        <input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} className="form-input" />
        <input type="text" placeholder="Locatie" value={location} onChange={e => setLocation(e.target.value)} className="form-input" />

        <div className="bet-options">
          <h4>Optiuni Pariuri</h4>
          {betOptions.map((betOption, index) => (
            <div key={betOption.id} className="bet-option">
              <input
                type="text"
                placeholder="Optiune"
                value={betOption.option}
                onChange={e => handleBetOptionChange(index, 'option', e.target.value)}
                className="form-input"
              />
              <input
                type="number"
                placeholder="Cota"
                value={betOption.odds}
                onChange={e => handleBetOptionChange(index, 'odds', e.target.value)}
                className="form-input"
              />
            </div>
          ))}
          <button type="button" className="add-option-btn" onClick={handleAddBetOption}>Adaugă Opțiune</button>
        </div>

        <button className="create-event-btn" onClick={handleCreateEvent}>Creare Eveniment</button>
      </div>

      <div className="event-list">
        <h3>Lista Evenimente</h3>
        {events.map(event => {
          let parsedOptions = {};
          if (event.Optiuni_Pariere || event.Optiuni_Pariuri) {
            try {
              parsedOptions = JSON.parse(event.Optiuni_Pariere || event.Optiuni_Pariuri);
            } catch (error) {
              console.error('Error parsing betting options:', error);
            }
          }
          return (
            <div key={event.ID_Eveniment} className="event-item">
              <p><strong>Tip Eveniment:</strong> {event.Tip_Eveniment}</p>
              <p><strong>Echipa unu:</strong> {event.Echipa_unu}</p>
              <p><strong>Echipa doi:</strong> {event.Echipa_doi}</p>
              <p><strong>Data Eveniment:</strong> {moment(event.Data_Eveniment).format('DD.MM.YYYY HH:mm')}</p> {/* Folosește moment.js pentru a formata data */}
              <p><strong>Locatie:</strong> {event.Locatie}</p>
              <p><strong>Optiuni Pariuri:</strong></p>
              <ul>
                {Object.keys(parsedOptions.cote || {}).length > 0 ? (
                  renderBettingOptions(parsedOptions)
                ) : (
                  <li key="no-options">Nici o opțiune de pariere disponibilă</li>
                )}
              </ul>
              <div className="action-buttons">
                <button className="update-btn" onClick={() => startEditingEvent(event)}>Actualizează</button>
                <button className="delete-btn" onClick={() => handleDeleteEvent(event.ID_Eveniment)}>Șterge</button>
              </div>

              {editingEvent && editingEvent.ID_Eveniment === event.ID_Eveniment && (
                <div className="edit-event-form">
                  <h4>Editare Eveniment</h4>
                  <select
                    value={editingEvent.Tip_Eveniment}
                    onChange={e => setEditingEvent({ ...editingEvent, Tip_Eveniment: e.target.value })}
                    className="form-input"
                  >
                    {eventTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editingEvent.Echipa_unu}
                    onChange={e => setEditingEvent({ ...editingEvent, Echipa_unu: e.target.value })}
                    className="form-input"
                  />
                  <input
                    type="text"
                    value={editingEvent.Echipa_doi}
                    onChange={e => setEditingEvent({ ...editingEvent, Echipa_doi: e.target.value })}
                    className="form-input"
                  />
                  <input
                    type="datetime-local"
                    value={moment(editingEvent.Data_Eveniment).format('YYYY-MM-DDTHH:mm')}
                    onChange={e => setEditingEvent({ ...editingEvent, Data_Eveniment: e.target.value })}
                    className="form-input"
                  />
                  <input
                    type="text"
                    value={editingEvent.Locatie}
                    onChange={e => setEditingEvent({ ...editingEvent, Locatie: e.target.value })}
                    className="form-input"
                  />
                  <h4>Optiuni Pariuri</h4>
                  {Object.entries(editingEvent.cote).map(([key, value]) => (
                    <div key={key} className="bet-option">
                      <input
                        type="text"
                        value={key}
                        readOnly
                        className="form-input"
                      />
                      <input
                        type="number"
                        value={value}
                        onChange={e => handleEditBetOptionChange(key, e.target.value)}
                        className="form-input"
                      />
                    </div>
                  ))}
                  <button className="save-changes-btn" onClick={() => handleUpdateEvent(event.ID_Eveniment)}>Salvează Modificările</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPage;
