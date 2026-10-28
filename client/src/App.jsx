
import React, { useEffect, useState } from 'react';
import {
  Link, Route, Routes, useNavigate, useParams
} from 'react-router-dom';
import axios from 'axios';
import {
  Film, Search, Ticket, LogOut, CalendarDays, MapPin, Star,
  ArrowRight, Armchair, CheckCircle2, Clapperboard, LayoutDashboard,
  Plus, Building2, Users, IndianRupee, Trash2, RefreshCw
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const http = axios.create({ baseURL: API });

http.interceptors.request.use(config => {
  const token = localStorage.getItem('imovies_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function Header({ user, logout }) {
  return (
    <header className="nav">
      <Link to="/" className="brand">
        <span className="brand-icon"><Film size={21} /></span>
        iMovies<span className="brand-dot">.</span>
      </Link>
      <div className="nav-links">
        <Link to="/">Explore</Link>
        {user?.role === 'platform_admin' && <Link to="/admin">Admin Dashboard</Link>}
        {user?.role === 'cinema_owner' && <Link to="/owner">My Cinema</Link>}
        {user && <Link to="/bookings">My tickets</Link>}
      </div>
      <div className="nav-right">
        {user ? (
          <>
            <span className="welcome">Hey, {user.name?.split(' ')[0]}</span>
            <button className="icon-button" title="Log out" onClick={logout}>
              <LogOut size={17} />
            </button>
          </>
        ) : <Link className="btn btn-outline" to="/login">Sign in</Link>}
        <Link className="btn btn-primary nav-cta" to={user ? '/bookings' : '/register'}>
          <Ticket size={16} /> Get tickets
        </Link>
      </div>
    </header>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('imovies_user')); }
    catch { return null; }
  });
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadMovies = async () => {
    try {
      const response = await http.get('/movies');
      setMovies(response.data);
      setError('');
    } catch {
      setError('Cannot reach the API. Check MongoDB and the backend.');
    }
  };

  useEffect(() => { loadMovies(); }, []);

  const logout = () => {
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
    setUser(null);
    navigate('/');
  };

  const saveSession = data => {
    localStorage.setItem('imovies_token', data.token);
    localStorage.setItem('imovies_user', JSON.stringify(data.user));
    setUser(data.user);
    navigate(data.user?.role === 'platform_admin' ? '/admin' : '/');
  };

  const filtered = movies.filter(movie =>
    `${movie.title} ${movie.genre?.join(' ')} ${movie.language}`
      .toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Header user={user} logout={logout} />
      <Routes>
        <Route path="/" element={
          <Home movies={filtered} query={query} setQuery={setQuery} error={error} />
        } />
        <Route path="/movie/:id" element={<MoviePage user={user} />} />
        <Route path="/login" element={<Auth mode="login" onSuccess={saveSession} />} />
        <Route path="/register" element={<Auth mode="register" onSuccess={saveSession} />} />
        <Route path="/bookings" element={<Bookings user={user} />} />
        <Route path="/admin" element={
          <AdminDashboard user={user} reloadMovies={loadMovies} />
        } />
        <Route path="*" element={
          <Home movies={filtered} query={query} setQuery={setQuery} error={error} />
        } />
      </Routes>
      <footer className="footer">
        <Link to="/" className="brand"><Film size={18} /> iMovies<span className="brand-dot">.</span></Link>
        <span>Your next favourite movie is one booking away.</span>
        <span>© {new Date().getFullYear()} iMovies</span>
      </footer>
    </>
  );
}

