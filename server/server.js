const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Load env vars
dotenv.config();

const app = express();

// CORS Configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://inquisitor-siem.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173'
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

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Database connection established successfully');
    console.log(`📍 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Connect to Elasticsearch (Optional)
const connectElasticsearch = async () => {
  try {
    console.log('⚠️  Elasticsearch not connected - fallback enabled');
  } catch (error) {
    console.log('⚠️  Elasticsearch connection failed - fallback enabled');
  }
};

// Initialize connections
connectDB();
connectElasticsearch();

// Mount routers
try {
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/logs', require('./routes/logRoutes'));
  app.use('/api/alerts', require('./routes/alertRoutes'));
  app.use('/api/dashboard', require('./routes/dashboardRoutes'));
} catch (error) {
  console.log('⚠️  Some routes not found, using available routes only');
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'INQUISITOR Backend running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'INQUISITOR SIEM API',
    version: '1.0.0',
    status: 'running'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 INQUISITOR Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});