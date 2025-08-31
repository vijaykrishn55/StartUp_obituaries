@echo off
echo 🚀 Setting up Startup Obituaries Project...

:: Check if Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js is installed

:: Setup Backend
echo 📦 Setting up Backend...
cd backend

:: Install dependencies
echo Installing backend dependencies...
npm install

:: Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file from example...
    copy .env.example .env
    echo ⚠️ Please edit backend\.env file with your database credentials
) else (
    echo ✅ .env file already exists
)

:: Create uploads directory
if not exist "uploads" mkdir uploads
echo ✅ Uploads directory created

cd ..

:: Setup Frontend
echo 🎨 Setting up Frontend...
cd frontend

:: Install dependencies
echo Installing frontend dependencies...
npm install

cd ..

:: Instructions
echo 🎉 Setup completed!
echo.
echo Next steps:
echo 1. Edit backend\.env file with your database credentials
echo 2. Create MySQL database: 'startup_obituaries'
echo 3. Import the schema: mysql -u username -p startup_obituaries ^< backend\schema.sql
echo 4. Start backend: cd backend ^&^& npm start
echo 5. Start frontend: cd frontend ^&^& npm run dev
echo.
echo Happy coding! 🚀
pause