const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  seats: [{ type: String, required: true }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  paymentMode: { type: String, default: 'demo' },
  paymentStatus: { type: String, enum: ['demo-paid', 'pending', 'refunded'], default: 'demo-paid' }
}, { timestamps: true });
module.exports = mongoose.model('Booking', bookingSchema);
