# Frontend - Startup Network Client

React/TypeScript frontend for the Startup Network Platform. A modern, responsive social networking interface for startup founders, investors, and job seekers.

## 🎨 Architecture

This frontend follows component-based architecture with:
- **Pages** - Route-level components
- **Components** - Reusable UI components
- **Contexts** - Global state management
- **Hooks** - Custom React hooks
- **Lib** - Utilities and API client

## 📁 Project Structure

```
frontend/
├── public/             # Static assets
│   └── robots.txt
├── src/
│   ├── assets/        # Images, fonts, etc.
│   ├── components/    # React components
│   │   ├── ui/       # shadcn/ui base components
│   │   ├── dashboard/ # Dashboard-specific components
│   │   │   ├── DashboardFeed.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── JobsTab.tsx
│   │   │   ├── Messages.tsx
│   │   │   ├── MyNetwork.tsx
│   │   │   ├── MyPosts.tsx
│   │   │   ├── ProfileSidebar.tsx
│   │   │   ├── RichPostEditor.tsx
│   │   │   ├── SuggestedConnections.tsx
│   │   │   └── UnifiedFeed.tsx
│   │   ├── investor-dashboard/ # Investor features
│   │   │   ├── DealFlow.tsx
│   │   │   ├── InvestorFeed.tsx
│   │   │   ├── InvestorMessages.tsx
│   │   │   ├── InvestorProfileSidebar.tsx
│   │   │   ├── MarketInsights.tsx
│   │   │   └── Portfolio.tsx
│   │   ├── posting/   # Content creation
│   │   │   └── ArticleEditor.tsx
│   │   ├── ApplyJobDialog.tsx
│   │   ├── EditProfileDialog.tsx
│   │   ├── FounderCard.tsx
│   │   ├── Hero.tsx
│   │   ├── JobCard.tsx
│   │   ├── JoinNowDialog.tsx
│   │   ├── Navigation.tsx
│   │   ├── NavLink.tsx
│   │   ├── NotificationDropdown.tsx
│   │   ├── PostJobDialog.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── SignInDialog.tsx
│   │   ├── StoryCard.tsx
│   │   └── SubmitPitchDialog.tsx
│   ├── contexts/      # React Context providers
│   │   └── AuthContext.tsx
│   ├── hooks/         # Custom hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/           # Utilities
│   │   ├── api.ts    # API client
│   │   ├── data.ts   # Type definitions
│   │   └── utils.ts  # Helper functions
│   ├── pages/         # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── Founders.tsx
│   │   ├── Index.tsx
│   │   ├── Investors.tsx
│   │   ├── JobDetail.tsx
│   │   ├── Jobs.tsx
│   │   ├── JobsBoard.tsx
│   │   ├── NotFound.tsx
│   │   ├── PostDetail.tsx
│   │   ├── ProfilePage.tsx
│   │   └── Stories.tsx
│   ├── App.tsx        # Root component
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles
├── .env               # Environment variables
├── .env.example       # Example env file
├── components.json    # shadcn/ui config
├── index.html         # HTML template
├── package.json       # Dependencies
├── postcss.config.js  # PostCSS config
├── tailwind.config.ts # Tailwind config
├── tsconfig.json      # TypeScript config
├── vite.config.ts     # Vite config
└── README.md          # This file
```

## 🔧 Tech Stack

- **React** 18.3.1 - UI library
- **TypeScript** 5.6.2 - Type safety
- **Vite** 5.4.19 - Build tool
- **React Router** 6.28.0 - Routing
- **Tailwind CSS** 3.4.16 - Styling
- **shadcn/ui** - Component library (Radix UI + Tailwind)
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **date-fns** - Date utilities
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## 🚀 Getting Started

### **Installation**

1. Navigate to frontend directory:
   ```bash
   cd frontend
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
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

App will run on `http://localhost:5173`

### **Available Scripts**

