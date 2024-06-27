import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from './axiosConfig';
import './AdminPage.css';
import moment from 'moment';

const AdminPage = () => {
  const [events, setEvents] = useState([]);
  const [eventType, setEventType] = useState('');
  const [teamOne, setTeamOne] = useState('');
  const [teamTwo, setTeamTwo] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [categories, setCategories] = useState([{ id: Date.now(), category: '', options: [{ id: Date.now(), option: '', odds: '' }] }]);
  const [eventTypes, setEventTypes] = useState(['Fotbal', 'Tenis', 'Baschet']);
  const [betCategories, setBetCategories] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Admin';

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/');
    } else {
      axios.get('/events')
        .then(response => {
          setEvents(response.data);
        })
        .catch(error => console.error('Error fetching events:', error));
    }
  }, [navigate]);

  useEffect(() => {
    switch (eventType) {
      case 'Fotbal':
        setBetCategories(['Rezultat Final', 'Sansa Dubla', 'Total Goluri']);
        break;
      case 'Tenis':
        setBetCategories(['Castigator Meci', 'Set 3 Total Game-uri', 'Total Game-uri']);
        break;
      case 'Baschet':
        setBetCategories(['Rezultat Final', 'Handicap Puncte', 'Total Puncte']);
        break;
      default:
        setBetCategories([]);
        break;
    }
  }, [eventType]);

  const handleAddCategory = () => {
    setCategories([...categories, { id: Date.now(), category: '', options: [{ id: Date.now(), option: '', odds: '' }] }]);
  };

  const handleRemoveCategory = (index) => {
    const updatedCategories = categories.filter((_, catIndex) => catIndex !== index);
    setCategories(updatedCategories);
  };

  const handleAddOption = (catIndex) => {
    const category = categories[catIndex].category;
    if (category === 'Rezultat Final' && eventType === 'Fotbal' && categories[catIndex].options.length >= 3) {
      alert('Maximum 3 options are allowed for Rezultat Final in Fotbal.');
      return;
    }
    if (category === 'Sansa Dubla' && eventType === 'Fotbal' && categories[catIndex].options.length >= 3) {
      alert('Maximum 3 options are allowed for Sansa Dubla in Fotbal.');
      return;
    }
    if (category === 'Castigator Meci' && eventType === 'Tenis' && categories[catIndex].options.length >= 2) {
      alert('Maximum 2 options are allowed for Castigator Meci in Tenis.');
      return;
    }
    if (category === 'Rezultat Final' && eventType === 'Baschet' && categories[catIndex].options.length >= 3) {
      alert('Maximum 3 options are allowed for Rezultat Final in Baschet.');
      return;
    }

    const updatedCategories = [...categories];
    updatedCategories[catIndex].options.push({ id: Date.now(), option: '', odds: '' });
    setCategories(updatedCategories);
  };

  const handleRemoveOption = (catIndex, optIndex) => {
    const updatedCategories = [...categories];
    updatedCategories[catIndex].options = updatedCategories[catIndex].options.filter((_, index) => index !== optIndex);
    setCategories(updatedCategories);
  };

  const handleCategoryChange = (index, value) => {
    const updatedCategories = [...categories];
    updatedCategories[index].category = value;
    setCategories(updatedCategories);
  };

  const handleOptionChange = (catIndex, optIndex, field, value) => {
    const updatedCategories = [...categories];
    updatedCategories[catIndex].options[optIndex][field] = value;
    setCategories(updatedCategories);
  };

  const selectWinningOptions = (categories) => {
    const options = categories.reduce((obj, item) => {
      if (item.category) {
        const categoryOptions = item.options.reduce((optObj, optItem) => {
          if (optItem.option && optItem.odds) {
            optObj[optItem.option] = parseFloat(optItem.odds);
          }
          return optObj;
        }, {});
        if (Object.keys(categoryOptions).length > 0) {
          obj[item.category] = categoryOptions;
        }
      }
      return obj;
    }, {});

    const winningOptions = {};
    for (const [category, option] of Object.entries(options)) {
      const optionKeys = Object.keys(option);
      const randomKey = optionKeys[Math.floor(Math.random() * optionKeys.length)];
      winningOptions[category] = { [randomKey]: option[randomKey] };
    }

    return winningOptions;
  };

  const handleCreateEvent = () => {
    if (!eventType || !teamOne || !teamTwo || !eventDate || !location) {
      alert('Toate câmpurile sunt obligatorii!');
      return;
    }
  
    setIsCreating(true);
  
    const selectedDate = moment(eventDate);
    const currentDate = moment();
  
    console.log('Selected Date:', selectedDate.format());
    console.log('Current Date:', currentDate.format());
  
    const options = categories.reduce((obj, item) => {
      if (item.category) {
        const categoryOptions = item.options.reduce((optObj, optItem) => {
          if (optItem.option && optItem.odds) {
            optObj[optItem.option] = parseFloat(optItem.odds);
          }
          return optObj;
        }, {});
        if (Object.keys(categoryOptions).length > 0) {
          obj[item.category] = categoryOptions;
        }
      }
      return obj;
    }, {});
  
    const newEvent = {
      Tip_Eveniment: eventType,
      Echipa_unu: teamOne,
      Echipa_doi: teamTwo,
      Data_Eveniment: eventDate,
      Locatie: location,
      Optiuni_Pariuri: JSON.stringify({ cote: options }),
      username, // Pass the username from localStorage or other state
      role: 'admin' // Assume the role is admin
    };
  
    axios.post('/events', newEvent)
      .then(response => {
        const createdEvent = response.data;
        setEvents([...events, createdEvent]);
  
        // Log the creation operation
        axios.post('/log-operation', {
          username,
          role: 'admin',
          operation: 'create',
          table: 'eveniment_sportiv'
        }).catch(error => console.error('Error logging operation:', error));
  
        if (selectedDate.isBefore(currentDate)) {
          const confirmCreation = window.confirm('Data evenimentului este în trecut. Ești sigur că vrei să continui?');
          if (confirmCreation) {
            const winningOptions = selectWinningOptions(categories);
            axios.post('/move-to-history', { matchId: createdEvent.ID_Eveniment, winningOptions })
              .then(response => {
                console.log('Event moved to history:', response.data);
                setEvents(events.filter(event => event.ID_Eveniment !== createdEvent.ID_Eveniment));
                window.location.reload(false);
              })
              .catch(error => console.error('Error moving event to history:', error));
          } else {
            axios.delete(`/events/${createdEvent.ID_Eveniment}`)
              .then(() => setEvents(events.filter(event => event.ID_Eveniment !== createdEvent.ID_Eveniment)))
              .catch(error => console.error('Error deleting event:', error));
          }
        } else {
          window.location.reload(false);
        }
  
        setIsCreating(false);
      })
      .catch(error => {
        console.error('Error creating event:', error);
        setIsCreating(false);
      });
  };
  
  const handleUpdateEvent = (id) => {
    if (!editingEvent) return;
  
    const selectedDate = moment(editingEvent.Data_Eveniment);
    const currentDate = moment();
  
    const options = editingEvent.categories.reduce((obj, item) => {
      if (item.category) {
        const categoryOptions = item.options.reduce((optObj, optItem) => {
          if (optItem.option && optItem.odds) {
            optObj[optItem.option] = parseFloat(optItem.odds);
          }
          return optObj;
        }, {});
        if (Object.keys(categoryOptions).length > 0) {
          obj[item.category] = categoryOptions;
        }
      }
      return obj;
    }, {});
  
    const updatedEvent = {
      ...editingEvent,
      Optiuni_Pariuri: JSON.stringify({ cote: options }),
      username, // Pass the username from localStorage or other state
      role: 'admin' // Assume the role is admin
    };
  
    axios.put(`/events/${id}`, updatedEvent)
      .then(response => {
        setEvents(events.map(event => (event.ID_Eveniment === id ? response.data : event)));
        setEditingEvent(null);
  
        // Log the update operation
        axios.post('/log-operation', {
          username,
          role: 'admin',
          operation: 'update',
          table: 'eveniment_sportiv'
        }).catch(error => console.error('Error logging operation:', error));
  
        if (selectedDate.isBefore(currentDate)) {
          const confirmUpdate = window.confirm('Data evenimentului este în trecut. Ești sigur că vrei să continui?');
          if (confirmUpdate) {
            const winningOptions = selectWinningOptions(editingEvent.categories);
            axios.post('/move-to-history', { matchId: id, winningOptions })
              .then(response => {
                console.log('Event moved to history:', response.data);
                setEvents(events.filter(event => event.ID_Eveniment !== id));
                window.location.reload(false);
              })
              .catch(error => console.error('Error moving event to history:', error));
          }
        } else {
          window.location.reload(false);
        }
      })
      .catch(error => console.error('Error updating event:', error));
  };  

  const startEditingEvent = (event) => {
    const parsedCategories = Object.entries(JSON.parse(event.Optiuni_Pariuri || '{}').cote || {}).map(([category, options]) => ({
      id: Date.now(),
      category,
      options: Object.entries(options).map(([option, odds]) => ({ id: Date.now(), option, odds }))
    }));
    setEditingEvent({
      ...event,
      categories: parsedCategories
    });
  };

  const handleEditCategoryChange = (catIndex, value) => {
    const updatedCategories = [...editingEvent.categories];
    updatedCategories[catIndex].category = value;
    setEditingEvent({ ...editingEvent, categories: updatedCategories });
  };

  const handleEditOptionChange = (catIndex, optIndex, field, value) => {
    const updatedCategories = [...editingEvent.categories];
    updatedCategories[catIndex].options[optIndex][field] = value;
    setEditingEvent({ ...editingEvent, categories: updatedCategories });
  };

  const handleAddEditCategory = () => {
    const updatedCategories = [...editingEvent.categories, { id: Date.now(), category: '', options: [{ id: Date.now(), option: '', odds: '' }] }];
    setEditingEvent({ ...editingEvent, categories: updatedCategories });
  };

  const handleRemoveEditCategory = (catIndex) => {
    const updatedCategories = editingEvent.categories.filter((_, index) => index !== catIndex);
    setEditingEvent({ ...editingEvent, categories: updatedCategories });
  };

  const handleAddEditOption = (catIndex) => {
    const category = editingEvent.categories[catIndex].category;
    if (category === 'Rezultat Final' && eventType === 'Fotbal' && editingEvent.categories[catIndex].options.length >= 3) {
      alert('Maximum 3 options are allowed for Rezultat Final in Fotbal.');
      return;
    }
    if (category === 'Sansa Dubla' && eventType === 'Fotbal' && editingEvent.categories[catIndex].options.length >= 3) {
      alert('Maximum 3 options are allowed for Sansa Dubla in Fotbal.');
      return;
    }
    if (category === 'Castigator Meci' && eventType === 'Tenis' && editingEvent.categories[catIndex].options.length >= 2) {
      alert('Maximum 2 options are allowed for Castigator Meci in Tenis.');
      return;
    }
    if (category === 'Rezultat Final' && eventType === 'Baschet' && editingEvent.categories[catIndex].options.length >= 3) {
      alert('Maximum 3 options are allowed for Rezultat Final in Baschet.');
      return;
    }

    const updatedCategories = [...editingEvent.categories];
    updatedCategories[catIndex].options.push({ id: Date.now(), option: '', odds: '' });
    setEditingEvent({ ...editingEvent, categories: updatedCategories });
  };

  const handleRemoveEditOption = (catIndex, optIndex) => {
    const updatedCategories = [...editingEvent.categories];
    updatedCategories[catIndex].options = updatedCategories[catIndex].options.filter((_, index) => index !== optIndex);
    setEditingEvent({ ...editingEvent, categories: updatedCategories });
  };

  const renderBettingOptions = (parsedOptions) => {
    return Object.entries(parsedOptions.cote).map(([category, options]) => (
      <div key={category}>
        <h5>{category}</h5>
        <ul>
          {Object.entries(options).map(([option, odds]) => (
            <li key={option}><strong>{option}:</strong> {odds}</li>
          ))}
        </ul>
      </div>
    ));
  };

  const handleDeleteEvent = (id) => {
    axios.delete(`/events/${id}`)
      .then(() => {
        setEvents(events.filter(event => event.ID_Eveniment !== id));
  
        // Log the delete operation
        axios.post('/log-operation', {
          username,
          role: 'admin',
          operation: 'delete',
          table: 'eveniment_sportiv'
        }).catch(error => console.error('Error logging operation:', error));
      })
      .catch(error => console.error('Error deleting event:', error));
  };
  
  const filterEvents = () => {
    return events.filter(event => {
      const matchesType = filterType ? event.Tip_Eveniment === filterType : true;
      const matchesCategory = filterCategory ? JSON.parse(event.Optiuni_Pariuri || '{}').cote.hasOwnProperty(filterCategory) : true;
      const matchesDate = filterDate ? moment(event.Data_Eveniment).isSame(filterDate, 'day') : true;
      return matchesType && matchesCategory && matchesDate;
    });
  };

  return (
    <div className="admin-page">
      <div className="button-container">
      <button className="back-button" onClick={() => { navigate('/'); window.location.reload(false); }}>Back</button>
      <Link to="/istoric" className="historical-link">Mergi la Istoric Meciuri</Link>
       </div>

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

        <div className="bet-categories">
          {categories.map((category, catIndex) => (
            <div key={category.id} className="category-section">
              <select
                value={category.category}
                onChange={e => handleCategoryChange(catIndex, e.target.value)}
                className="form-input"
              >
                <option value="">Selectează Categoria</option>
                {betCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {category.options.map((option, optIndex) => (
                <div key={option.id} className="bet-option">
                  <input
                    type="text"
                    placeholder="Optiune"
                    value={option.option}
                    onChange={e => handleOptionChange(catIndex, optIndex, 'option', e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="number"
                    placeholder="Cota"
                    value={option.odds}
                    onChange={e => handleOptionChange(catIndex, optIndex, 'odds', e.target.value)}
                    className="form-input"
                  />
                  <button type="button" className="remove-option-btn" onClick={() => handleRemoveOption(catIndex, optIndex)}>Șterge Opțiune</button>
                </div>
              ))}
              <button type="button" className="add-option-btn" onClick={() => handleAddOption(catIndex)}>Adaugă Opțiune</button>
              <button type="button" className="remove-category-btn" onClick={() => handleRemoveCategory(catIndex)}>Șterge Categoria</button>
            </div>
          ))}
        </div>
        <button type="button" className="add-category-btn" onClick={handleAddCategory}>Adaugă Categorie</button>
        <button className="create-event-btn" onClick={handleCreateEvent} disabled={isCreating}>Creare Eveniment</button>
      </div>

      <div className="filter-section">
        <h3>Filtrare Evenimente</h3>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="form-input">
          <option value="">Selectează Tipul Evenimentului</option>
          {eventTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="form-input">
          <option value="">Selectează Categoria</option>
          {betCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="form-input" />
      </div>

      <div className="event-list">
        <h3>Lista Evenimente</h3>
        {filterEvents().map(event => {
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
              <p><strong>Data Eveniment:</strong> {moment(event.Data_Eveniment).format('DD.MM.YYYY HH:mm')}</p>
              <p><strong>Locatie:</strong> {event.Locatie}</p>
              <p><strong>Optiuni Pariuri:</strong></p>
              <div>
                {Object.keys(parsedOptions.cote || {}).length > 0 ? (
                  renderBettingOptions(parsedOptions)
                ) : (
                  <p>Nici o opțiune de pariere disponibilă</p>
                )}
              </div>
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
                  {editingEvent.categories.map((category, catIndex) => (
                    <div key={category.id} className="category-section">
                      <select
                        value={category.category}
                        onChange={e => handleEditCategoryChange(catIndex, e.target.value)}
                        className="form-input"
                      >
                        <option value="">Selectează Categoria</option>
                        {betCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {category.options.map((option, optIndex) => (
                        <div key={option.id} className="bet-option">
                          <input
                            type="text"
                            placeholder="Optiune"
                            value={option.option}
                            onChange={e => handleEditOptionChange(catIndex, optIndex, 'option', e.target.value)}
                            className="form-input"
                          />
                          <input
                            type="number"
                            placeholder="Cota"
                            value={option.odds}
                            onChange={e => handleEditOptionChange(catIndex, optIndex, 'odds', e.target.value)}
                            className="form-input"
                          />
                          <button type="button" className="remove-option-btn" onClick={() => handleRemoveEditOption(catIndex, optIndex)}>Șterge Opțiune</button>
                        </div>
                      ))}
                      <button type="button" className="add-option-btn" onClick={() => handleAddEditOption(catIndex)}>Adaugă Opțiune</button>
                      <button type="button" className="remove-category-btn" onClick={() => handleRemoveEditCategory(catIndex)}>Șterge Categoria</button>
                    </div>
                  ))}
                  <button type="button" className="add-category-btn" onClick={handleAddEditCategory}>Adaugă Categorie</button>
                  <button className="save-changes-btn" onClick={() => handleUpdateEvent(editingEvent.ID_Eveniment)}>Salvează Modificările</button>
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
