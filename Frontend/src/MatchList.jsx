import React, { useState, useEffect } from 'react';
import './MatchList.css';
import { safeParseJSON } from './utils';

// Definirea categoriilor de pariuri disponibile pentru fiecare tip de eveniment
const betCategories = {
    Fotbal: ['Rezultat Final', 'Sansa Dubla', 'Total Goluri'],
    Tenis: ['Castigator Meci', 'Set 3 Total Game-uri', 'Total Game-uri'],
    Baschet: ['Rezultat Final', 'Handicap Puncte', 'Total Puncte'],
};

// Definirea numărului de opțiuni pe rând pentru fiecare categorie de pariu
const optionsPerRow = {
    'Rezultat Final': 3,
    'Sansa Dubla': 3,
    'Total Goluri': 2,
    'Castigator Meci': 2,
    'Set 3 Total Game-uri': 2,
    'Total Game-uri': 2,
    'Handicap Puncte': 2,
    'Total Puncte': 2,
};

function MatchList({ matches, onSelection, deletionDetails }) {
    const [selectedBets, setSelectedBets] = useState({});
    const [expandedMatchId, setExpandedMatchId] = useState(null);
    const [collapsedCategories, setCollapsedCategories] = useState({});
    const [filteredMatches, setFilteredMatches] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    // Filtrează meciurile în funcție de categorie și data evenimentului
    useEffect(() => {
        filterMatches();
    }, [matches, selectedCategory]);

    // Setează categoria inițială de pariu în funcție de tipul de eveniment al primului meci
    useEffect(() => {
        if (matches.length > 0) {
            const initialCategory = betCategories[matches[0].Tip_Eveniment][0];
            setSelectedCategory(initialCategory);
        }
    }, [matches]);

    const filterMatches = () => {
        const currentDate = new Date();
        const futureMatches = matches.filter(match => new Date(match.Data_Eveniment) > currentDate);
        const categoryMatches = futureMatches.filter(match => {
            const bettingOptions = safeParseJSON(match.Optiuni_Pariuri);
            return bettingOptions && bettingOptions.cote && bettingOptions.cote[selectedCategory];
        });

        setFilteredMatches(categoryMatches);
    };

    // Gestionează ștergerea unui pariu selectat
    useEffect(() => {
        if (deletionDetails.type === 'single' && deletionDetails.key && deletionDetails.ID && deletionDetails.category) {
            setSelectedBets(prevBets => {
                const updatedBets = { ...prevBets };
                if (updatedBets[deletionDetails.ID] && updatedBets[deletionDetails.ID][deletionDetails.category]) {
                    delete updatedBets[deletionDetails.ID][deletionDetails.category][deletionDetails.key];
                    if (Object.keys(updatedBets[deletionDetails.ID][deletionDetails.category]).length === 0) {
                        delete updatedBets[deletionDetails.ID][deletionDetails.category];
                    }
                    if (Object.keys(updatedBets[deletionDetails.ID]).length === 0) {
                        delete updatedBets[deletionDetails.ID];
                    }
                }
                return updatedBets;
            });
        } else if (deletionDetails.type === 'all') {
            setSelectedBets({});
        }
    }, [deletionDetails]);

    const handleSelectBet = (matchId, category, betKey) => {
        const match = matches.find(match => match.ID_Eveniment === matchId);
        if (!match) {
            console.error(`No match found with ID ${matchId}`);
            return;
        }

        const bettingOptions = safeParseJSON(match.Optiuni_Pariuri);
        if (!bettingOptions || !bettingOptions.cote || !bettingOptions.cote[category] || !(betKey in bettingOptions.cote[category])) {
            console.error('Invalid or missing betting options for:', matchId, bettingOptions);
            return;
        }

        const currentBets = selectedBets[matchId] && selectedBets[matchId][category] ? selectedBets[matchId][category] : {};
        const isCurrentlySelected = !!currentBets[betKey];
        const newBets = { ...currentBets, [betKey]: !isCurrentlySelected };

        if (!isCurrentlySelected) {
            setSelectedBets({
                ...selectedBets,
                [matchId]: {
                    ...selectedBets[matchId],
                    [category]: newBets
                }
            });
            onSelection(matchId, `${match.Echipa_unu} vs ${match.Echipa_doi}`, { key: betKey, odds: bettingOptions.cote[category][betKey] }, false, category);
        } else {
            const { [betKey]: _, ...remainingBets } = newBets;
            setSelectedBets({
                ...selectedBets,
                [matchId]: {
                    ...selectedBets[matchId],
                    [category]: remainingBets
                }
            });
            onSelection(matchId, `${match.Echipa_unu} vs ${match.Echipa_doi}`, { key: betKey, odds: bettingOptions.cote[category][betKey] }, true, category);
        }
    };

    const handleMatchClick = (matchId) => {
        if (expandedMatchId === matchId) {
            setExpandedMatchId(null); // Colapsează dacă este deja extins
        } else {
            setExpandedMatchId(matchId); // Extinde meciul clicat
        }
    };

    const handleCategoryClick = (matchId, category, e) => {
        e.stopPropagation();
        setCollapsedCategories(prevState => ({
            ...prevState,
            [matchId]: {
                ...prevState[matchId],
                [category]: !prevState[matchId]?.[category]
            }
        }));
    };

    if (filteredMatches.length === 0) {
        return <div>No matches found</div>;
    }

    return (
        <div>
            <div className="filters">
                <label>
                    Categoria:
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        {matches.length > 0 && betCategories[matches[0].Tip_Eveniment].map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </label>
            </div>
            <div className="match-list">
                {filteredMatches.map((match, index) => {
                    const bettingOptions = safeParseJSON(match.Optiuni_Pariuri);
                    if (!bettingOptions || !bettingOptions.cote || !bettingOptions.cote[selectedCategory]) {
                        console.error('Invalid betting options or missing selected category', match.Optiuni_Pariuri);
                        return null;
                    }

                    const matchBets = selectedBets[match.ID_Eveniment] || {};
                    const categoryBets = matchBets[selectedCategory] || {};

                    return (
                        <div key={index} className={`match-item ${expandedMatchId === match.ID_Eveniment ? 'expanded' : ''}`}>
                            <div className="match-header" onClick={() => handleMatchClick(match.ID_Eveniment)}>
                                <div className="teams">
                                    {match.Echipa_unu}
                                    <span className="vs"> vs </span>
                                    {match.Echipa_doi}
                                </div>
                                <div className="match-info">
                                    <span className="date">{new Date(match.Data_Eveniment).toLocaleString()}</span>
                                    <span className="location">Locație: {match.Locatie}</span>
                                </div>
                            </div>
                            {expandedMatchId === match.ID_Eveniment ? (
                                <div className="match-details">
                                    {Object.entries(bettingOptions.cote).map(([category, options]) => (
                                        <div key={category} className="betting-category">
                                            <h4 onClick={(e) => handleCategoryClick(match.ID_Eveniment, category, e)}>
                                                {category}
                                                <span className={`category-arrow ${collapsedCategories[match.ID_Eveniment]?.[category] ? 'collapsed' : ''}`}>▼</span>
                                            </h4>
                                            {!collapsedCategories[match.ID_Eveniment]?.[category] && (
                                                <div className="betting-options full-width">
                                                    {Object.entries(options).map(([key, odds], idx) => {
                                                        const maxOptions = optionsPerRow[category];
                                                        return (
                                                            <React.Fragment key={idx}>
                                                                {idx % maxOptions === 0 && idx > 0 && <div className="option-break"></div>}
                                                                <button
                                                                    className={`bet-option ${matchBets[category] && matchBets[category][key] ? 'selected' : ''}`}
                                                                    onClick={() => handleSelectBet(match.ID_Eveniment, category, key)}
                                                                >
                                                                    {key}: {odds}
                                                                </button>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="betting-category">
                                    <h4>{selectedCategory}</h4>
                                    <div className="betting-options full-width">
                                        {Object.entries(bettingOptions.cote[selectedCategory]).map(([key, odds], idx) => {
                                            const maxOptions = optionsPerRow[selectedCategory];
                                            return (
                                                <React.Fragment key={idx}>
                                                    {idx % maxOptions === 0 && idx > 0 && <div className="option-break"></div>}
                                                    <button
                                                        className={`bet-option ${categoryBets[key] ? 'selected' : ''}`}
                                                        onClick={() => handleSelectBet(match.ID_Eveniment, selectedCategory, key)}
                                                    >
                                                        {key}: {odds}
                                                    </button>
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default MatchList;
