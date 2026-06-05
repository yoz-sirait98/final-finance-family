-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: family_finance
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('bank','cash','ewallet') COLLATE utf8mb4_unicode_ci NOT NULL,
  `initial_balance` decimal(16,2) NOT NULL DEFAULT '0.00',
  `balance` decimal(16,2) NOT NULL DEFAULT '0.00',
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `accounts_user_id_foreign` (`user_id`),
  CONSTRAINT `accounts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,1,'BCA','bank',0.00,7500000.00,'bi-bank',1,'2026-03-24 18:59:44','2026-04-06 02:51:36'),(2,1,'BRI','bank',0.00,8000000.00,'bi-bank',1,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(3,1,'Cash','cash',0.00,2000000.00,'bi-wallet2',1,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(4,1,'GoPay','ewallet',0.00,500000.00,'bi-phone',1,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(5,1,'OVO','ewallet',0.00,750000.00,'bi-phone',1,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(6,2,'BCA','bank',2000000.00,31326162.00,'bi-bank',1,'2026-03-24 19:02:15','2026-04-06 02:43:37'),(7,2,'Mandiri','bank',0.00,500000.00,'bi-bank',1,'2026-03-24 19:03:46','2026-03-25 00:17:32'),(8,2,'GoPay Juls','ewallet',0.00,0.00,'bi-wallet2',1,'2026-03-24 19:04:40','2026-03-24 19:04:40'),(9,2,'GoPay Yoz','ewallet',0.00,0.00,'bi-wallet2',1,'2026-03-24 19:04:54','2026-03-24 19:04:54'),(10,2,'DANA Juls','ewallet',0.00,0.00,'bi-wallet2',1,'2026-03-24 19:05:14','2026-03-24 19:05:14'),(11,2,'DANA Yoz','ewallet',0.00,0.00,'bi-wallet2',1,'2026-03-24 19:05:29','2026-03-24 19:05:29'),(12,2,'JAGO Juls','bank',0.00,0.00,'bi-bank',1,'2026-03-24 19:05:55','2026-03-24 19:05:55'),(13,2,'JAGO Yoz','bank',0.00,0.00,'bi-bank',1,'2026-03-24 19:06:03','2026-03-24 19:06:03');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `member_id` bigint unsigned DEFAULT NULL,
  `action` enum('CREATE','UPDATE','DELETE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` bigint unsigned NOT NULL,
  `before_data` json DEFAULT NULL,
  `after_data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_logs_member_id_foreign` (`member_id`),
  KEY `activity_logs_user_id_created_at_index` (`user_id`,`created_at`),
  KEY `activity_logs_entity_type_entity_id_index` (`entity_type`,`entity_id`),
  CONSTRAINT `activity_logs_member_id_foreign` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE SET NULL,
  CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,2,NULL,'CREATE','Account',6,NULL,'{\"id\": 6, \"icon\": \"bi-bank\", \"name\": \"BCA\", \"type\": \"bank\", \"balance\": \"0.00\", \"user_id\": 2, \"initial_balance\": \"0.00\"}','2026-03-24 19:02:15','2026-03-24 19:02:15'),(2,2,NULL,'CREATE','Account',7,NULL,'{\"id\": 7, \"icon\": \"bi-bank\", \"name\": \"Mandiri\", \"type\": \"bank\", \"balance\": \"0.00\", \"user_id\": 2, \"initial_balance\": \"0.00\"}','2026-03-24 19:03:46','2026-03-24 19:03:46'),(3,2,NULL,'CREATE','Account',8,NULL,'{\"id\": 8, \"icon\": \"bi-wallet2\", \"name\": \"GoPay Juls\", \"type\": \"ewallet\", \"balance\": \"0.00\", \"user_id\": 2, \"initial_balance\": \"0.00\"}','2026-03-24 19:04:40','2026-03-24 19:04:40'),(4,2,NULL,'CREATE','Account',9,NULL,'{\"id\": 9, \"icon\": \"bi-wallet2\", \"name\": \"GoPay Yoz\", \"type\": \"ewallet\", \"balance\": \"0.00\", \"user_id\": 2, \"initial_balance\": \"0.00\"}','2026-03-24 19:04:54','2026-03-24 19:04:54'),(5,2,NULL,'CREATE','Account',10,NULL,'{\"id\": 10, \"icon\": \"bi-wallet2\", \"name\": \"DANA Juls\", \"type\": \"ewallet\", \"balance\": \"0.00\", \"user_id\": 2, \"initial_balance\": \"0.00\"}','2026-03-24 19:05:14','2026-03-24 19:05:14'),(6,2,NULL,'CREATE','Account',11,NULL,'{\"id\": 11, \"icon\": \"bi-wallet2\", \"name\": \"DANA Yoz\", \"type\": \"ewallet\", \"balance\": \"0.00\", \"user_id\": 2, \"initial_balance\": \"0.00\"}','2026-03-24 19:05:29','2026-03-24 19:05:29'),(7,2,NULL,'CREATE','Account',12,NULL,'{\"id\": 12, \"icon\": \"bi-bank\", \"name\": \"JAGO Juls\", \"type\": \"bank\", \"balance\": \"0.00\", \"user_id\": 2, \"initial_balance\": \"0.00\"}','2026-03-24 19:05:55','2026-03-24 19:05:55'),(8,2,NULL,'CREATE','Account',13,NULL,'{\"id\": 13, \"icon\": \"bi-bank\", \"name\": \"JAGO Yoz\", \"type\": \"bank\", \"balance\": \"0.00\", \"user_id\": 2, \"initial_balance\": \"0.00\"}','2026-03-24 19:06:03','2026-03-24 19:06:03'),(9,2,5,'CREATE','Transaction',9,NULL,'{\"id\": 9, \"type\": \"income\", \"amount\": \"10119360.00\", \"user_id\": 2, \"member_id\": 5, \"account_id\": 6, \"category_id\": 12, \"description\": \"Juls - Gaji Maret\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 19:14:01','2026-03-24 19:14:01'),(10,2,4,'CREATE','Transaction',10,NULL,'{\"id\": 10, \"type\": \"income\", \"amount\": \"15653633.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 7, \"category_id\": 12, \"description\": \"Yoz - Gaji Maret\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 19:14:23','2026-03-24 19:14:23'),(11,2,NULL,'CREATE','Budget',6,NULL,'{\"id\": 6, \"year\": 2026, \"month\": 3, \"amount\": \"0.00\", \"user_id\": 2, \"category_id\": 13}','2026-03-24 19:15:24','2026-03-24 19:15:24'),(12,2,NULL,'DELETE','Budget',6,'{\"id\": 6, \"year\": 2026, \"month\": 3, \"amount\": \"0.00\", \"user_id\": 2, \"category_id\": 13}',NULL,'2026-03-24 19:15:29','2026-03-24 19:15:29'),(13,2,NULL,'CREATE','Budget',7,NULL,'{\"id\": 7, \"year\": 2026, \"month\": 3, \"amount\": \"500000.00\", \"user_id\": 2, \"category_id\": 13}','2026-03-24 19:58:53','2026-03-24 19:58:53'),(14,2,4,'CREATE','Transaction',11,NULL,'{\"id\": 11, \"type\": \"expense\", \"amount\": \"4672502.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 7, \"category_id\": 15, \"description\": \"KPR Rumah\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 20:00:40','2026-03-24 20:00:40'),(15,2,4,'CREATE','RecurringTransaction',2,NULL,'{\"id\": 2, \"type\": \"expense\", \"amount\": \"4672502.00\", \"user_id\": 2, \"end_date\": \"2039-06-25T00:00:00.000000Z\", \"frequency\": \"monthly\", \"member_id\": 4, \"account_id\": 7, \"category_id\": 15, \"description\": \"KPR Rumah\", \"next_due_date\": \"2026-04-25T00:00:00.000000Z\"}','2026-03-24 20:01:33','2026-03-24 20:01:33'),(16,2,4,'CREATE','Transaction',12,NULL,'{\"id\": 12, \"type\": \"expense\", \"amount\": \"242915.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 7, \"category_id\": 19, \"description\": \"SPayLater\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 20:06:49','2026-03-24 20:06:49'),(17,2,NULL,'CREATE','Budget',8,NULL,'{\"id\": 8, \"year\": 2026, \"month\": 3, \"amount\": \"300000.00\", \"user_id\": 2, \"category_id\": 16}','2026-03-24 20:07:26','2026-03-24 20:07:26'),(18,2,4,'CREATE','Transaction',13,NULL,'{\"id\": 13, \"type\": \"expense\", \"amount\": \"30600.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 7, \"category_id\": 19, \"description\": \"GoPayLater\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 20:08:54','2026-03-24 20:08:54'),(19,2,4,'CREATE','Transaction',14,NULL,'{\"id\": 14, \"type\": \"expense\", \"amount\": \"2163000.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 7, \"category_id\": 19, \"description\": \"INDODANA - KFC, Tiket Pesawat\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 20:13:32','2026-03-24 20:13:32'),(20,2,4,'CREATE','Transaction',15,NULL,'{\"id\": 15, \"type\": \"expense\", \"amount\": \"209000.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 7, \"category_id\": 15, \"description\": \"IPL Rumah\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 20:16:54','2026-03-24 20:16:54'),(21,2,4,'CREATE','Transaction',16,NULL,'{\"id\": 16, \"type\": \"expense\", \"amount\": \"50000.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 7, \"category_id\": 19, \"description\": \"Uang Kas IT\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 20:17:34','2026-03-24 20:17:34'),(22,2,4,'UPDATE','Transaction',10,'{\"id\": 10, \"type\": \"income\", \"amount\": \"15653633.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 7, \"category_id\": 12, \"description\": \"Yoz - Gaji Maret\", \"transfer_id\": null, \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','{\"id\": 10, \"type\": \"income\", \"amount\": \"15653633.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 7, \"category_id\": 12, \"description\": \"Gaji Maret\", \"transfer_id\": null, \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 20:17:43','2026-03-24 20:17:43'),(23,2,5,'UPDATE','Transaction',9,'{\"id\": 9, \"type\": \"income\", \"amount\": \"10119360.00\", \"user_id\": 2, \"member_id\": 5, \"account_id\": 6, \"category_id\": 12, \"description\": \"Juls - Gaji Maret\", \"transfer_id\": null, \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','{\"id\": 9, \"type\": \"income\", \"amount\": \"10119360.00\", \"user_id\": 2, \"member_id\": 5, \"account_id\": 6, \"category_id\": 12, \"description\": \"Gaji Maret\", \"transfer_id\": null, \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 20:17:49','2026-03-24 20:17:49'),(24,2,4,'CREATE','Transaction',17,NULL,'{\"id\": 17, \"type\": \"expense\", \"amount\": \"190298.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 7, \"category_id\": 19, \"description\": \"Kredivo\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 20:37:57','2026-03-24 20:37:57'),(25,2,4,'CREATE','Transaction',18,NULL,'{\"id\": 18, \"type\": \"expense\", \"amount\": \"90600.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 7, \"category_id\": 15, \"description\": \"Air Perumdam\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 20:40:10','2026-03-24 20:40:10'),(26,2,4,'CREATE','Transaction',19,NULL,'{\"id\": 19, \"type\": \"expense\", \"amount\": \"47500.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 7, \"category_id\": 16, \"description\": \"Netflix\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 20:48:19','2026-03-24 20:48:19'),(27,2,4,'CREATE','Transaction',20,NULL,'{\"id\": 20, \"type\": \"expense\", \"amount\": \"59900.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 7, \"category_id\": 16, \"description\": \"Spotify\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 20:49:14','2026-03-24 20:49:14'),(28,2,4,'CREATE','RecurringTransaction',3,NULL,'{\"id\": 3, \"type\": \"expense\", \"amount\": \"47500.00\", \"user_id\": 2, \"end_date\": null, \"frequency\": \"monthly\", \"member_id\": 4, \"account_id\": 7, \"category_id\": 16, \"description\": \"Netflix\", \"next_due_date\": \"2026-04-25T00:00:00.000000Z\"}','2026-03-24 20:51:27','2026-03-24 20:51:27'),(29,2,4,'CREATE','RecurringTransaction',4,NULL,'{\"id\": 4, \"type\": \"expense\", \"amount\": \"59900.00\", \"user_id\": 2, \"end_date\": null, \"frequency\": \"monthly\", \"member_id\": 4, \"account_id\": 7, \"category_id\": 16, \"description\": \"Spotify\", \"next_due_date\": \"2026-04-25T00:00:00.000000Z\"}','2026-03-24 20:51:50','2026-03-24 20:51:50'),(30,2,5,'CREATE','Transaction',21,NULL,'{\"id\": 21, \"type\": \"expense\", \"amount\": \"4659897.00\", \"user_id\": 2, \"member_id\": 5, \"account_id\": 6, \"category_id\": 19, \"description\": \"CC BCA\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 21:17:59','2026-03-24 21:17:59'),(31,2,5,'CREATE','Transaction',22,NULL,'{\"id\": 22, \"type\": \"expense\", \"amount\": \"1602831.00\", \"user_id\": 2, \"member_id\": 5, \"account_id\": 6, \"category_id\": 19, \"description\": \"GoPay Pinjam\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 21:23:03','2026-03-24 21:23:03'),(32,2,5,'CREATE','Transaction',23,NULL,'{\"id\": 23, \"type\": \"expense\", \"amount\": \"99999.00\", \"user_id\": 2, \"member_id\": 5, \"account_id\": 6, \"category_id\": 19, \"description\": \"GoPay Pinjam\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 21:38:37','2026-03-24 21:38:37'),(33,2,5,'DELETE','Transaction',23,'{\"id\": 23, \"type\": \"expense\", \"amount\": \"99999.00\", \"user_id\": 2, \"member_id\": 5, \"account_id\": 6, \"category_id\": 19, \"description\": \"GoPay Pinjam\", \"transfer_id\": null, \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}',NULL,'2026-03-24 21:41:19','2026-03-24 21:41:19'),(34,2,4,'CREATE','RecurringTransaction',5,NULL,'{\"id\": 5, \"type\": \"expense\", \"amount\": \"209000.00\", \"user_id\": 2, \"end_date\": null, \"frequency\": \"monthly\", \"member_id\": 4, \"account_id\": 7, \"category_id\": 15, \"description\": \"IPL Rumah\", \"next_due_date\": \"2026-04-25T00:00:00.000000Z\"}','2026-03-24 21:42:05','2026-03-24 21:42:05'),(35,2,5,'CREATE','Transaction',24,NULL,'{\"id\": 24, \"type\": \"expense\", \"amount\": \"2939854.00\", \"user_id\": 2, \"member_id\": 5, \"account_id\": 6, \"category_id\": 19, \"description\": \"Dana PPJB\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 21:43:41','2026-03-24 21:43:41'),(36,2,5,'UPDATE','Transaction',24,'{\"id\": 24, \"type\": \"expense\", \"amount\": \"2939854.00\", \"user_id\": 2, \"member_id\": 5, \"account_id\": 6, \"category_id\": 19, \"description\": \"Dana PPJB\", \"transfer_id\": null, \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','{\"id\": 24, \"type\": \"expense\", \"amount\": \"2939854.00\", \"user_id\": 2, \"member_id\": 5, \"account_id\": 6, \"category_id\": 19, \"description\": \"Dana PPJB 6/12\", \"transfer_id\": null, \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 21:43:48','2026-03-24 21:43:48'),(37,2,5,'CREATE','Transaction',25,NULL,'{\"id\": 25, \"type\": \"expense\", \"amount\": \"360551.00\", \"user_id\": 2, \"member_id\": 5, \"account_id\": 6, \"category_id\": 19, \"description\": \"CC Bank Mega\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 21:44:17','2026-03-24 21:44:17'),(38,2,5,'CREATE','Transaction',26,NULL,'{\"id\": 26, \"type\": \"expense\", \"amount\": \"154935.00\", \"user_id\": 2, \"member_id\": 5, \"account_id\": 6, \"category_id\": 19, \"description\": \"SPayLater\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 21:44:34','2026-03-24 21:44:34'),(39,2,4,'CREATE','Transaction',27,NULL,'{\"id\": 27, \"type\": \"expense\", \"amount\": \"7472448.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 7, \"category_id\": 19, \"description\": \"CC Bank Mandiri\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 21:46:00','2026-03-24 21:46:00'),(40,2,NULL,'UPDATE','Account',6,'{\"id\": 6, \"icon\": \"bi-bank\", \"name\": \"BCA\", \"type\": \"bank\", \"balance\": \"401292.00\", \"user_id\": 2, \"is_active\": true, \"initial_balance\": \"0.00\"}','{\"id\": 6, \"icon\": \"bi-bank\", \"name\": \"BCA\", \"type\": \"bank\", \"balance\": \"2401292.00\", \"user_id\": 2, \"is_active\": true, \"initial_balance\": \"2000000.00\"}','2026-03-24 23:20:39','2026-03-24 23:20:39'),(41,2,NULL,'UPDATE','Account',6,'{\"id\": 6, \"icon\": \"bi-bank\", \"name\": \"BCA\", \"type\": \"bank\", \"balance\": \"2401292.00\", \"user_id\": 2, \"is_active\": true, \"initial_balance\": \"2000000.00\"}','{\"id\": 6, \"icon\": \"bi-bank\", \"name\": \"BCA\", \"type\": \"bank\", \"balance\": \"1401292.00\", \"user_id\": 2, \"is_active\": true, \"initial_balance\": \"1000000.00\"}','2026-03-24 23:25:55','2026-03-24 23:25:55'),(42,2,NULL,'UPDATE','Account',6,'{\"id\": 6, \"icon\": \"bi-bank\", \"name\": \"BCA\", \"type\": \"bank\", \"balance\": \"1401292.00\", \"user_id\": 2, \"is_active\": true, \"initial_balance\": \"1000000.00\"}','{\"id\": 6, \"icon\": \"bi-bank\", \"name\": \"BCA\", \"type\": \"bank\", \"balance\": \"401292.00\", \"user_id\": 2, \"is_active\": true, \"initial_balance\": \"0.00\"}','2026-03-24 23:26:51','2026-03-24 23:26:51'),(43,2,NULL,'UPDATE','Account',6,'{\"id\": 6, \"icon\": \"bi-bank\", \"name\": \"BCA\", \"type\": \"bank\", \"balance\": \"401292.00\", \"user_id\": 2, \"is_active\": true, \"initial_balance\": \"0.00\"}','{\"id\": 6, \"icon\": \"bi-bank\", \"name\": \"BCA\", \"type\": \"bank\", \"balance\": \"1401292.00\", \"user_id\": 2, \"is_active\": true, \"initial_balance\": \"1000000.00\"}','2026-03-24 23:31:04','2026-03-24 23:31:04'),(44,2,4,'CREATE','Transaction',34,NULL,'{\"id\": 34, \"type\": \"expense\", \"amount\": \"1000000.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 7, \"category_id\": 16, \"description\": \"Uang Bulanan Rumah\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-24 23:51:32','2026-03-24 23:51:32'),(45,2,NULL,'UPDATE','Account',6,'{\"id\": 6, \"icon\": \"bi-bank\", \"name\": \"BCA\", \"type\": \"bank\", \"balance\": \"826162.00\", \"user_id\": 2, \"is_active\": true, \"initial_balance\": \"1000000.00\"}','{\"id\": 6, \"icon\": \"bi-bank\", \"name\": \"BCA\", \"type\": \"bank\", \"balance\": \"1826162.00\", \"user_id\": 2, \"is_active\": true, \"initial_balance\": \"2000000.00\"}','2026-03-24 23:52:05','2026-03-24 23:52:05'),(46,2,NULL,'CREATE','Goal',3,NULL,'{\"id\": 3, \"name\": \"Test Goal\", \"status\": \"active\", \"user_id\": 2, \"deadline\": \"2026-04-25T00:00:00.000000Z\", \"account_id\": null, \"target_amount\": \"1000000.00\", \"current_amount\": \"0.00\"}','2026-03-24 23:56:13','2026-03-24 23:56:13'),(47,2,NULL,'UPDATE','Budget',8,'{\"id\": 8, \"year\": 2026, \"month\": 3, \"amount\": \"300000.00\", \"user_id\": 2, \"category_id\": 16}','{\"id\": 8, \"year\": 2026, \"month\": 3, \"amount\": \"2000000.00\", \"user_id\": 2, \"category_id\": 16}','2026-03-24 23:59:38','2026-03-24 23:59:38'),(48,2,NULL,'DELETE','Goal',3,'{\"id\": 3, \"name\": \"Test Goal\", \"status\": \"active\", \"user_id\": 2, \"deadline\": \"2026-04-25T00:00:00.000000Z\", \"account_id\": null, \"target_amount\": \"1000000.00\", \"current_amount\": \"100000.00\"}',NULL,'2026-03-24 23:59:52','2026-03-24 23:59:52'),(49,2,NULL,'CREATE','Goal',4,NULL,'{\"id\": 4, \"name\": \"Test Goal\", \"status\": \"active\", \"user_id\": 2, \"deadline\": \"2026-04-25T00:00:00.000000Z\", \"account_id\": null, \"target_amount\": \"1000000.00\", \"current_amount\": \"0.00\"}','2026-03-25 00:00:09','2026-03-25 00:00:09'),(50,2,5,'DELETE','Transaction',33,'{\"id\": 33, \"type\": \"income\", \"amount\": \"500000.00\", \"user_id\": 2, \"member_id\": 5, \"account_id\": 7, \"category_id\": null, \"description\": \"Transfer lagi\", \"transfer_id\": 32, \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}',NULL,'2026-03-25 00:07:33','2026-03-25 00:07:33'),(51,2,4,'DELETE','Transaction',34,'{\"id\": 34, \"type\": \"expense\", \"amount\": \"1000000.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 7, \"category_id\": 16, \"description\": \"Uang Bulanan Rumah\", \"transfer_id\": null, \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}',NULL,'2026-03-25 00:15:13','2026-03-25 00:15:13'),(52,2,4,'CREATE','Transaction',37,NULL,'{\"id\": 37, \"type\": \"expense\", \"amount\": \"1000000.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 7, \"category_id\": 16, \"description\": \"Uang Bulanan Rumah\", \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}','2026-03-25 00:16:42','2026-03-25 00:16:42'),(53,2,4,'DELETE','Transaction',31,'{\"id\": 31, \"type\": \"income\", \"amount\": \"500000.00\", \"user_id\": 2, \"member_id\": 4, \"account_id\": 6, \"category_id\": null, \"description\": \"Transfer ulang\", \"transfer_id\": 30, \"transaction_date\": \"2026-03-25T00:00:00.000000Z\"}',NULL,'2026-03-25 00:17:32','2026-03-25 00:17:32'),(54,2,NULL,'UPDATE','Budget',8,'{\"id\": 8, \"year\": 2026, \"month\": 3, \"amount\": \"2000000.00\", \"user_id\": 2, \"category_id\": 16}','{\"id\": 8, \"year\": 2026, \"month\": 3, \"amount\": \"1200000.00\", \"user_id\": 2, \"category_id\": 16}','2026-03-25 00:52:30','2026-03-25 00:52:30'),(55,2,NULL,'UPDATE','Budget',8,'{\"id\": 8, \"year\": 2026, \"month\": 3, \"amount\": \"1200000.00\", \"user_id\": 2, \"category_id\": 16}','{\"id\": 8, \"year\": 2026, \"month\": 3, \"amount\": \"1500000.00\", \"user_id\": 2, \"category_id\": 16}','2026-03-25 00:52:44','2026-03-25 00:52:44'),(56,2,NULL,'UPDATE','Budget',8,'{\"id\": 8, \"year\": 2026, \"month\": 3, \"amount\": \"1500000.00\", \"user_id\": 2, \"category_id\": 16}','{\"id\": 8, \"year\": 2026, \"month\": 3, \"amount\": \"1000000.00\", \"user_id\": 2, \"category_id\": 16}','2026-03-25 23:09:18','2026-03-25 23:09:18'),(57,2,NULL,'UPDATE','Budget',8,'{\"id\": 8, \"year\": 2026, \"month\": 3, \"amount\": \"1000000.00\", \"user_id\": 2, \"category_id\": 16}','{\"id\": 8, \"year\": 2026, \"month\": 3, \"amount\": \"1500000.00\", \"user_id\": 2, \"category_id\": 16}','2026-03-25 23:19:56','2026-03-25 23:19:56'),(58,2,NULL,'DELETE','Goal',4,'{\"id\": 4, \"name\": \"Test Goal\", \"status\": \"active\", \"user_id\": 2, \"deadline\": \"2026-04-25T00:00:00.000000Z\", \"account_id\": null, \"target_amount\": \"1000000.00\", \"current_amount\": \"100000.00\"}',NULL,'2026-03-26 18:23:49','2026-03-26 18:23:49'),(59,2,5,'CREATE','Transaction',38,NULL,'{\"id\": 38, \"type\": \"income\", \"amount\": \"30000000.00\", \"user_id\": 2, \"member_id\": 5, \"account_id\": 6, \"category_id\": 17, \"description\": \"BONUS NICH\", \"transaction_date\": \"2026-04-06T00:00:00.000000Z\"}','2026-04-06 02:43:37','2026-04-06 02:43:37'),(60,2,NULL,'CREATE','Goal',5,NULL,'{\"id\": 5, \"name\": \"Pulang Kampung\", \"status\": \"active\", \"user_id\": 2, \"deadline\": \"2026-12-29T00:00:00.000000Z\", \"account_id\": null, \"target_amount\": \"20000000.00\", \"current_amount\": \"0.00\"}','2026-04-06 02:55:43','2026-04-06 02:55:43'),(61,2,NULL,'CREATE','Budget',9,NULL,'{\"id\": 9, \"year\": 2026, \"month\": 4, \"amount\": \"1000000.00\", \"user_id\": 2, \"category_id\": 13}','2026-04-06 02:56:38','2026-04-06 02:56:38');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budgets`
--

DROP TABLE IF EXISTS `budgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budgets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `amount` decimal(16,2) NOT NULL,
  `month` tinyint NOT NULL,
  `year` smallint NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `budgets_user_id_category_id_month_year_unique` (`user_id`,`category_id`,`month`,`year`),
  KEY `budgets_category_id_foreign` (`category_id`),
  KEY `budgets_user_month_year` (`user_id`,`month`,`year`),
  CONSTRAINT `budgets_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `budgets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budgets`
--

LOCK TABLES `budgets` WRITE;
/*!40000 ALTER TABLE `budgets` DISABLE KEYS */;
INSERT INTO `budgets` VALUES (1,1,5,3000000.00,3,2026,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(2,1,6,1000000.00,3,2026,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(3,1,7,1500000.00,3,2026,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(4,1,8,1000000.00,3,2026,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(5,1,9,1000000.00,3,2026,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(7,2,13,500000.00,3,2026,'2026-03-24 19:58:53','2026-03-24 19:58:53'),(8,2,16,1500000.00,3,2026,'2026-03-24 20:07:26','2026-03-25 23:19:56'),(9,2,13,1000000.00,4,2026,'2026-04-06 02:56:38','2026-04-06 02:56:38');
/*!40000 ALTER TABLE `budgets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES ('family-finance-cache-account_list_2','O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:8:{i:0;O:18:\"App\\Models\\Account\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"accounts\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:10:{s:2:\"id\";i:6;s:7:\"user_id\";i:2;s:4:\"name\";s:3:\"BCA\";s:4:\"type\";s:4:\"bank\";s:15:\"initial_balance\";s:10:\"2000000.00\";s:7:\"balance\";s:11:\"31326162.00\";s:4:\"icon\";s:7:\"bi-bank\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:02:15\";s:10:\"updated_at\";s:19:\"2026-04-06 09:43:37\";}s:11:\"\0*\0original\";a:10:{s:2:\"id\";i:6;s:7:\"user_id\";i:2;s:4:\"name\";s:3:\"BCA\";s:4:\"type\";s:4:\"bank\";s:15:\"initial_balance\";s:10:\"2000000.00\";s:7:\"balance\";s:11:\"31326162.00\";s:4:\"icon\";s:7:\"bi-bank\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:02:15\";s:10:\"updated_at\";s:19:\"2026-04-06 09:43:37\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:3:{s:15:\"initial_balance\";s:9:\"decimal:2\";s:7:\"balance\";s:9:\"decimal:2\";s:9:\"is_active\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:7:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:15:\"initial_balance\";i:4;s:7:\"balance\";i:5;s:4:\"icon\";i:6;s:9:\"is_active\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:18:\"App\\Models\\Account\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"accounts\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:10:{s:2:\"id\";i:10;s:7:\"user_id\";i:2;s:4:\"name\";s:9:\"DANA Juls\";s:4:\"type\";s:7:\"ewallet\";s:15:\"initial_balance\";s:4:\"0.00\";s:7:\"balance\";s:4:\"0.00\";s:4:\"icon\";s:10:\"bi-wallet2\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:05:14\";s:10:\"updated_at\";s:19:\"2026-03-25 02:05:14\";}s:11:\"\0*\0original\";a:10:{s:2:\"id\";i:10;s:7:\"user_id\";i:2;s:4:\"name\";s:9:\"DANA Juls\";s:4:\"type\";s:7:\"ewallet\";s:15:\"initial_balance\";s:4:\"0.00\";s:7:\"balance\";s:4:\"0.00\";s:4:\"icon\";s:10:\"bi-wallet2\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:05:14\";s:10:\"updated_at\";s:19:\"2026-03-25 02:05:14\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:3:{s:15:\"initial_balance\";s:9:\"decimal:2\";s:7:\"balance\";s:9:\"decimal:2\";s:9:\"is_active\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:7:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:15:\"initial_balance\";i:4;s:7:\"balance\";i:5;s:4:\"icon\";i:6;s:9:\"is_active\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:2;O:18:\"App\\Models\\Account\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"accounts\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:10:{s:2:\"id\";i:11;s:7:\"user_id\";i:2;s:4:\"name\";s:8:\"DANA Yoz\";s:4:\"type\";s:7:\"ewallet\";s:15:\"initial_balance\";s:4:\"0.00\";s:7:\"balance\";s:4:\"0.00\";s:4:\"icon\";s:10:\"bi-wallet2\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:05:29\";s:10:\"updated_at\";s:19:\"2026-03-25 02:05:29\";}s:11:\"\0*\0original\";a:10:{s:2:\"id\";i:11;s:7:\"user_id\";i:2;s:4:\"name\";s:8:\"DANA Yoz\";s:4:\"type\";s:7:\"ewallet\";s:15:\"initial_balance\";s:4:\"0.00\";s:7:\"balance\";s:4:\"0.00\";s:4:\"icon\";s:10:\"bi-wallet2\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:05:29\";s:10:\"updated_at\";s:19:\"2026-03-25 02:05:29\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:3:{s:15:\"initial_balance\";s:9:\"decimal:2\";s:7:\"balance\";s:9:\"decimal:2\";s:9:\"is_active\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:7:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:15:\"initial_balance\";i:4;s:7:\"balance\";i:5;s:4:\"icon\";i:6;s:9:\"is_active\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:3;O:18:\"App\\Models\\Account\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"accounts\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:10:{s:2:\"id\";i:8;s:7:\"user_id\";i:2;s:4:\"name\";s:10:\"GoPay Juls\";s:4:\"type\";s:7:\"ewallet\";s:15:\"initial_balance\";s:4:\"0.00\";s:7:\"balance\";s:4:\"0.00\";s:4:\"icon\";s:10:\"bi-wallet2\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:04:40\";s:10:\"updated_at\";s:19:\"2026-03-25 02:04:40\";}s:11:\"\0*\0original\";a:10:{s:2:\"id\";i:8;s:7:\"user_id\";i:2;s:4:\"name\";s:10:\"GoPay Juls\";s:4:\"type\";s:7:\"ewallet\";s:15:\"initial_balance\";s:4:\"0.00\";s:7:\"balance\";s:4:\"0.00\";s:4:\"icon\";s:10:\"bi-wallet2\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:04:40\";s:10:\"updated_at\";s:19:\"2026-03-25 02:04:40\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:3:{s:15:\"initial_balance\";s:9:\"decimal:2\";s:7:\"balance\";s:9:\"decimal:2\";s:9:\"is_active\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:7:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:15:\"initial_balance\";i:4;s:7:\"balance\";i:5;s:4:\"icon\";i:6;s:9:\"is_active\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:4;O:18:\"App\\Models\\Account\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"accounts\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:10:{s:2:\"id\";i:9;s:7:\"user_id\";i:2;s:4:\"name\";s:9:\"GoPay Yoz\";s:4:\"type\";s:7:\"ewallet\";s:15:\"initial_balance\";s:4:\"0.00\";s:7:\"balance\";s:4:\"0.00\";s:4:\"icon\";s:10:\"bi-wallet2\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:04:54\";s:10:\"updated_at\";s:19:\"2026-03-25 02:04:54\";}s:11:\"\0*\0original\";a:10:{s:2:\"id\";i:9;s:7:\"user_id\";i:2;s:4:\"name\";s:9:\"GoPay Yoz\";s:4:\"type\";s:7:\"ewallet\";s:15:\"initial_balance\";s:4:\"0.00\";s:7:\"balance\";s:4:\"0.00\";s:4:\"icon\";s:10:\"bi-wallet2\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:04:54\";s:10:\"updated_at\";s:19:\"2026-03-25 02:04:54\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:3:{s:15:\"initial_balance\";s:9:\"decimal:2\";s:7:\"balance\";s:9:\"decimal:2\";s:9:\"is_active\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:7:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:15:\"initial_balance\";i:4;s:7:\"balance\";i:5;s:4:\"icon\";i:6;s:9:\"is_active\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:5;O:18:\"App\\Models\\Account\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"accounts\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:10:{s:2:\"id\";i:12;s:7:\"user_id\";i:2;s:4:\"name\";s:9:\"JAGO Juls\";s:4:\"type\";s:4:\"bank\";s:15:\"initial_balance\";s:4:\"0.00\";s:7:\"balance\";s:4:\"0.00\";s:4:\"icon\";s:7:\"bi-bank\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:05:55\";s:10:\"updated_at\";s:19:\"2026-03-25 02:05:55\";}s:11:\"\0*\0original\";a:10:{s:2:\"id\";i:12;s:7:\"user_id\";i:2;s:4:\"name\";s:9:\"JAGO Juls\";s:4:\"type\";s:4:\"bank\";s:15:\"initial_balance\";s:4:\"0.00\";s:7:\"balance\";s:4:\"0.00\";s:4:\"icon\";s:7:\"bi-bank\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:05:55\";s:10:\"updated_at\";s:19:\"2026-03-25 02:05:55\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:3:{s:15:\"initial_balance\";s:9:\"decimal:2\";s:7:\"balance\";s:9:\"decimal:2\";s:9:\"is_active\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:7:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:15:\"initial_balance\";i:4;s:7:\"balance\";i:5;s:4:\"icon\";i:6;s:9:\"is_active\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:6;O:18:\"App\\Models\\Account\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"accounts\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:10:{s:2:\"id\";i:13;s:7:\"user_id\";i:2;s:4:\"name\";s:8:\"JAGO Yoz\";s:4:\"type\";s:4:\"bank\";s:15:\"initial_balance\";s:4:\"0.00\";s:7:\"balance\";s:4:\"0.00\";s:4:\"icon\";s:7:\"bi-bank\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:06:03\";s:10:\"updated_at\";s:19:\"2026-03-25 02:06:03\";}s:11:\"\0*\0original\";a:10:{s:2:\"id\";i:13;s:7:\"user_id\";i:2;s:4:\"name\";s:8:\"JAGO Yoz\";s:4:\"type\";s:4:\"bank\";s:15:\"initial_balance\";s:4:\"0.00\";s:7:\"balance\";s:4:\"0.00\";s:4:\"icon\";s:7:\"bi-bank\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:06:03\";s:10:\"updated_at\";s:19:\"2026-03-25 02:06:03\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:3:{s:15:\"initial_balance\";s:9:\"decimal:2\";s:7:\"balance\";s:9:\"decimal:2\";s:9:\"is_active\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:7:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:15:\"initial_balance\";i:4;s:7:\"balance\";i:5;s:4:\"icon\";i:6;s:9:\"is_active\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:7;O:18:\"App\\Models\\Account\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"accounts\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:10:{s:2:\"id\";i:7;s:7:\"user_id\";i:2;s:4:\"name\";s:7:\"Mandiri\";s:4:\"type\";s:4:\"bank\";s:15:\"initial_balance\";s:4:\"0.00\";s:7:\"balance\";s:9:\"500000.00\";s:4:\"icon\";s:7:\"bi-bank\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:03:46\";s:10:\"updated_at\";s:19:\"2026-03-25 07:17:32\";}s:11:\"\0*\0original\";a:10:{s:2:\"id\";i:7;s:7:\"user_id\";i:2;s:4:\"name\";s:7:\"Mandiri\";s:4:\"type\";s:4:\"bank\";s:15:\"initial_balance\";s:4:\"0.00\";s:7:\"balance\";s:9:\"500000.00\";s:4:\"icon\";s:7:\"bi-bank\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:03:46\";s:10:\"updated_at\";s:19:\"2026-03-25 07:17:32\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:3:{s:15:\"initial_balance\";s:9:\"decimal:2\";s:7:\"balance\";s:9:\"decimal:2\";s:9:\"is_active\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:7:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:15:\"initial_balance\";i:4;s:7:\"balance\";i:5;s:4:\"icon\";i:6;s:9:\"is_active\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}',1775469479),('family-finance-cache-budget_2_4_2026_1_15','O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:17:\"App\\Models\\Budget\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:7:\"budgets\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:12:{s:2:\"id\";i:9;s:7:\"user_id\";i:2;s:11:\"category_id\";i:13;s:6:\"amount\";s:10:\"1000000.00\";s:5:\"month\";i:4;s:4:\"year\";i:2026;s:10:\"created_at\";s:19:\"2026-04-06 09:56:38\";s:10:\"updated_at\";s:19:\"2026-04-06 09:56:38\";s:5:\"spent\";d:0;s:9:\"remaining\";d:1000000;s:10:\"percentage\";d:0;s:17:\"is_over_threshold\";b:0;}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:9;s:7:\"user_id\";i:2;s:11:\"category_id\";i:13;s:6:\"amount\";s:10:\"1000000.00\";s:5:\"month\";i:4;s:4:\"year\";i:2026;s:10:\"created_at\";s:19:\"2026-04-06 09:56:38\";s:10:\"updated_at\";s:19:\"2026-04-06 09:56:38\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:3:{s:6:\"amount\";s:9:\"decimal:2\";s:5:\"month\";s:7:\"integer\";s:4:\"year\";s:7:\"integer\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:8:\"category\";O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:13;s:7:\"user_id\";i:2;s:4:\"name\";s:7:\"Makanan\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:9:\"bi-basket\";s:5:\"color\";s:7:\"#dc3545\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:58:25\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:13;s:7:\"user_id\";i:2;s:4:\"name\";s:7:\"Makanan\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:9:\"bi-basket\";s:5:\"color\";s:7:\"#dc3545\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:58:25\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:4:\"icon\";i:4;s:5:\"color\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:11:\"category_id\";i:2;s:6:\"amount\";i:3;s:5:\"month\";i:4;s:4:\"year\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}',1775542552),('family-finance-cache-category_list_2_all','O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:8:{i:0;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:17;s:7:\"user_id\";i:2;s:4:\"name\";s:5:\"Bonus\";s:4:\"type\";s:6:\"income\";s:4:\"icon\";s:12:\"bi-gift-fill\";s:5:\"color\";s:7:\"#49fb09\";s:10:\"created_at\";s:19:\"2026-03-25 02:11:12\";s:10:\"updated_at\";s:19:\"2026-03-25 02:11:12\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:17;s:7:\"user_id\";i:2;s:4:\"name\";s:5:\"Bonus\";s:4:\"type\";s:6:\"income\";s:4:\"icon\";s:12:\"bi-gift-fill\";s:5:\"color\";s:7:\"#49fb09\";s:10:\"created_at\";s:19:\"2026-03-25 02:11:12\";s:10:\"updated_at\";s:19:\"2026-03-25 02:11:12\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:4:\"icon\";i:4;s:5:\"color\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:16;s:7:\"user_id\";i:2;s:4:\"name\";s:13:\"Entertainment\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:13:\"bi-controller\";s:5:\"color\";s:7:\"#6f42c1\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 03:47:58\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:16;s:7:\"user_id\";i:2;s:4:\"name\";s:13:\"Entertainment\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:13:\"bi-controller\";s:5:\"color\";s:7:\"#6f42c1\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 03:47:58\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:4:\"icon\";i:4;s:5:\"color\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:2;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:12;s:7:\"user_id\";i:2;s:4:\"name\";s:4:\"Gaji\";s:4:\"type\";s:6:\"income\";s:4:\"icon\";s:13:\"bi-cash-stack\";s:5:\"color\";s:7:\"#198754\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:11:22\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:12;s:7:\"user_id\";i:2;s:4:\"name\";s:4:\"Gaji\";s:4:\"type\";s:6:\"income\";s:4:\"icon\";s:13:\"bi-cash-stack\";s:5:\"color\";s:7:\"#198754\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:11:22\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:4:\"icon\";i:4;s:5:\"color\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:3;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:13;s:7:\"user_id\";i:2;s:4:\"name\";s:7:\"Makanan\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:9:\"bi-basket\";s:5:\"color\";s:7:\"#dc3545\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:58:25\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:13;s:7:\"user_id\";i:2;s:4:\"name\";s:7:\"Makanan\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:9:\"bi-basket\";s:5:\"color\";s:7:\"#dc3545\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:58:25\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:4:\"icon\";i:4;s:5:\"color\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:4;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:19;s:7:\"user_id\";i:2;s:4:\"name\";s:7:\"Tagihan\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:10:\"bi-receipt\";s:5:\"color\";s:7:\"#1e78c8\";s:10:\"created_at\";s:19:\"2026-03-25 02:13:17\";s:10:\"updated_at\";s:19:\"2026-03-25 02:13:17\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:19;s:7:\"user_id\";i:2;s:4:\"name\";s:7:\"Tagihan\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:10:\"bi-receipt\";s:5:\"color\";s:7:\"#1e78c8\";s:10:\"created_at\";s:19:\"2026-03-25 02:13:17\";s:10:\"updated_at\";s:19:\"2026-03-25 02:13:17\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:4:\"icon\";i:4;s:5:\"color\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:5;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:18;s:7:\"user_id\";i:2;s:4:\"name\";s:3:\"THR\";s:4:\"type\";s:6:\"income\";s:4:\"icon\";s:7:\"bi-gift\";s:5:\"color\";s:7:\"#2ce628\";s:10:\"created_at\";s:19:\"2026-03-25 02:11:46\";s:10:\"updated_at\";s:19:\"2026-03-25 02:11:46\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:18;s:7:\"user_id\";i:2;s:4:\"name\";s:3:\"THR\";s:4:\"type\";s:6:\"income\";s:4:\"icon\";s:7:\"bi-gift\";s:5:\"color\";s:7:\"#2ce628\";s:10:\"created_at\";s:19:\"2026-03-25 02:11:46\";s:10:\"updated_at\";s:19:\"2026-03-25 02:11:46\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:4:\"icon\";i:4;s:5:\"color\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:6;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:14;s:7:\"user_id\";i:2;s:4:\"name\";s:12:\"Transportasi\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:12:\"bi-car-front\";s:5:\"color\";s:7:\"#ffc107\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:12:05\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:14;s:7:\"user_id\";i:2;s:4:\"name\";s:12:\"Transportasi\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:12:\"bi-car-front\";s:5:\"color\";s:7:\"#ffc107\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:12:05\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:4:\"icon\";i:4;s:5:\"color\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:7;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:15;s:7:\"user_id\";i:2;s:4:\"name\";s:9:\"Utilities\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:12:\"bi-lightning\";s:5:\"color\";s:7:\"#0dcaf0\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:01:22\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:15;s:7:\"user_id\";i:2;s:4:\"name\";s:9:\"Utilities\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:12:\"bi-lightning\";s:5:\"color\";s:7:\"#0dcaf0\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:01:22\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:4:\"icon\";i:4;s:5:\"color\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}',1775469480),('family-finance-cache-category_list_2_expense','O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:5:{i:0;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:16;s:7:\"user_id\";i:2;s:4:\"name\";s:13:\"Entertainment\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:13:\"bi-controller\";s:5:\"color\";s:7:\"#6f42c1\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 03:47:58\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:16;s:7:\"user_id\";i:2;s:4:\"name\";s:13:\"Entertainment\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:13:\"bi-controller\";s:5:\"color\";s:7:\"#6f42c1\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 03:47:58\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:4:\"icon\";i:4;s:5:\"color\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:13;s:7:\"user_id\";i:2;s:4:\"name\";s:7:\"Makanan\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:9:\"bi-basket\";s:5:\"color\";s:7:\"#dc3545\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:58:25\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:13;s:7:\"user_id\";i:2;s:4:\"name\";s:7:\"Makanan\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:9:\"bi-basket\";s:5:\"color\";s:7:\"#dc3545\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:58:25\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:4:\"icon\";i:4;s:5:\"color\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:2;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:19;s:7:\"user_id\";i:2;s:4:\"name\";s:7:\"Tagihan\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:10:\"bi-receipt\";s:5:\"color\";s:7:\"#1e78c8\";s:10:\"created_at\";s:19:\"2026-03-25 02:13:17\";s:10:\"updated_at\";s:19:\"2026-03-25 02:13:17\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:19;s:7:\"user_id\";i:2;s:4:\"name\";s:7:\"Tagihan\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:10:\"bi-receipt\";s:5:\"color\";s:7:\"#1e78c8\";s:10:\"created_at\";s:19:\"2026-03-25 02:13:17\";s:10:\"updated_at\";s:19:\"2026-03-25 02:13:17\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:4:\"icon\";i:4;s:5:\"color\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:3;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:14;s:7:\"user_id\";i:2;s:4:\"name\";s:12:\"Transportasi\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:12:\"bi-car-front\";s:5:\"color\";s:7:\"#ffc107\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:12:05\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:14;s:7:\"user_id\";i:2;s:4:\"name\";s:12:\"Transportasi\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:12:\"bi-car-front\";s:5:\"color\";s:7:\"#ffc107\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:12:05\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:4:\"icon\";i:4;s:5:\"color\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:4;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:15;s:7:\"user_id\";i:2;s:4:\"name\";s:9:\"Utilities\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:12:\"bi-lightning\";s:5:\"color\";s:7:\"#0dcaf0\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:01:22\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:15;s:7:\"user_id\";i:2;s:4:\"name\";s:9:\"Utilities\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:12:\"bi-lightning\";s:5:\"color\";s:7:\"#0dcaf0\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:01:22\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:4:\"icon\";i:4;s:5:\"color\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}',1775469503),('family-finance-cache-dashboard_bar_2_2026','a:12:{i:0;a:3:{s:5:\"month\";s:3:\"Jan\";s:6:\"income\";d:0;s:7:\"expense\";d:0;}i:1;a:3:{s:5:\"month\";s:3:\"Feb\";s:6:\"income\";d:0;s:7:\"expense\";d:0;}i:2;a:3:{s:5:\"month\";s:3:\"Mar\";s:6:\"income\";d:25772993;s:7:\"expense\";d:25946831;}i:3;a:3:{s:5:\"month\";s:3:\"Apr\";s:6:\"income\";d:30000000;s:7:\"expense\";d:0;}i:4;a:3:{s:5:\"month\";s:3:\"May\";s:6:\"income\";d:0;s:7:\"expense\";d:0;}i:5;a:3:{s:5:\"month\";s:3:\"Jun\";s:6:\"income\";d:0;s:7:\"expense\";d:0;}i:6;a:3:{s:5:\"month\";s:3:\"Jul\";s:6:\"income\";d:0;s:7:\"expense\";d:0;}i:7;a:3:{s:5:\"month\";s:3:\"Aug\";s:6:\"income\";d:0;s:7:\"expense\";d:0;}i:8;a:3:{s:5:\"month\";s:3:\"Sep\";s:6:\"income\";d:0;s:7:\"expense\";d:0;}i:9;a:3:{s:5:\"month\";s:3:\"Oct\";s:6:\"income\";d:0;s:7:\"expense\";d:0;}i:10;a:3:{s:5:\"month\";s:3:\"Nov\";s:6:\"income\";d:0;s:7:\"expense\";d:0;}i:11;a:3:{s:5:\"month\";s:3:\"Dec\";s:6:\"income\";d:0;s:7:\"expense\";d:0;}}',1775542623),('family-finance-cache-dashboard_line_2_6','a:6:{i:0;a:2:{s:5:\"month\";s:8:\"Nov 2025\";s:7:\"expense\";d:0;}i:1;a:2:{s:5:\"month\";s:8:\"Dec 2025\";s:7:\"expense\";d:0;}i:2;a:2:{s:5:\"month\";s:8:\"Jan 2026\";s:7:\"expense\";d:0;}i:3;a:2:{s:5:\"month\";s:8:\"Feb 2026\";s:7:\"expense\";d:0;}i:4;a:2:{s:5:\"month\";s:8:\"Mar 2026\";s:7:\"expense\";d:25946831;}i:5;a:2:{s:5:\"month\";s:8:\"Apr 2026\";s:7:\"expense\";d:0;}}',1775542623),('family-finance-cache-dashboard_member_2_0_2026_0','a:2:{i:0;a:3:{s:6:\"member\";s:5:\"Yosua\";s:5:\"color\";s:7:\"#0d6efd\";s:5:\"total\";d:16228763;}i:1;a:3:{s:6:\"member\";s:7:\"Juliana\";s:5:\"color\";s:7:\"#6f42c1\";s:5:\"total\";d:9718068;}}',1775469801),('family-finance-cache-dashboard_member_2_3_2026_0','a:2:{i:0;a:3:{s:6:\"member\";s:5:\"Yosua\";s:5:\"color\";s:7:\"#0d6efd\";s:5:\"total\";d:16228763;}i:1;a:3:{s:6:\"member\";s:7:\"Juliana\";s:5:\"color\";s:7:\"#6f42c1\";s:5:\"total\";d:9718068;}}',1775542658),('family-finance-cache-dashboard_member_2_4_2026_0','a:0:{}',1775542636),('family-finance-cache-dashboard_pie_2_0_2026_0','a:3:{i:0;a:3:{s:8:\"category\";s:9:\"Utilities\";s:5:\"color\";s:7:\"#0dcaf0\";s:5:\"total\";d:4972102;}i:1;a:3:{s:8:\"category\";s:7:\"Tagihan\";s:5:\"color\";s:7:\"#1e78c8\";s:5:\"total\";d:19867329;}i:2;a:3:{s:8:\"category\";s:13:\"Entertainment\";s:5:\"color\";s:7:\"#6f42c1\";s:5:\"total\";d:1107400;}}',1775469801),('family-finance-cache-dashboard_pie_2_3_2026_0','a:3:{i:0;a:3:{s:8:\"category\";s:9:\"Utilities\";s:5:\"color\";s:7:\"#0dcaf0\";s:5:\"total\";d:4972102;}i:1;a:3:{s:8:\"category\";s:7:\"Tagihan\";s:5:\"color\";s:7:\"#1e78c8\";s:5:\"total\";d:19867329;}i:2;a:3:{s:8:\"category\";s:13:\"Entertainment\";s:5:\"color\";s:7:\"#6f42c1\";s:5:\"total\";d:1107400;}}',1775542658),('family-finance-cache-dashboard_pie_2_4_2026_0','a:0:{}',1775542623),('family-finance-cache-dashboard_summary_2_3_2026','a:7:{s:13:\"total_balance\";d:31826162;s:14:\"monthly_income\";d:25772993;s:15:\"monthly_expense\";d:25946831;s:11:\"monthly_net\";d:-173838;s:12:\"active_goals\";i:1;s:5:\"month\";i:3;s:4:\"year\";i:2026;}',1775527610),('family-finance-cache-dashboard_summary_2_4_2026','a:7:{s:13:\"total_balance\";d:31826162;s:14:\"monthly_income\";d:30000000;s:15:\"monthly_expense\";d:0;s:11:\"monthly_net\";d:30000000;s:12:\"active_goals\";i:1;s:5:\"month\";i:4;s:4:\"year\";i:2026;}',1775542623),('family-finance-cache-goal_2_1_15','O:42:\"Illuminate\\Pagination\\LengthAwarePaginator\":12:{s:8:\"\0*\0items\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:15:\"App\\Models\\Goal\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:5:\"goals\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:10:{s:2:\"id\";i:5;s:7:\"user_id\";i:2;s:4:\"name\";s:14:\"Pulang Kampung\";s:13:\"target_amount\";s:11:\"20000000.00\";s:14:\"current_amount\";s:4:\"0.00\";s:8:\"deadline\";s:10:\"2026-12-29\";s:6:\"status\";s:6:\"active\";s:10:\"created_at\";s:19:\"2026-04-06 09:55:43\";s:10:\"updated_at\";s:19:\"2026-04-06 09:55:43\";s:10:\"account_id\";N;}s:11:\"\0*\0original\";a:10:{s:2:\"id\";i:5;s:7:\"user_id\";i:2;s:4:\"name\";s:14:\"Pulang Kampung\";s:13:\"target_amount\";s:11:\"20000000.00\";s:14:\"current_amount\";s:4:\"0.00\";s:8:\"deadline\";s:10:\"2026-12-29\";s:6:\"status\";s:6:\"active\";s:10:\"created_at\";s:19:\"2026-04-06 09:55:43\";s:10:\"updated_at\";s:19:\"2026-04-06 09:55:43\";s:10:\"account_id\";N;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:3:{s:13:\"target_amount\";s:9:\"decimal:2\";s:14:\"current_amount\";s:9:\"decimal:2\";s:8:\"deadline\";s:4:\"date\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:2:{s:16:\"goalTransactions\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:0:{}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:7:\"account\";N;}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:7:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:13:\"target_amount\";i:3;s:14:\"current_amount\";i:4;s:10:\"account_id\";i:5;s:8:\"deadline\";i:6;s:6:\"status\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:10:\"\0*\0perPage\";i:15;s:14:\"\0*\0currentPage\";i:1;s:7:\"\0*\0path\";s:31:\"http://localhost:8000/api/goals\";s:8:\"\0*\0query\";a:0:{}s:11:\"\0*\0fragment\";N;s:11:\"\0*\0pageName\";s:4:\"page\";s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:10:\"onEachSide\";i:3;s:10:\"\0*\0options\";a:2:{s:4:\"path\";s:31:\"http://localhost:8000/api/goals\";s:8:\"pageName\";s:4:\"page\";}s:8:\"\0*\0total\";i:1;s:11:\"\0*\0lastPage\";i:1;}',1775469644),('family-finance-cache-member_list_2','O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:2:{i:0;O:17:\"App\\Models\\Member\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:7:\"members\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:5;s:7:\"user_id\";i:2;s:4:\"name\";s:7:\"Juliana\";s:4:\"role\";s:6:\"mother\";s:6:\"avatar\";N;s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:01:49\";s:10:\"updated_at\";s:19:\"2026-03-25 02:01:49\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:5;s:7:\"user_id\";i:2;s:4:\"name\";s:7:\"Juliana\";s:4:\"role\";s:6:\"mother\";s:6:\"avatar\";N;s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:01:49\";s:10:\"updated_at\";s:19:\"2026-03-25 02:01:49\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:1:{s:9:\"is_active\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"role\";i:3;s:6:\"avatar\";i:4;s:9:\"is_active\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:17:\"App\\Models\\Member\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:7:\"members\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:4;s:7:\"user_id\";i:2;s:4:\"name\";s:5:\"Yosua\";s:4:\"role\";s:6:\"father\";s:6:\"avatar\";N;s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:01:41\";s:10:\"updated_at\";s:19:\"2026-03-25 02:01:41\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:4;s:7:\"user_id\";i:2;s:4:\"name\";s:5:\"Yosua\";s:4:\"role\";s:6:\"father\";s:6:\"avatar\";N;s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:01:41\";s:10:\"updated_at\";s:19:\"2026-03-25 02:01:41\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:1:{s:9:\"is_active\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"role\";i:3;s:6:\"avatar\";i:4;s:9:\"is_active\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}',1775542635),('family-finance-cache-networth_current_1','d:18750000;',1775469610),('family-finance-cache-networth_current_2','d:31826162;',1775542623),('family-finance-cache-networth_history_2','a:2:{i:0;a:6:{s:2:\"id\";i:4;s:7:\"user_id\";i:2;s:13:\"total_balance\";s:10:\"1826162.00\";s:11:\"recorded_at\";s:27:\"2026-03-01T00:00:00.000000Z\";s:10:\"created_at\";s:27:\"2026-04-06T09:42:05.000000Z\";s:10:\"updated_at\";s:27:\"2026-04-06T09:42:05.000000Z\";}i:1;a:6:{s:2:\"id\";i:2;s:7:\"user_id\";i:2;s:13:\"total_balance\";s:11:\"31826162.00\";s:11:\"recorded_at\";s:27:\"2026-04-01T00:00:00.000000Z\";s:10:\"created_at\";s:27:\"2026-04-06T09:39:52.000000Z\";s:10:\"updated_at\";s:27:\"2026-04-06T09:55:10.000000Z\";}}',1775542623),('family-finance-cache-recurring_2_1_15_0_0_0_all_all','O:42:\"Illuminate\\Pagination\\LengthAwarePaginator\":12:{s:8:\"\0*\0items\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:4:{i:0;O:31:\"App\\Models\\RecurringTransaction\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:22:\"recurring_transactions\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:14:{s:2:\"id\";i:2;s:7:\"user_id\";i:2;s:9:\"member_id\";i:4;s:10:\"account_id\";i:7;s:11:\"category_id\";i:15;s:4:\"type\";s:7:\"expense\";s:6:\"amount\";s:10:\"4672502.00\";s:11:\"description\";s:9:\"KPR Rumah\";s:9:\"frequency\";s:7:\"monthly\";s:13:\"next_due_date\";s:10:\"2026-04-25\";s:8:\"end_date\";s:10:\"2039-06-25\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 03:01:33\";s:10:\"updated_at\";s:19:\"2026-03-25 03:01:33\";}s:11:\"\0*\0original\";a:14:{s:2:\"id\";i:2;s:7:\"user_id\";i:2;s:9:\"member_id\";i:4;s:10:\"account_id\";i:7;s:11:\"category_id\";i:15;s:4:\"type\";s:7:\"expense\";s:6:\"amount\";s:10:\"4672502.00\";s:11:\"description\";s:9:\"KPR Rumah\";s:9:\"frequency\";s:7:\"monthly\";s:13:\"next_due_date\";s:10:\"2026-04-25\";s:8:\"end_date\";s:10:\"2039-06-25\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 03:01:33\";s:10:\"updated_at\";s:19:\"2026-03-25 03:01:33\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:4:{s:6:\"amount\";s:9:\"decimal:2\";s:13:\"next_due_date\";s:4:\"date\";s:8:\"end_date\";s:4:\"date\";s:9:\"is_active\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:3:{s:6:\"member\";O:17:\"App\\Models\\Member\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:7:\"members\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:4;s:7:\"user_id\";i:2;s:4:\"name\";s:5:\"Yosua\";s:4:\"role\";s:6:\"father\";s:6:\"avatar\";N;s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:01:41\";s:10:\"updated_at\";s:19:\"2026-03-25 02:01:41\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:4;s:7:\"user_id\";i:2;s:4:\"name\";s:5:\"Yosua\";s:4:\"role\";s:6:\"father\";s:6:\"avatar\";N;s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:01:41\";s:10:\"updated_at\";s:19:\"2026-03-25 02:01:41\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:1:{s:9:\"is_active\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"role\";i:3;s:6:\"avatar\";i:4;s:9:\"is_active\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}s:7:\"account\";O:18:\"App\\Models\\Account\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"accounts\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:10:{s:2:\"id\";i:7;s:7:\"user_id\";i:2;s:4:\"name\";s:7:\"Mandiri\";s:4:\"type\";s:4:\"bank\";s:15:\"initial_balance\";s:4:\"0.00\";s:7:\"balance\";s:9:\"500000.00\";s:4:\"icon\";s:7:\"bi-bank\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:03:46\";s:10:\"updated_at\";s:19:\"2026-03-25 07:17:32\";}s:11:\"\0*\0original\";a:10:{s:2:\"id\";i:7;s:7:\"user_id\";i:2;s:4:\"name\";s:7:\"Mandiri\";s:4:\"type\";s:4:\"bank\";s:15:\"initial_balance\";s:4:\"0.00\";s:7:\"balance\";s:9:\"500000.00\";s:4:\"icon\";s:7:\"bi-bank\";s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 02:03:46\";s:10:\"updated_at\";s:19:\"2026-03-25 07:17:32\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:3:{s:15:\"initial_balance\";s:9:\"decimal:2\";s:7:\"balance\";s:9:\"decimal:2\";s:9:\"is_active\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:7:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:15:\"initial_balance\";i:4;s:7:\"balance\";i:5;s:4:\"icon\";i:6;s:9:\"is_active\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}s:8:\"category\";O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:15;s:7:\"user_id\";i:2;s:4:\"name\";s:9:\"Utilities\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:12:\"bi-lightning\";s:5:\"color\";s:7:\"#0dcaf0\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:01:22\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:15;s:7:\"user_id\";i:2;s:4:\"name\";s:9:\"Utilities\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:12:\"bi-lightning\";s:5:\"color\";s:7:\"#0dcaf0\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 02:01:22\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:4:\"icon\";i:4;s:5:\"color\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:11:{i:0;s:7:\"user_id\";i:1;s:9:\"member_id\";i:2;s:10:\"account_id\";i:3;s:11:\"category_id\";i:4;s:4:\"type\";i:5;s:6:\"amount\";i:6;s:11:\"description\";i:7;s:9:\"frequency\";i:8;s:13:\"next_due_date\";i:9;s:8:\"end_date\";i:10;s:9:\"is_active\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:31:\"App\\Models\\RecurringTransaction\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:22:\"recurring_transactions\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:14:{s:2:\"id\";i:3;s:7:\"user_id\";i:2;s:9:\"member_id\";i:4;s:10:\"account_id\";i:7;s:11:\"category_id\";i:16;s:4:\"type\";s:7:\"expense\";s:6:\"amount\";s:8:\"47500.00\";s:11:\"description\";s:7:\"Netflix\";s:9:\"frequency\";s:7:\"monthly\";s:13:\"next_due_date\";s:10:\"2026-04-25\";s:8:\"end_date\";N;s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 03:51:27\";s:10:\"updated_at\";s:19:\"2026-03-25 03:51:27\";}s:11:\"\0*\0original\";a:14:{s:2:\"id\";i:3;s:7:\"user_id\";i:2;s:9:\"member_id\";i:4;s:10:\"account_id\";i:7;s:11:\"category_id\";i:16;s:4:\"type\";s:7:\"expense\";s:6:\"amount\";s:8:\"47500.00\";s:11:\"description\";s:7:\"Netflix\";s:9:\"frequency\";s:7:\"monthly\";s:13:\"next_due_date\";s:10:\"2026-04-25\";s:8:\"end_date\";N;s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 03:51:27\";s:10:\"updated_at\";s:19:\"2026-03-25 03:51:27\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:4:{s:6:\"amount\";s:9:\"decimal:2\";s:13:\"next_due_date\";s:4:\"date\";s:8:\"end_date\";s:4:\"date\";s:9:\"is_active\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:3:{s:6:\"member\";r:61;s:7:\"account\";r:118;s:8:\"category\";O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:16;s:7:\"user_id\";i:2;s:4:\"name\";s:13:\"Entertainment\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:13:\"bi-controller\";s:5:\"color\";s:7:\"#6f42c1\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 03:47:58\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:16;s:7:\"user_id\";i:2;s:4:\"name\";s:13:\"Entertainment\";s:4:\"type\";s:7:\"expense\";s:4:\"icon\";s:13:\"bi-controller\";s:5:\"color\";s:7:\"#6f42c1\";s:10:\"created_at\";s:19:\"2026-03-25 02:01:22\";s:10:\"updated_at\";s:19:\"2026-03-25 03:47:58\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:7:\"user_id\";i:1;s:4:\"name\";i:2;s:4:\"type\";i:3;s:4:\"icon\";i:4;s:5:\"color\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:11:{i:0;s:7:\"user_id\";i:1;s:9:\"member_id\";i:2;s:10:\"account_id\";i:3;s:11:\"category_id\";i:4;s:4:\"type\";i:5;s:6:\"amount\";i:6;s:11:\"description\";i:7;s:9:\"frequency\";i:8;s:13:\"next_due_date\";i:9;s:8:\"end_date\";i:10;s:9:\"is_active\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:2;O:31:\"App\\Models\\RecurringTransaction\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:22:\"recurring_transactions\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:14:{s:2:\"id\";i:4;s:7:\"user_id\";i:2;s:9:\"member_id\";i:4;s:10:\"account_id\";i:7;s:11:\"category_id\";i:16;s:4:\"type\";s:7:\"expense\";s:6:\"amount\";s:8:\"59900.00\";s:11:\"description\";s:7:\"Spotify\";s:9:\"frequency\";s:7:\"monthly\";s:13:\"next_due_date\";s:10:\"2026-04-25\";s:8:\"end_date\";N;s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 03:51:50\";s:10:\"updated_at\";s:19:\"2026-03-25 03:51:50\";}s:11:\"\0*\0original\";a:14:{s:2:\"id\";i:4;s:7:\"user_id\";i:2;s:9:\"member_id\";i:4;s:10:\"account_id\";i:7;s:11:\"category_id\";i:16;s:4:\"type\";s:7:\"expense\";s:6:\"amount\";s:8:\"59900.00\";s:11:\"description\";s:7:\"Spotify\";s:9:\"frequency\";s:7:\"monthly\";s:13:\"next_due_date\";s:10:\"2026-04-25\";s:8:\"end_date\";N;s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 03:51:50\";s:10:\"updated_at\";s:19:\"2026-03-25 03:51:50\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:4:{s:6:\"amount\";s:9:\"decimal:2\";s:13:\"next_due_date\";s:4:\"date\";s:8:\"end_date\";s:4:\"date\";s:9:\"is_active\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:3:{s:6:\"member\";r:61;s:7:\"account\";r:118;s:8:\"category\";r:319;}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:11:{i:0;s:7:\"user_id\";i:1;s:9:\"member_id\";i:2;s:10:\"account_id\";i:3;s:11:\"category_id\";i:4;s:4:\"type\";i:5;s:6:\"amount\";i:6;s:11:\"description\";i:7;s:9:\"frequency\";i:8;s:13:\"next_due_date\";i:9;s:8:\"end_date\";i:10;s:9:\"is_active\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:3;O:31:\"App\\Models\\RecurringTransaction\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:22:\"recurring_transactions\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:14:{s:2:\"id\";i:5;s:7:\"user_id\";i:2;s:9:\"member_id\";i:4;s:10:\"account_id\";i:7;s:11:\"category_id\";i:15;s:4:\"type\";s:7:\"expense\";s:6:\"amount\";s:9:\"209000.00\";s:11:\"description\";s:9:\"IPL Rumah\";s:9:\"frequency\";s:7:\"monthly\";s:13:\"next_due_date\";s:10:\"2026-04-25\";s:8:\"end_date\";N;s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 04:42:05\";s:10:\"updated_at\";s:19:\"2026-03-25 04:42:05\";}s:11:\"\0*\0original\";a:14:{s:2:\"id\";i:5;s:7:\"user_id\";i:2;s:9:\"member_id\";i:4;s:10:\"account_id\";i:7;s:11:\"category_id\";i:15;s:4:\"type\";s:7:\"expense\";s:6:\"amount\";s:9:\"209000.00\";s:11:\"description\";s:9:\"IPL Rumah\";s:9:\"frequency\";s:7:\"monthly\";s:13:\"next_due_date\";s:10:\"2026-04-25\";s:8:\"end_date\";N;s:9:\"is_active\";i:1;s:10:\"created_at\";s:19:\"2026-03-25 04:42:05\";s:10:\"updated_at\";s:19:\"2026-03-25 04:42:05\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:4:{s:6:\"amount\";s:9:\"decimal:2\";s:13:\"next_due_date\";s:4:\"date\";s:8:\"end_date\";s:4:\"date\";s:9:\"is_active\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:3:{s:6:\"member\";r:61;s:7:\"account\";r:118;s:8:\"category\";r:183;}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:11:{i:0;s:7:\"user_id\";i:1;s:9:\"member_id\";i:2;s:10:\"account_id\";i:3;s:11:\"category_id\";i:4;s:4:\"type\";i:5;s:6:\"amount\";i:6;s:11:\"description\";i:7;s:9:\"frequency\";i:8;s:13:\"next_due_date\";i:9;s:8:\"end_date\";i:10;s:9:\"is_active\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:10:\"\0*\0perPage\";i:15;s:14:\"\0*\0currentPage\";i:1;s:7:\"\0*\0path\";s:48:\"http://localhost:8000/api/recurring-transactions\";s:8:\"\0*\0query\";a:0:{}s:11:\"\0*\0fragment\";N;s:11:\"\0*\0pageName\";s:4:\"page\";s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:10:\"onEachSide\";i:3;s:10:\"\0*\0options\";a:2:{s:4:\"path\";s:48:\"http://localhost:8000/api/recurring-transactions\";s:8:\"pageName\";s:4:\"page\";}s:8:\"\0*\0total\";i:4;s:11:\"\0*\0lastPage\";i:1;}',1775469479),('family-finance-cache-user_2_insight_expense_anomaly','N;',1775544123),('family-finance-cache-user_2_insight_highest_day','s:47:\"? Wednesdays are your highest spending days.\";',1775544123),('family-finance-cache-user_2_insight_monthly_comp','s:43:\"? Spending down 100% vs last month. ?\";',1775544123),('family-finance-cache-user_2_insight_savings_rate','s:26:\"? Saved 100% of income!\";',1775544123),('family-finance-cache-user_2_insight_weekend_vs_weekday','s:38:\"? Most spending occurs on weekdays.\";',1775544123);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('income','expense') COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categories_user_id_foreign` (`user_id`),
  CONSTRAINT `categories_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,1,'Salary','income','bi-cash-stack','#28a745','2026-03-24 18:59:44','2026-03-24 18:59:44'),(2,1,'Bonus','income','bi-gift','#20c997','2026-03-24 18:59:44','2026-03-24 18:59:44'),(3,1,'Freelance','income','bi-laptop','#17a2b8','2026-03-24 18:59:44','2026-03-24 18:59:44'),(4,1,'Investment','income','bi-graph-up-arrow','#0d6efd','2026-03-24 18:59:44','2026-03-24 18:59:44'),(5,1,'Food','expense','bi-basket','#dc3545','2026-03-24 18:59:44','2026-03-24 18:59:44'),(6,1,'Transport','expense','bi-car-front','#fd7e14','2026-03-24 18:59:44','2026-03-24 18:59:44'),(7,1,'Bills','expense','bi-receipt','#ffc107','2026-03-24 18:59:44','2026-03-24 18:59:44'),(8,1,'Shopping','expense','bi-bag','#e83e8c','2026-03-24 18:59:44','2026-03-24 18:59:44'),(9,1,'Education','expense','bi-book','#6f42c1','2026-03-24 18:59:44','2026-03-24 18:59:44'),(10,1,'Healthcare','expense','bi-heart-pulse','#d63384','2026-03-24 18:59:44','2026-03-24 18:59:44'),(11,1,'Entertainment','expense','bi-controller','#6610f2','2026-03-24 18:59:44','2026-03-24 18:59:44'),(12,2,'Gaji','income','bi-cash-stack','#198754','2026-03-24 19:01:22','2026-03-24 19:11:22'),(13,2,'Makanan','expense','bi-basket','#dc3545','2026-03-24 19:01:22','2026-03-24 19:58:25'),(14,2,'Transportasi','expense','bi-car-front','#ffc107','2026-03-24 19:01:22','2026-03-24 19:12:05'),(15,2,'Utilities','expense','bi-lightning','#0dcaf0','2026-03-24 19:01:22','2026-03-24 19:01:22'),(16,2,'Entertainment','expense','bi-controller','#6f42c1','2026-03-24 19:01:22','2026-03-24 20:47:58'),(17,2,'Bonus','income','bi-gift-fill','#49fb09','2026-03-24 19:11:12','2026-03-24 19:11:12'),(18,2,'THR','income','bi-gift','#2ce628','2026-03-24 19:11:46','2026-03-24 19:11:46'),(19,2,'Tagihan','expense','bi-receipt','#1e78c8','2026-03-24 19:13:17','2026-03-24 19:13:17');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `goal_transactions`
