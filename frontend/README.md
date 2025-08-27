# Startup Obituaries Frontend

A React-based frontend for the Startup Obituaries platform - where failure becomes wisdom. This application allows entrepreneurs to share their startup failure stories, learn from others, and build meaningful connections in the startup community.

## Features

### 🏠 Core Features
- **Landing Page**: Beautiful hero section with statistics and feature highlights
- **Authentication**: Secure login/register with JWT tokens
- **Dashboard**: Feed of startup stories with filtering and search
- **Create Stories**: Multi-step wizard for sharing startup obituaries
- **Startup Details**: Comprehensive view with reactions, comments, and team info

### 👥 Community Features
- **Reactions**: 💡 Brilliant Mistake, 🪦 RIP, 🔁 Deserved Pivot
- **Comments**: Threaded commenting system
- **Team Management**: Join requests and team member management
- **Connections**: LinkedIn-style networking
- **Messaging**: Real-time chat between connections

### 📊 Analytics & Discovery
- **Leaderboards**: Most tragic, deserved pivot, brilliant mistakes, most funded failures
- **User Profiles**: Comprehensive profiles with startup history
- **Search & Filters**: Advanced filtering by industry, failure reason, etc.

## Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state
- **Routing**: React Router v6
- **Forms**: React Hook Form with validation
- **Animations**: Framer Motion
- **Icons**: Heroicons & Lucide React
- **HTTP Client**: Axios with interceptors
- **UI Components**: Headless UI for accessibility

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Backend API running on `http://localhost:3000`

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Start development server**:
```bash
npm run dev
```

3. **Build for production**:
```bash
npm run build
```

4. **Preview production build**:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout wrapper
│   ├── Navbar.jsx      # Navigation header
│   ├── Sidebar.jsx     # Side navigation
│   ├── StartupCard.jsx # Startup story card
│   ├── ReactionPanel.jsx
│   ├── CommentsSection.jsx
│   ├── TeamSection.jsx
│   └── LoadingSpinner.jsx
├── pages/              # Page components
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── CreateStartupPage.jsx
│   ├── StartupDetailPage.jsx
│   ├── ProfilePage.jsx
│   ├── LeaderboardsPage.jsx
│   ├── ConnectionsPage.jsx
│   ├── MessagesPage.jsx
│   └── MyStartupsPage.jsx
├── stores/             # Zustand stores
│   └── authStore.js    # Authentication state
├── lib/                # Utilities and API
│   └── api.js          # API client and endpoints
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## API Integration

The frontend connects to the backend API with the following endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Startups
- `GET /api/startups` - List startups with filters
- `POST /api/startups` - Create startup obituary
- `GET /api/startups/:id` - Get startup details
- `PUT /api/startups/:id` - Update startup
- `DELETE /api/startups/:id` - Delete startup

### Community Features
- `GET/POST/DELETE /api/startups/:id/reactions` - Reactions
- `GET/POST/PUT/DELETE /api/startups/:id/comments` - Comments
- `GET/POST /api/startups/:id/join-requests` - Team requests

### Networking
- `GET/POST /api/connections` - Connection management
- `GET/POST /api/messages` - Messaging system

## Design System

### Colors
- **Primary**: Blue (#0ea5e9) for main actions and branding
- **Success**: Green (#10b981) for positive actions
- **Error**: Red (#ef4444) for destructive actions
- **Warning**: Yellow (#f59e0b) for caution
- **Gray Scale**: Comprehensive gray palette for text and backgrounds

### Typography
- **Primary Font**: Inter for clean, modern text
- **Monospace**: JetBrains Mono for code and data

### Components
- **Buttons**: Primary, secondary, outline variants
- **Cards**: Elevated cards with hover effects
- **Forms**: Consistent input styling with validation
- **Animations**: Subtle motion with Framer Motion

## Key Features Implementation

### Authentication Flow
- JWT token storage in localStorage
- Automatic token refresh and validation
- Protected routes with redirect logic
- User state management with Zustand

### Startup Creation
- Multi-step wizard with progress indicator
- Form validation with React Hook Form
- Draft saving capability
- Rich text input for detailed stories

### Community Engagement
- Real-time reaction updates
- Threaded comment system
- Team join request workflow
- Connection and messaging system

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Adaptive layouts for all screen sizes
- Touch-friendly interactions
- Progressive enhancement

## Environment Configuration

Create a `.env` file for environment variables:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Development Guidelines

### Code Style
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices
- Use TypeScript-style prop validation

### Performance
- Lazy loading for route components
- Image optimization
- Bundle size monitoring
- Efficient re-rendering patterns

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

## Deployment

### Build Optimization
```bash
npm run build
```

### Static Hosting
The built application can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Environment Setup
Ensure the backend API is accessible from your deployment environment and update the API base URL accordingly.

## Contributing

1. Follow the existing code style and patterns
2. Add proper error handling and loading states
3. Include responsive design considerations
4. Test across different browsers and devices
5. Document any new features or changes

## License

MIT License - see LICENSE file for details.
