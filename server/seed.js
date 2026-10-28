require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');
const Show = require('./models/Show');
const seats = Array.from({ length: 40 }, (_, i) => ({ seatNo: `${String.fromCharCode(65 + Math.floor(i / 10))}${(i % 10) + 1}`, status: 'available' }));
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Movie.deleteMany({}); await Show.deleteMany({});
  const movies = await Movie.insertMany([
    { title: 'Interstellar', description: 'A team travels beyond this galaxy to ensure humanity has a future.', genre: ['Sci-Fi', 'Drama'], language: 'English', durationMins: 169, rating: 8.7, posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
    { title: 'Dune: Part Two', description: 'Paul Atreides unites with Chani and the Fremen on a path of destiny.', genre: ['Sci-Fi', 'Adventure'], language: 'English', durationMins: 166, rating: 8.5, posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg' },
    { title: 'The Dark Knight', description: 'Batman faces a criminal mastermind who plunges Gotham into chaos.', genre: ['Action', 'Crime'], language: 'English', durationMins: 152, rating: 9.0, posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
    { title: '12th Fail', description: 'An aspiring civil servant keeps going despite repeated setbacks.', genre: ['Drama'], language: 'Hindi', durationMins: 147, rating: 8.8, posterUrl: 'https://image.tmdb.org/t/p/w500/k3J2ur4l9k6X4u7g3j3Q8w2Q2t.jpg' }
  ]);
  const date = new Date(); date.setDate(date.getDate() + 1); const dateStr = date.toISOString().slice(0, 10);
  const shows = [];
  for (const movie of movies) for (const time of ['11:30', '15:00', '19:30']) shows.push({ movie: movie._id, theatreName: 'iMovies Central', location: 'Indore', showDate: dateStr, showTime: time, price: 180, seats: seats.map(s => ({ ...s })) });
  await Show.insertMany(shows); console.log('Seeded demo movies and shows'); await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