function Home({ movies, query, setQuery, error }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> YOUR SEAT IS WAITING</div>
          <h1>Movies hit<br />different <em>here.</em></h1>
          <p>Find the stories worth watching. Pick your seats. Make it a movie night.</p>
          <div className="hero-actions">
            <a href="#movies" className="btn btn-primary btn-large">Explore movies <ArrowRight size={17} /></a>
            <span className="hero-note"><CheckCircle2 size={15} /> Simple, secure booking</span>
          </div>
          <div className="hero-stats">
            <div><strong>4.8<span>/5</span></strong><small>Audience love</small></div>
            <div><strong>40<span>+</span></strong><small>Seats per screen</small></div>
            <div><strong>3</strong><small>Daily showtimes</small></div>
          </div>
        </div>
        <div className="hero-art">
          <div className="poster poster-back"><div className="poster-orbit" /><span>THE</span><b>UNKNOWN</b><small>EVERY STORY STARTS SOMEWHERE</small></div>
          <div className="poster poster-front">
            <img src="https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" alt="Interstellar poster" />
            <div className="poster-tag"><Star size={13} fill="currentColor" /> 8.7 <span>Top pick</span></div>
          </div>
          <div className="floating-ticket"><Ticket size={18} /><div><b>Movie night?</b><small>Consider it booked.</small></div></div>
          <div className="art-spark spark-one">✦</div><div className="art-spark spark-two">✧</div>
        </div>
      </section>

      <section id="movies" className="movie-section">
        <div className="section-top">
          <div>
            <div className="eyebrow">THE BIG SCREEN EDITION</div>
            <h2>Now showing<span className="brand-dot">.</span></h2>
            <p className="section-sub">Good stories. Great seats. Your kind of night.</p>
          </div>
          <label className="searchbox">
            <Search size={18} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search movies, genres..." />
          </label>
        </div>
        {error && <div className="error-banner">{error}</div>}
        <div className="movie-grid">
          {movies.map((movie, index) => <MovieCard key={movie._id} movie={movie} index={index} />)}
        </div>
        {!movies.length && !error && <div className="empty">Loading the good stuff…</div>}
        {!movies.length && error && <div className="empty">Once the API is running, your movie collection will appear here.</div>}
      </section>

      <section className="bottom-cta">
        <div className="cta-icon"><Clapperboard size={25} /></div>
        <div><h3>Make tonight a movie night.</h3><p>Your next great watch is just a few clicks away.</p></div>
        <a className="btn btn-light" href="#movies">Find your film <ArrowRight size={16} /></a>
      </section>
    </main>
  );
}

function MovieCard({ movie, index }) {
  return (
    <article className="movie-card" style={{ '--delay': `${index * 70}ms` }}>
      <Link to={`/movie/${movie._id}`} className="poster-wrap">
        <img src={movie.posterUrl || ''} onError={e => { e.currentTarget.src = 'https://placehold.co/500x750/171720/f4f0ff?text=iMovies'; }} alt={`${movie.title} poster`} />
        <span className="rating"><Star size={13} fill="currentColor" /> {movie.rating?.toFixed(1) || '—'}</span>
        <span className="poster-overlay"><span>View showtimes <ArrowRight size={15} /></span></span>
      </Link>
      <div className="movie-info">
        <div className="movie-meta">{movie.genre?.slice(0, 2).join(' · ') || 'Now showing'} <span>•</span> {movie.durationMins || 120} min</div>
        <Link to={`/movie/${movie._id}`} className="movie-title">{movie.title}</Link>
        <div className="movie-bottom"><span>{movie.language || 'English'}</span><Link to={`/movie/${movie._id}`} className="round-arrow"><ArrowRight size={16} /></Link></div>
      </div>
    </article>
  );
}

function MoviePage({ user }) {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    http.get('/movies').then(r => setMovie(r.data.find(m => m._id === id))).catch(() => {});
    http.get(`/movies/${id}/shows`).then(r => setShows(r.data)).catch(() => setErr('Could not load showtimes.'));
  }, [id]);

  if (!movie) return <main className="page-wrap"><div className="empty">Loading movie…</div></main>;

  return (
    <main className="page-wrap">
      <div className="detail-hero">
        <img src={movie.posterUrl} alt="" />
        <div>
          <div className="eyebrow">NOW SHOWING</div><h1>{movie.title}</h1>
          <div className="detail-meta"><span><Star size={15} fill="currentColor" /> {movie.rating}/10</span><span>{movie.durationMins} min</span><span>{movie.language}</span></div>
          <p>{movie.description}</p>
          <div className="genre-row">{movie.genre?.map(g => <span key={g}>{g}</span>)}</div>
        </div>
      </div>
      <div className="show-section">
        <h2>Choose your showtime<span className="brand-dot">.</span></h2>
        <p className="section-sub">Select a show to see available seats.</p>
        {err && <div className="error-banner">{err}</div>}
        {shows.length === 0 ? <div className="empty">No showtimes available yet.</div> :
          shows.map(show => <ShowRow key={show._id} show={show} user={user} />)}
      </div>
    </main>
  );
}

