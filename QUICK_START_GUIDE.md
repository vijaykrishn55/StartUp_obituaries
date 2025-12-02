# 🚀 Quick Start Guide - New Features

## Installation & Setup

### Prerequisites
- Node.js v16+ and npm
- MongoDB running locally or connection string
- Basic understanding of the platform

### 1. Backend Setup

No additional dependencies needed! All features use existing packages:
- `mongoose` - Database models
- `express` - Routes and controllers
- Socket.io is already configured for real-time features

The backend is **ready to go**. Just start the server:

```bash
cd backend
npm start
```

### 2. Frontend Setup

All UI components use existing shadcn/ui library. No new installations needed!

```bash
cd frontend
npm run dev
```

### 3. Database Collections

The following collections will be auto-created when first used:
- `failurereports` - Failure Heatmap data
- `assets` - Marketplace listings
- `warrooms` - War Room sessions

---

## 📋 Feature Access Guide

### Failure Heatmap
**URL**: `http://localhost:5173/failure-heatmap`

**What users can do:**
1. Browse failure reports with filters
2. View analytics and statistics
3. See geographic distribution
4. Read detailed failure stories
5. Add comments to reports
6. Mark reports as helpful
7. Submit their own failure reports

**Test Data Creation:**
```javascript
// Create a sample failure report via API
POST /api/failure-reports
{
  "startupName": "TechVenture Inc",
  "industry": "Technology",
  "location": {
    "city": "San Francisco",
    "state": "California",
    "country": "USA",
    "coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  },
  "fundingRaised": 500000,
  "teamSize": 8,
  "operationalMonths": 18,
  "failureDate": "2024-01-15",
  "primaryReason": "Ran out of cash",
  "detailedAnalysis": "We underestimated our burn rate and couldn't secure additional funding in time...",
  "lessonsLearned": ["Always have 12+ months runway", "Start fundraising earlier"],
  "anonymousPost": false
}
```

---

### Resurrection Marketplace
**URL**: `http://localhost:5173/marketplace`

**What users can do:**
1. Browse available assets
2. Search and filter by category/price
3. View detailed asset information
4. Express interest with offers
5. List their own assets for sale
6. Track asset performance
7. Mark assets as sold

**Sample Asset Listing:**
```javascript
POST /api/assets
{
  "title": "SaaS Starter Template - React/Node",
  "category": "Source Code",
  "description": "Full-stack SaaS template with authentication, payments, and dashboard. Built with React, Node.js, and Stripe integration.",
  "askingPrice": 5000,
  "originalValue": 50000,
  "condition": "Excellent",
  "location": {
    "city": "Austin",
    "state": "Texas",
    "country": "USA"
  },
  "shippingAvailable": false,
  "tags": ["saas", "react", "nodejs", "stripe"]
}
```

---

### Live Autopsy War Rooms
**URL**: `http://localhost:5173/war-rooms`

**What users can do:**
1. Browse active and upcoming war rooms
2. Join live sessions
3. Send messages and advice
4. Create action items
5. Share resources
6. Vote on polls
7. Add mentor notes (for mentors)
8. Request their own war room

**Sample War Room:**
```javascript
POST /api/war-rooms
{
  "title": "Critical: Running Out of Runway - Need Advice",
  "startupName": "MyStartup",
  "situation": "Running out of cash",
  "description": "We have 2 months of runway left. Revenue is growing but not fast enough. Looking for advice on fundraising vs. cutting costs vs. pivoting.",
  "urgencyLevel": "Critical",
  "scheduledTime": "2024-12-01T15:00:00Z",
  "maxParticipants": 50,
  "isPrivate": false
}
```

---

## 🎨 UI Components Used

All features use the existing shadcn/ui components:
- ✅ Button
- ✅ Card
- ✅ Input
- ✅ Select
- ✅ Badge
- ✅ Dialog
- ✅ Textarea
- ✅ Avatar
- ✅ DropdownMenu

No additional UI setup required!

---