- `npm run dev` - Start development server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Features & Components

### **Authentication**
- **SignInDialog** - Login/register modal
- **ProtectedRoute** - Route protection wrapper
- **AuthContext** - Authentication state management

### **Navigation**
- **Navigation** - Main navigation bar
- **NavLink** - Active link styling
- **NotificationDropdown** - Bell icon with notification list

### **Dashboard Components**

#### **DashboardFeed**
- Create posts with rich editor
- Poll creation (2-10 options, optional multiple choice)
- Like, comment, bookmark posts
- Vote on polls with real-time results
- Comment threads
- Optimistic UI updates

#### **MyNetwork**
- View connections (with stats)
- Accept/reject connection requests
- Discover new connections
- Connection suggestions
- Search functionality
- Three tabs: Discover, Connections, Requests

#### **Messages**
- Two-panel interface (conversations + chat)
- Real-time messaging
- Conversation list with last message preview
- Unread message count
- Mark as read functionality
- Send messages with Enter key

#### **JobsTab**
- Browse jobs from API
- Filter by type (All, Full-time, Co-founder, Remote)
- Search by title, company, skills, location
- Job count badges
- Loading states

#### **ProfileSidebar**
- User avatar and name from AuthContext
- Connection count
- Profile views
- Post impressions
- Navigate to profile page

#### **MyPosts**
- Display user's posts
- Edit/delete functionality
- Post types: postmortem, funding, job, insight, question, pitch

### **Dialogs & Modals**

#### **EditProfileDialog**
- Two tabs: Basic Info, Social Links
- Update name, bio, company, location
- Social links (website, LinkedIn, Twitter, GitHub)
- Real API integration

#### **ApplyJobDialog**
- Full name, email, phone
- LinkedIn, portfolio links
- Cover letter
- Resume upload (ready)
- Real API submission

#### **PostJobDialog**
- Job title, company, location
- Job type, salary range
- Description, requirements
- Tags (comma-separated)
- Remote checkbox
- Real API submission

#### **SubmitPitchDialog**
- Company name, founder name, email
- Website, industry, stage
- Funding goal
- Elevator pitch
- Pitch deck URL
- Real API submission

### **Pages**

#### **Index (Landing)**
- Hero section
- Feature highlights
- CTA buttons
- Responsive design

#### **Dashboard**
- Main feed with posts
- Create post interface
- Sidebar with profile
- Suggested connections
- Job listings

#### **Investor Dashboard**
- Deal flow view
- Market insights
- Portfolio companies
- Investor-specific feed

#### **Jobs**
- Browse all jobs
- Filter and search
- Apply to jobs
- Job cards with details

#### **JobDetail**
- Full job description
- Requirements
- Company info
- Apply button
- Fetches from API

#### **PostDetail**
- Full post view
- Comments section
- Like, bookmark, share
- Poll voting
- Fetches from API with comments

#### **Stories**
- Browse startup stories
- Filter by category
- Story cards
- Fetches from API

#### **Founders**
- Browse founder profiles
- Search functionality
- Founder cards
- Fetches from API

#### **Investors**
- Browse investor profiles
- Search functionality
- Investment focus
- Fetches from API

#### **ProfilePage**
- User profile view
- Edit profile button
- Skills, experience, education
- Startup journeys/ventures
- Achievements
- Activity feed
- Fetches from API

### **UI Components (shadcn/ui)**

Pre-built, customizable components:
- **Accordion** - Collapsible content
- **Alert** - Notifications
- **Avatar** - User images
- **Badge** - Status indicators
- **Button** - Call-to-action
- **Card** - Container component
- **Checkbox** - Form input
- **Dialog** - Modals
- **Dropdown** - Menu options
- **Form** - Form components
- **Input** - Text input
- **Label** - Form labels
- **Select** - Dropdown selection
- **Separator** - Divider
- **Tabs** - Tab navigation
- **Textarea** - Multi-line input
- **Toast** - Notifications
- And 30+ more components