function ShowRow({ show, user }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [paymentStep, setPaymentStep] = useState('seats');
  const seats = show.seats || [];
  const total = selected.length * Number(show.price || 0);

  const startPayment = () => {
    if (!user) { setMessage('Please sign in to continue.'); return; }
    if (!selected.length) { setMessage('Choose at least one seat.'); return; }
    setMessage('');
    setPaymentStep('checkout');
  };

  const payNow = () => {
    setBusy(true);
    setMessage('');
    // Payment is simulated for this project; no payment provider is contacted.
    window.setTimeout(() => {
      setPaymentStep('paid');
      setBusy(false);
    }, 700);
  };

  const book = async () => {
    if (!user) { setMessage('Please sign in to continue.'); return; }
    if (paymentStep !== 'paid') { setMessage('Complete payment before confirming your booking.'); return; }
    setBusy(true); setMessage('');
    try {
      await http.post('/bookings', { showId: show._id, seats: selected });
      setMessage('Booking confirmed successfully.');
      setSelected([]);
      setPaymentStep('seats');
      const r = await http.get(`/movies/${show.movie?._id || show.movie}/shows`);
      const updated = r.data.find(s => s._id === show._id);
      if (updated) show.seats = updated.seats;
    } catch (e) {
      setMessage(e.response?.data?.message || 'Booking failed. Please try again.');
    } finally { setBusy(false); }
  };

  const resetPayment = () => {
    setPaymentStep('seats');
    setMessage('');
  };

  return (
    <div className="show-card">
      <div className="show-info">
        <div className="show-time"><CalendarDays size={16} />{show.showDate} <b>{show.showTime}</b></div>
        <div className="show-theatre"><MapPin size={15} />{show.theatreName} · {show.location}</div>
      </div>
      <div className="show-price">₹{show.price}<small>per seat</small></div>
      <button className="btn btn-primary" onClick={() => { setOpen(!open); setMessage(''); }}>{open ? 'Hide seats' : 'Select seats'} <ArrowRight size={15} /></button>
      {open && <div className="seat-picker">
        {paymentStep === 'seats' && <>
          <div className="screen-line">SCREEN</div>
          <div className="seat-grid">{seats.map(s =>
            <button key={s.seatNo} disabled={s.status === 'booked'} className={`seat ${s.status === 'booked' ? 'booked' : ''} ${selected.includes(s.seatNo) ? 'selected' : ''}`} onClick={() => setSelected(old => old.includes(s.seatNo) ? old.filter(x => x !== s.seatNo) : [...old, s.seatNo])}>
              <Armchair size={14} />{s.seatNo}
            </button>
          )}</div>
          <div className="seat-legend"><span><i /> Available</span><span><i className="sel" /> Selected</span><span><i className="taken" /> Booked</span></div>
          <div className="booking-action">
            <span>{selected.length} seat(s) · <b>₹{total}</b></span>
            <button className="btn btn-primary" disabled={busy} onClick={startPayment}>Continue to payment <ArrowRight size={15} /></button>
          </div>
        </>}

        {paymentStep === 'checkout' && <div style={{ background: '#11111a', border: '1px solid #303044', borderRadius: 14, padding: 20, marginTop: 12, color: '#f5f5fb' }}>
          <button className="btn btn-outline" onClick={resetPayment} style={{ marginBottom: 16 }}>← Back to seats</button>
          <div className="eyebrow">SECURE CHECKOUT</div>
          <h2 style={{ margin: '8px 0' }}>Pay with UPI</h2>
          <p style={{ color: '#b9b9c9', marginTop: 0 }}>Scan the code shown in your payment app or use the UPI ID below.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 20, alignItems: 'center' }}>
            <div style={{ background: '#fff', padding: 12, borderRadius: 12, width: 164, height: 164, boxSizing: 'border-box', display: 'grid', gridTemplateColumns: 'repeat(11,1fr)', gridTemplateRows: 'repeat(11,1fr)', gap: 2, margin: '0 auto' }}>
              {Array.from({ length: 121 }, (_, i) => {
                const x = i % 11, y = Math.floor(i / 11);
                const finder = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
                const dark = finder ? (x === 0 || x === 2 || y === 0 || y === 2 || (x === 1 && y === 1) || (x === 8 && y === 1) || (x === 9 && y === 1) || (x === 8 && y === 2) || (x === 1 && y === 8) || (x === 1 && y === 9) || (x === 2 && y === 8)) : ((i * 7 + x * y + x + y) % 5 < 2);
                return <span key={i} style={{ background: dark ? '#111' : '#fff', borderRadius: 1 }} />;
              })}
            </div>
            <div>
              <div style={{ color: '#b9b9c9', fontSize: 13 }}>UPI ID</div>
              <div style={{ fontSize: 17, fontWeight: 700, margin: '5px 0 14px' }}>imovies.test@upi</div>
              <div style={{ color: '#b9b9c9', fontSize: 13 }}>Amount to pay</div>
              <div style={{ fontSize: 30, fontWeight: 800, margin: '5px 0 16px' }}>₹{total}</div>
              <button className="btn btn-primary btn-large" disabled={busy} onClick={payNow}>{busy ? 'Processing…' : 'Pay Now'} <ArrowRight size={16} /></button>
              <p style={{ fontSize: 11, color: '#8f8fa3', marginBottom: 0 }}>No money is transferred from this screen.</p>
            </div>
          </div>
        </div>}

        {paymentStep === 'paid' && <div style={{ background: '#11111a', border: '1px solid #285d47', borderRadius: 14, padding: 20, marginTop: 12, color: '#f5f5fb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#67d6a0' }}><CheckCircle2 size={28} /><h2 style={{ margin: 0 }}>Payment Successful</h2></div>
          <p style={{ color: '#c4c4d2' }}>Amount: <b>₹{total}</b> · Seats: <b>{selected.join(', ')}</b></p>
          <p style={{ color: '#9b9bad', fontSize: 12 }}>Payment status is simulated for this project. No money was transferred.</p>
          <button className="btn btn-primary btn-large" disabled={busy} onClick={book}>{busy ? 'Confirming…' : 'Confirm Booking'} <CheckCircle2 size={16} /></button>
        </div>}
        {message && <div className={message.startsWith('Booking confirmed') ? 'success-banner' : 'error-banner'}>{message}</div>}
      </div>}
    </div>
  );
}