## 🔌 API Integration

All API endpoints are already integrated in `frontend/src/lib/api.ts`:

```typescript
// Failure Reports
api.getFailureReports(params)
api.getFailureReportById(id)
api.createFailureReport(data)
api.getHeatmapData(params)
api.getFailureAnalytics()

// Assets
api.getAssets(params)
api.getAssetById(id)
api.createAsset(data)
api.expressInterest(id, message, offer)
api.getMarketplaceStats()

// War Rooms
api.getWarRooms(params)
api.getWarRoomById(id)
api.createWarRoom(data)
api.joinWarRoom(id, role)
api.sendWarRoomMessage(id, text, type)
```

---

## 🧪 Testing the Features

### Manual Testing Flow:

#### 1. Failure Heatmap
```
1. Navigate to /failure-heatmap
2. View analytics dashboard
3. Apply filters (industry, reason)
4. Click on a failure report
5. Add a comment
6. Mark as helpful
```

#### 2. Marketplace
```
1. Navigate to /marketplace
2. Browse available assets
3. Search for specific items
4. Click "View Details" on an asset
5. Express interest with a message
6. (Optional) List your own asset
```

#### 3. War Rooms
```
1. Navigate to /war-rooms
2. View live rooms
3. Click "Join Live Session"
4. Send a message in the chat
5. Add an action item
6. Vote on a poll
```

---

## 🎯 Navigation Shortcuts

### Desktop Users:
- Click "More" in the top navigation
- Select from dropdown:
  - 🟠 Failure Heatmap
  - 🟢 Marketplace
  - 🔴 War Rooms

### Mobile Users:
- Open hamburger menu
- Scroll to "More Features" section
- Tap desired feature

### From Homepage:
- Scroll to feature showcase
- Click any of the three large feature cards

---

## 🚨 Important Notes

### Real-time Features (War Rooms)
War Rooms are designed for real-time communication. The Socket.io connection is already configured in `server.js`:

```javascript
// Socket.io is ready at:
const io = socketio(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});
```

### Authentication
Most features require authentication:
- Creating reports: ✅ Required
- Viewing reports: ❌ Public
- Creating assets: ✅ Required
- Viewing marketplace: ❌ Public
- Creating war rooms: ✅ Required
- Joining war rooms: ✅ Required

### Data Privacy
- Failure reports can be posted anonymously
- War rooms can be set to private
- All data respects user privacy settings

---

## 📊 Expected Behavior

### On First Load:
- All features will show empty states
- Helpful CTAs to create first content
- Analytics will show zeros

### After Adding Data:
- Failure Heatmap shows geographic distribution
- Marketplace displays listings
- War Rooms show active sessions

---

## 🐛 Troubleshooting

### Issue: "Cannot find module" errors
**Solution**: Make sure all dependencies are installed:
```bash
cd backend && npm install
cd frontend && npm install
```

### Issue: Features not showing in navigation
**Solution**: Clear browser cache and refresh

### Issue: API calls failing
**Solution**: 
1. Check MongoDB is running
2. Verify backend is running on port 5000
3. Check CORS settings in server.js

### Issue: Real-time not working in War Rooms
**Solution**: 
1. Verify Socket.io is configured
2. Check browser console for connection errors
3. Ensure ports are not blocked

---

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ All three features load without errors
- ✅ Navigation links work correctly
- ✅ Can create and view content
- ✅ Filters and search work
- ✅ Analytics display correctly
- ✅ Real-time features respond instantly

---

## 📚 Next Steps

1. **Add Test Data**: Create sample content to showcase features
2. **Customize Styling**: Adjust colors and themes to match brand
3. **Add Notifications**: Integrate with notification system
4. **Enable Social Sharing**: Add share buttons
5. **Analytics Integration**: Track feature usage

---

## 💬 Support

If you encounter issues:
1. Check this guide first
2. Review browser console for errors
3. Check backend logs
4. Verify all files were created correctly

**All features are production-ready and fully implemented!** 🚀
