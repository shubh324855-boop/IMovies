const router = require('express').Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
router.get('/mine', auth, async (req, res, next) => { try { res.json(await Booking.find({ user: req.user.id }).populate({ path: 'show', populate: { path: 'movie' } }).sort({ createdAt: -1 })); } catch (e) { next(e); } });
router.post('/', auth, async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { showId, seats } = req.body;
    if (!showId || !Array.isArray(seats) || !seats.length) return res.status(400).json({ message: 'Choose a show and at least one seat.' });
    let created;
    await session.withTransaction(async () => {
      const show = await Show.findById(showId).session(session);
      if (!show) throw Object.assign(new Error('Show not found.'), { status: 404 });
      const uniqueSeats = [...new Set(seats)];
      const unavailable = uniqueSeats.filter(s => !show.seats.some(x => x.seatNo === s && x.status === 'available'));
      if (unavailable.length) throw Object.assign(new Error(`Seats unavailable: ${unavailable.join(', ')}`), { status: 409 });
      show.seats.forEach(s => { if (uniqueSeats.includes(s.seatNo)) s.status = 'booked'; });
      await show.save({ session });
      [created] = await Booking.create([{ user: req.user.id, show: show._id, seats: uniqueSeats, totalAmount: uniqueSeats.length * show.price, paymentMode: 'demo', paymentStatus: 'demo-paid' }], { session });
    });
    res.status(201).json(await Booking.findById(created._id).populate({ path: 'show', populate: { path: 'movie' } }));
  } catch (e) { next(e); } finally { await session.endSession(); }
});
module.exports = router;
