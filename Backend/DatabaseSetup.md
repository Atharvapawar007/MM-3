# Database Setup (MySQL + Workbench)

This guide helps you create the MySQL database and tables used by the Backend. Use MySQL Workbench (or any MySQL client) to execute the statements below in order.

- Database name (example): bustrack
- Recommended user: bustrack
- Charset/Collation: utf8mb4 / utf8mb4_unicode_ci

Note: The backend uses Sequelize and will auto-sync minor changes. Still, creating the schema explicitly is recommended for clean setup.

## 1) Create database and app user

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS `bustrack`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- Create application user (adjust host and password as needed)
CREATE USER IF NOT EXISTS 'bustrack'@'%' IDENTIFIED BY 'your-strong-password';

-- Grant privileges to the user on this database
GRANT ALL PRIVILEGES ON `bustrack`.* TO 'bustrack'@'%';
FLUSH PRIVILEGES;
```

If running locally with MySQL Workbench on the same machine, you can also create the user as `'bustrack'@'localhost'`.

## 2) Use the database

```sql
USE `bustrack`;
```

## 3) Create tables

The schema below matches the backend models and route expectations (including a PRN field for students).

### 3.1 users
```sql
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','sub-admin') NOT NULL DEFAULT 'admin',
  `reset_password_token` VARCHAR(255) NULL,
  `reset_password_expires` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.2 drivers
```sql
CREATE TABLE IF NOT EXISTS `drivers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `number` VARCHAR(100) NOT NULL,
  `gender` ENUM('male','female','other') NOT NULL,
  `contact` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `bus_plate` VARCHAR(100) NOT NULL,
  `bus_number` VARCHAR(100) NOT NULL,
  `user_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_drivers_number` (`number`),
  UNIQUE KEY `uk_drivers_email` (`email`),
  UNIQUE KEY `uk_drivers_bus_plate` (`bus_plate`),
  UNIQUE KEY `uk_drivers_bus_number` (`bus_number`),
  KEY `idx_drivers_user_id` (`user_id`),
  CONSTRAINT `fk_drivers_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.3 students
```sql
CREATE TABLE IF NOT EXISTS `students` (
  `prn` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `gender` ENUM('male','female','other') NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `bus_id` INT NOT NULL,
  `username` VARCHAR(255) NULL,
  `password` VARCHAR(255) NULL,
  `credentials_generated` TINYINT(1) NOT NULL DEFAULT 0,
  `invitation_sent` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`prn`),
  UNIQUE KEY `uk_students_email` (`email`),
  KEY `idx_students_bus_id` (`bus_id`),
  CONSTRAINT `fk_students_bus_id` FOREIGN KEY (`bus_id`) REFERENCES `drivers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 4) Optional seed (create an admin)

You can run the backend script which creates an admin automatically after DB connection is established, or insert manually for quick testing:

```sql
INSERT INTO `users` (`email`, `password`, `role`)
VALUES ('admin@example.com', '$2b$10$replace_with_bcrypt_hash', 'admin');
```

Note: Passwords must be bcrypt-hashed in production. The backend will hash when creating via API/script.

## 5) Verify schema

```sql
-- Ensure tables exist
SHOW TABLES;

-- Inspect columns
DESCRIBE `users`;
DESCRIBE `drivers`;
DESCRIBE `students`;

-- Quick integrity checks
SELECT COUNT(*) AS users_cnt FROM `users`;
SELECT COUNT(*) AS drivers_cnt FROM `drivers`;
SELECT COUNT(*) AS students_cnt FROM `students`;
```

## 6) Configure Backend .env

Map DB credentials in `Backend/.env`:

```ini
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=bustrack
DB_USER=bustrack
DB_PASSWORD=your-strong-password

JWT_SECRET=replace_with_strong_secret
RESET_PASSWORD_SECRET=replace_with_strong_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@example.com
```

## 7) Start the Backend

- Ensure MySQL is running.
- From `Backend/`: `npm run dev`

Sequelize will validate/sync tables. If you created tables with this guide, sync should be quick and non-destructive.
