-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gazdă: 127.0.0.1
-- Timp de generare: iun. 28, 2024 la 08:54 PM
-- Versiune server: 10.4.32-MariaDB
-- Versiune PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Bază de date: `casa_de_pariuri`
--

DELIMITER $$
--
-- Proceduri
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `cleanup_meci` ()   BEGIN
    DECLARE cutoffDate DATE;
    SET cutoffDate = DATE_SUB(NOW(), INTERVAL 30 DAY);
    DELETE FROM meci2 WHERE Data_Eveniment < cutoffDate;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `cleanup_operati` ()   BEGIN
    DECLARE cutoffDate DATE;
    SET cutoffDate = DATE_SUB(NOW(), INTERVAL 30 DAY);
    DELETE FROM operati WHERE Data < cutoffDate;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `cleanup_tranzactie` ()   BEGIN
    DECLARE cutoffDate DATE;
    SET cutoffDate = DATE_SUB(NOW(), INTERVAL 30 DAY);
    DELETE FROM tranzactie WHERE Data_Tranzactie < cutoffDate;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteOldInvoices` ()   BEGIN
    DECLARE cutoffDate DATE;
    SET cutoffDate = DATE_SUB(NOW(), INTERVAL 30 DAY);
    DELETE FROM facturare WHERE Data_Facturare < cutoffDate;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `coduri_rol`
--

CREATE TABLE `coduri_rol` (
  `ID_Coduri` int(255) NOT NULL,
  `Valoare` int(255) NOT NULL,
  `Pozitie_Cod` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eliminarea datelor din tabel `coduri_rol`
--

INSERT INTO `coduri_rol` (`ID_Coduri`, `Valoare`, `Pozitie_Cod`) VALUES
(1, 123456789, 'admin'),
(2, 987654321, 'manager'),
(3, 123456780, 'angajat');

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `counter`
--

CREATE TABLE `counter` (
  `Indexuri` int(255) NOT NULL,
  `Counter` int(255) DEFAULT NULL,
  `Currency` varchar(255) DEFAULT NULL,
  `ID_Utilizator` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eliminarea datelor din tabel `counter`
--

INSERT INTO `counter` (`Indexuri`, `Counter`, `Currency`, `ID_Utilizator`) VALUES
(26, 0, 'RON', 587537221),
(27, 0, 'RON', 732474291),
(29, 0, 'RON', 862912367),
(31, 0, 'RON', 885844800),
(34, 0, 'RON', 868377000);

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `eveniment_sportiv`
--

CREATE TABLE `eveniment_sportiv` (
  `ID_Eveniment` int(255) NOT NULL,
  `Tip_Eveniment` varchar(255) NOT NULL,
  `Echipa_unu` varchar(255) NOT NULL,
  `Echipa_doi` varchar(255) NOT NULL,
  `Data_Eveniment` datetime NOT NULL,
  `Locatie` varchar(255) NOT NULL,
  `Optiuni_Pariuri` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`Optiuni_Pariuri`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eliminarea datelor din tabel `eveniment_sportiv`
--

INSERT INTO `eveniment_sportiv` (`ID_Eveniment`, `Tip_Eveniment`, `Echipa_unu`, `Echipa_doi`, `Data_Eveniment`, `Locatie`, `Optiuni_Pariuri`) VALUES
(189, 'Fotbal', 'A', 'B', '2024-07-07 18:56:00', 'C', '{\"cote\":{\"Rezultat Final\":{\"B\":2}}}');

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `facturare`
--

CREATE TABLE `facturare` (
  `ID_Factura` int(11) NOT NULL,
  `Nume_Facturare` varchar(255) NOT NULL,
  `Email_Factura` varchar(255) NOT NULL,
  `Adresa_Facturare` varchar(255) NOT NULL,
  `Oras_Facturare` varchar(255) NOT NULL,
  `Cod_Postal` int(11) NOT NULL,
  `Data_Facturare` datetime NOT NULL,
  `ID_Utilizator` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eliminarea datelor din tabel `facturare`
--

INSERT INTO `facturare` (`ID_Factura`, `Nume_Facturare`, `Email_Factura`, `Adresa_Facturare`, `Oras_Facturare`, `Cod_Postal`, `Data_Facturare`, `ID_Utilizator`) VALUES
(127537535, 'A A', 'aaa@a.com', 'Galati', 'Galati', 80008, '2024-06-28 09:23:55', 862912367),
(178416142, 'A A', 'aaa@a.com', 'Galati', 'Galati', 80008, '2024-06-28 11:27:32', 862912367),
(234881897, 'A A', 'aaa@a.com', 'Galati', 'Galati', 80008, '2024-06-27 19:26:41', 862912367),
(476033366, 'John Doe', 'sb-gphbu29958700@personal.example.com', '25 Lipscani Street', 'Bucharest', 12266, '2024-06-28 17:38:39', 587537221),
(742186816, 'A A', 'aaa@a.com', 'Galati', 'Galati', 80008, '2024-06-27 19:40:13', 862912367);

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `meciuri_istoric`
--

CREATE TABLE `meciuri_istoric` (
  `ID_Meci2` int(255) NOT NULL,
  `Tip_Eveniment` varchar(255) NOT NULL,
  `Echipa_unu` varchar(255) NOT NULL,
  `Echipa_doi` varchar(255) NOT NULL,
  `Data_Eveniment` datetime NOT NULL,
  `Locatie` varchar(255) NOT NULL,
  `Optiuni_Castigatoare` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`Optiuni_Castigatoare`)),
  `ID_Eveniment` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eliminarea datelor din tabel `meciuri_istoric`
--

INSERT INTO `meciuri_istoric` (`ID_Meci2`, `Tip_Eveniment`, `Echipa_unu`, `Echipa_doi`, `Data_Eveniment`, `Locatie`, `Optiuni_Castigatoare`, `ID_Eveniment`) VALUES
(91, 'Fotbal', 'A', 'B', '2024-06-29 15:02:00', 'C', '[\"Rezultat Final\",\"{\\\"A\\\":2\"]', 185);

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `operati`
--

CREATE TABLE `operati` (
  `ID_Operatie` int(255) NOT NULL,
  `Nume` varchar(255) NOT NULL,
  `Pozitie` varchar(255) NOT NULL,
  `Operatie` varchar(255) NOT NULL,
  `Tabela` varchar(255) NOT NULL,
  `Data` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eliminarea datelor din tabel `operati`
--

INSERT INTO `operati` (`ID_Operatie`, `Nume`, `Pozitie`, `Operatie`, `Tabela`, `Data`) VALUES
(1, 'aa', 'admin', 'create', 'eveniment_sportiv', '2024-06-26 19:57:00'),
(2, 'aa', 'admin', 'update', 'eveniment_sportiv', '2024-06-26 20:59:56'),
(3, 'aa', 'admin', 'create', 'eveniment_sportiv', '2024-06-27 18:56:25'),
(4, 'aa', 'admin', 'create', 'eveniment_sportiv', '2024-06-27 18:56:29'),
(5, 'aa', 'admin', 'create', 'eveniment_sportiv', '2024-06-27 18:56:32'),
(6, 'aaa', 'angajat', 'create', 'pariu', '2024-06-28 12:23:55'),
(7, 'aaa', 'angajat', 'create', 'pariu', '2024-06-28 14:27:32'),
(8, 'testuser', 'admin', 'create', 'utilizatori', '2024-06-28 16:22:20'),
(9, 'testuser', 'admin', 'create', 'utilizatori', '2024-06-28 16:29:42'),
(10, 'testuser', 'admin', 'create', 'utilizatori', '2024-06-28 16:34:40');

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `pariu`
--

CREATE TABLE `pariu` (
  `ID_Pariu` int(11) NOT NULL,
  `Descriere` varchar(255) NOT NULL,
  `Categorie` varchar(255) NOT NULL,
  `Cheia_Selectata` varchar(255) NOT NULL,
  `Cota` varchar(255) NOT NULL,
  `Suma` int(11) NOT NULL,
  `Moneda` varchar(255) NOT NULL,
  `Colectat` tinyint(1) NOT NULL,
  `Combinat` tinyint(1) NOT NULL,
  `ID_Eveniment` int(255) NOT NULL,
  `ID_Tranzactie` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eliminarea datelor din tabel `pariu`
--

INSERT INTO `pariu` (`ID_Pariu`, `Descriere`, `Categorie`, `Cheia_Selectata`, `Cota`, `Suma`, `Moneda`, `Colectat`, `Combinat`, `ID_Eveniment`, `ID_Tranzactie`) VALUES
(652992836, 'A vs B', 'Rezultat Final', 'A', '2', 100, 'RON', 1, 0, 185, 403117421),
(686294057, 'A vs B', 'Rezultat Final', 'A', '2', 100, 'RON', 0, 0, 185, 363397223);

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `tranzactie`
--

CREATE TABLE `tranzactie` (
  `ID_Tranzactie` int(255) NOT NULL,
  `Data_Tranzactie` datetime NOT NULL,
  `Suma_Totala` float NOT NULL,
  `Currency` varchar(255) NOT NULL,
  `ID_Utilizator` int(255) NOT NULL,
  `Capture_ID` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eliminarea datelor din tabel `tranzactie`
--

INSERT INTO `tranzactie` (`ID_Tranzactie`, `Data_Tranzactie`, `Suma_Totala`, `Currency`, `ID_Utilizator`, `Capture_ID`) VALUES
(363397223, '2024-06-28 12:23:55', 100, 'RON', 862912367, NULL),
(403117421, '2024-06-28 14:27:32', 100, 'RON', 862912367, NULL);

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `utilizatori`
--

CREATE TABLE `utilizatori` (
  `ID_Utilizator` int(255) NOT NULL,
  `Nume_Utilizator` varchar(255) NOT NULL,
  `Parola_Hash` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Varsta` int(255) NOT NULL,
  `Pozitie` varchar(255) NOT NULL,
  `Data_Inregistrare` datetime NOT NULL,
  `Confirmare` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eliminarea datelor din tabel `utilizatori`
