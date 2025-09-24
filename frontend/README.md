# Startup Obituaries Frontend

A React-based frontend for the Startup Obituaries platform - where failure becomes wisdom. This application allows entrepreneurs to share their startup failure stories, learn from others, and build meaningful connections in the startup community.

![Startup Obituaries Platform](https://img.shields.io/badge/Platform-Startup%20Obituaries-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB)
![Vite](https://img.shields.io/badge/Vite-4.4.5-646CFF)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.3.3-38B2AC)

## Features

### 🏠 Core Features
- **Landing Page**: Beautiful hero section with statistics and feature highlights
- **Authentication**: Secure login/register with JWT tokens
- **Dashboard**: Role-specific dashboards for founders, investors, students, and recruiters
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
- **Role-Based Insights**: Tailored analytics for each user role

### 🤖 AI-Powered Features
- **Obituary Templates**: AI-generated structure for startup stories
- **Content Enhancement**: AI suggestions to improve obituary quality
- **Investment Analysis**: Risk pattern recognition for investors
- **Talent Matching**: AI-driven candidate matching for recruiters
- **Learning Resources**: AI-generated study guides for students

## Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state
- **Routing**: React Router v6
- **Forms**: React Hook Form with validation
- **Animations**: Framer Motion
- **Icons**: Heroicons & Lucide React
- **HTTP Client**: Axios with interceptors
- **UI Components**: Headless UI & Radix UI for accessible components
- **Charts**: Chart.js and Recharts for data visualization
- **Real-time**: Socket.io for messaging and notifications
- **Date Handling**: date-fns for date manipulation
- **Class Utilities**: clsx and tailwind-merge for dynamic class generation

## Role-Based Dashboards

The application features tailored dashboards for different user roles:

### 👨‍💼 Founder Dashboard
- Startup performance metrics and analytics
- Content creation and management tools
- Team management interface
- Engagement tracking and analytics

### 💰 Investor Dashboard
- Investment portfolio and risk analysis
- Founder talent discovery
- Market trend insights
- Due diligence tools

### 🧑‍🎓 Student Dashboard
- Learning progress tracking
- Story bookmarking and note-taking
- Industry and failure pattern exploration
- Educational resources

### 🔍 Recruiter Dashboard
- Talent pool exploration
- Candidate management
- Job posting and matching
- Skill and resilience assessment

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
│   ├── dashboards/     # Role-specific dashboards
│   │   ├── DashboardRouter.jsx    # Routes to appropriate dashboard
│   │   ├── FounderDashboard.jsx   # Founder-specific dashboard
│   │   ├── InvestorDashboard.jsx  # Investor-specific dashboard
│   │   ├── RecruiterDashboard.jsx # Recruiter-specific dashboard
│   │   └── StudentDashboard.jsx   # Student-specific dashboard
│   ├── ui/             # UI component library
│   │   ├── Avatar.jsx  # User avatars
│   │   ├── Badge.jsx   # Status badges
│   │   ├── Card.jsx    # Card components with animations
│   │   └── Progress.jsx # Progress indicators
│   ├── Layout.jsx      # Main layout wrapper
│   ├── Navbar.jsx      # Navigation header
│   ├── Sidebar.jsx     # Side navigation
│   ├── StartupCard.jsx # Startup story card
│   ├── ReactionPanel.jsx # Emoji reactions system
│   ├── CommentsSection.jsx # Comments and discussions
│   ├── ThreadedComments.jsx # Nested comment threads
│   ├── TeamSection.jsx # Team management
│   ├── MessageChat.jsx # Real-time messaging UI
│   └── LoadingSpinner.jsx # Loading indicator
├── pages/              # Page components
│   ├── LandingPage.jsx # Homepage for visitors
│   ├── LoginPage.jsx   # User authentication
│   ├── RegisterPage.jsx # User registration
│   ├── DashboardPage.jsx # Dashboard container
│   ├── CreateStartupPage.jsx # Obituary creation
│   ├── StartupDetailPage.jsx # Startup story details
│   ├── ProfilePage.jsx # User profiles
│   ├── LeaderboardsPage.jsx # Rankings and trends
│   ├── ConnectionsPage.jsx # Network connections
│   ├── MessagesPage.jsx # Messaging system
│   ├── MyStartupsPage.jsx # User's created startups
│   ├── AdminPage.jsx   # Admin controls
│   └── AnalyticsPage.jsx # In-depth analytics
├── stores/             # Zustand stores
│   └── authStore.js    # Authentication state
├── hooks/              # Custom React hooks
│   ├── useApi.js       # API interaction hook
│   └── useSocket.js    # WebSocket connection hook
├── lib/                # Utilities and API
│   ├── api.js          # API client and endpoints
│   ├── cn.js           # Class name utilities
│   ├── constants.js    # Application constants
│   └── utils.js        # Helper functions
├── utils/              # Utility functions
│   └── errorHandler.js # Error handling utilities
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## API Integration

The frontend connects to the backend API with the following endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Startups
- `GET /api/startups` - List startups with filters
- `POST /api/startups` - Create startup obituary
- `GET /api/startups/:id` - Get startup details
- `PUT /api/startups/:id` - Update startup
- `DELETE /api/startups/:id` - Delete startup
- `GET /api/startups/my-startups` - Get user's created startups

### Community Features
- `GET/POST/DELETE /api/startups/:id/reactions` - Manage reactions
- `GET/POST/PUT/DELETE /api/comments` - Manage threaded comments
- `GET/POST /api/startups/:id/team` - Team management

### Networking
- `GET/POST /api/connections` - Connection management
- `GET/POST /api/conversations` - Message conversations
- `GET/POST /api/messages` - Individual messages

### Analytics & Discovery
- `GET /api/leaderboards` - Ranking and statistics
- `GET /api/analytics` - Detailed analytics and insights
- `GET /api/stats` - User and platform statistics

### AI Integration
- `POST /api/ai/generate-obituary` - Generate obituary template
- `POST /api/ai/enhance-content` - Improve content quality
- `POST /api/ai/analyze-risk` - Investment risk analysis
- `POST /api/ai/match-candidates` - Talent matching for recruiters
- `POST /api/ai/create-study-guide` - Educational resources

## Design System

### Colors
- **Primary**: Blue (#0ea5e9) for main actions and branding
- **Success**: Green (#10b981) for positive actions and completion
- **Error**: Red (#ef4444) for destructive actions and alerts
- **Warning**: Yellow (#f59e0b) for caution and notifications
- **Gray Scale**: Comprehensive gray palette for text and backgrounds
- **Role-Specific**: Color accents for different user roles (founder, investor, etc.)

### Typography
- **Primary Font**: Inter for clean, modern text
- **Monospace**: JetBrains Mono for code and data
- **Heading Scale**: Consistent sizing from h1 to h6
- **Body Text**: Optimized for readability with proper line height

### Components
- **Buttons**: Primary, secondary, outline, and ghost variants
- **Cards**: Animated cards with hover effects and consistent padding
- **Forms**: Accessible form controls with validation states
- **Data Display**: Charts, tables, and statistics with consistent styling
- **Navigation**: Breadcrumbs, tabs, and sidebar navigation
- **Feedback**: Alerts, toasts, and progress indicators
- **Animations**: Subtle motion with Framer Motion for enhanced UX

## Key Features Implementation

### Authentication Flow
- JWT token storage in localStorage with secure handling
- Automatic token refresh and validation via interceptors
- Protected routes with role-based access control
- User state management with Zustand store
- Password reset and account recovery flow

### Role-Based Dashboard System
- Dynamic dashboard routing based on user role
- Custom dashboard components for each user type
- Specialized analytics and metrics by role
- AI-powered insights tailored to each role
- Consistent design system across all dashboards

### Startup Creation and Management
- Multi-step wizard with progress indicator
- Form validation with React Hook Form
- Draft saving capability with auto-save
- Rich text input for detailed stories
- AI-assisted content creation and enhancement
- File uploads for startup logos and documentation

### Community Engagement
- Real-time reaction updates with socket.io
- Threaded comment system with nested replies
- Team join request workflow and management
- Connection and messaging system with real-time notifications
- Leaderboards and trending content

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Adaptive layouts for all screen sizes
- Touch-friendly interactions and gestures
- Progressive enhancement for accessibility
- Print-friendly styles for case studies and reports

## Environment Configuration

Create a `.env` file for environment variables:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_AI_FEATURES_ENABLED=true
VITE_DEFAULT_DASHBOARD=student
```

## AI Feature Implementation

The application integrates AI capabilities through the backend API:

### Obituary Generation
- AI-powered templates based on startup type
- Content suggestions and enhancements
- Automatic lesson extraction from failure details
- Language improvement for clarity and impact

### Investment Analysis
- Pattern recognition from historical failure data
- Risk factor identification for potential investments
- Industry trend insights and predictions
- Founder assessment and team dynamics analysis

### Talent Matching
- Skill extraction and categorization
- Candidate resilience assessment from failure stories
- Team fit prediction and compatibility analysis
- Learning capacity evaluation based on past experiences

### Learning Enhancement
- Personalized study guides from failure stories
- Complex concept explanations tailored to students
- Question answering for deeper understanding
- Learning path recommendations based on interests

## Development Guidelines

### Code Style
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices
- Use TypeScript-style prop validation with JSDoc comments
- Maintain consistent file and folder structure

### Performance
- Lazy loading for route components
- Image optimization with responsive loading
- Bundle size monitoring and code splitting
- Efficient re-rendering patterns with memoization
- Virtualization for long lists

### Accessibility
- ARIA labels and roles for all interactive elements
- Keyboard navigation support with visible focus states
- Screen reader compatibility with semantic HTML
- Color contrast compliance (WCAG 2.1 AA standard)
- Reduced motion options for animations

## Running the Application

### Development Mode
```bash
# Start the development server
npm run dev

# The application will be available at http://localhost:5173
```

### Building for Production
```bash
# Create optimized production build
npm run build

# Preview the production build locally
npm run preview
```

## Deployment

### Build Optimization
The application uses Vite's built-in optimization features:
- Code splitting for optimal chunk sizes
- CSS minification and extraction
- Tree shaking to eliminate unused code
- Efficient asset processing

### Static Hosting
The built application can be deployed to:
- Vercel (recommended for CI/CD integration)
- Netlify (great for PR previews)
- AWS S3 + CloudFront (for enterprise scaling)
- GitHub Pages (for simple hosting)

### Environment Setup
Ensure the backend API is accessible from your deployment environment and update the API base URL accordingly in environment variables.

## Dashboard System Architecture

The application implements a role-based dashboard system:

1. **DashboardRouter Component**
   - Detects user role from authentication store
   - Routes to appropriate dashboard component
   - Handles fallback logic for missing roles

2. **Role-Specific Dashboards**
   - FounderDashboard: For startup creators
   - InvestorDashboard: For investment professionals
   - StudentDashboard: For educational users
   - RecruiterDashboard: For talent acquisition

3. **Shared Dashboard Components**
   - Analytics charts and visualizations
   - Activity feeds and notifications
   - Role-appropriate action buttons

## Contributing

1. Follow the existing code style and component patterns
2. Add proper error handling and loading states for all async operations
3. Include responsive design considerations for all screen sizes
4. Maintain accessibility standards for all new components
5. Test across different browsers and devices
6. Document any new features or changes in component comments
7. Keep AI integrations optional with graceful fallbacks

## License

MIT License - see LICENSE file for details.
