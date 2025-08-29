-- Migration to add user_role column to existing Users table (Safe Mode Friendly)
-- This version works with MySQL safe update mode enabled

USE startup_obituaries;

-- Check if column exists and add it if it doesn't
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'startup_obituaries' 
    AND TABLE_NAME = 'Users' 
    AND COLUMN_NAME = 'user_role'
);

-- Add user_role column to Users table (only if it doesn't exist)
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE Users ADD COLUMN user_role ENUM("student", "founder", "investor", "recruiter") DEFAULT "student" AFTER github_url;',
    'SELECT "Column user_role already exists" as Notice;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing users based on their current flags using individual ID-based updates
-- This approach uses the PRIMARY KEY (id) in WHERE clauses to satisfy safe mode requirements

-- Update recruiters (using specific IDs from a subquery)
UPDATE Users 
SET user_role = 'recruiter' 
WHERE id IN (
    SELECT temp.id FROM (
        SELECT id FROM Users WHERE is_recruiter = TRUE
    ) AS temp
);

-- Update founders (using specific IDs from a subquery)
UPDATE Users 
SET user_role = 'founder' 
WHERE id IN (
    SELECT temp.id FROM (
        SELECT id FROM Users 
        WHERE open_to_co_founding = TRUE 
        AND is_recruiter = FALSE
        AND user_role = 'student'  -- Only update if still default
    ) AS temp
);

-- Verify the updates
SELECT 
    user_role,
    COUNT(*) as count,
    GROUP_CONCAT(DISTINCT CASE WHEN is_recruiter THEN 'has_recruiter_flag' END) as flags
FROM Users 
GROUP BY user_role 
ORDER BY user_role;