--

INSERT INTO `utilizatori` (`ID_Utilizator`, `Nume_Utilizator`, `Parola_Hash`, `Email`, `Varsta`, `Pozitie`, `Data_Inregistrare`, `Confirmare`) VALUES
(587537221, 'a', '$2b$10$cgU7es/cADEYesgoiVDKHOgpo7UWGmaiSPXBjZAfvzGudaqsm4Kji', 'a@a.com', 26, 'admin', '2024-06-27 20:51:49', 1),
(732474291, 'aa', '$2b$10$LFAJ0IV/7DLuHOOvEAt.5.G29ehvm4h0X.Ah/3iAKndTRN/gb9zZ.', 'aa@a.com', 25, 'utilizator', '2024-06-27 20:56:42', 0),
(862912367, 'aaa', '$2b$10$wkdyJ04JOvwYOa26WZpFG.8OXw6V/dkO1qPob1u4x5bzTJsWAToHm', 'aaa@a.com', 27, 'angajat', '2024-06-27 22:24:59', 1),
(868377000, 'b', '$2b$10$1w8WJxawqcgQjGja/1ysOOtXgLBPl/6qL8bBamF37H/TpRVjbyto.', 'b@b.com', 29, 'utilizator', '2024-06-28 12:31:25', 0),
(885844800, 'aaaa', '$2b$10$xGseRHFf46tecLATEsOovuB3/W1ZE.sJ.M5iTwPFfxgdbD73IRXVC', 'aaaa@a.com', 28, 'manager', '2024-06-28 12:14:48', 1);

