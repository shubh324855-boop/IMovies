
const router = require('express').Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');

router.use(auth, admin);

// Dashboard statistics
router.get('/stats', async (req, res, next) => {
  try {
    const [totalMovies, totalTheatres, totalBookings, revenue] =
      await Promise.all([
        Movie.countDocuments(),
        Theatre.countDocuments(),
        Booking.countDocuments({ status: 'confirmed' }),
        Booking.aggregate([
          {
            $match: {
              status: 'confirmed',
              paymentStatus: 'demo-paid'
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalAmount' }
            }
          }
        ])
      ]);

    res.json({
      totalMovies,
      totalTheatres,
      totalBookings,
      demoRevenue: revenue[0]?.total || 0
    });
  } catch (error) {
    next(error);
  }
});

// View all bookings
router.get('/bookings', async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate({
        path: 'show',
        populate: { path: 'movie', select: 'title posterUrl' }
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

// Add a movie
router.post('/movies', async (req, res, next) => {
  try {
    const {
      title, description, genre, language,
      durationMins, rating, posterUrl, releaseDate
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Movie title is required.' });
    }

    const movie = await Movie.create({
      title: title.trim(),
      description,
      genre,
      language,
      durationMins,
      rating,
      posterUrl,
      releaseDate
    });

    res.status(201).json(movie);
  } catch (error) {
    next(error);
  }
});

// Edit a movie
router.patch('/movies/:id', async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    res.json(movie);
  } catch (error) {
    next(error);
  }
});

// Delete a movie only when it has no shows or bookings
router.delete('/movies/:id', async (req, res, next) => {
  try {
    const shows = await Show.find({ movie: req.params.id }).select('_id');
    const showIds = shows.map(show => show._id);
    const hasBookings = await Booking.exists({ show: { $in: showIds } });

    if (hasBookings) {
      return res.status(409).json({
        message: 'This movie has bookings. Keep it to preserve booking history.'
      });
    }

    await Show.deleteMany({ movie: req.params.id });
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    res.json({ message: 'Movie deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// View all theatres
router.get('/theatres', async (req, res, next) => {
  try {
    const theatres = await Theatre.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json(theatres);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
