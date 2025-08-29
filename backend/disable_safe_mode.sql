-- Quick Fix for Safe Update Mode (Error 1175)
-- Run this script to temporarily disable safe mode and run migrations

USE startup_obituaries;

-- Show current safe mode setting
SELECT @@SQL_SAFE_UPDATES as 'Current Safe Mode Setting (1=ON, 0=OFF)';

-- Temporarily disable safe update mode
SET SQL_SAFE_UPDATES = 0;

-- Confirmation message
SELECT 'Safe update mode temporarily disabled. You can now run your migrations.' as Status;

-- Note: Safe mode will be re-enabled when you disconnect/reconnect
-- Or you can manually re-enable it by running: SET SQL_SAFE_UPDATES = 1;