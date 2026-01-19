-- MySQL Database Setup for Event Management System
-- Run this script in your MySQL database (loginDB)

-- Check if table exists
SHOW TABLES LIKE 'event';

-- Option 1: Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS event (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  location VARCHAR(255),
  registration_link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Option 2: If table exists but time column is missing, add it
-- Try this first (if AFTER is supported in your MySQL version):
-- ALTER TABLE event ADD COLUMN time TIME AFTER date;

-- If the above fails, use this safer option (works in all MySQL versions):
-- ALTER TABLE event ADD COLUMN time TIME;

-- Verify table structure
DESCRIBE event;

-- Or use:
-- SHOW COLUMNS FROM event;