## 📡 API Integration

### **API Client (`lib/api.ts`)**

Centralized API client with 65+ endpoints:

```typescript
// Authentication
api.login(email, password)
api.register(data)
api.getProfile(userId?)
api.updateProfile(data)

// Posts
api.getPosts(params?)
api.getPostById(id)
api.createPost(data)
api.likePost(id)
api.bookmarkPost(id)
api.commentOnPost(id, content)
api.votePoll(postId, optionIndex)
api.getTrendingPosts(limit?)
api.getUserPosts(userId, params?)
api.getBookmarkedPosts(params?)

// Jobs
api.getJobs(params?)
api.getJobById(id)
api.createJob(data)
api.applyToJob(jobId, data)

// Connections
api.getConnections()
api.getSentConnectionRequests()
api.getReceivedConnectionRequests()
api.getConnectionSuggestions(limit?)
api.sendConnectionRequest(userId)
api.acceptConnectionRequest(requestId)
api.rejectConnectionRequest(requestId)
api.removeConnection(connectionId)

// Messages
api.getConversations()
api.getConversation(conversationId)
api.getMessages(conversationId, params?)
api.sendMessage(conversationId, content)
api.createConversation(participantIds)
api.markConversationAsRead(conversationId)

// Notifications
api.getNotifications(params?)
api.getUnreadNotifications()
api.markNotificationAsRead(id)
api.markAllNotificationsAsRead()
api.deleteNotification(id)

// Stories, Founders, Investors
api.getStories(params?)
api.getFounders(params?)
api.getInvestors(params?)

// Pitches
api.createPitch(data)
api.getPitches(params?)

// Upload
api.uploadFile(file, type)
```

### **API Configuration**

```typescript
// Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Auto-includes auth token from localStorage
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAuthToken()}`
});
```

### **Error Handling**

All API calls include error handling:
```typescript
try {
  const response = await api.getPosts();
  setPosts(response.data);
} catch (error) {
  console.error('Failed to fetch posts:', error);
  toast.error('Failed to load posts');
}
```

## 🎨 Styling

### **Tailwind CSS**

Utility-first CSS framework:
```tsx
<div className="flex items-center gap-4 p-6 rounded-lg bg-white shadow-sm">
  <Avatar className="h-12 w-12" />
  <div className="flex-1">
    <h3 className="font-semibold">User Name</h3>
    <p className="text-sm text-muted-foreground">Bio text</p>
  </div>
</div>
```

### **Theme Configuration**

Colors defined in `index.css`:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  --muted: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  /* ... */
}
```

Dark mode ready with `.dark` class variants.

## 🔐 Authentication Flow

1. User enters credentials in SignInDialog
2. Frontend calls `api.login(email, password)`
3. Backend returns JWT tokens (access + refresh)
4. Tokens stored in localStorage
5. AuthContext updates with user data
6. Protected routes check authentication
7. API client auto-includes token in headers
8. Token refresh handled automatically

### **AuthContext Usage**

```tsx
const { user, login, logout, updateUser } = useAuth();

// Check if logged in
if (!user) return <Navigate to="/" />;

// Use user data
<p>{user.name}</p>
<img src={user.avatar} />

// Login
await login(email, password);

// Logout
logout();

// Update user
updateUser({ name: 'New Name' });
```

### **Protected Routes**

```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## 🎯 State Management

### **Context API**

- **AuthContext** - User authentication state
  - `user` - Current user object
  - `login()` - Login function
  - `logout()` - Logout function
  - `updateUser()` - Update user data
  - `loading` - Loading state

### **Component State**

Local state with useState:
```tsx
const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

### **Form State**

React Hook Form for complex forms:
```tsx
const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: { ... }
});
```

## 🎨 Component Patterns

### **Data Fetching Pattern**

```tsx
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.getData();
      setData(response.data);
    } catch (error) {
      console.error('Error:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [dependency]);
```

