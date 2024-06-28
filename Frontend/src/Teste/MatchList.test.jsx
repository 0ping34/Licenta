import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MatchList from '../MatchList';
import { safeParseJSON } from '../utils';

// Mock safeParseJSON util pentru a intercepta apelurile și a folosi JSON.parse
jest.mock('../utils', () => ({
    safeParseJSON: jest.fn()
}));

// Date mock pentru meciuri
const mockMatches = [
    {
        ID_Eveniment: '1',
        Echipa_unu: 'Team A',
        Echipa_doi: 'Team B',
        Data_Eveniment: new Date(Date.now() + 10000).toISOString(),
        Locatie: 'Stadium 1',
        Tip_Eveniment: 'Fotbal',
        Optiuni_Pariuri: JSON.stringify({
            cote: {
                'Rezultat Final': {
                    '1': 1.5,
                    'X': 3.6,
                    '2': 2.1,
                }
            }
        })
    },
    {
        ID_Eveniment: '2',
        Echipa_unu: 'Team C',
        Echipa_doi: 'Team D',
        Data_Eveniment: new Date(Date.now() + 20000).toISOString(),
        Locatie: 'Stadium 2',
        Tip_Eveniment: 'Tenis',
        Optiuni_Pariuri: JSON.stringify({
            cote: {
                'Castigator Meci': {
                    '1': 1.8,
                    '2': 2.0,
                }
            }
        })
    }
];

// Test suite pentru componenta MatchList
describe('MatchList Component', () => {
    const onSelectionMock = jest.fn();
    const deletionDetailsMock = {};

    // Se rulează înainte de fiecare test pentru a reseta mock-urile și a configura safeParseJSON
    beforeEach(() => {
        jest.clearAllMocks();
        safeParseJSON.mockImplementation((json) => JSON.parse(json));
    });

    // Test pentru a verifica dacă detaliile unui meci se extind și se colapsează corect
    test('should handle match click to expand and collapse match details', () => {
        render(<MatchList matches={mockMatches} onSelection={onSelectionMock} deletionDetails={deletionDetailsMock} />);

        const matchHeader = screen.getByText((content, element) => content.includes('Team A'));
        fireEvent.click(matchHeader);

        // Asigură-te că doar un singur header "Rezultat Final" este vizibil (cel din detaliile meciului)
        const expandedMatchHeaders = screen.getAllByText(/Rezultat Final/).filter((element) => 
            element.closest('.match-details')
        );
        expect(expandedMatchHeaders.length).toBe(1);

        fireEvent.click(matchHeader);

        // Asigură-te că niciun header "Rezultat Final" nu este vizibil (deoarece meciul este colapsat)
        const collapsedMatchHeaders = screen.queryAllByText(/Rezultat Final/).filter((element) => 
            element.closest('.match-details')
        );
        expect(collapsedMatchHeaders.length).toBe(0);
    });

    // Test pentru a verifica dacă opțiunile de pariere se extind și se colapsează corect
    test('should handle category click to expand and collapse betting options', () => {
        render(<MatchList matches={mockMatches} onSelection={onSelectionMock} deletionDetails={deletionDetailsMock} />);

        const matchHeader = screen.getByText((content, element) => content.includes('Team A'));
        fireEvent.click(matchHeader);

        const categoryHeader = screen.getAllByText(/Rezultat Final/).filter((element) =>
            element.closest('.match-details')
        )[0];
        fireEvent.click(categoryHeader);

        expect(screen.queryByText('1: 1.5')).not.toBeInTheDocument();
        fireEvent.click(categoryHeader);

        expect(screen.getByText('1: 1.5')).toBeInTheDocument();
    });

    // Test pentru a verifica dacă selecția și deselectarea pariurilor funcționează corect
    test('should handle bet selection and deselection', () => {
        render(<MatchList matches={mockMatches} onSelection={onSelectionMock} deletionDetails={deletionDetailsMock} />);

        const matchHeader = screen.getByText((content, element) => content.includes('Team A'));
        fireEvent.click(matchHeader);

        const betOption = screen.getByText('1: 1.5');
        fireEvent.click(betOption);

        expect(onSelectionMock).toHaveBeenCalledWith('1', 'Team A vs Team B', { key: '1', odds: 1.5 }, false, 'Rezultat Final');

        fireEvent.click(betOption);

        expect(onSelectionMock).toHaveBeenCalledWith('1', 'Team A vs Team B', { key: '1', odds: 1.5 }, true, 'Rezultat Final');
    });
});