function Auth({ mode, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [adminMode, setAdminMode] = useState(false);

  const submit = async e => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const { data } = await http.post(`/auth/${mode}`, form);
      if (adminMode && data.user?.role !== 'platform_admin') {
        setError('This account does not have administrator access.');
        return;
      }
      onSuccess(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not connect to the server.');
    } finally { setBusy(false); }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-symbol"><Film size={24} /></div>
        <div className="eyebrow">{adminMode ? 'ADMINISTRATOR ACCESS' : 'YOUR MOVIE JOURNEY STARTS HERE'}</div>
        <h1>{mode === 'login' ? (adminMode ? 'Admin sign in.' : 'Welcome back.') : 'Join the show.'}</h1>
        <p>{mode === 'login' ? (adminMode ? 'Sign in with your administrator account.' : 'Sign in and get back to the good stuff.') : 'Create an account to book your next movie night.'}</p>
        {mode === 'login' && <button type="button" className="btn btn-outline btn-large full" style={{ marginBottom: 16 }} onClick={() => { setAdminMode(v => !v); setError(''); }}>
          <LayoutDashboard size={17} /> {adminMode ? 'Sign in as Customer' : 'Login as Admin'}
        </button>}
        <form onSubmit={submit}>
          {mode === 'register' && <label>Full name<input required minLength="2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>}
          <label>Email address<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
          <label>Password<input required minLength="8" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" /></label>
          {error && <div className="error-banner">{error}</div>}
          <button disabled={busy} className="btn btn-primary btn-large full">{busy ? 'Please wait…' : mode === 'login' ? (adminMode ? 'Admin sign in' : 'Sign in') : 'Create account'} <ArrowRight size={16} /></button>
        </form>
        <div className="auth-switch">{mode === 'login' ? <>New around here? <Link to="/register">Create an account</Link></> : <>Already a member? <Link to="/login">Sign in</Link></>}</div>
      </div>
    </main>
  );
}

function Bookings({ user }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) http.get('/bookings/mine').then(r => setItems(r.data)).catch(e => setError(e.response?.data?.message || 'Could not load bookings.'));
  }, [user]);

  if (!user) return <main className="auth-page"><div className="auth-card"><div className="auth-symbol"><Ticket /></div><h1>Your tickets await.</h1><p>Sign in to view your bookings and upcoming shows.</p><Link className="btn btn-primary btn-large full" to="/login">Sign in <ArrowRight size={16} /></Link></div></main>;

  return (
    <main className="page-wrap">
      <div className="eyebrow">YOUR MOVIE NIGHTS</div><h1 className="page-title">My tickets<span className="brand-dot">.</span></h1>
      <p className="section-sub">All your confirmed bookings, in one place.</p>
      {error && <div className="error-banner">{error}</div>}
      {items.length === 0 && !error ? <div className="empty">No bookings yet. Your next movie night is waiting.<br /><Link to="/" className="text-link">Explore movies <ArrowRight size={15} /></Link></div> :
        <div className="booking-list">{items.map(b =>
          <div className="booking-card" key={b._id}>
            <div className="booking-ticket-icon"><Ticket /></div>
            <div className="booking-main"><h3>{b.show?.movie?.title || 'Movie show'}</h3><p>{b.show?.theatreName} · {b.show?.showDate} · {b.show?.showTime}</p><span>Seats: {b.seats.join(', ')}</span></div>
            <div className="booking-total"><b>₹{b.totalAmount}</b><span><CheckCircle2 size={14} /> Confirmed</span></div>
          </div>
        )}</div>}
    </main>
  );
}

