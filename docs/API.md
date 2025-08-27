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
- `GET /startups/:id/reactions` - Get reactions
- `POST /startups/:id/reaction` - Add reaction
- `DELETE /startups/:id/reaction` - Remove reaction

### Comments
- `GET /startups/:id/comments` - Get comments
- `POST /startups/:id/comments` - Create comment
- `PUT /comments/:id` - Edit comment
- `DELETE /comments/:id` - Delete comment

### Connections
- `GET /connections` - Get connections
- `GET /connections/requests` - Get pending requests
- `POST /connections/connect/:userId` - Send connection request
- `PUT /connections/:requestId` - Accept/reject request

### Messages
- `GET /messages/:connectionId` - Get messages
- `POST /messages` - Send message

### Leaderboards
- `GET /leaderboards/most-tragic`
- `GET /leaderboards/deserved-pivot`
- `GET /leaderboards/brilliant-mistakes`
- `GET /leaderboards/most-funded-failures`
