-- Simple Migration to add user_role column to existing Users table
-- This version avoids complex syntax and works reliably

USE startup_obituaries;

-- Temporarily disable safe update mode
SET SQL_SAFE_UPDATES = 0;

-- Add user_role column to Users table (simple approach)
ALTER TABLE Users 
ADD COLUMN user_role ENUM('student', 'founder', 'investor', 'recruiter') DEFAULT 'student' 
AFTER github_url;

-- Update existing users based on their current flags
-- Using id > 0 to reference the PRIMARY KEY for safe mode compatibility
UPDATE Users SET user_role = 'recruiter' WHERE id > 0 AND is_recruiter = TRUE;
UPDATE Users SET user_role = 'founder' WHERE id > 0 AND open_to_co_founding = TRUE AND is_recruiter = FALSE;

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Show the results
SELECT 'Migration completed successfully!' as Status;
SELECT user_role, COUNT(*) as count FROM Users GROUP BY user_role;