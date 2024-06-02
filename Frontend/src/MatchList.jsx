import React, { useState, useEffect } from 'react';
import './MatchList.css';
import { safeParseJSON } from './utils';

function MatchList({ matches, onSelection, deletionDetails }) {
    const [selectedBets, setSelectedBets] = useState({});

    useEffect(() => {
        if (deletionDetails.type === 'single' && deletionDetails.key && deletionDetails.ID) {
            setSelectedBets(prevBets => {
                // Make a copy of the current state
                const updatedBets = { ...prevBets };
                // Check if the specific match bets exist and delete the betKey
                if (updatedBets[deletionDetails.ID] && updatedBets[deletionDetails.ID][deletionDetails.key]) {
                    delete updatedBets[deletionDetails.ID][deletionDetails.key];
                }
                // Return the updated bets, should cause re-render only if actual change happened
                return updatedBets;
            });
        } else if (deletionDetails.type === 'all') {
            setSelectedBets({}); // Clear all selected bets without causing dependency issues
        }
    }, [deletionDetails]); // Remove selectedBets from dependency array
    
    const handleSelectBet = (matchId, betKey) => {
        const match = matches.find(match => match.ID_Eveniment === matchId);
        if (!match) {
            console.error(`No match found with ID ${matchId}`);
            return;
        }

        const bettingOptions = safeParseJSON(match.Optiuni_Pariuri);
        if (!bettingOptions || !bettingOptions.cote || !(betKey in bettingOptions.cote)) {
            console.error('Invalid or missing betting options for:', matchId, bettingOptions);
            return;
        }

        // Toggle bet selection
        const currentBets = selectedBets[matchId] || {};
        const isCurrentlySelected = !!currentBets[betKey];
        const newBets = { ...currentBets, [betKey]: !isCurrentlySelected };
        setSelectedBets({ ...selectedBets, [matchId]: newBets });
        
        const MatchID=matchId;
        const teamNames = `${match.Echipa_unu} vs ${match.Echipa_doi}`;
        const odds = bettingOptions.cote[betKey];
        const selectedOption = {
            key: betKey,
            odds: odds
        };

        if (!isCurrentlySelected) {
            onSelection(MatchID,teamNames, selectedOption, false);
        } else {
            onSelection(MatchID,teamNames, selectedOption, true);
        }
    };

    if (matches.length === 0) {
        return <div>Loading matches...</div>;
    }

    return (
        <div className="match-list">
            {matches.map((match, index) => {
                const bettingOptions = safeParseJSON(match.Optiuni_Pariuri);
                if (!bettingOptions || !bettingOptions.cote) {
                    console.error('Invalid betting options', match.Optiuni_Pariuri);
                    return null;
                }
                const matchBets = selectedBets[match.ID_Eveniment] || {};
                return (
                    <div key={index} className="match-item">
                        <div>
                            {match.Echipa_unu} vs {match.Echipa_doi} - {new Date(match.Data_Eveniment).toLocaleString()}
                        </div>
                        <div className="betting-options">
                            {Object.entries(bettingOptions.cote).map(([key, odds], idx) => (
                                <button
                                    key={idx}
                                    className={`bet-option ${matchBets[key] ? 'selected' : ''}`}
                                    onClick={() => handleSelectBet(match.ID_Eveniment, key)}
                                >
                                    {key}: {odds}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default MatchList;
