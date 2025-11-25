# Backend - Startup Network API

Node.js/Express REST API for the Startup Network Platform. Provides authentication, social networking, job management, and real-time messaging features.

## 🏗️ Architecture

This backend follows MVC (Model-View-Controller) pattern with:
- **Models** - Mongoose schemas for MongoDB collections
- **Controllers** - Business logic handlers
- **Routes** - API endpoint definitions
- **Middleware** - Authentication, validation, error handling
- **Utils** - Helper functions and utilities

## 📁 Project Structure

```
backend/
├── controllers/        # Request handlers
│   ├── authController.js
│   ├── postController.js
│   ├── jobController.js
│   ├── connectionController.js
│   ├── messageController.js
│   ├── notificationController.js
│   ├── storyController.js
│   ├── founderController.js
│   ├── investorController.js
│   ├── pitchController.js
│   └── userController.js
├── middleware/         # Express middleware
│   ├── auth.js        # JWT authentication
│   ├── errorHandler.js
│   └── validation.js
├── models/            # Mongoose schemas
│   ├── User.js
│   ├── Post.js
│   ├── Job.js
│   ├── Application.js
│   ├── Story.js
│   ├── Founder.js
│   ├── Investor.js
│   ├── Connection.js
│   ├── Message.js
│   ├── Conversation.js
│   ├── Notification.js
│   ├── Comment.js
│   └── Pitch.js
├── routes/            # API routes
│   ├── auth.js
│   ├── posts.js
│   ├── jobs.js
│   ├── applications.js
│   ├── connections.js
│   ├── messages.js
│   ├── notifications.js
│   ├── stories.js
│   ├── founders.js
│   ├── investors.js
│   ├── pitches.js
│   ├── users.js
│   ├── comments.js
│   ├── search.js
│   └── upload.js
├── utils/             # Utilities
│   ├── email.js
│   └── uploadService.js
├── uploads/           # File uploads storage
├── .env               # Environment variables
├── .env.example       # Example env file
├── server.js          # Express app entry point
├── seed.js            # Database seeder
├── package.json       # Dependencies
└── README.md          # This file
```

## 🔧 Tech Stack

- **Node.js** v20.19.4 - JavaScript runtime
- **Express.js** v4.21.1 - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** v8.8.4 - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Socket.io** v4.8.1 - Real-time communication
- **Multer** v1.4.5-lts.1 - File uploads
- **express-validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP logging
- **dotenv** - Environment config

## 🚀 Getting Started

### **Installation**

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   copy .env.example .env
   ```

4. Configure `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/startup-obituaries
   JWT_SECRET=your_super_secret_jwt_key_change_this
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

5. Seed the database:
   ```bash
   npm run seed
   ```

6. Start the server:
   ```bash
   npm start
   ```

Server will run on `http://localhost:5000`

### **Available Scripts**

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with test data

## 📊 Database Models