--

DROP TABLE IF EXISTS `goal_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goal_transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `goal_id` bigint unsigned NOT NULL,
  `amount` decimal(16,2) NOT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `goal_transactions_goal_id_foreign` (`goal_id`),
  CONSTRAINT `goal_transactions_goal_id_foreign` FOREIGN KEY (`goal_id`) REFERENCES `goals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goal_transactions`
--

LOCK TABLES `goal_transactions` WRITE;
/*!40000 ALTER TABLE `goal_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `goal_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `goals`
--

DROP TABLE IF EXISTS `goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_amount` decimal(16,2) NOT NULL,
  `current_amount` decimal(16,2) NOT NULL DEFAULT '0.00',
  `deadline` date DEFAULT NULL,
  `status` enum('active','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `account_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `goals_user_id_foreign` (`user_id`),
  KEY `goals_account_id_foreign` (`account_id`),
  CONSTRAINT `goals_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `goals_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goals`
--

LOCK TABLES `goals` WRITE;
/*!40000 ALTER TABLE `goals` DISABLE KEYS */;
INSERT INTO `goals` VALUES (1,1,'Dana Darurat',50000000.00,12000000.00,'2027-03-25','active','2026-03-24 18:59:44','2026-03-24 18:59:44',NULL),(2,1,'Liburan Bali',10000000.00,3500000.00,'2026-09-25','active','2026-03-24 18:59:44','2026-03-24 18:59:44',NULL),(5,2,'Pulang Kampung',20000000.00,0.00,'2026-12-29','active','2026-04-06 02:55:43','2026-04-06 02:55:43',NULL);
/*!40000 ALTER TABLE `goals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_reserved_at_available_at_index` (`queue`,`reserved_at`,`available_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('father','mother','child') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'child',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `members_user_id_foreign` (`user_id`),
  CONSTRAINT `members_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
INSERT INTO `members` VALUES (1,1,'Budi','father',NULL,1,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(2,1,'Sari','mother',NULL,1,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(3,1,'Andi','child',NULL,1,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(4,2,'Yosua','father',NULL,1,'2026-03-24 19:01:41','2026-03-24 19:01:41'),(5,2,'Juliana','mother',NULL,1,'2026-03-24 19:01:49','2026-03-24 19:01:49');
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2024_01_01_000001_create_members_table',1),(5,'2024_01_01_000002_create_accounts_table',1),(6,'2024_01_01_000003_create_categories_table',1),(7,'2024_01_01_000004_create_transactions_table',1),(8,'2024_01_01_000005_create_budgets_table',1),(9,'2024_01_01_000006_create_recurring_transactions_table',1),(10,'2024_01_01_000007_create_goals_table',1),(11,'2024_01_01_000008_create_goal_transactions_table',1),(12,'2024_01_01_000009_create_transaction_attachments_table',1),(13,'2026_03_13_180326_create_personal_access_tokens_table',1),(14,'2026_03_24_000000_create_activity_logs_table',1),(15,'2026_03_24_024946_add_performance_indexes',1),(16,'2026_03_24_031106_add_initial_balance_to_accounts_table',1),(17,'2026_03_24_062602_add_account_id_to_goals_table',1),(18,'2026_03_24_080058_create_net_worth_histories_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `net_worth_histories`
--

DROP TABLE IF EXISTS `net_worth_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `net_worth_histories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `total_balance` decimal(18,2) NOT NULL DEFAULT '0.00',
  `recorded_at` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `net_worth_histories_user_id_recorded_at_unique` (`user_id`,`recorded_at`),
  CONSTRAINT `net_worth_histories_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `net_worth_histories`
