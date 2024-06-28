// TermeniSiConditiiPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TermeniSiConditiiPage.css';

const TermeniSiConditiiPage = () => {
  const navigate = useNavigate();

  return (
    <div className="termeni-conditii-container">
      <button className="back-button" onClick={() => { navigate('/'); window.location.reload(false); }}>Back</button>
      <h1>Termeni și Condiții</h1>
      <div className="content">
        <h2>1. Introducere</h2>
        <p>Bine ați venit la AlphasBet. Acești termeni și condiții stabilesc regulile și reglementările pentru utilizarea site-ului web al AlphasBet.</p>

        <h2>2. Acceptarea Termenilor</h2>
        <p>Prin accesarea acestui site, presupunem că acceptați acești termeni și condiții în întregime. Nu continuați să utilizați site-ul AlphasBet dacă nu acceptați toți termenii și condițiile menționate pe această pagină.</p>

        <h2>3. Cookie-uri</h2>
        <p>Site-ul utilizează cookie-uri pentru a vă permite o experiență de navigare mai bună. Prin utilizarea site-ului nostru web, sunteți de acord cu utilizarea cookie-urilor în conformitate cu politica de confidențialitate a AlphasBet.</p>

        <h2>4. Licență</h2>
        <p>AlphasBet deține drepturile de proprietate intelectuală pentru toate materialele de pe site. Toate drepturile de proprietate intelectuală sunt rezervate.</p>

        <h2>5. Utilizarea Acceptabilă</h2>
        <p>Nu trebuie să utilizați acest site în niciun fel care provoacă sau poate provoca daune site-ului sau afectează accesul la site.</p>

        <h2>6. Contul Dumneavoastră</h2>
        <p>Sunteți responsabil pentru menținerea confidențialității contului și parolei dumneavoastră și pentru restricționarea accesului la contul dumneavoastră de pe orice dispozitiv.</p>

        <h2>7. Limitarea Răspunderii</h2>
        <p>AlphasBet nu va fi responsabil pentru daunele de orice fel care rezultă din utilizarea acestui site.</p>

        <h2>8. Modificări</h2>
        <p>AlphasBet își rezervă dreptul de a modifica acești termeni și condiții în orice moment. Este responsabilitatea dumneavoastră să verificați această pagină periodic pentru modificări.</p>

        <h2>9. Ștergerea Datelor</h2>
        <p>Meciurile istorice, datele de facturare și pariurile necastigătoare se vor șterge la 30 de zile după introducerea în sistem ale acestora.</p>

        <h2>10. Contactați-ne</h2>
        <p>Dacă aveți întrebări despre acești termeni și condiții, vă rugăm să ne contactați la numărul de telefon: +40 665 734 658 sau să vizitați o locație fizică.</p>
      </div>
    </div>
  );
};

export default TermeniSiConditiiPage;
