-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gazdă: 127.0.0.1
-- Timp de generare: iul. 16, 2024 la 04:36 PM
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
(26, 200, 'RON', 587537221),
(29, 600, 'RON', 862912367),
(31, 0, 'RON', 885844800),
(46, 10200, 'RON', 394324337),
(47, 0, 'RON', 477055056);

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
(193, 'Fotbal', 'FC Barcelona', 'Real Madrid', '2024-08-15 18:30:00', 'Camp Nou, Barcelona', '{\"cote\":{\"Rezultat Final\":{\"FC Barcelona\":2.8,\"Egal\":2.3,\"Real Madrid\":2},\"Sansa Dubla\":{\"12\":1.2,\"1X\":1.4,\"X2\":1.5},\"Total Goluri\":{\"Peste 2.5\":1.9,\"Sub 2.5\":1.8}}}'),
(194, 'Fotbal', ' Manchester United', 'Liverpool FC', '2024-09-10 16:00:00', 'Old Trafford, Manchester', '{\"cote\":{\"Rezultat Final\":{\"Manchester United\":2.7,\"Egal\":3.2,\"Liverpool FC\":2.5},\"Sansa Dubla\":{\"12\":1.25,\"1X\":1.45,\"X2\":1.5},\"Total Goluri\":{\"Peste 2.5\":1.85,\"Sub 2.5\":1.95}}}'),
(195, 'Tenis', 'Novak Djokovic', 'Rafael Nadal', '2024-07-20 14:00:00', 'Wimbledon, Londra', '{\"cote\":{\"Castigator Meci\":{\"Novak Djokovic\":1.8,\"Rafael Nadal\":2},\"Set 3 Total Game-uri\":{\"Peste 10.5\":1.75,\"Sub 10.5\":2},\"Total Game-uri\":{\"Peste 40.5\":1.9,\"Sub 40.5\":1.85}}}'),
(196, 'Baschet', 'Los Angeles Lakers', 'Golden State Warriors', '2024-10-01 19:00:00', 'Staples Center, Los Angeles', '{\"cote\":{\"Rezultat Final\":{\"Los Angeles Lakers\":2,\"Golden State Warriors\":1.9},\"Handicap Puncte\":{\"Los Angeles Lakers +5.5\":1.85,\"Golden State Warriors -5.5\":1.85},\"Total Puncte\":{\"Peste 210.5\":1.95,\"Sub 210.5\":1.85}}}'),
(197, 'Baschet', 'Chicago Bulls', 'Miami Heat', '2024-11-15 18:30:00', 'Staples Center, Los Angeles', '{\"cote\":{\"Rezultat Final\":{\"Chicago Bulls\":2.2,\"Miami Heat\":1.75},\"Handicap Puncte\":{\"Chicago Bulls +4.5\":1.8,\"Miami Heat -4.5\":1.9},\"Total Puncte\":{\"Peste 200.5\":1.9,\"Sub 200.5\":1.9}}}'),
(198, 'Fotbal', 'Chelsea FC', 'Arsenal FC', '2024-08-20 18:00:00', 'Stamford Bridge, Londra', '{\"cote\":{\"Rezultat Final\":{\"Chelsea FC\":2.3,\"Egal\":3.4,\"Arsenal FC\":3},\"Sansa Dubla\":{\"12\":1.25,\"1X\":1.35,\"X2\":1.55}}}');

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
(15327894, ' John Doe', 'sb-gphbu29958700@personal.example.com', 'Galati', 'Galati', 80008, '2024-07-16 13:32:43', 862912367),
(41010333, ' John Doe', 'a@a.com', 'Galati', 'Galati', 80008, '2024-07-16 13:42:26', 862912367),
(45781765, ' John Doe', 'sb-gphbu29958700@personal.example.com', 'Galati', 'Galati', 80008, '2024-07-16 13:19:32', 862912367),
(127537535, 'A A', 'aaa@a.com', 'Galati', 'Galati', 80008, '2024-06-28 09:23:55', 862912367),
(178416142, 'A A', 'aaa@a.com', 'Galati', 'Galati', 80008, '2024-06-28 11:27:32', 862912367),
(234881897, 'A A', 'aaa@a.com', 'Galati', 'Galati', 80008, '2024-06-27 19:26:41', 862912367),
(296154600, 'John Doe', 'sb-gphbu29958700@personal.example.com', '25 Lipscani Street', 'Bucharest', 12266, '2024-07-16 13:18:27', 394324337),
(326152072, 'John Doe', 'sb-gphbu29958700@personal.example.com', '25 Lipscani Street', 'Bucharest', 12266, '2024-07-16 13:45:13', 394324337),
(381990553, 'John Doe', 'sb-gphbu29958700@personal.example.com', '25 Lipscani Street', 'Bucharest', 12266, '2024-07-16 14:09:06', 587537221),
(387631337, 'A A', 'a@a.com', 'Galati', 'Galati', 80008, '2024-07-02 17:38:20', 862912367),
(409959011, 'John Doe', 'sb-gphbu29958700@personal.example.com', '25 Lipscani Street', 'Bucharest', 12266, '2024-07-02 17:36:34', 394324337),
(476033366, 'John Doe', 'sb-gphbu29958700@personal.example.com', '25 Lipscani Street', 'Bucharest', 12266, '2024-06-28 17:38:39', 587537221),
(528217937, 'John Doe', 'sb-gphbu29958700@personal.example.com', '25 Lipscani Street', 'Bucharest', 12266, '2024-07-16 13:36:45', 394324337),
(550545641, ' John Doe', 'a@a.com', 'Galati', 'Galati', 80008, '2024-07-16 13:46:52', 862912367),
(742186816, 'A A', 'aaa@a.com', 'Galati', 'Galati', 80008, '2024-06-27 19:40:13', 862912367),
(848712693, ' John Doe', 'sb-gphbu29958700@personal.example.com', 'Galati', 'Galati', 80008, '2024-07-16 13:37:57', 862912367),
(864495006, 'John Doe', 'sb-gphbu29958700@personal.example.com', '25 Lipscani Street', 'Bucharest', 12266, '2024-07-16 13:46:03', 394324337),
(936352408, 'John Doe', 'sb-gphbu29958700@personal.example.com', '25 Lipscani Street', 'Bucharest', 12266, '2024-07-16 13:30:55', 394324337);

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
(93, 'Fotbal', 'Juventus', 'AC Milan', '2024-06-05 20:00:00', 'Allianz Stadium, Torino', '{\"Rezultat Final\":{\"AC Milan\":2.9},\"Total Goluri\":{\"Peste 2.5\":1.95}}', 199),
(96, 'Tenis', 'Simona Halep', 'Ashleigh Barty', '2024-06-10 13:00:00', 'Roland Garros, Paris', '{\"Castigator Meci\":{\"Simona Halep\":2},\"Set 3 Total Game-uri\":{\"Peste 10.5\":1.8}}', 204),
(97, 'Baschet', 'A', 'B', '2024-05-18 14:00:00', 'C', '{\"Rezultat Final\":{\"A\":2}}', 205),
(98, 'Tenis', 'Roger Federer', 'Andy Murray', '2024-03-15 16:00:00', 'Australian Open, Melbourne', '{\"Castigator Meci\":{\"Roger Federer\":1.9},\"Total Game-uri\":{\"Sub 38.5\":1.9}}', 201),
(99, 'Tenis', ' Serena Williams', 'Naomi Osaka', '2024-06-02 12:00:00', 'US Open, New York', '{\"Castigator Meci\":{\"Naomi Osaka\":1.75},\"Set 3 Total Game-uri\":{\"Sub 9.5\":2},\"Total Game-uri\":{\"Sub 36.5\":1.9}}', 200),
(100, 'Fotbal', 'A', 'B', '2024-06-02 14:07:00', 'V', '{\"Rezultat Final\":{\"A\":2}}', 210);

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
(10, 'testuser', 'admin', 'create', 'utilizatori', '2024-06-28 16:34:40'),
(11, 'a', 'admin', 'delete', 'eveniment_sportiv', '2024-07-02 20:24:56'),
(12, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-02 20:29:54'),
(13, 'a', 'admin', 'delete', 'eveniment_sportiv', '2024-07-02 20:30:14'),
(14, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-02 20:30:57'),
(15, 'a', 'admin', 'update', 'eveniment_sportiv', '2024-07-02 20:31:05'),
(16, 'aaa', 'angajat', 'create', 'pariu', '2024-07-02 20:38:20'),
(17, 'a', 'admin', 'update', 'eveniment_sportiv', '2024-07-02 20:39:49'),
(18, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-02 20:57:59'),
(19, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 13:22:04'),
(20, 'a', 'admin', 'update', 'eveniment_sportiv', '2024-07-16 13:22:47'),
(21, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 13:25:39'),
(22, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 13:27:49'),
(23, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 13:30:53'),
(24, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 13:33:05'),
(25, 'a', 'admin', 'update', 'eveniment_sportiv', '2024-07-16 13:34:28'),
(26, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 13:39:32'),
(27, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 13:41:34'),
(28, 'a', 'admin', 'update', 'eveniment_sportiv', '2024-07-16 13:42:39'),
(29, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 13:45:49'),
(30, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 13:47:33'),
(31, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 13:48:29'),
(32, 'a', 'admin', 'delete', 'meciuri_istoric', '2024-07-16 13:48:46'),
(33, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 13:49:45'),
(34, 'a', 'admin', 'delete', 'meciuri_istoric', '2024-07-16 13:49:59'),
(35, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 13:51:43'),
(36, 'a', 'admin', 'update', 'eveniment_sportiv', '2024-07-16 13:56:52'),
(37, 'a', 'admin', 'update', 'eveniment_sportiv', '2024-07-16 14:00:43'),
(38, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 14:13:19'),
(39, 'aaa', 'angajat', 'create', 'pariu', '2024-07-16 16:19:32'),
(40, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 16:22:40'),
(41, 'a', 'admin', 'update', 'eveniment_sportiv', '2024-07-16 16:22:59'),
(42, 'a', 'admin', 'update', 'eveniment_sportiv', '2024-07-16 16:23:19'),
(43, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 16:26:44'),
(44, 'a', 'admin', 'update', 'eveniment_sportiv', '2024-07-16 16:27:20'),
(45, 'aaa', 'angajat', 'create', 'pariu', '2024-07-16 16:32:43'),
(46, 'aaa', 'angajat', 'create', 'pariu', '2024-07-16 16:37:57'),
(47, 'aaa', 'angajat', 'create', 'pariu', '2024-07-16 16:42:26'),
(48, 'a', 'admin', 'update', 'eveniment_sportiv', '2024-07-16 16:42:56'),
(49, 'aaa', 'angajat', 'create', 'pariu', '2024-07-16 16:46:52'),
(50, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 16:47:41'),
(51, 'a', 'admin', 'update', 'eveniment_sportiv', '2024-07-16 16:47:53'),
(52, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 16:57:26'),
(53, 'a', 'admin', 'create', 'eveniment_sportiv', '2024-07-16 17:07:35'),
(54, 'a', 'admin', 'update', 'eveniment_sportiv', '2024-07-16 17:07:52'),
(55, 'a', 'admin', 'update', 'eveniment_sportiv', '2024-07-16 17:09:18'),
(56, 'testuser', 'admin', 'create', 'utilizatori', '2024-07-16 17:34:02');

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
(243847165, 'FC Barcelona vs Real Madrid', 'Rezultat Final', 'FC Barcelona', '2.8', 100, 'RON', 0, 0, 193, 942504357),
(373960134, 'A vs B', 'Rezultat Final', 'A', '2', 100, 'RON', 1, 0, 210, 768165391),
(492068858, 'FC Barcelona vs Real Madrid', 'Rezultat Final', 'FC Barcelona', '2.8', 100, 'RON', 0, 0, 193, 383019873),
(758871954, 'A vs B', 'Rezultat Final', 'B', '3', 100, 'RON', 0, 0, 210, 768165391);

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
(383019873, '2024-07-16 16:46:03', 100, 'RON', 394324337, '4DN06578GR977172J'),
(768165391, '2024-07-16 17:09:06', 200, 'RON', 587537221, '91M554389V973392G'),
(942504357, '2024-07-16 16:36:45', 100, 'RON', 394324337, '9JV39724UD4999610');

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
(394324337, 'b', '$2b$10$FlHFD4YE90Qn5LDoBgX2CerK35r3VJ0x9FiYn2Fqy1iT1q1t1cmiu', 'b@b.com', 25, 'utilizator', '2024-07-02 20:24:15', 1),
(477055056, 'testuser', '$2b$10$3PX0ky0NdR5Hw.JTiZzasOZAk1cw06hk/fdTMtMWgatsXPdVRtQ2C', 'testuser@example.com', 34, 'user', '2024-07-16 17:34:00', 0),
(587537221, 'a', '$2b$10$cgU7es/cADEYesgoiVDKHOgpo7UWGmaiSPXBjZAfvzGudaqsm4Kji', 'a@a.com', 26, 'admin', '2024-06-27 20:51:49', 1),
(862912367, 'aaa', '$2b$10$wkdyJ04JOvwYOa26WZpFG.8OXw6V/dkO1qPob1u4x5bzTJsWAToHm', 'aaa@a.com', 27, 'angajat', '2024-06-27 22:24:59', 1),
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
  MODIFY `Indexuri` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT pentru tabele `eveniment_sportiv`
--
ALTER TABLE `eveniment_sportiv`
  MODIFY `ID_Eveniment` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=211;

--
-- AUTO_INCREMENT pentru tabele `meciuri_istoric`
--
ALTER TABLE `meciuri_istoric`
  MODIFY `ID_Meci2` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT pentru tabele `operati`
--
ALTER TABLE `operati`
  MODIFY `ID_Operatie` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

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
