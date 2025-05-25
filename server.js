const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const prisma = require('./utils/prisma');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/api/test', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      message: 'Backend is working!',
      database: 'Connected to Supabase successfully!'
    });
  } catch (error) {
    res.json({ 
      message: 'Backend is working!',
      database: 'Database connection failed',
      error: error.message
    });
  }
});

// Routes
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});