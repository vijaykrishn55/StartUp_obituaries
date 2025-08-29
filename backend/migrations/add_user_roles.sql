-- Migration to add user_role column to existing Users table
-- Run this script if you have an existing database

USE startup_obituaries;

-- Temporarily disable safe update mode for this migration
SET SQL_SAFE_UPDATES = 0;

-- Add user_role column to Users table
ALTER TABLE Users 
ADD COLUMN user_role ENUM('student', 'founder', 'investor', 'recruiter') DEFAULT 'student' 
AFTER github_url;

-- Update existing users based on their current flags
-- Update recruiters first (using id > 0 to use a KEY column)
UPDATE Users SET user_role = 'recruiter' WHERE id > 0 AND is_recruiter = TRUE;

-- Update founders (using id > 0 to use a KEY column)
UPDATE Users SET user_role = 'founder' WHERE id > 0 AND open_to_co_founding = TRUE AND is_recruiter = FALSE;

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;