--
-- Indexuri pentru tabele eliminate
--

--
-- Indexuri pentru tabele `coduri_rol`
--
ALTER TABLE `coduri_rol`
  ADD PRIMARY KEY (`ID_Coduri`);

--
-- Indexuri pentru tabele `counter`
--
ALTER TABLE `counter`
  ADD PRIMARY KEY (`Indexuri`),
  ADD KEY `ID_Utilizator2` (`ID_Utilizator`);

--
-- Indexuri pentru tabele `eveniment_sportiv`
--
ALTER TABLE `eveniment_sportiv`
  ADD PRIMARY KEY (`ID_Eveniment`);

--
-- Indexuri pentru tabele `facturare`
--
ALTER TABLE `facturare`
  ADD PRIMARY KEY (`ID_Factura`),
  ADD KEY `ID_Utilizator` (`ID_Utilizator`);

--
-- Indexuri pentru tabele `meciuri_istoric`
--
ALTER TABLE `meciuri_istoric`
  ADD PRIMARY KEY (`ID_Meci2`);

--
-- Indexuri pentru tabele `operati`
--
ALTER TABLE `operati`
  ADD PRIMARY KEY (`ID_Operatie`);

--
-- Indexuri pentru tabele `pariu`
--
ALTER TABLE `pariu`
  ADD PRIMARY KEY (`ID_Pariu`),
  ADD KEY `ID_Tranzactie` (`ID_Tranzactie`);

