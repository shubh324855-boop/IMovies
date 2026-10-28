# iMovies — Movie Ticket Booking Platform

iMovies is a full-stack movie ticket booking platform designed to simplify movie discovery, showtime selection, seat booking, and theatre management. It features a cinema-inspired interface and a role-based admin dashboard for managing movies, theatres, and bookings.

## Tech Stack

**Frontend**
- React.js
- Vite
- CSS

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB
- Mongoose

**Authentication & Security**
- JSON Web Tokens (JWT)
- bcrypt password hashing
- Role-based access control

**Tools**
- Git
- GitHub
- npm

## Features

- **User Authentication:** User registration and login with hashed passwords and JWT-based authentication.
- **Movie Discovery:** Browse movies and view movie details.
- **Showtime Management:** Retrieve available shows for movies.
- **Interactive Seat Booking:** Select seats and maintain booking and seat availability records.
- **Booking History:** View personal bookings.
- **Admin Dashboard:** Manage movies, theatres, and bookings.
- **Theatre Management:** Add theatres and manage approval status.
- **Role-Based Access:** Separate permissions for customers, cinema owners, and platform administrators.
- **Responsive UI:** Dark, cinema-inspired interface for a modern movie-booking experience.

## Project Structure

```text
IMovies/
├── client/
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── style.css
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── server.js
│   └── seed.js
├── .gitignore
├── package-lock.json
└── README.md
```

## Repository

GitHub: [atharvshukla24/IMovies](https://github.com/atharvshukla24/IMovies)