function AdminDashboard({ user, reloadMovies }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [movieForm, setMovieForm] = useState({
    title: '', description: '', genre: 'Drama', language: 'English',
    durationMins: 120, rating: 7.5, posterUrl: '', releaseDate: ''
  });
  const [theatreForm, setTheatreForm] = useState({
    name: '', city: '', address: '', screens: 1
  });

  const loadDashboard = async () => {
    setError('');
    try {
      const [s, m, t, b] = await Promise.all([
        http.get('/admin/stats'),
        http.get('/movies'),
        http.get('/admin/theatres'),
        http.get('/admin/bookings')
      ]);
      setStats(s.data);
      setMovies(m.data);
      setTheatres(t.data);
      setBookings(b.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load admin data. Please log in again.');
    }
  };

  useEffect(() => {
    if (user?.role === 'platform_admin') loadDashboard();
  }, [user]);

  if (!user) {
    return <main className="auth-page"><div className="auth-card"><h1>Admin sign-in required</h1><p>Sign in with your authorized platform admin account.</p><Link className="btn btn-primary full" to="/login">Sign in</Link></div></main>;
  }

  if (user.role !== 'platform_admin') {
    return <main className="page-wrap"><div className="error-banner">You don't have permission to access this dashboard.</div><Link to="/">Return to movies</Link></main>;
  }

  const addMovie = async e => {
    e.preventDefault(); setError(''); setNotice('');
    try {
      const payload = {
        ...movieForm,
        genre: movieForm.genre.split(',').map(g => g.trim()).filter(Boolean),
        durationMins: Number(movieForm.durationMins),
        rating: Number(movieForm.rating),
        releaseDate: movieForm.releaseDate || undefined
      };
      await http.post('/admin/movies', payload);
      setMovieForm({ title: '', description: '', genre: 'Drama', language: 'English', durationMins: 120, rating: 7.5, posterUrl: '', releaseDate: '' });
      setNotice('Movie added successfully.');
      await loadDashboard();
      await reloadMovies();
      setTab('movies');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not add movie.');
    }
  };

  const deleteMovie = async id => {
    if (!window.confirm('Delete this movie? Movies with booking history cannot be deleted.')) return;
    setError(''); setNotice('');
    try {
      await http.delete(`/admin/movies/${id}`);
      setNotice('Movie deleted.');
      await loadDashboard();
      await reloadMovies();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not delete movie.');
    }
  };

  const addTheatre = async e => {
    e.preventDefault(); setError(''); setNotice('');
    try {
      await http.post('/theatres', {
        ...theatreForm,
        screens: Number(theatreForm.screens)
      });
      setTheatreForm({ name: '', city: '', address: '', screens: 1 });
      setNotice('Theatre created.');
      await loadDashboard();
      setTab('theatres');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not add theatre.');
    }
  };

  const approveTheatre = async (id, approvalStatus) => {
    setError(''); setNotice('');
    try {
      await http.patch(`/theatres/${id}/approval`, { approvalStatus });
      setNotice(`Theatre ${approvalStatus}.`);
      await loadDashboard();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not update theatre approval.');
    }
  };

  const navItems = [
    ['overview', 'Overview', LayoutDashboard],
    ['movies', 'Movies', Film],
    ['addMovie', 'Add Movie', Plus],
    ['theatres', 'Theatres', Building2],
    ['addTheatre', 'Add Theatre', Building2],
    ['bookings', 'All Bookings', Ticket]
  ];

  const panelStyle = { background: '#15151f', border: '1px solid #2c2c3a', borderRadius: 14, padding: 20 };
  const inputStyle = { width: '100%', padding: '12px 13px', marginTop: 6, marginBottom: 14, borderRadius: 8, border: '1px solid #393949', background: '#0f0f17', color: '#fff', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', color: '#d6d6e0', fontSize: 14 };

  return (
    <main className="page-wrap" style={{ maxWidth: 1240 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div><div className="eyebrow">IMOVIES CONTROL CENTRE</div><h1 className="page-title">Admin Dashboard<span className="brand-dot">.</span></h1><p className="section-sub">Manage movies, theatres and bookings.</p></div>
        <button className="btn btn-outline" onClick={loadDashboard}><RefreshCw size={16} /> Refresh</button>
      </div>

      {error && <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>}
      {notice && <div className="success-banner" style={{ marginBottom: 16 }}>{notice}</div>}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
        {navItems.map(([key, label, Icon]) =>
          <button key={key} className={`btn ${tab === key ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setTab(key); setError(''); setNotice(''); }}>
            <Icon size={16} /> {label}
          </button>
        )}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14 }}>
          <StatCard icon={<Film />} title="Total Movies" value={stats?.totalMovies ?? '—'} />
          <StatCard icon={<Building2 />} title="Total Theatres" value={stats?.totalTheatres ?? '—'} />
          <StatCard icon={<Ticket />} title="Confirmed Bookings" value={stats?.totalBookings ?? '—'} />
          <StatCard icon={<IndianRupee />} title="Revenue" value={stats ? `₹${stats.Revenue}` : '—'} />
          <div style={{ ...panelStyle, gridColumn: '1 / -1' }}>
            <h3>Quick actions</h3>
            <p className="section-sub">Manage the platform from here.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => setTab('addMovie')}><Plus size={16} /> Add Movie</button>
              <button className="btn btn-outline" onClick={() => setTab('addTheatre')}><Building2 size={16} /> Add Theatre</button>
              <button className="btn btn-outline" onClick={() => setTab('bookings')}><Ticket size={16} /> View Bookings</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'addMovie' && (
        <form onSubmit={addMovie} style={panelStyle}>
          <h2>Add Movie</h2>
          <p className="section-sub">Add a movie to the public catalogue.</p>
          <label style={labelStyle}>Movie title<input style={inputStyle} required value={movieForm.title} onChange={e => setMovieForm({ ...movieForm, title: e.target.value })} /></label>
          <label style={labelStyle}>Description<textarea style={inputStyle} rows="3" value={movieForm.description} onChange={e => setMovieForm({ ...movieForm, description: e.target.value })} /></label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
            <label style={labelStyle}>Genres (comma-separated)<input style={inputStyle} value={movieForm.genre} onChange={e => setMovieForm({ ...movieForm, genre: e.target.value })} /></label>
            <label style={labelStyle}>Language<input style={inputStyle} value={movieForm.language} onChange={e => setMovieForm({ ...movieForm, language: e.target.value })} /></label>
            <label style={labelStyle}>Duration in minutes<input style={inputStyle} type="number" min="1" required value={movieForm.durationMins} onChange={e => setMovieForm({ ...movieForm, durationMins: e.target.value })} /></label>
            <label style={labelStyle}>Rating (0–10)<input style={inputStyle} type="number" min="0" max="10" step="0.1" value={movieForm.rating} onChange={e => setMovieForm({ ...movieForm, rating: e.target.value })} /></label>
          </div>
          <label style={labelStyle}>Poster image URL<input style={inputStyle} type="url" value={movieForm.posterUrl} onChange={e => setMovieForm({ ...movieForm, posterUrl: e.target.value })} placeholder="https://..." /></label>
          <label style={labelStyle}>Release date<input style={inputStyle} type="date" value={movieForm.releaseDate} onChange={e => setMovieForm({ ...movieForm, releaseDate: e.target.value })} /></label>
          <button className="btn btn-primary" type="submit"><Plus size={16} /> Save Movie</button>
        </form>
      )}

      {tab === 'movies' && (
        <div style={{ ...panelStyle, overflowX: 'auto' }}>
          <h2>Movies</h2>
          <table style={tableStyle}>
            <thead><tr><th>Movie</th><th>Genre</th><th>Language</th><th>Duration</th><th>Action</th></tr></thead>
            <tbody>{movies.map(movie =>
              <tr key={movie._id}>
                <td>{movie.title}</td><td>{movie.genre?.join(', ') || '—'}</td><td>{movie.language}</td><td>{movie.durationMins} min</td>
                <td><button className="btn btn-outline" onClick={() => deleteMovie(movie._id)}><Trash2 size={15} /> Delete</button></td>
              </tr>
            )}</tbody>
          </table>
          {!movies.length && <p className="empty">No movies found.</p>}
        </div>
      )}

      {tab === 'addTheatre' && (
        <form onSubmit={addTheatre} style={panelStyle}>
          <h2>Add Theatre</h2>
          <p className="section-sub">Create a theatre record. It will appear in the theatre list for review.</p>
          <label style={labelStyle}>Theatre name<input style={inputStyle} required value={theatreForm.name} onChange={e => setTheatreForm({ ...theatreForm, name: e.target.value })} /></label>
          <label style={labelStyle}>City<input style={inputStyle} required value={theatreForm.city} onChange={e => setTheatreForm({ ...theatreForm, city: e.target.value })} /></label>
          <label style={labelStyle}>Full address<input style={inputStyle} required value={theatreForm.address} onChange={e => setTheatreForm({ ...theatreForm, address: e.target.value })} /></label>
          <label style={labelStyle}>Number of screens<input style={inputStyle} type="number" min="1" required value={theatreForm.screens} onChange={e => setTheatreForm({ ...theatreForm, screens: e.target.value })} /></label>
          <button className="btn btn-primary" type="submit"><Plus size={16} /> Save Theatre</button>
        </form>
      )}

      {tab === 'theatres' && (
        <div style={{ ...panelStyle, overflowX: 'auto' }}>
          <h2>Theatre Management</h2>
          <table style={tableStyle}>
            <thead><tr><th>Theatre</th><th>City</th><th>Owner</th><th>Screens</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{theatres.map(theatre =>
              <tr key={theatre._id}>
                <td>{theatre.name}<br /><small>{theatre.address}</small></td>
                <td>{theatre.city}</td>
                <td>{theatre.owner?.name || '—'}<br /><small>{theatre.owner?.email || ''}</small></td>
                <td>{theatre.screens}</td>
                <td>{theatre.approvalStatus}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {theatre.approvalStatus !== 'approved' && <button className="btn btn-primary" onClick={() => approveTheatre(theatre._id, 'approved')}>Approve</button>}
                  {' '}
                  {theatre.approvalStatus !== 'rejected' && <button className="btn btn-outline" onClick={() => approveTheatre(theatre._id, 'rejected')}>Reject</button>}
                </td>
              </tr>
            )}</tbody>
          </table>
          {!theatres.length && <p className="empty">No theatres have been submitted yet.</p>}
        </div>
      )}

      {tab === 'bookings' && (
        <div style={{ ...panelStyle, overflowX: 'auto' }}>
          <h2>All Bookings</h2>
          <table style={tableStyle}>
            <thead><tr><th>Customer</th><th>Movie</th><th>Theatre / Show</th><th>Seats</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>{bookings.map(booking =>
              <tr key={booking._id}>
                <td>{booking.user?.name || 'Unknown'}<br /><small>{booking.user?.email || ''}</small></td>
                <td>{booking.show?.movie?.title || 'Movie unavailable'}</td>
                <td>{booking.show?.theatreName || '—'}<br /><small>{booking.show?.showDate} {booking.show?.showTime}</small></td>
                <td>{booking.seats?.join(', ')}</td>
                <td>₹{booking.totalAmount}</td>
                <td>{booking.status || 'confirmed'}</td>
              </tr>
            )}</tbody>
          </table>
          {!bookings.length && <p className="empty">No bookings found.</p>}
        </div>
      )}
    </main>
  );
}

const tableStyle = {
  width: '100%', borderCollapse: 'collapse', textAlign: 'left',
  color: '#f4f4f8', minWidth: 680
};

function StatCard({ icon, title, value }) {
  return (
    <div style={{ background: '#15151f', border: '1px solid #2c2c3a', borderRadius: 14, padding: 20 }}>
      <div style={{ color: '#ff566b', marginBottom: 14 }}>{icon}</div>
      <div style={{ color: '#b5b5c4', fontSize: 14 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{value}</div>
    </div>
  );
}

export default App;