### **User Model**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  userType: ['founder', 'investor', 'job-seeker', 'mentor', 'other'],
  avatar: String,
  coverPhoto: String,
  bio: String,
  company: String,
  location: String,
  website: String,
  socialLinks: { linkedin, twitter, github },
  skills: [{ name, endorsements }],
  experience: [{ title, company, period, description }],
  education: [{ school, degree, period, details }],
  ventures: [{ name, role, status, period, description }],
  connections: [userId],
  following: [userId],
  followers: [userId],
  createdAt: Date,
  updatedAt: Date
}
```

### **Post Model**
```javascript
{
  author: ObjectId (ref: User),
  type: ['postmortem', 'funding', 'job', 'insight', 'question', 'pitch'],
  title: String,
  content: String,
  images: [String],
  tags: [String],
  likes: [userId],
  bookmarkedBy: [userId],
  commentCount: Number,
  
  // Poll feature
  poll: {
    question: String,
    options: [{ text, votes: [userId] }],
    multipleChoice: Boolean,
    endsAt: Date
  },
  
  // Type-specific fields
  startupName: String,
  failure: String,
  lesson: String,
  fundingAmount: String,
  investors: String,
  jobTitle: String,
  jobType: String,
  
  trending: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **Job Model**
```javascript
{
  title: String,
  company: String,
  location: String,
  type: ['Full-time', 'Part-time', 'Contract', 'Co-founder', 'Internship'],
  salary: String,
  description: String,
  requirements: String,
  tags: [String],
  isRemote: Boolean,
  postedBy: ObjectId (ref: User),
  applicants: [ObjectId (ref: User)],
  status: ['open', 'closed', 'filled'],
  createdAt: Date
}
```

### **Connection Model**
```javascript
{
  requester: ObjectId (ref: User),
  recipient: ObjectId (ref: User),
  status: ['pending', 'accepted', 'rejected'],
  createdAt: Date,
  respondedAt: Date
}
```

### **Message Model**
```javascript
{
  conversation: ObjectId (ref: Conversation),
  sender: ObjectId (ref: User),
  content: String,
  read: Boolean,
  createdAt: Date
}
```

### **Conversation Model**
```javascript
{
  participants: [ObjectId (ref: User)],
  lastMessage: ObjectId (ref: Message),
  unreadCount: Map (userId -> count),
  createdAt: Date,
  updatedAt: Date
}
```

### **Notification Model**
```javascript
{
  recipient: ObjectId (ref: User),
  sender: ObjectId (ref: User),
  type: ['like', 'comment', 'connection', 'message', 'follow'],
  post: ObjectId (ref: Post),
  message: String,
  read: Boolean,
  createdAt: Date
}
```

### **Story, Founder, Investor, Pitch, Application, Comment** models also available

## 🛣️ API Routes

### **Authentication Routes** (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /refresh-token` - Refresh access token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `GET /me` - Get current user (protected)
- `POST /logout` - Logout user (protected)
- `PUT /change-password` - Change password (protected)

### **User Routes** (`/api/users`)
- `GET /` - Search users
- `GET /:id` - Get user by ID
- `GET /me` - Get my profile (protected)
- `PUT /me` - Update my profile (protected)
- `POST /me/avatar` - Upload avatar (protected)
- `POST /me/experience` - Add experience (protected)
- `PUT /me/experience/:id` - Update experience (protected)
- `DELETE /me/experience/:id` - Delete experience (protected)
- `POST /me/education` - Add education (protected)
- `DELETE /me/education/:id` - Delete education (protected)
- `POST /me/skills` - Add skill (protected)
- `DELETE /me/skills/:id` - Delete skill (protected)
- `POST /me/ventures` - Add venture (protected)
- `DELETE /me/ventures/:id` - Delete venture (protected)

### **Post Routes** (`/api/posts`)
- `GET /` - Get all posts (with pagination)
- `GET /trending` - Get trending posts
- `GET /user/:userId` - Get user's posts
- `GET /bookmarked` - Get bookmarked posts (protected)
- `GET /:id` - Get post by ID
- `GET /:id/comments` - Get post comments
- `POST /` - Create post (protected)
- `PUT /:id` - Update post (protected)
- `DELETE /:id` - Delete post (protected)
- `POST /:id/like` - Toggle like (protected)
- `POST /:id/bookmark` - Toggle bookmark (protected)
- `POST /:id/comments` - Add comment (protected)
- `POST /:id/poll/vote` - Vote on poll (protected)

### **Job Routes** (`/api/jobs`)
- `GET /` - Get all jobs
- `GET /:id` - Get job by ID
- `GET /my-applications` - Get my applications (protected)
- `GET /my-postings` - Get my job postings (protected)
- `POST /` - Create job (protected)
- `PUT /:id` - Update job (protected)
- `DELETE /:id` - Delete job (protected)
- `POST /:id/apply` - Apply to job (protected)
- `GET /:id/applications` - Get job applications (protected)

### **Connection Routes** (`/api/connections`)
- `GET /` - Get my connections (protected)
- `GET /requests` - Get connection requests (protected)
- `GET /suggestions` - Get connection suggestions (protected)
- `GET /mutual/:userId` - Get mutual connections (protected)
- `POST /request` - Send connection request (protected)
- `POST /accept/:id` - Accept request (protected)
- `POST /reject/:id` - Reject request (protected)
- `DELETE /:id` - Remove connection (protected)

### **Message Routes** (`/api/messages`)
- `GET /conversations` - Get all conversations (protected)
- `POST /conversations` - Create conversation (protected)
- `GET /conversations/:id` - Get conversation (protected)
- `GET /conversations/:id/messages` - Get messages (protected)
- `POST /conversations/:id/messages` - Send message (protected)
- `PUT /conversations/:id/read` - Mark as read (protected)
- `DELETE /conversations/:id/messages/:messageId` - Delete message (protected)

### **Notification Routes** (`/api/notifications`)
- `GET /` - Get notifications (protected)
- `GET /unread-count` - Get unread count (protected)
- `PUT /read-all` - Mark all as read (protected)
- `PUT /:id/read` - Mark as read (protected)
- `DELETE /:id` - Delete notification (protected)

### **Story Routes** (`/api/stories`)
- `GET /` - Get all stories
- `GET /:id` - Get story by ID
- `POST /` - Create story (protected)
- `PUT /:id` - Update story (protected)
- `DELETE /:id` - Delete story (protected)
- `POST /:id/like` - Like story (protected)

### **Founder Routes** (`/api/founders`)
- `GET /` - Get all founders
- `GET /:id` - Get founder by ID
- `POST /` - Create founder profile (protected)
- `PUT /:id` - Update founder profile (protected)
- `DELETE /:id` - Delete founder profile (protected)

### **Investor Routes** (`/api/investors`)
- `GET /` - Get all investors
- `GET /:id` - Get investor by ID
- `POST /` - Create investor profile (protected)
- `PUT /:id` - Update investor profile (protected)
- `DELETE /:id` - Delete investor profile (protected)

### **Pitch Routes** (`/api/pitches`)
- `POST /` - Submit pitch
- `GET /` - Get all pitches
- `GET /:id` - Get pitch by ID
- `PUT /:id` - Update pitch
- `PUT /:id/status` - Update pitch status
- `DELETE /:id` - Delete pitch

### **Upload Routes** (`/api/upload`)
- `POST /` - Upload file (protected)
- `DELETE /:id` - Delete file (protected)

### **Search Routes** (`/api/search`)
- `GET /` - Global search (posts, users, jobs)
- `GET /users` - Search users

### **Comment Routes** (`/api/comments`)
- `PUT /:id` - Update comment (protected)
- `DELETE /:id` - Delete comment (protected)
- `POST /:id/like` - Like comment (protected)
- `POST /:id/reply` - Reply to comment (protected)

## 🔐 Authentication & Security

### **JWT Authentication**
- Access tokens expire in 7 days
- Refresh tokens expire in 30 days
- Tokens stored in localStorage on frontend
- Protected routes use `protect` middleware

### **Password Security**
- Passwords hashed with bcrypt (10 rounds)
- Password reset via email token
- Change password requires old password

### **Middleware Stack**
1. **helmet** - Security headers
2. **cors** - CORS with credentials
3. **morgan** - HTTP logging
4. **express.json** - JSON body parser
5. **express.urlencoded** - URL-encoded parser
6. **protect** - JWT verification (protected routes)
7. **errorHandler** - Global error handling

### **Input Validation**
- express-validator for request validation
- Sanitization of user inputs
- File upload restrictions (size, type)

## 🔄 Real-time Features (Socket.io)

Socket.io configured for:
- Real-time messaging
- Notification delivery
- Online status
- Typing indicators (ready to implement)

Connection handling:
```javascript
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId); // Join user's personal room
  });
});
```

## 📤 File Uploads

Uses Multer for file uploads:
- **Avatar images** - Profile pictures
- **Cover photos** - Profile banners
- **Documents** - Resumes, pitch decks
- **Post images** - Content images

Stored in `/uploads` directory

## 🧪 Database Seeding

The `seed.js` script creates:
- 3 test users (sarah, michael, emma)
- 3 sample posts with different types
- 5 job listings
- 4 startup stories
- 2 founder profiles
- 1 investor profile

Run with: `npm run seed`

Test credentials: All users have password `Password123!`

## 🐛 Error Handling

Centralized error handling with `errorHandler` middleware:
- Mongoose validation errors
- Duplicate key errors
- Cast errors (invalid ObjectId)
- JWT errors
- Custom application errors

Returns consistent JSON error responses:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details"
}
```

## 📈 Performance Optimizations

- Database indexes on frequently queried fields
- Pagination for large data sets
- Lean queries for read-only operations
- Population only when necessary
- Response compression ready

## 🔧 Configuration

### **Environment Variables**

Required:
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret

Optional:
- `JWT_EXPIRE` - Access token expiry (default: 7d)
- `JWT_REFRESH_EXPIRE` - Refresh token expiry (default: 30d)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)
- `NODE_ENV` - Environment (development/production)

### **Database Connection**

MongoDB Atlas recommended. Connection string format:
```
mongodb+srv://username:password@cluster.mongodb.net/database-name
```

Database name: `startup-obituaries`

## 🚨 Common Issues

**MongoDB Connection Failed**
- Check MONGODB_URI in .env
- Verify network access in MongoDB Atlas
- Ensure database user has correct permissions

**JWT Errors**
- Verify JWT_SECRET is set
- Check token format in Authorization header
- Ensure token hasn't expired

**File Upload Errors**
- Check uploads/ directory exists
- Verify file size limits
- Check file type restrictions

**CORS Errors**
- Verify FRONTEND_URL matches frontend origin
- Ensure credentials: true in CORS config

## 🔍 API Testing

Use these tools to test the API:
- **Postman** - Import collection from routes
- **Thunder Client** (VS Code extension)
- **cURL** - Command line testing

Example cURL:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah@example.com","password":"Password123!"}'

# Get posts (with token)
curl http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📝 API Response Format

Success response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error response:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error"
}
```

Paginated response:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10,
    "limit": 10
  }
}
```

## 🛠️ Development Tips

1. Use `npm run dev` for auto-restart with nodemon
2. Check MongoDB Atlas for data verification
3. Use Morgan logs to debug HTTP requests
4. Test protected routes with valid JWT tokens
5. Seed database fresh when testing: `npm run seed`

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

**Backend API Status:** ✅ Fully Operational
