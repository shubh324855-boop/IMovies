const mongoose = require('mongoose');
const showSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theatreName: { type: String, required: true },
  location: { type: String, default: 'Indore' },
  showDate: { type: String, required: true },
  showTime: { type: String, required: true },
  price: { type: Number, required: true, min: 1 },
  seats: [{ seatNo: String, status: { type: String, enum: ['available', 'booked'], default: 'available' } }]
}, { timestamps: true });
module.exports = mongoose.model('Show', showSchema);
