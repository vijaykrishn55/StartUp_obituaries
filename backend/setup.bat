@echo off
echo ============================================
echo Phoenix Startup Circle - Backend Setup
echo ============================================
echo.

echo Step 1: Installing dependencies...
call npm install
echo.

echo Step 2: Creating uploads directories...
if not exist uploads mkdir uploads
if not exist uploads\avatars mkdir uploads\avatars
if not exist uploads\resumes mkdir uploads\resumes
if not exist uploads\documents mkdir uploads\documents
if not exist uploads\covers mkdir uploads\covers
echo ✓ Uploads directories created
echo.

echo Step 3: Setting up environment variables...
if not exist .env (
    copy .env.example .env
    echo ✓ .env file created from .env.example
    echo ! IMPORTANT: Please update the .env file with your actual configuration values
) else (
    echo ! .env file already exists, skipping...
)
echo.

echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Update .env file with your configuration
echo 2. Make sure MongoDB is running
echo 3. Run 'npm run dev' to start the server
echo 4. Optional: Run 'node seed.js' to populate sample data
echo.
pause
