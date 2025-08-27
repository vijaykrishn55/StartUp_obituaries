# Startup Obituaries Platform

A LinkedIn-style networking platform for failed startups where entrepreneurs can share their failure stories, connect with others, and learn from collective experiences.

## Project Structure

```
major-project/
├── README.md                 # Project documentation
├── .gitignore               # Git ignore rules
├── backend/                 # Node.js/Express API server
│   ├── config/             # Database and app configuration
│   ├── middleware/         # Express middleware (auth, validation)
│   ├── routes/            # API route handlers
│   ├── utils/             # Utility functions and validation
│   ├── schema.sql         # Database schema
│   ├── server.js          # Main server entry point
│   └── package.json       # Backend dependencies
└── frontend/              # React/Vite client application
    ├── src/              # Source code
    │   ├── components/   # Reusable UI components
    │   ├── pages/       # Page components
    │   ├── hooks/       # Custom React hooks
    │   ├── lib/         # API client and utilities
    │   ├── stores/      # State management (Zustand)
    │   └── styles/      # CSS and styling
    ├── public/          # Static assets
    ├── index.html       # HTML template
    ├── vite.config.js   # Vite configuration
    ├── tailwind.config.js # Tailwind CSS config
    └── package.json     # Frontend dependencies
```

## Features

- **User Authentication**: JWT-based auth with user profiles
- **Startup Obituaries**: Detailed failure analysis and stories
- **Community Engagement**: Emoji reactions (💡 brilliant mistake, 🪦 RIP, 🔁 deserved pivot)
- **Comments System**: Threaded discussions on startup stories
- **Networking**: LinkedIn-style connection requests and messaging
- **Team Management**: Join startup teams and manage roles
- **Leaderboards**: Rankings for most tragic, deserved pivots, etc.

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT tokens
- **Validation**: express-validator

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router
- **HTTP Client**: Axios
- **Icons**: Heroicons
- **Animations**: Framer Motion

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL database
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
# Configure database connection in .env
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
```bash
# Import the schema
mysql -u username -p database_name < backend/schema.sql
```

## API Endpoints

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Startups**: `/api/startups/*`
- **Connections**: `/api/connections/*`
- **Messages**: `/api/messages/*`
- **Leaderboards**: `/api/leaderboards/*`

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=startup_obituaries
JWT_SECRET=your_jwt_secret
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request