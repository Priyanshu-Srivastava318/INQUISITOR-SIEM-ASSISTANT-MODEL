const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const connectElasticsearch = require('./config/elasticsearch');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Connect to Elasticsearch
connectElasticsearch();

const app = express();

// CORS Configuration - YE FIX KIYA HAI
app.use(cors({
  origin: [
    'https://inquisitor-siem.netlify.app',  // Tera production frontend
    'http://localhost:3000',                 // Local testing ke liye
    'http://localhost:5173'                  // Vite ke liye agar use karta hai
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'INQUISITOR Backend running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'INQUISITOR SIEM API' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║     🚀 INQUISITOR Backend running on port ${PORT}    ║
║                                                ║
║     📍 Health check: http://localhost:${PORT}/health   ║
║                                                ║
╚════════════════════════════════════════════════╝
  `)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});