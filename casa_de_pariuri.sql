-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gazdă: 127.0.0.1
-- Timp de generare: iun. 02, 2024 la 10:39 PM
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
(23, 'Fotbal', 'Real Madrid', 'Manchester City', '2024-06-10 20:00:00', 'Santiago Bernabéu, Madrid', '{\"cote\":{\"Real Madrid\":2.5,\"Egalitate\":3.1,\"Manchester City\":2.8}}'),
(24, 'Fotbal', 'Liverpool', 'Chelsea', '2024-06-25 15:00:00', 'Anfield, Liverpool', '{\"cote\":{\"Liverpool\":1.8,\"Egalitate\":3.5,\"Chelsea\":3}}'),
(25, 'Tenis', ' Novak Djokovic', 'Rafael Nadal', '2024-06-19 19:00:00', 'All England Club, Londra', '{\"cote\":{\"Djokovic\":1.7,\"Nadal\":2.2}}');

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
  `ID_Utilizator` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eliminarea datelor din tabel `facturare`
--

INSERT INTO `facturare` (`ID_Factura`, `Nume_Facturare`, `Email_Factura`, `Adresa_Facturare`, `Oras_Facturare`, `Cod_Postal`, `ID_Utilizator`) VALUES
(298163429, 'A A', 'a@a.com', 'A', 'A', 80000, 233284668),
(513629489, 'A A', 'a@a.com', 'A', 'A', 80000, 233284668),
(766723322, 'A A', 'a@a.com', 'A', 'A', 80000, 260757247),
(844840036, 'A A', 'a@a.com', 'A', 'A', 80000, 233284668);

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `operati`
--

CREATE TABLE `operati` (
  `Nume` varchar(255) NOT NULL,
  `Pozitie` varchar(255) NOT NULL,
  `Operatie` varchar(255) NOT NULL,
  `Tabela` varchar(255) NOT NULL,
  `Data` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `pariu`
--

CREATE TABLE `pariu` (
  `ID_Pariu` int(11) NOT NULL,
  `Descriere` varchar(255) NOT NULL,
  `Cheia_Selectata` varchar(255) NOT NULL,
  `Cota` varchar(255) NOT NULL,
  `ID_Tranzactie` int(11) NOT NULL,
  `ID_Eveniment` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eliminarea datelor din tabel `pariu`
--

INSERT INTO `pariu` (`ID_Pariu`, `Descriere`, `Cheia_Selectata`, `Cota`, `ID_Tranzactie`, `ID_Eveniment`) VALUES
(91341404, 'Real Madrid vs Manchester City, Liverpool vs Chelsea', 'Manchester City, Chelsea', '2.8, 3', 710996335, 23);

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `tranzactie`
--

CREATE TABLE `tranzactie` (
  `ID_Tranzactie` int(255) NOT NULL,
  `Data_Tranzactie` datetime NOT NULL,
  `Suma_Totala` float NOT NULL,
  `Currency` varchar(255) NOT NULL,
  `ID_Utilizator` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eliminarea datelor din tabel `tranzactie`
--

INSERT INTO `tranzactie` (`ID_Tranzactie`, `Data_Tranzactie`, `Suma_Totala`, `Currency`, `ID_Utilizator`) VALUES
(710996335, '2024-06-02 23:38:04', 200, 'GBP', 260757247);

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `utilizatori`
--

CREATE TABLE `utilizatori` (
  `ID_Utilizator` int(255) NOT NULL,
  `Nume_Utilizator` varchar(255) NOT NULL,
  `Parola_Hash` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Pozitie` varchar(255) NOT NULL,
  `Data_Inregistrare` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eliminarea datelor din tabel `utilizatori`
--

INSERT INTO `utilizatori` (`ID_Utilizator`, `Nume_Utilizator`, `Parola_Hash`, `Email`, `Pozitie`, `Data_Inregistrare`) VALUES
(233284668, 'a', 'a', 'a@a', 'admin', '2024-05-31 16:10:19'),
(260757247, 'aa', 'aa', 'aa@a', 'utilizator', '2024-05-31 16:10:38'),
(414956754, 'aaa', 'aaa', 'aaa@a', 'utilizator', '2024-05-31 20:11:30');

--
-- Indexuri pentru tabele eliminate
--

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
-- Indexuri pentru tabele `pariu`
--
ALTER TABLE `pariu`
  ADD PRIMARY KEY (`ID_Pariu`),
  ADD KEY `ID_Tranzactie` (`ID_Tranzactie`,`ID_Eveniment`),
  ADD KEY `ID_Eveniment` (`ID_Eveniment`);

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
-- AUTO_INCREMENT pentru tabele `eveniment_sportiv`
--
ALTER TABLE `eveniment_sportiv`
  MODIFY `ID_Eveniment` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constrângeri pentru tabele eliminate
--

--
-- Constrângeri pentru tabele `facturare`
--
ALTER TABLE `facturare`
  ADD CONSTRAINT `ID_Utilizator` FOREIGN KEY (`ID_Utilizator`) REFERENCES `utilizatori` (`ID_Utilizator`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constrângeri pentru tabele `pariu`
--
ALTER TABLE `pariu`
  ADD CONSTRAINT `ID_Eveniment` FOREIGN KEY (`ID_Eveniment`) REFERENCES `eveniment_sportiv` (`ID_Eveniment`) ON DELETE CASCADE ON UPDATE CASCADE,
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