### **Optimistic Updates**

```tsx
const handleLike = async (postId) => {
  // Optimistically update UI
  const updatedPosts = posts.map(post =>
    post._id === postId
      ? { ...post, likes: [...post.likes, user.id] }
      : post
  );
  setPosts(updatedPosts);

  try {
    await api.likePost(postId);
  } catch (error) {
    // Revert on error
    setPosts(originalPosts);
    toast.error('Failed to like post');
  }
};
```

### **Conditional Rendering**

```tsx
{loading ? (
  <LoadingSpinner />
) : error ? (
  <ErrorMessage error={error} />
) : data.length === 0 ? (
  <EmptyState />
) : (
  <DataList data={data} />
)}
```

## 📱 Responsive Design

Mobile-first approach with Tailwind breakpoints:
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+
- `xl:` - 1280px+
- `2xl:` - 1536px+

Example:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

## 🧪 Type Safety

### **TypeScript Interfaces**

Defined in `lib/data.ts`:
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  userType: 'founder' | 'investor' | 'job-seeker' | 'mentor' | 'other';
  // ...
}

interface Post {
  _id: string;
  author: User;
  type: 'postmortem' | 'funding' | 'job' | 'insight' | 'question' | 'pitch';
  title: string;
  content: string;
  likes: string[];
  poll?: Poll;
  // ...
}
```

### **API Response Types**

```typescript
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};
```

## 🚨 Error Handling

### **Toast Notifications**

```tsx
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

// Success
toast({
  title: "Success!",
  description: "Action completed successfully."
});

// Error
toast({
  title: "Error",
  description: "Something went wrong.",
  variant: "destructive"
});
```

### **Error Boundaries**

Production-ready error boundaries to catch React errors:
```tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

## 🎭 Loading States

Consistent loading UI:
```tsx
{loading && (
  <div className="text-center py-12">
    <p className="text-muted-foreground">Loading...</p>
  </div>
)}
```

Skeleton loaders available in shadcn/ui:
```tsx
<Skeleton className="h-12 w-12 rounded-full" />
<Skeleton className="h-4 w-[250px]" />
```

## 🔧 Configuration

### **Environment Variables**

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

### **Vite Config**

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### **Tailwind Config**

```typescript
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        // ...
      },
    },
  },
};
```

## 🚀 Build & Deploy

### **Development Build**
```bash
npm run dev
```

### **Production Build**
```bash
npm run build
```

Output in `dist/` directory.

### **Preview Production Build**
```bash
npm run preview
```

### **Deploy to Vercel/Netlify**

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables
5. Deploy!

### **Environment Variables for Production**

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## 🐛 Common Issues

**API calls failing**
- Check VITE_API_BASE_URL is correct
- Ensure backend is running
- Verify CORS settings on backend
- Check auth token in localStorage

**Build errors**
- Clear `node_modules` and reinstall
- Check TypeScript errors
- Verify all imports are correct
- Update dependencies if needed

**Styling issues**
- Clear browser cache
- Check Tailwind config
- Verify PostCSS is working
- Rebuild with `npm run build`

**Routing issues**
- Check React Router setup
- Verify route paths match
- Ensure basename is correct for deployment
- Check for redirect loops

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [React Router](https://reactrouter.com/)

## 🎯 Development Tips

1. Use TypeScript for type safety
2. Follow component composition patterns
3. Keep components small and focused
4. Use custom hooks for reusable logic
5. Implement loading and error states
6. Add optimistic updates for better UX
7. Use React DevTools for debugging
8. Test responsive design at all breakpoints

## 📊 Performance

- Code splitting with React.lazy()
- Image optimization ready
- Memoization with useMemo/useCallback
- Virtual scrolling for long lists (ready to implement)
- Lazy loading routes
- Build optimization with Vite

---

**Frontend Status:** ✅ Fully Functional with Real API Integration
