@echo off
echo Setting up Startup Obituaries Database...
echo.

REM Check if MySQL is running
echo Checking MySQL service...
sc query MySQL80 >nul 2>&1
if %errorlevel% neq 0 (
    echo MySQL service not found. Please ensure MySQL is installed and running.
    pause
    exit /b 1
)

echo MySQL service is running.
echo.

REM Setup database
echo Creating database and tables...
mysql -u root -p -e "source complete_schema_latest.sql"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database setup completed successfully!
    echo.
    echo You can now start the backend server:
    echo   cd backend
    echo   npm start
) else (
    echo.
    echo ❌ Database setup failed. Please check your MySQL credentials.
    echo Make sure MySQL is running and you have the correct password.
)

echo.
pause
