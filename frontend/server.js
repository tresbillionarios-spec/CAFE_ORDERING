import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle API routes (if any frontend-specific API routes are needed)
app.get('/api/health', (req, res) => {
  res.json({ status: 'Frontend server is running' });
});

// Handle all other routes by serving index.html (SPA routing)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    console.log(`Serving index.html for route: ${req.path}`);
    res.sendFile(indexPath);
  } else {
    console.error(`index.html not found at: ${indexPath}`);
    res.status(404).send('index.html not found. Please run npm run build first.');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal server error');
});

app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Frontend server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🔄 SPA routing enabled - all routes will serve index.html`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
});
