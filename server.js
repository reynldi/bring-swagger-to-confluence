const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Atlassian Connect lifecycle endpoints
app.post('/installed', (req, res) => {
  // Log installation for monitoring (keep this for production monitoring)
  console.log('App installation completed for:', req.body?.baseUrl || 'unknown');
  res.status(200).json({ status: 'installed', message: 'App installed successfully' });
});

app.post('/uninstalled', (req, res) => {
  // Log uninstallation for monitoring (keep this for production monitoring)
  console.log('App uninstallation completed for:', req.body?.baseUrl || 'unknown');
  res.status(200).json({ status: 'uninstalled', message: 'App uninstalled successfully' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Swagger Documentation for Confluence server running on port ${port}`);
});