-- Add logo_url column to Startups table
USE startup_obituaries;

ALTER TABLE Startups ADD COLUMN logo_url VARCHAR(500) AFTER links;
