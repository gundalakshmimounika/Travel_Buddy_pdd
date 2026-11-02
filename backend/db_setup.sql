-- ========================================================================
-- TRAVEL BUDDY - COMPLETE DATABASE INITIALIZATION SCHEMA
-- ========================================================================

CREATE DATABASE IF NOT EXISTS `travel_buddy` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `travel_buddy`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Planned Trips Table
CREATE TABLE IF NOT EXISTS `planned_trips` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_email` VARCHAR(255) NOT NULL,
    `destination` VARCHAR(255) NOT NULL,
    `image_res` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `user_destination` (`user_email`, `destination`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Trip Budgets Table
CREATE TABLE IF NOT EXISTS `trip_budgets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `trip_title` VARCHAR(255) NOT NULL UNIQUE,
    `total_budget` DECIMAL(10, 2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Expenses Table
CREATE TABLE IF NOT EXISTS `expenses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `trip_title` VARCHAR(255) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `note` VARCHAR(255) DEFAULT '',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Community Posts Table
CREATE TABLE IF NOT EXISTS `community_posts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_name` VARCHAR(100) NOT NULL,
    `user_rating` VARCHAR(100) NOT NULL,
    `avatar_id` INT NOT NULL DEFAULT 1,
    `destination` VARCHAR(255) NOT NULL,
    `dates` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `interested_count` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Join Requests Table
CREATE TABLE IF NOT EXISTS `join_requests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `post_id` INT NOT NULL,
    `requester_name` VARCHAR(100) NOT NULL,
    `requester_email` VARCHAR(100) NOT NULL,
    `destination` VARCHAR(255) NOT NULL,
    `status` VARCHAR(20) DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Packing List Table
CREATE TABLE IF NOT EXISTS `packing_list` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `trip_title` VARCHAR(255) NOT NULL,
    `item_name` VARCHAR(255) NOT NULL,
    `category` VARCHAR(50) NOT NULL DEFAULT 'General',
    `is_packed` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Alerts Table
CREATE TABLE IF NOT EXISTS `alerts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_email` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(50) NOT NULL DEFAULT 'general',
    `timestamp` BIGINT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Seed Data (optional initial user)
INSERT IGNORE INTO `users` (`full_name`, `email`, `password`)
VALUES ('Aarav Mehta', 'aarav.mehta@gmail.com', 'Travel123');
