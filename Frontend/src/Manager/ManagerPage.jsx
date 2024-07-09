import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ro'; // Importăm localizarea pentru limba română
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import './ManagerPage.css';
import Sidebar from './Sidebar';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Înregistrăm componentele Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const ITEMS_PER_PAGE = 25; // Constanta pentru numărul de elemente pe pagină

const ManagerPage = () => {
  const [matchHistory, setMatchHistory] = useState([]); // Stochează istoricul meciurilor
  const [currentEvents, setCurrentEvents] = useState([]); // Stochează evenimentele curente
  const [loggedOperations, setLoggedOperations] = useState([]); // Stochează operațiunile logate
  const [adminUsers, setAdminUsers] = useState([]); // Stochează utilizatorii administratori
  const [employeeUsers, setEmployeeUsers] = useState([]); // Stochează utilizatorii angajați
  const [allBets, setAllBets] = useState([]); // Stochează toate pariurile
  const [invoices, setInvoices] = useState([]); // Stochează facturile
  const [selectedItem, setSelectedItem] = useState('operations'); // Elementul selectat implicit
  const [filter, setFilter] = useState({ username: '', operation: '', startDate: '', endDate: '' }); // Filtre pentru operațiuni
  const [eventFilter, setEventFilter] = useState({ eventType: '', startDate: '', endDate: '' }); // Filtre pentru evenimente
  const [matchFilter, setMatchFilter] = useState({ eventType: '', startDate: '', endDate: '' }); // Filtre pentru istoricul meciurilor
  const [betFilter, setBetFilter] = useState({ category: '', startDate: '', endDate: '' }); // Filtre pentru pariuri
  const [invoiceFilter, setInvoiceFilter] = useState({ name: '', startDate: '', endDate: '' }); // Filtre pentru facturi
  const [uniqueEventTypes, setUniqueEventTypes] = useState([]); // Tipuri unice de evenimente
  const [uniqueNames, setUniqueNames] = useState([]); // Nume unice pentru facturi
  const [currentPage, setCurrentPage] = useState(1); // Pagină curentă pentru paginare

  const [selectedReport, setSelectedReport] = useState('matchHistoryByEventType'); // Raportul selectat
  const [reportStartDate, setReportStartDate] = useState(''); // Data de început pentru raport
  const [reportEndDate, setReportEndDate] = useState(''); // Data de sfârșit pentru raport
  const [matchTypeFilter, setMatchTypeFilter] = useState(''); // Filtru pentru tipul de meci
  const [eventLocationFilter, setEventLocationFilter] = useState(''); // Filtru pentru locația evenimentului
  const [userOperationFilter, setUserOperationFilter] = useState(''); // Filtru pentru tipul de operațiune a utilizatorului

  const navigate = useNavigate(); // Funcție pentru navigare între pagini
  const username = localStorage.getItem('username') || 'Manager'; // Numele utilizatorului logat

  const chartRef = useRef(); // Referință pentru grafic

  // Setăm localizarea moment la română
  moment.locale('ro');

  // UseEffect pentru a obține datele la montarea componentului
  useEffect(() => {
    // Obținem istoricul meciurilor
    axios.get('https://localhost:8081/match-history')
      .then(response => {
        setMatchHistory(response.data);
        // Extragem tipurile de evenimente unice din istoricul meciurilor
        const matchEventTypes = [...new Set(response.data.map(match => match.Tip_Eveniment))];
        setUniqueEventTypes(matchEventTypes);
      })
      .catch(error => console.error('Error fetching match history:', error));

    // Obținem evenimentele curente
    axios.get('https://localhost:8081/events')
      .then(response => {
        const events = response.data;
        setCurrentEvents(events);

        // Extragem tipurile de evenimente unice
        const eventTypes = [...new Set(events.map(event => event.Tip_Eveniment))];
        setUniqueEventTypes(eventTypes);
      })
      .catch(error => console.error('Error fetching current events:', error));

    // Obținem operațiunile înregistrate
    axios.get('https://localhost:8081/logged-operations')
      .then(response => {
        setLoggedOperations(response.data);
      })
      .catch(error => console.error('Error fetching logged operations:', error));

    // Obținem utilizatorii administratori
    axios.get('https://localhost:8081/admin-users')
      .then(response => {
        setAdminUsers(response.data);
      })
      .catch(error => console.error('Error fetching admin users:', error));

    // Obținem utilizatorii angajați
    axios.get('https://localhost:8081/employee-users')
      .then(response => {
        setEmployeeUsers(response.data);
      })
      .catch(error => console.error('Error fetching employee users:', error));

    // Obținem toate pariurile
    axios.get('https://localhost:8081/all-bets')
      .then(response => {
        setAllBets(response.data);
      })
      .catch(error => console.error('Error fetching all bets:', error));

    // Obținem facturile
    axios.get('https://localhost:8081/invoices')
      .then(response => {
        setInvoices(response.data);

        // Extragem numele unice pentru filtrul de facturi
        const names = [...new Set(response.data.map(invoice => invoice.Nume_Facturare))];
        setUniqueNames(names);
      })
      .catch(error => console.error('Error fetching invoices:', error));
  }, []);

  // Funcție pentru filtrarea datelor după dată
  const filterDataByDate = (data, dateField) => {
    return data.filter(item => {
      const itemDate = moment(item[dateField]);
      const start = reportStartDate ? moment(reportStartDate) : null;
      const end = reportEndDate ? moment(reportEndDate) : null;
      return (!start || itemDate.isSameOrAfter(start)) && (!end || itemDate.isSameOrBefore(end));
    });
  };

  // Funcție pentru selectarea unui element din sidebar
  const handleSelectItem = (item) => {
    setCurrentPage(1); // Resetează la prima pagină când se schimbă elementul selectat
    if (item === 'back') {
      navigate('/');
      window.location.reload(false); 
    } else {
      setSelectedItem(item);
    }
  };

  // Funcție pentru schimbarea filtrelor
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prevState => ({ ...prevState, [name]: value }));
  };

  const handleEventFilterChange = (e) => {
    const { name, value } = e.target;
    setEventFilter(prevState => ({ ...prevState, [name]: value }));
  };

  const handleMatchFilterChange = (e) => {
    const { name, value } = e.target;
    setMatchFilter(prevState => ({ ...prevState, [name]: value }));
  };

  const handleBetFilterChange = (e) => {
    const { name, value } = e.target;
    setBetFilter(prevState => ({ ...prevState, [name]: value }));
  };

  const handleInvoiceFilterChange = (e) => {
    const { name, value } = e.target;
    setInvoiceFilter(prevState => ({ ...prevState, [name]: value }));
  };

  const handleReportFilterChange = (e, filterName) => {
    const { value } = e.target;
    switch (filterName) {
      case 'startDate':
        setReportStartDate(value);
        break;
      case 'endDate':
        setReportEndDate(value);
        break;
      case 'matchType':
        setMatchTypeFilter(value);
        break;
      case 'eventLocation':
        setEventLocationFilter(value);
        break;
      case 'userOperation':
        setUserOperationFilter(value);
        break;
      default:
        break;
    }
  };

  // Funcție pentru filtrarea datelor pe baza unei funcții de filtrare
  const getFilteredData = (data, filterFn) => {
    return data.filter(filterFn);
  };

  // Funcție pentru obținerea datelor pentru pagina curentă
  const getPageData = (data) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Funcție pentru redarea paginării
  const renderPagination = (totalItems) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-button ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        {currentPage > 1 && (
          <button className="pagination-button" onClick={() => handlePageChange(currentPage - 1)}>
            {'<'}
          </button>
        )}
        {pages}
        {currentPage < totalPages && (
          <button className="pagination-button" onClick={() => handlePageChange(currentPage + 1)}>
            {'>'}
          </button>
        )}
      </div>
    );
  };

  // Filtrarea operațiunilor înregistrate
  const filteredOperations = getFilteredData(loggedOperations, operation => {
    const matchesUsername = filter.username ? operation.Nume.includes(filter.username) : true;
    const matchesOperation = filter.operation ? operation.Operatie.includes(filter.operation) : true;
    const matchesStartDate = filter.startDate ? moment(operation.Data).isAfter(moment(filter.startDate)) : true;
    const matchesEndDate = filter.endDate ? moment(operation.Data).isBefore(moment(filter.endDate)) : true;
    return matchesUsername && matchesOperation && matchesStartDate && matchesEndDate;
  });

  // Filtrarea evenimentelor curente
  const filteredEvents = getFilteredData(currentEvents, event => {
    const matchesEventType = eventFilter.eventType ? event.Tip_Eveniment === eventFilter.eventType : true;
    const matchesStartDate = eventFilter.startDate ? moment(event.Data_Eveniment).isAfter(moment(eventFilter.startDate)) : true;
    const matchesEndDate = eventFilter.endDate ? moment(event.Data_Eveniment).isBefore(moment(eventFilter.endDate)) : true;
    return matchesEventType && matchesStartDate && matchesEndDate;
  });

  // Filtrarea istoricului meciurilor
  const filteredMatchHistory = getFilteredData(matchHistory, match => {
    const matchesEventType = matchFilter.eventType ? match.Tip_Eveniment === matchFilter.eventType : true;
    const matchesStartDate = matchFilter.startDate ? moment(match.Data_Eveniment).isAfter(moment(matchFilter.startDate)) : true;
    const matchesEndDate = matchFilter.endDate ? moment(match.Data_Eveniment).isBefore(moment(matchFilter.endDate)) : true;
    return matchesEventType && matchesStartDate && matchesEndDate;
  });

  // Filtrarea pariurilor
  const filteredBets = getFilteredData(allBets, bet => {
    const matchesCategory = betFilter.category ? bet.Categorie.includes(betFilter.category) : true;
    const matchesStartDate = betFilter.startDate ? moment(bet.Data_Tranzactie).isAfter(moment(betFilter.startDate)) : true;
    const matchesEndDate = betFilter.endDate ? moment(bet.Data_Tranzactie).isBefore(moment(betFilter.endDate)) : true;
    return matchesCategory && matchesStartDate && matchesEndDate;
  });

  // Filtrarea facturilor
  const filteredInvoices = getFilteredData(invoices, invoice => {
    const matchesName = invoiceFilter.name ? invoice.Nume_Facturare.includes(invoiceFilter.name) : true;
    const matchesStartDate = invoiceFilter.startDate ? moment(invoice.Data_Facturare).isAfter(moment(invoiceFilter.startDate)) : true;
    const matchesEndDate = invoiceFilter.endDate ? moment(invoice.Data_Facturare).isBefore(moment(invoiceFilter.endDate)) : true;
    return matchesName && matchesStartDate && matchesEndDate;
  });

  // Pregătirea datelor pentru rapoarte
  const filteredMatchHistoryReport = filterDataByDate(matchHistory, 'Data_Eveniment')
    .filter(item => !matchTypeFilter || item.Tip_Eveniment === matchTypeFilter);
  const filteredCurrentEventsReport = filterDataByDate(currentEvents, 'Data_Eveniment')
    .filter(item => !eventLocationFilter || item.Locatie === eventLocationFilter);
  const filteredLoggedOperationsReport = filterDataByDate(loggedOperations, 'Data')
    .filter(item => !userOperationFilter || item.Operatie === userOperationFilter);
  const filteredAllBetsReport = filterDataByDate(allBets, 'Data_Tranzactie');
  const filteredInvoicesReport = filterDataByDate(invoices, 'Data_Facturare');

  // Datele pentru graficul "Istoric meciuri pe tip de eveniment"
  const matchHistoryByEventType = {
    labels: [...new Set(filteredMatchHistoryReport.map(item => item.Tip_Eveniment))],
    datasets: [
      {
        label: 'Match History by Event Type',
        data: [...new Set(filteredMatchHistoryReport.map(item => item.Tip_Eveniment))].map(eventType =>
          filteredMatchHistoryReport.filter(item => item.Tip_Eveniment === eventType).length
        ),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Datele pentru graficul "Evenimente curente pe locație"
  const currentEventsByLocation = {
    labels: [...new Set(filteredCurrentEventsReport.map(item => item.Locatie))],
    datasets: [
      {
        label: 'Current Events by Location',
        data: [...new Set(filteredCurrentEventsReport.map(item => item.Locatie))].map(location =>
          filteredCurrentEventsReport.filter(item => item.Locatie === location).length
        ),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Datele pentru graficul "Operațiuni înregistrate pe utilizator"
  const loggedOperationsByUser = {
    labels: [...new Set(filteredLoggedOperationsReport.map(item => item.Nume))],
    datasets: [
      {
        label: 'Logged Operations by User',
        data: [...new Set(filteredLoggedOperationsReport.map(item => item.Nume))].map(user =>
          filteredLoggedOperationsReport.filter(item => item.Nume === user).length
        ),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Datele pentru graficul "Operațiuni înregistrate pe tip"
  const loggedOperationsByType = {
    labels: [...new Set(filteredLoggedOperationsReport.map(item => item.Operatie))],
    datasets: [
      {
        label: 'Logged Operations by Type',
        data: [...new Set(filteredLoggedOperationsReport.map(item => item.Operatie))].map(operation =>
          filteredLoggedOperationsReport.filter(item => item.Operatie === operation).length
        ),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Datele pentru graficul "Pariuri pe categorie"
  const betsByCategory = {
    labels: [...new Set(filteredAllBetsReport.map(item => item.Categorie))],
    datasets: [
      {
        label: 'Bets by Category',
        data: [...new Set(filteredAllBetsReport.map(item => item.Categorie))].map(category =>
          filteredAllBetsReport.filter(item => item.Categorie === category).length
        ),
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Grouping and sorting invoices by date
  const invoicesByDate = filteredInvoicesReport.reduce((acc, invoice) => {
    const date = moment(invoice.Data_Facturare).format('MMM Do YY');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Sort dates in ascending order
  const sortedDates = Object.keys(invoicesByDate).sort((a, b) => moment(a, 'MMM Do YY').diff(moment(b, 'MMM Do YY')));
  const sortedInvoicesByDate = sortedDates.reduce((acc, date) => {
    acc[date] = invoicesByDate[date];
    return acc;
  }, {});

  const invoicesOverTime = {
    labels: Object.keys(sortedInvoicesByDate),
    datasets: [
      {
        label: 'Invoices Over Time',
        data: Object.values(sortedInvoicesByDate),
        fill: false,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Funcție pentru parsarea opțiunilor câștigătoare
  const parseWinningOptions = (winningOptions) => {
    try {
      const options = JSON.parse(winningOptions);
      return Object.entries(options).map(([key, value]) => {
        return (
          <div key={key}>
            <strong>{key}:</strong>
            {Object.entries(value).map(([innerKey, innerValue]) => (
              <div key={innerKey}>
                {innerKey} cu Cota: {innerValue}
              </div>
            ))}
          </div>
        );
      });
    } catch (error) {
      console.error('Error parsing winning options:', error);
      return <div>Error parsing winning options</div>;
    }
  };

  // Funcție pentru exportarea datelor în PDF
  const exportToPDF = (data, title) => {
    const doc = new jsPDF();
    doc.text(title, 20, 10);
    doc.autoTable({
      startY: 20,
      head: [Object.keys(data[0])],
      body: data.map(item => Object.values(item))
    });
    doc.save(`${title}.pdf`);
  };

  // Funcție pentru exportarea datelor în Excel
  const exportToExcel = (data, title) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  // Funcție pentru importarea datelor din Excel
  const importFromExcel = (file, setData) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      setData(data);
    };
    reader.readAsBinaryString(file);
  };

  // Funcție pentru gestionarea încărcării fișierului
  const handleFileUpload = (e, setData) => {
    const file = e.target.files[0];
    if (file) {
      importFromExcel(file, setData);
    }
  };

  // Funcție pentru exportarea graficului în PDF
  const exportChartToPDF = () => {
    if (chartRef.current) {
      const chart = chartRef.current;
      const image = chart.toBase64Image();
      const doc = new jsPDF();
      doc.text('Chart Report', 20, 10);
      doc.addImage(image, 'PNG', 15, 40, 180, 160);
      doc.save('chart-report.pdf');
    } else {
      console.error('Chart instance not available');
    }
  };

  return (
    <div className="manager-page-container">
      <Sidebar onSelect={handleSelectItem} selectedItem={selectedItem} />
      <div className="manager-page-content">
        <div className="welcome-section">
          <h1>Manager Page</h1>
          <p>Welcome to the manager dashboard, {username}.</p>
        </div>

        {selectedItem === 'operations' && (
          <>
            <h2>Logged Operations</h2>
            <div className="filter-controls">
              <label>
                Username:
                <select name="username" value={filter.username} onChange={handleFilterChange} className="filter-input">
                  <option value="">All</option>
                  {[...new Set(loggedOperations.map(op => op.Nume))].map((username, index) => (
                    <option key={index} value={username}>{username}</option>
                  ))}
                </select>
              </label>
              <label>
                Operation:
                <select name="operation" value={filter.operation} onChange={handleFilterChange} className="filter-input">
                  <option value="">All</option>
                  {[...new Set(loggedOperations.map(op => op.Operatie))].map((operation, index) => (
                    <option key={index} value={operation}>{operation}</option>
                  ))}
                </select>
              </label>
              <label>
                Start Date:
                <input
                  type="date"
                  name="startDate"
                  value={filter.startDate}
                  onChange={handleFilterChange}
                  className="filter-input"
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  name="endDate"
                  value={filter.endDate}
                  onChange={handleFilterChange}
                  className="filter-input"
                />
              </label>
            </div>
            {filteredOperations.length > 0 ? (
              <>
                <ul>
                  {getPageData(filteredOperations).map(operation => (
                    <li key={operation.ID}>
                      {operation.Nume} ({operation.Pozitie}) - {operation.Operatie} pe tabela {operation.Tabela} la data {moment(operation.Data).format('MMMM Do YYYY, HH:mm:ss')}
                    </li>
                  ))}
                </ul>
                {renderPagination(filteredOperations.length)}
                <div className="export-buttons">
                <button className="export-button" onClick={() => exportToPDF(filteredOperations, 'Operations')}>Export to PDF</button>
                <button className="export-button" onClick={() => exportToExcel(filteredOperations, 'Operations')}>Export to Excel</button>
                <label className="export-button">
                  Import from Excel
                  <input type="file" className="file-input" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, setMatchHistory)} />
                </label>
              </div>
              </>
            ) : (
              <p>No logged operations matching the filters.</p>
            )}
          </>
        )}

        {selectedItem === 'events' && (
          <>
            <h2>Current Events</h2>
            <div className="filter-controls">
              <label>
                Event Type:
                <select name="eventType" value={eventFilter.eventType} onChange={handleEventFilterChange} className="filter-input">
                  <option value="">All</option>
                  {uniqueEventTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label>
                Start Date:
                <input
                  type="date"
                  name="startDate"
                  value={eventFilter.startDate}
                  onChange={handleEventFilterChange}
                  className="filter-input"
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  name="endDate"
                  value={eventFilter.endDate}
                  onChange={handleEventFilterChange}
                  className="filter-input"
                />
              </label>
            </div>
            {filteredEvents.length > 0 ? (
              <>
                <ul>
                  {getPageData(filteredEvents).map(event => (
                    <li key={event.ID_Eveniment}>
                      {event.Tip_Eveniment} - {event.Echipa_unu} vs {event.Echipa_doi} la Locatia {event.Locatie} la data {moment(event.Data_Eveniment).format('MMMM Do YYYY, HH:mm:ss')}
                    </li>
                  ))}
                </ul>
                {renderPagination(filteredEvents.length)}
                <div className="export-buttons">
                <button className="export-button" onClick={() => exportToPDF(filteredEvents, 'Events')}>Export to PDF</button>
                <button className="export-button" onClick={() => exportToExcel(filteredEvents, 'Events')}>Export to Excel</button>
                <label className="export-button">
                  Import from Excel
                  <input type="file" className="file-input" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, setMatchHistory)} />
                </label>
              </div>
              </>
            ) : (
              <p>No current events matching the filters.</p>
            )}
          </>
        )}

        {selectedItem === 'matchHistory' && (
          <>
            <h2>Match History</h2>
            <div className="filter-controls">
              <label>
                Event Type:
                <select name="eventType" value={matchFilter.eventType} onChange={handleMatchFilterChange} className="filter-input">
                  <option value="">All</option>
                  {uniqueEventTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label>
                Start Date:
                <input
                  type="date"
                  name="startDate"
                  value={matchFilter.startDate}
                  onChange={handleMatchFilterChange}
                  className="filter-input"
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  name="endDate"
                  value={matchFilter.endDate}
                  onChange={handleMatchFilterChange}
                  className="filter-input"
                />
              </label>
            </div>
            {filteredMatchHistory.length > 0 ? (
              <>
                <ul>
                  {getPageData(filteredMatchHistory).map(match => (
                    <li key={match.id}>
                      {match.Echipa_unu} vs {match.Echipa_doi} - {moment(match.Data_Eveniment).format('MMMM Do YYYY, HH:mm:ss')}
                      <br />
                      Locatie: {match.Locatie}
                      <br />
                      Optiuni Castigatoare: 
                      <div>{parseWinningOptions(match.Optiuni_Castigatoare)}</div>
                      <br />
                      ID Eveniment: {match.ID_Eveniment}
                    </li>
                  ))}
                </ul>
                {renderPagination(filteredMatchHistory.length)}
                <div className="export-buttons">
                <button className="export-button" onClick={() => exportToPDF(filteredMatchHistory, 'MatchHistory')}>Export to PDF</button>
                <button className="export-button" onClick={() => exportToExcel(filteredMatchHistory, 'MatchHistory')}>Export to Excel</button>
                <label className="export-button">
                  Import from Excel
                  <input type="file" className="file-input" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, setMatchHistory)} />
                </label>
              </div>
              </>
            ) : (
              <p>No match history available.</p>
            )}
          </>
        )}

        {selectedItem === 'adminUsers' && (
          <>
            <h2>Admin Users</h2>
            {adminUsers.length > 0 ? (
              <>
                <ul>
                  {getPageData(adminUsers).map(user => (
                    <li key={user.ID_Utilizator}>
                      {user.Nume_Utilizator} - {user.Email} - {user.Pozitie}
                    </li>
                  ))}
                </ul>
                {renderPagination(adminUsers.length)}
                <div className="export-buttons">
                <button className="export-button" onClick={() => exportToPDF(adminUsers, 'adminUsers')}>Export to PDF</button>
                <button className="export-button" onClick={() => exportToExcel(adminUsers, 'adminUsers')}>Export to Excel</button>
                <label className="export-button">
                  Import from Excel
                  <input type="file" className="file-input" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, setMatchHistory)} />
                </label>
              </div>
              </>
            ) : (
              <p>No admin users available.</p>
            )}
          </>
        )}

        {selectedItem === 'employeeUsers' && (
          <>
            <h2>Employee Users</h2>
            {employeeUsers.length > 0 ? (
              <>
                <ul>
                  {getPageData(employeeUsers).map(user => (
                    <li key={user.ID_Utilizator}>
                      {user.Nume_Utilizator} - {user.Email} - {user.Pozitie}
                    </li>
                  ))}
                </ul>
                {renderPagination(employeeUsers.length)}
                <div className="export-buttons">
                <button className="export-button" onClick={() => exportToPDF(employeeUsers, 'employeeUsers')}>Export to PDF</button>
                <button className="export-button" onClick={() => exportToExcel(employeeUsers, 'employeeUsers')}>Export to Excel</button>
                <label className="export-button">
                  Import from Excel
                  <input type="file" className="file-input" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, setMatchHistory)} />
                </label>
              </div>
              </>
            ) : (
              <p>No employee users available.</p>
            )}
          </>
        )}

        {selectedItem === 'bets' && (
          <>
            <h2>All Bets</h2>
            <div className="filter-controls">
              <label>
                Category:
                <select name="category" value={betFilter.category} onChange={handleBetFilterChange} className="filter-input">
                  <option value="">All</option>
                  {[...new Set(allBets.map(bet => bet.Categorie))].map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label>
                Start Date:
                <input
                  type="date"
                  name="startDate"
                  value={betFilter.startDate}
                  onChange={handleBetFilterChange}
                  className="filter-input"
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  name="endDate"
                  value={betFilter.endDate}
                  onChange={handleBetFilterChange}
                  className="filter-input"
                />
              </label>
            </div>
            {filteredBets.length > 0 ? (
              <>
                <ul>
                  {getPageData(filteredBets).map(bet => (
                    <li key={bet.ID_Pariu}>
                      {bet.Descriere} - {bet.Categorie} - Bet Key: {bet.Cheia_Selectata} - Cota: {bet.Cota} - Suma: {bet.Suma} {bet.Moneda}
                      <br />
                      Transaction ID: {bet.ID_Tranzactie} - Data: {moment(bet.Data_Tranzactie).format('MMMM Do YYYY, HH:mm:ss')}
                    </li>
                  ))}
                </ul>
                {renderPagination(filteredBets.length)}
                <div className="export-buttons">
                <button className="export-button" onClick={() => exportToPDF(filteredBets, 'Bets')}>Export to PDF</button>
                <button className="export-button" onClick={() => exportToExcel(filteredBets, 'Bets')}>Export to Excel</button>
                <label className="export-button">
                  Import from Excel
                  <input type="file" className="file-input" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, setMatchHistory)} />
                </label>
              </div>
              </>
            ) : (
              <p>No bets available.</p>
            )}
          </>
        )}

        {selectedItem === 'invoices' && (
          <>
            <h2>Invoices</h2>
            <div className="filter-controls">
              <label>
                Name:
                <select name="name" value={invoiceFilter.name} onChange={handleInvoiceFilterChange} className="filter-input">
                  <option value="">All</option>
                  {uniqueNames.map((name, index) => (
                    <option key={index} value={name}>{name}</option>
                  ))}
                </select>
              </label>
              <label>
                Start Date:
                <input
                  type="date"
                  name="startDate"
                  value={invoiceFilter.startDate}
                  onChange={handleInvoiceFilterChange}
                  className="filter-input"
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  name="endDate"
                  value={invoiceFilter.endDate}
                  onChange={handleInvoiceFilterChange}
                  className="filter-input"
                />
              </label>
            </div>
            {filteredInvoices.length > 0 ? (
              <>
                <ul>
                  {getPageData(filteredInvoices).map(invoice => (
                    <li key={invoice.ID_Factura}>
                      Invoice ID: {invoice.ID_Factura} - Nume si Prenume: {invoice.Nume_Facturare} - Email: {invoice.Email_Factura}
                      <br />
                      Addresa: {invoice.Adresa_Facturare}, {invoice.Oras_Facturare}, {invoice.Cod_Postal}
                      <br />
                      User ID: {invoice.ID_Utilizator} - Data: {moment(invoice.Data_Facturare).format('MMMM Do YYYY, HH:mm:ss')}
                    </li>
                  ))}
                </ul>
                {renderPagination(filteredInvoices.length)}
                <div className="export-buttons">
                <button className="export-button" onClick={() => exportToPDF(filteredInvoices, 'Invoices')}>Export to PDF</button>
                <button className="export-button" onClick={() => exportToExcel(filteredInvoices, 'Invoices')}>Export to Excel</button>
                <label className="export-button">
                  Import from Excel
                  <input type="file" className="file-input" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, setMatchHistory)} />
                </label>
              </div>
              </>
            ) : (
              <p>No invoices available.</p>
            )}
          </>
        )}

        {selectedItem === 'reports' && (
          <div>
            <h2>Reports</h2>
            <div className="filter-controls">
              <label htmlFor="report-select">Select Report:</label>
              <select
                id="report-select"
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
              >
                <option value="matchHistoryByEventType">Match History by Event Type</option>
                <option value="currentEventsByLocation">Current Events by Location</option>
                <option value="loggedOperationsByUser">Logged Operations by User</option>
                <option value="loggedOperationsByType">Logged Operations by Type</option>
                <option value="betsByCategory">Bets by Category</option>
                <option value="invoicesOverTime">Invoices Over Time</option>
              </select>
            </div>

            <div className="filter-controls">
              <label htmlFor="start-date">Start Date:</label>
              <input
                type="date"
                id="start-date"
                value={reportStartDate}
                onChange={(e) => handleReportFilterChange(e, 'startDate')}
              />
              <label htmlFor="end-date">End Date:</label>
              <input
                type="date"
                id="end-date"
                value={reportEndDate}
                onChange={(e) => handleReportFilterChange(e, 'endDate')}
              />
            </div>

            {selectedReport === 'matchHistoryByEventType' && (
              <div>
                <label htmlFor="match-type-filter">Filter by Match Type:</label>
                <select
                  id="match-type-filter"
                  value={matchTypeFilter}
                  onChange={(e) => handleReportFilterChange(e, 'matchType')}
                >
                  <option value="">All</option>
                  {[...new Set(matchHistory.map(item => item.Tip_Eveniment))].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <h3>Match History by Event Type</h3>
                <div className="chart-container">
                  <Bar ref={chartRef} data={matchHistoryByEventType} options={options} />
                </div>
              </div>
            )}

            {selectedReport === 'currentEventsByLocation' && (
              <div>
                <label htmlFor="event-location-filter">Filter by Event Location:</label>
                <select
                  id="event-location-filter"
                  value={eventLocationFilter}
                  onChange={(e) => handleReportFilterChange(e, 'eventLocation')}
                >
                  <option value="">All</option>
                  {[...new Set(currentEvents.map(item => item.Locatie))].map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                <h3>Current Events by Location</h3>
                <div className="chart-container">
                  <Pie ref={chartRef} data={currentEventsByLocation} />
                </div>
              </div>
            )}

            {selectedReport === 'loggedOperationsByUser' && (
              <div>
                <label htmlFor="user-operation-filter">Filter by Operation Type:</label>
                <select
                  id="user-operation-filter"
                  value={userOperationFilter}
                  onChange={(e) => handleReportFilterChange(e, 'userOperation')}
                >
                  <option value="">All</option>
                  {[...new Set(loggedOperations.map(item => item.Operatie))].map(operation => (
                    <option key={operation} value={operation}>{operation}</option>
                  ))}
                </select>
                <h3>Logged Operations by User</h3>
                <div className="chart-container">
                  <Bar ref={chartRef} data={loggedOperationsByUser} options={options} />
                </div>
              </div>
            )}

            {selectedReport === 'loggedOperationsByType' && (
              <div>
                <h3>Logged Operations by Type</h3>
                <div className="chart-container">
                  <Pie ref={chartRef} data={loggedOperationsByType} />
                </div>
              </div>
            )}

            {selectedReport === 'betsByCategory' && (
              <div>
                <h3>Bets by Category</h3>
                <div className="chart-container">
                  <Bar ref={chartRef} data={betsByCategory} options={options} />
                </div>
              </div>
            )}

            {selectedReport === 'invoicesOverTime' && (
              <div>
                <h3>Invoices Over Time</h3>
                <div className="chart-container">
                  <Line ref={chartRef} data={invoicesOverTime} options={options} />
                </div>
              </div>
            )}

            <div className="export-buttons">
              <button className="export-button" onClick={exportChartToPDF}>Export Chart to PDF</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerPage;
