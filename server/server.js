
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const theatreRoutes = require('./routes/theatres');
const app = express();


app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://i-movies-nine-ruby.vercel.app'
  ]
}));


app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'iMovies API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/theatres', theatreRoutes);

// Keep error handling after all routes.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Server error.'
  });
});

const PORT = process.env.PORT || 8000;

async function start() {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    throw new Error('Set MONGO_URI and JWT_SECRET in server/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  app.listen(PORT, () => {
    console.log(`iMovies API running at http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});
