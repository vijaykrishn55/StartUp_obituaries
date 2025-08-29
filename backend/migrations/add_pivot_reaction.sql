-- Migration to add 'pivot' reaction type to existing Reactions table
-- Run this script if you have an existing database

USE startup_obituaries;

-- Add 'pivot' to the existing ENUM type
ALTER TABLE Reactions 
MODIFY COLUMN type ENUM('upvote', 'downvote', 'pivot') NOT NULL;

-- Optional: Add some sample pivot reactions for testing
-- Uncomment the lines below if you want to add test data
/*
INSERT INTO Reactions (user_id, startup_id, type) VALUES 
(1, 1, 'pivot'),
(2, 2, 'pivot'),
(3, 1, 'pivot');
*/
