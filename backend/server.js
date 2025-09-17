// Complete Express server setup
const express = require('express');
const cors = require('cors');
const app = express();

// Essential middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Import the AI proxy routes
const aiProxyRoutes = require('./routes/aiProxyRoutes');

// Use the AI proxy routes
app.use('/api/ai-proxy', aiProxyRoutes);

// Your existing routes...
const aiCourseRoutes = require('./routes/aiCourseRoutes');
app.use('/api/ai', aiCourseRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI API: http://localhost:${PORT}/api/ai`);
});

module.exports = app;