--

LOCK TABLES `net_worth_histories` WRITE;
/*!40000 ALTER TABLE `net_worth_histories` DISABLE KEYS */;
INSERT INTO `net_worth_histories` VALUES (1,1,18750000.00,'2026-04-01','2026-04-06 02:39:52','2026-04-06 02:55:10'),(2,2,31826162.00,'2026-04-01','2026-04-06 02:39:52','2026-04-06 02:55:10'),(3,1,26250000.00,'2026-03-01','2026-04-06 02:42:05','2026-04-06 02:42:05'),(4,2,1826162.00,'2026-03-01','2026-04-06 02:42:05','2026-04-06 02:42:05');
/*!40000 ALTER TABLE `net_worth_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (3,'App\\Models\\User',2,'auth-token','8af4fb3d2e543800f3026f05a196c3f19e0e35e4daf04ce3b2546b25756527c7','[\"*\"]','2026-03-24 20:16:42',NULL,'2026-03-24 19:26:41','2026-03-24 20:16:42'),(6,'App\\Models\\User',2,'auth-token','93fc47ea804323cdf7576b4048516c86b464f9bc377f13e0e65dfedf81769d71','[\"*\"]','2026-04-06 23:12:38',NULL,'2026-03-24 19:44:58','2026-04-06 23:12:38');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recurring_transactions`
--

DROP TABLE IF EXISTS `recurring_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recurring_transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `member_id` bigint unsigned NOT NULL,
  `account_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `type` enum('income','expense') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(16,2) NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `frequency` enum('weekly','monthly','yearly') COLLATE utf8mb4_unicode_ci NOT NULL,
  `next_due_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `recurring_transactions_user_id_foreign` (`user_id`),
  KEY `recurring_transactions_member_id_foreign` (`member_id`),
  KEY `recurring_transactions_account_id_foreign` (`account_id`),
  KEY `recurring_transactions_category_id_foreign` (`category_id`),
  CONSTRAINT `recurring_transactions_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recurring_transactions_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recurring_transactions_member_id_foreign` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recurring_transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recurring_transactions`
--

LOCK TABLES `recurring_transactions` WRITE;
/*!40000 ALTER TABLE `recurring_transactions` DISABLE KEYS */;
INSERT INTO `recurring_transactions` VALUES (1,1,1,1,7,'expense',500000.00,'Internet bulanan','monthly','2026-05-01',NULL,1,'2026-03-24 18:59:44','2026-04-06 02:51:36'),(2,2,4,7,15,'expense',4672502.00,'KPR Rumah','monthly','2026-04-25','2039-06-25',1,'2026-03-24 20:01:33','2026-03-24 20:01:33'),(3,2,4,7,16,'expense',47500.00,'Netflix','monthly','2026-04-25',NULL,1,'2026-03-24 20:51:27','2026-03-24 20:51:27'),(4,2,4,7,16,'expense',59900.00,'Spotify','monthly','2026-04-25',NULL,1,'2026-03-24 20:51:50','2026-03-24 20:51:50'),(5,2,4,7,15,'expense',209000.00,'IPL Rumah','monthly','2026-04-25',NULL,1,'2026-03-24 21:42:05','2026-03-24 21:42:05');
/*!40000 ALTER TABLE `recurring_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction_attachments`
--

DROP TABLE IF EXISTS `transaction_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_attachments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `transaction_id` bigint unsigned NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transaction_attachments_transaction_id_foreign` (`transaction_id`),
  CONSTRAINT `transaction_attachments_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction_attachments`
--

LOCK TABLES `transaction_attachments` WRITE;
/*!40000 ALTER TABLE `transaction_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `transaction_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `member_id` bigint unsigned NOT NULL,
  `account_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned DEFAULT NULL,
  `type` enum('income','expense','transfer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(16,2) NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `transfer_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transactions_member_id_foreign` (`member_id`),
  KEY `transactions_account_id_foreign` (`account_id`),
  KEY `transactions_category_id_foreign` (`category_id`),
  KEY `transactions_transfer_id_foreign` (`transfer_id`),
  KEY `transactions_user_id_transaction_date_index` (`user_id`,`transaction_date`),
  KEY `transactions_user_id_type_index` (`user_id`,`type`),
  KEY `transactions_dashboard_lookup` (`user_id`,`type`,`transfer_id`,`transaction_date`),
  KEY `transactions_category_lookup` (`user_id`,`category_id`,`type`,`transaction_date`),
  CONSTRAINT `transactions_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transactions_member_id_foreign` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_transfer_id_foreign` FOREIGN KEY (`transfer_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,1,1,1,1,'income',12000000.00,'Gaji bulanan','2026-03-01',NULL,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(2,1,2,2,3,'income',3500000.00,'Proyek desain','2026-03-03',NULL,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(3,1,1,1,5,'expense',2500000.00,'Belanja bulanan','2026-03-04',NULL,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(4,1,2,3,6,'expense',800000.00,'Bensin dan parkir','2026-03-06',NULL,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(5,1,3,4,9,'expense',500000.00,'Les bahasa Inggris','2026-03-08',NULL,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(6,1,1,1,7,'expense',1200000.00,'Listrik dan air','2026-03-11',NULL,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(7,1,2,5,8,'expense',750000.00,'Baju anak','2026-03-13',NULL,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(8,1,1,1,11,'expense',300000.00,'Nonton bioskop keluarga','2026-03-15',NULL,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(9,2,5,6,12,'income',10119360.00,'Gaji Maret','2026-03-25',NULL,'2026-03-24 19:14:01','2026-03-24 20:17:49'),(10,2,4,7,12,'income',15653633.00,'Gaji Maret','2026-03-25',NULL,'2026-03-24 19:14:23','2026-03-24 20:17:43'),(11,2,4,7,15,'expense',4672502.00,'KPR Rumah','2026-03-25',NULL,'2026-03-24 20:00:40','2026-03-24 20:00:40'),(12,2,4,7,19,'expense',242915.00,'SPayLater','2026-03-25',NULL,'2026-03-24 20:06:49','2026-03-24 20:06:49'),(13,2,4,7,19,'expense',30600.00,'GoPayLater','2026-03-25',NULL,'2026-03-24 20:08:54','2026-03-24 20:08:54'),(14,2,4,7,19,'expense',2163000.00,'INDODANA - KFC, Tiket Pesawat','2026-03-25',NULL,'2026-03-24 20:13:32','2026-03-24 20:13:32'),(15,2,4,7,15,'expense',209000.00,'IPL Rumah','2026-03-25',NULL,'2026-03-24 20:16:54','2026-03-24 20:16:54'),(16,2,4,7,19,'expense',50000.00,'Uang Kas IT','2026-03-25',NULL,'2026-03-24 20:17:33','2026-03-24 20:17:33'),(17,2,4,7,19,'expense',190298.00,'Kredivo','2026-03-25',NULL,'2026-03-24 20:37:57','2026-03-24 20:37:57'),(18,2,4,7,15,'expense',90600.00,'Air Perumdam','2026-03-25',NULL,'2026-03-24 20:40:10','2026-03-24 20:40:10'),(19,2,4,7,16,'expense',47500.00,'Netflix','2026-03-25',NULL,'2026-03-24 20:48:19','2026-03-24 20:48:19'),(20,2,4,7,16,'expense',59900.00,'Spotify','2026-03-25',NULL,'2026-03-24 20:49:14','2026-03-24 20:49:14'),(21,2,5,6,19,'expense',4659897.00,'CC BCA','2026-03-25',NULL,'2026-03-24 21:17:59','2026-03-24 21:17:59'),(22,2,5,6,19,'expense',1602831.00,'GoPay Pinjam','2026-03-25',NULL,'2026-03-24 21:23:03','2026-03-24 21:23:03'),(24,2,5,6,19,'expense',2939854.00,'Dana PPJB 6/12','2026-03-25',NULL,'2026-03-24 21:43:41','2026-03-24 21:43:48'),(25,2,5,6,19,'expense',360551.00,'CC Bank Mega','2026-03-25',NULL,'2026-03-24 21:44:17','2026-03-24 21:44:17'),(26,2,5,6,19,'expense',154935.00,'SPayLater','2026-03-25',NULL,'2026-03-24 21:44:34','2026-03-24 21:44:34'),(27,2,4,7,19,'expense',7472448.00,'CC Bank Mandiri','2026-03-25',NULL,'2026-03-24 21:46:00','2026-03-24 21:46:00'),(28,2,5,6,NULL,'expense',575130.00,'Transfer untuk bayar CC Mandiri','2026-03-25',29,'2026-03-24 23:34:52','2026-03-24 23:34:52'),(29,2,5,7,NULL,'income',575130.00,'Transfer untuk bayar CC Mandiri','2026-03-25',28,'2026-03-24 23:34:52','2026-03-24 23:34:52'),(35,2,5,6,NULL,'expense',500000.00,'Coba Transfer lagi','2026-03-25',36,'2026-03-25 00:16:03','2026-03-25 00:16:03'),(36,2,5,7,NULL,'income',500000.00,'Coba Transfer lagi','2026-03-25',35,'2026-03-25 00:16:03','2026-03-25 00:16:03'),(37,2,4,7,16,'expense',1000000.00,'Uang Bulanan Rumah','2026-03-25',NULL,'2026-03-25 00:16:42','2026-03-25 00:16:42'),(38,2,5,6,17,'income',30000000.00,'BONUS NICH','2026-04-06',NULL,'2026-04-06 02:43:37','2026-04-06 02:43:37'),(39,1,1,1,7,'expense',500000.00,'Internet bulanan (recurring)','2026-04-01',NULL,'2026-04-06 02:51:36','2026-04-06 02:51:36');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Keluarga Budiman','family@example.com',NULL,'$2y$12$cPYO6IQgPRD9fH2n5LCP4uceniizPIoXd0Nmvdjgl.vDbtHTiZqWK',NULL,'2026-03-24 18:59:44','2026-03-24 18:59:44'),(2,'YJ\'s Family','yjsfamily@gmail.com',NULL,'$2y$12$3iLp7HgA4BYSMdhd7kvABOoUF8frR9yMvg/5kH1KijW8DDsuJ/11m',NULL,'2026-03-24 19:01:22','2026-03-24 19:01:22');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-04 15:38:48
