const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'jado-dev-secret';
const dbFile = path.join(__dirname, 'data', 'db.json');

const sampleProfiles = [
  {
    id: 'p1',
    name: 'Maya Chen',
    age: 27,
    location: 'Greenpoint',
    bio: 'Currently collecting little joys: Sunday markets, terrible puns, and recipes that take all afternoon.',
    interests: ['Film photography', 'Food', 'Slow mornings'],
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1100&q=85',
    mutual: true
  },
  {
    id: 'p2',
    name: 'Theo James',
    age: 29,
    location: 'Williamsburg',
    bio: 'Architect by day, amateur pasta maker by night. Looking for a plus-one for bookstore wandering.',
    interests: ['Architecture', 'Cooking', 'Books'],
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1100&q=85',
    mutual: false
  },
  {
    id: 'p3',
    name: 'Nina Patel',
    age: 26,
    location: 'Fort Greene',
    bio: 'I make playlists for people I like and over-order when we share small plates. Your turn to pick the music.',
    interests: ['Live music', 'Cooking', 'Dogs'],
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1100&q=85',
    mutual: true
  },
  {
    id: 'p4',
    name: 'Eli Brooks',
    age: 30,
    location: 'Bed-Stuy',
    bio: 'Weekend cyclist, weekday designer. Always up for a long walk that accidentally ends at a good bakery.',
    interests: ['Cycling', 'Design', 'Coffee'],
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1100&q=85',
    mutual: true
  }
];

const defaultRooms = [
  { id: 'room-1', name: 'Soft launch Sunday', host: 'Jules', topic: 'LATE NIGHT CHATS', category: 'after work', near: true },
  { id: 'room-2', name: 'Make me a playlist', host: 'Kai', topic: 'MUSIC & MOODS', category: 'music', near: false },
  { id: 'room-3', name: 'A table for everyone', host: 'Priya', topic: 'FOOD PEOPLE', category: 'near you', near: true }
];

const adapter = new JSONFile(dbFile);
const db = new Low(adapter, {
  users: [],
  profiles: sampleProfiles,
  matches: [],
  keeps: [],
  roomSessions: []
});

async function initDb() {
  await db.read();
  db.data ||= {
    users: [],
    profiles: sampleProfiles,
    matches: [],
    keeps: [],
    roomSessions: []
  };

  if (!Array.isArray(db.data.users)) db.data.users = [];
  if (!Array.isArray(db.data.profiles)) db.data.profiles = sampleProfiles;
  if (!Array.isArray(db.data.matches)) db.data.matches = [];
  if (!Array.isArray(db.data.keeps)) db.data.keeps = [];
  if (!Array.isArray(db.data.roomSessions)) db.data.roomSessions = [];

  await db.write();
}

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'user' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'JADO API', timestamp: new Date().toISOString() });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, role } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existingUser = db.data.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(409).json({ error: 'User already exists.' });
  }

  const user = {
    id: `user_${Date.now()}`,
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 10),
    role: role === 'host' ? 'host' : 'user',
    createdAt: new Date().toISOString()
  };

  db.data.users.push(user);
  await db.write();

  const token = createToken(user);
  res.status(201).json({ token, user: sanitizeUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.data.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = createToken(user);
  res.json({ token, user: sanitizeUser(user) });
});

app.get('/api/profile/me', authMiddleware, (req, res) => {
  const user = db.data.users.find((item) => item.id === req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({ user: sanitizeUser(user) });
});

app.get('/api/profiles', (req, res) => {
  res.json({ profiles: db.data.profiles });
});

app.get('/api/keeps', authMiddleware, (req, res) => {
  const keeps = db.data.keeps.filter((item) => item.userId === req.user.id);
  res.json({ keeps });
});

app.post('/api/keeps', authMiddleware, async (req, res) => {
  const { profileId } = req.body || {};

  if (!profileId) {
    return res.status(400).json({ error: 'profileId is required.' });
  }

  const profile = db.data.profiles.find((item) => item.id === profileId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found.' });
  }

  const exists = db.data.keeps.some((item) => item.userId === req.user.id && item.profileId === profileId);
  if (exists) {
    return res.status(200).json({ message: 'Profile already in keeps.', keeps: db.data.keeps.filter((item) => item.userId === req.user.id) });
  }

  const keep = { id: `keep_${Date.now()}`, userId: req.user.id, profileId, profileName: profile.name, createdAt: new Date().toISOString() };
  db.data.keeps.push(keep);
  await db.write();

  res.status(201).json({ keep, keeps: db.data.keeps.filter((item) => item.userId === req.user.id) });
});

app.get('/api/matches', authMiddleware, (req, res) => {
  const matches = db.data.matches.filter((item) => item.userId === req.user.id);
  res.json({ matches });
});

app.post('/api/matches', authMiddleware, async (req, res) => {
  const { profileId } = req.body || {};

  if (!profileId) {
    return res.status(400).json({ error: 'profileId is required.' });
  }

  const exists = db.data.matches.some((item) => item.userId === req.user.id && item.profileId === profileId);
  if (!exists) {
    db.data.matches.push({
      id: `match_${Date.now()}`,
      userId: req.user.id,
      profileId,
      createdAt: new Date().toISOString()
    });
    await db.write();
  }

  res.status(201).json({ matches: db.data.matches.filter((item) => item.userId === req.user.id) });
});

app.get('/api/rooms', (req, res) => {
  res.json({ rooms: defaultRooms });
});

app.post('/api/rooms/join', authMiddleware, async (req, res) => {
  const { roomId, roomName } = req.body || {};

  if (!roomId && !roomName) {
    return res.status(400).json({ error: 'roomId or roomName is required.' });
  }

  const session = {
    id: `session_${Date.now()}`,
    userId: req.user.id,
    roomId: roomId || `room_${Date.now()}`,
    roomName: roomName || 'Live room',
    joinedAt: new Date().toISOString()
  };

  db.data.roomSessions.push(session);
  await db.write();

  res.status(201).json({ session });
});

app.listen(PORT, async () => {
  await initDb();
  console.log(`JADO backend running on http://localhost:${PORT}`);
});

module.exports = app;