--
-- Indexuri pentru tabele `tranzactie`
--
ALTER TABLE `tranzactie`
  ADD PRIMARY KEY (`ID_Tranzactie`),
  ADD KEY `ID_Utilizator` (`ID_Utilizator`);

--
-- Indexuri pentru tabele `utilizatori`
--
ALTER TABLE `utilizatori`
  ADD PRIMARY KEY (`ID_Utilizator`);

--
-- AUTO_INCREMENT pentru tabele eliminate
--

--
-- AUTO_INCREMENT pentru tabele `coduri_rol`
--
ALTER TABLE `coduri_rol`
  MODIFY `ID_Coduri` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pentru tabele `counter`
--
ALTER TABLE `counter`
  MODIFY `Indexuri` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT pentru tabele `eveniment_sportiv`
--
ALTER TABLE `eveniment_sportiv`
  MODIFY `ID_Eveniment` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=190;

--
-- AUTO_INCREMENT pentru tabele `meciuri_istoric`
--
ALTER TABLE `meciuri_istoric`
  MODIFY `ID_Meci2` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

--
-- AUTO_INCREMENT pentru tabele `operati`
--
ALTER TABLE `operati`
  MODIFY `ID_Operatie` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constrângeri pentru tabele eliminate
--

--
-- Constrângeri pentru tabele `counter`
--
ALTER TABLE `counter`
  ADD CONSTRAINT `ID_Utilizator2` FOREIGN KEY (`ID_Utilizator`) REFERENCES `utilizatori` (`ID_Utilizator`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constrângeri pentru tabele `facturare`
--
ALTER TABLE `facturare`
  ADD CONSTRAINT `ID_Utilizator` FOREIGN KEY (`ID_Utilizator`) REFERENCES `utilizatori` (`ID_Utilizator`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constrângeri pentru tabele `pariu`
--
ALTER TABLE `pariu`
  ADD CONSTRAINT `ID_Tranzactie` FOREIGN KEY (`ID_Tranzactie`) REFERENCES `tranzactie` (`ID_Tranzactie`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constrângeri pentru tabele `tranzactie`
--
ALTER TABLE `tranzactie`
  ADD CONSTRAINT `Tranz` FOREIGN KEY (`ID_Utilizator`) REFERENCES `utilizatori` (`ID_Utilizator`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
