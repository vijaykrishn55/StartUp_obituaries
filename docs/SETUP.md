# Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MySQL database server
- Git
- Code editor (VS Code recommended)

## Installation Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd major-project
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=startup_obituaries
JWT_SECRET=your_jwt_secret_here
PORT=3000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### 3. Database Setup
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE startup_obituaries;"

# Import schema
mysql -u root -p startup_obituaries < schema.sql
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

### 5. Start Development Servers

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm run dev
```

## Verification
- Backend: http://localhost:3000/health
- Frontend: http://localhost:5173
- API: http://localhost:3000/api

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists

### Port Conflicts
- Backend default: 3000
- Frontend default: 5173
- Change ports in respective config files if needed

### CORS Issues
- Verify CORS_ORIGIN in backend `.env`
- Should match frontend URL exactly
