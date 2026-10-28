const mongoose = require('mongoose');
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  genre: [{ type: String }],
  language: { type: String, default: 'English' },
  durationMins: { type: Number, default: 120 },
  rating: { type: Number, min: 0, max: 10, default: 7.5 },
  posterUrl: { type: String, default: '' },
  releaseDate: { type: Date }
}, { timestamps: true });
module.exports = mongoose.model('Movie', movieSchema);
