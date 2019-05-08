-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 08, 2019 at 04:22 AM
-- Server version: 8.0.16
-- PHP Version: 7.1.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `skl`
--

-- --------------------------------------------------------

--
-- Table structure for table `pastpeople`
--

CREATE TABLE `pastpeople` (
  `adm_no` int(11) NOT NULL,
  `name` text NOT NULL,
  `year_passed` varchar(20) NOT NULL,
  `phno` int(10) NOT NULL,
  `address` varchar(160) NOT NULL,
  `emis` varchar(100) NOT NULL,
  `img` longblob NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `name` text NOT NULL,
  `bg` varchar(10) NOT NULL,
  `exno` varchar(100) NOT NULL,
  `add_no` varchar(100) NOT NULL,
  `std` text NOT NULL,
  `sec` text NOT NULL,
  `emis` varchar(60) NOT NULL,
  `aadhar` varchar(20) NOT NULL,
  `dob` varchar(10) NOT NULL,
  `gender` text NOT NULL,
  `fname` text NOT NULL,
  `foc` varchar(30) NOT NULL,
  `mname` text NOT NULL,
  `moc` text NOT NULL,
  `mob1` int(10) NOT NULL,
  `mob2` int(10) NOT NULL,
  `address` varchar(160) NOT NULL,
  `religion` text NOT NULL,
  `cast` text NOT NULL,
  `community` text NOT NULL,
  `img` longblob NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teacher`
--

CREATE TABLE `teacher` (
  `tid` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `std` varchar(11) NOT NULL,
  `sec` text NOT NULL,
  `phno` int(11) NOT NULL,
  `img` longblob NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pastpeople`
--
ALTER TABLE `pastpeople`
  ADD PRIMARY KEY (`emis`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`add_no`),
  ADD UNIQUE KEY `aadhar` (`aadhar`),
  ADD UNIQUE KEY `emis` (`emis`(20));

--
-- Indexes for table `teacher`
--
ALTER TABLE `teacher`
  ADD PRIMARY KEY (`tid`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
