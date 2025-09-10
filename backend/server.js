// Add AI Proxy Routes to your main server file
const express = require('express');
const app = express();

// Import the AI proxy routes
const aiProxyRoutes = require('./routes/aiProxyRoutes');

// Use the AI proxy routes
app.use('/api/ai-proxy', aiProxyRoutes);

// Your existing routes...
const aiCourseRoutes = require('./routes/aiCourseRoutes');
app.use('/api/ai', aiCourseRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
