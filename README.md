# Startup Network Platform

A comprehensive social networking platform for startup founders, investors, and job seekers to connect, share stories, find opportunities, and build relationships.

## 🚀 Project Overview

This is a full-stack web application that combines professional networking with startup-specific features like pitch submissions, failure stories, funding announcements, and job opportunities.

### **Key Features**

- 🔐 **User Authentication** - JWT-based secure login/registration
- 📝 **Posts & Stories** - Share startup journeys, failures, and insights
- 💼 **Job Board** - Post and apply for startup jobs
- 🤝 **Networking** - Connect with founders and investors
- 💬 **Real-time Messaging** - Chat with connections
- 🔔 **Notifications** - Stay updated on activity
- 📊 **Founder & Investor Profiles** - Showcase experience and portfolio
- 🎯 **Pitch Submissions** - Submit startup pitches to investors
- 📈 **Polls** - Create polls in posts for community feedback

## 📁 Project Structure

```
major project 2/
├── backend/          # Node.js/Express API server
├── frontend/         # React/TypeScript client
└── README.md         # This file
```

## 🛠️ Tech Stack

### **Backend**
- **Runtime:** Node.js v20.19.4
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT + Refresh Tokens
- **Real-time:** Socket.io
- **File Upload:** Multer
- **Security:** Helmet, CORS
- **Validation:** express-validator

### **Frontend**
- **Framework:** React 18.3.1
- **Language:** TypeScript
- **Build Tool:** Vite 5.4.19
- **UI Library:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State Management:** Context API
- **Icons:** Lucide React
- **Notifications:** Sonner

## 🎯 Core Functionality

### **User Types**
- **Founders** - Share startup journeys, post jobs, connect with investors
- **Investors** - Discover pitches, connect with founders, view deal flow
- **Job Seekers** - Find opportunities, build network
- **Mentors** - Share insights, connect with founders

### **Post Types**
- **Postmortem** - Share failure stories and lessons learned
- **Funding** - Announce funding rounds
- **Job** - Quick job postings
- **Insight** - Share knowledge and tips
- **Question** - Ask the community
- **Pitch** - Share startup pitch

### **Features by Module**

#### **Authentication**
- Register with email/password
- Login with JWT tokens
- Refresh token mechanism
- Password reset functionality
- Protected routes

#### **Social Features**
- Create posts with rich content
- Add polls to posts
- Like, comment, bookmark posts
- Follow connections
- Send/receive connection requests
- Real-time messaging

#### **Jobs**
- Browse job listings
- Filter by type (full-time, co-founder, remote)
- Apply to jobs
- Post job openings
- Track applications

#### **Stories & Profiles**
- Share startup failure/success stories
- Founder profiles with ventures
- Investor profiles with portfolio
- View profile activity

## 🚦 Getting Started

### **Prerequisites**
- Node.js v20+ installed
- MongoDB Atlas account (or local MongoDB)
- Git installed

### **Quick Start**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "major project 2"
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI
   npm run seed    # Seed database with test data
   npm start       # Start backend server on port 5000
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev     # Start frontend on port 5173
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

### **Test Accounts**
After seeding the database, use these credentials:

```
Email: sarah@example.com
Password: Password123!

Email: michael@example.com
Password: Password123!

Email: emma@example.com
Password: Password123!
```

## 📊 Database Schema

### **Main Collections**
- **Users** - User accounts and profiles
- **Posts** - All types of posts and content
- **Jobs** - Job listings
- **Applications** - Job applications
- **Stories** - Startup stories
- **Founders** - Founder profiles
- **Investors** - Investor profiles
- **Connections** - User connections
- **Messages** - Direct messages
- **Conversations** - Message threads
- **Notifications** - User notifications
- **Comments** - Post comments
- **Pitches** - Startup pitch submissions

## 🔧 Configuration

### **Environment Variables**

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 📡 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### **Posts**
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/bookmark` - Bookmark post
- `POST /api/posts/:id/comments` - Add comment
- `POST /api/posts/:id/poll/vote` - Vote on poll

### **Jobs**
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create job
- `POST /api/jobs/:id/apply` - Apply to job

### **Connections**
- `GET /api/connections` - Get connections
- `POST /api/connections/request` - Send connection request
- `POST /api/connections/accept/:id` - Accept request
- `POST /api/connections/reject/:id` - Reject request

### **Messages**
- `GET /api/messages/conversations` - Get conversations
- `POST /api/messages/conversations` - Create conversation
- `GET /api/messages/conversations/:id/messages` - Get messages
- `POST /api/messages/conversations/:id/messages` - Send message

### **More endpoints available** - See backend/routes/ for complete list

## 🔒 Security Features

- JWT authentication with access and refresh tokens
- Password hashing with bcrypt
- Protected API routes with middleware
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- XSS protection
- Rate limiting ready

## 📱 Frontend Pages

- `/` - Landing page
- `/dashboard` - User dashboard feed
- `/investor-dashboard` - Investor-specific dashboard
- `/jobs` - Job board
- `/jobs/:id` - Job details
- `/stories` - Startup stories
- `/founders` - Browse founders
- `/investors` - Browse investors
- `/profile` - User profile
- `/posts/:id` - Post details

## 🎨 UI Components

Built with shadcn/ui:
- Navigation with notifications
- Post cards with polls
- Job cards
- Connection cards
- Message interface
- Modals/dialogs for actions
- Toast notifications
- Loading states
- Error boundaries

## 📈 Future Enhancements

- [ ] Email notifications
- [ ] Advanced search and filters
- [ ] Analytics dashboard
- [ ] Video content support
- [ ] Event management
- [ ] Payment integration
- [ ] Mobile app (React Native)
- [ ] AI-powered recommendations
- [ ] Advanced analytics

## 🤝 Contributing

This is a private project. For questions or contributions, please contact the project owner.

## 📄 License

All rights reserved. This project is proprietary.

## 📞 Support

For issues or questions:
- Check the backend README for API documentation
- Check the frontend README for component documentation
- Review the code comments for implementation details

---

**Built with ❤️ for the startup community**
