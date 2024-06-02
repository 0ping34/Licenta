export function safeParseJSON(jsonString) {
    if (typeof jsonString === 'string') {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error("Failed to parse JSON", error);
            return {}; // Returnează un obiect gol în caz de eroare
        }
    } else {
        // Dacă nu este un string, presupunem că este deja un obiect
        return jsonString || {};
    }
}

