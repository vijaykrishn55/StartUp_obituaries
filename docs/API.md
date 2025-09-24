# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user profile

### Users
- `GET /users` - Get users list (for discovery)
- `GET /users/:userId` - Get user profile
- `PUT /users/profile` - Update own profile

### Startups
- `GET /startups/featured` - Featured startups
- `GET /startups` - Search/filter startups
- `POST /startups` - Create startup obituary
- `GET /startups/:id` - Get startup details
- `PUT /startups/:id` - Update startup
- `DELETE /startups/:id` - Delete startup

### Reactions
- `GET /startups/:startupId/reactions` - Get reactions (upvotes/downvotes)
- `POST /startups/:startupId/reaction` - Add reaction (upvote/downvote)
- `DELETE /startups/:startupId/reaction` - Remove reaction

### Comments
- `GET /startups/:startupId/comments` - Get comments
- `POST /startups/:startupId/comments` - Create comment
- `PUT /comments/:id` - Edit comment
- `DELETE /comments/:id` - Delete comment

### Connections
- `GET /api/connections` - Get connections
- `GET /api/connections/requests` - Get pending requests
- `POST /api/connections/connect/:userId` - Send connection request
- `PUT /api/connections/:requestId` - Accept/reject request

### Messages
- `GET /messages/:conversationId` - Get message history for a conversation
- `PUT /messages/:messageId` - Edit a message
- `DELETE /messages/:messageId` - Delete a message
- `POST /messages/:messageId/reactions` - Add reaction to message
- `DELETE /messages/:messageId/reactions/:reaction` - Remove reaction

### Conversations
- `GET /conversations` - Get all conversations for authenticated user
- `GET /conversations/:id` - Get specific conversation details
- `POST /conversations` - Create or get conversation for a connection

### Real-time Messaging (Socket.IO)
- `send_message` - Send message in real-time
- `edit_message` - Edit message in real-time
- `delete_message` - Delete message in real-time
- `join_conversation` - Join a conversation room
- `typing_start/typing_stop` - Typing indicators
- `mark_messages_read` - Mark messages as read
- `add_reaction` - Add emoji reaction to message

### Leaderboards
- `GET /leaderboards/most-downvoted` - Most downvoted startups
- `GET /leaderboards/most-upvoted` - Most upvoted startups
- `GET /leaderboards/most-tragic` - Most tragic failures
- `GET /leaderboards/deserved-pivot` - Startups that should have pivoted
- `GET /leaderboards/brilliant-mistakes` - Failures that taught lessons
- `GET /leaderboards/most-funded-failures` - Biggest money burns

### Team Management
- `GET /startups/:startupId/team` - Get team members
- `POST /startups/:startupId/team` - Add yourself to team
- `POST /startups/:startupId/join-requests` - Request to join team
- `GET /startups/:startupId/join-requests` - Get pending join requests (creator only)
- `PUT /join-requests/:requestId` - Approve/reject join request
- `DELETE /team/:memberId` - Remove team member
