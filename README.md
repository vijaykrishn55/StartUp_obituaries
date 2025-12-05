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

### **🌟 Revolutionary Features**

- 🗺️ **Failure Heatmap** - Geographic visualization of startup failures with detailed analytics. Learn where startups fail and why. See patterns by location, industry, and failure reason.

- 💼 **Resurrection Marketplace** - Buy and sell assets from failed startups. $12.4M+ in assets traded. Categories include domains, source code, customer databases, IP, equipment, and more.

- 🆘 **Live Autopsy War Rooms** - Real-time community support during startup shutdowns. Join live sessions where founders in crisis get advice from mentors, investors, and fellow entrepreneurs. You're not alone.

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
- **FailureReports** - Documented startup failures with analytics (NEW)
- **Assets** - Marketplace listings from failed startups (NEW)
- **WarRooms** - Live support sessions for founders in crisis (NEW)

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

- `/` - Landing page with real database data and auth-protected navigation
- `/dashboard` - User dashboard feed with posts, jobs, connections
- `/investor-dashboard` - Investor-specific dashboard with deal flow
- `/jobs` - Job board with search and filters
- `/jobs/:id` - Job details with apply functionality
- `/stories` - Startup stories with categories
- `/stories/:id` - Individual story detail
- `/founders` - Browse founder profiles
- `/investors` - Browse investor profiles
- `/profile` - Current user's profile (redirects to `/profile/:id`)
- `/profile/:id` - Any user's profile with posts, activity, connections
- `/posts/:id` - Post details with comments and polls
- `/messages` - Direct messaging with conversations
- `/bookmarks` - Saved/bookmarked posts
- `/failure-heatmap` - Geographic failure visualization with analytics
- `/failure-reports/submit` - Submit failure report
- `/failure-reports/:id` - Failure report detail
- `/marketplace` - Asset marketplace for failed startups
- `/assets/:id` - Individual asset detail
- `/war-rooms` - Live support sessions with real-time chat

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

## 📈 Recent Enhancements (December 2024)

### Core Features
- ✅ **Failure Heatmap** - Geographic failure analysis with detailed reports
- ✅ **Resurrection Marketplace** - Asset trading platform for failed startups
- ✅ **Live Autopsy War Rooms** - Real-time crisis support with community and real-time messaging

### Landing Page
- ✅ **Real Database Integration** - All landing page sections fetch real data from MongoDB
- ✅ **Dynamic Stats** - Founders, stories, jobs, investors, and assets traded counts from actual database
- ✅ **Auth-Protected Navigation** - Clicking any feature opens Join Now dialog if not signed in
- ✅ **Sign In/Join Now Toggle** - Seamless switching between login and registration dialogs

### Profile System
- ✅ **Unified Profile Page** - Single `/profile/:userId` route for all user types
- ✅ **Real Profile Strength** - Calculated from actual profile completeness
- ✅ **Real Analytics** - Profile views, post impressions, search appearances from database
- ✅ **View Other Profiles** - Navigate to any user's profile with proper data isolation
- ✅ **Message Button** - Direct messaging from profile pages with conversation creation

### Posts & Content
- ✅ **MyPosts Component** - Shows correct user's posts when viewing profiles
- ✅ **Empty States** - Proper empty state messages for all profile sections
- ✅ **Delete Functionality** - Working delete for skills, experiences, education, ventures

### Messaging
- ✅ **Conversation Creation** - Proper `/messages?user=` param handling
- ✅ **War Rooms Real-time** - Tab caching without unnecessary reloads

### Bug Fixes
- ✅ Fixed route ordering issues (specific routes before dynamic)
- ✅ Fixed React hydration errors
- ✅ Fixed background color consistency across pages
- ✅ Fixed array mapping errors (tags.map, skills.map with Array.isArray checks)

## 🔮 Future Enhancements

- [ ] Email notifications with SMTP integration
- [ ] Advanced search and filters with Elasticsearch
- [ ] Video content support for War Rooms (WebRTC)
- [ ] Event management system
- [ ] Payment integration for Marketplace (Stripe)
- [ ] Mobile app (React Native)
- [ ] AI-powered connection recommendations
- [ ] Blockchain verification for assets
- [ ] Advanced failure prediction models with ML
- [ ] Export profile/data functionality
- [ ] Two-factor authentication

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
