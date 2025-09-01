const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Simple health check without database
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Simple startups endpoint without database
app.get('/api/startups', (req, res) => {
  res.json({ 
    startups: [
      {
        id: 1,
        name: "Test Startup",
        description: "A test startup for debugging",
        upvote_count: 0,
        downvote_count: 0,
        pivot_count: 0,
        comment_count: 0
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Test API: http://localhost:${PORT}/api/startups`);
});
