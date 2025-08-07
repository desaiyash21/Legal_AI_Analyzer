const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

//  Ensure 'uploads' folder exists before any middleware/routes try to access it
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('📁 uploads folder created at runtime');
}

//  Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

//  Serve uploaded files (very important for public access after deployment)
app.use('/uploads', express.static(uploadsPath));

//  Routes
const uploadRoutes = require('./routes/upload');
const documentRoutes = require('./routes/documents');
const analysisRoutes = require('./routes/analysis');

app.use('/api/upload', uploadRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analysis', analysisRoutes);

//  Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Legal Document Analyzer API is running' });
});

//  Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

//  Serve frontend in production
const buildPath = path.join(__dirname, '../client/build');
app.use(express.static(buildPath));

//  React SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

//  404 Fallback for unmatched API routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

//  Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 API available at http://localhost:${PORT}/api`);
});
