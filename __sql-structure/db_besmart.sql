-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 10, 2019 at 05:42 AM
-- Server version: 10.1.36-MariaDB
-- PHP Version: 7.2.10

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_besmart`
--
CREATE DATABASE IF NOT EXISTS `db_besmart` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `db_besmart`;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_attendance`
--

DROP TABLE IF EXISTS `tbl_attendance`;
CREATE TABLE IF NOT EXISTS `tbl_attendance` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `barcode` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `timeIn` varchar(255) NOT NULL,
  `timeOut` varchar(255) NOT NULL,
  `section` varchar(255) NOT NULL,
  `addedBy` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  KEY `idx_barcode` (`barcode`),
  KEY `idx_section` (`section`),
  KEY `idx_date` (`date`),
  KEY `idx_addedBy` (`addedBy`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_patrons_basic`
--

DROP TABLE IF EXISTS `tbl_patrons_basic`;
CREATE TABLE IF NOT EXISTS `tbl_patrons_basic` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `barcode` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `middleName` varchar(255) NOT NULL,
  `gender` varchar(255) NOT NULL,
  `course` varchar(255) NOT NULL,
  `cellphoneNumber` text NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `idx_barcode` (`barcode`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_patrons_library`
--

DROP TABLE IF EXISTS `tbl_patrons_library`;
CREATE TABLE IF NOT EXISTS `tbl_patrons_library` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `accessLevel` varchar(255) NOT NULL,
  `assetItemsOut` int(11) NOT NULL,
  `assetItemsOverdue` int(11) NOT NULL,
  `textbookItemsOut` int(11) NOT NULL,
  `textbookItemsOverdue` int(11) NOT NULL,
  `libraryItemsOut` int(11) NOT NULL,
  `libraryItemsOverdue` int(11) NOT NULL,
  `mediaItemsOut` int(11) NOT NULL,
  `mediaItemsOverdue` int(11) NOT NULL,
  `libraryHolds` int(11) NOT NULL,
  `mediaBookings` int(11) NOT NULL,
  `libraryFines` varchar(255) NOT NULL,
  `textbookFines` varchar(255) NOT NULL,
  `otherFines` varchar(255) NOT NULL,
  `isDelinquent` tinyint(1) NOT NULL DEFAULT '0',
  `dateDue` text NOT NULL,
  `isNotified` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user`
--

DROP TABLE IF EXISTS `tbl_user`;
CREATE TABLE IF NOT EXISTS `tbl_user` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `accessLevel` varchar(255) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user_settings`
--

DROP TABLE IF EXISTS `tbl_user_settings`;
CREATE TABLE IF NOT EXISTS `tbl_user_settings` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `userID` int(11) NOT NULL,
  `section` int(11) NOT NULL,
  `resetPassword` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
SET FOREIGN_KEY_CHECKS=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
