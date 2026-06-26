const express = require('express');
const http = require('http');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Pool } = require('pg');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this';

if (!process.env.DATABASE_URL) {
  console.log('DATABASE_URL bulunamadı. Render Environment kısmına eklemen lazım.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const onlineUsers = new Map();

function nowTime() {
  return new Date().toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username
    },
    JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token yok.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Geçersiz token.' });
  }
}

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(30) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      room VARCHAR(50) NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      username VARCHAR(30) NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Database tabloları hazır.');
}

app.post('/api/register', async (req, res) => {
  try {
    const username = cleanText(req.body.username, 30);
    const password = String(req.body.password || '');

    if (username.length < 3) {
      return res.status(400).json({ error: 'Kullanıcı adı en az 3 karakter olmalı.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı.' });
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten alınmış.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, avatar_url',
      [username, passwordHash]
    );

    const user = result.rows[0];
    const token = createToken(user);

    res.json({
      token,
      user
    });
  } catch (error) {
    console.error('Register hatası:', error);
    res.status(500).json({ error: 'Kayıt olurken hata oluştu.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const username = cleanText(req.body.username, 30);
    const password = String(req.body.password || '');

    const result = await pool.query(
      'SELECT id, username, password_hash, avatar_url FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Kullanıcı adı veya şifre yanlış.' });
    }

    const user = result.rows[0];
    const isCorrect = await bcrypt.compare(password, user.password_hash);

    if (!isCorrect) {
      return res.status(400).json({ error: 'Kullanıcı adı veya şifre yanlış.' });
    }

    const token = createToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Login hatası:', error);
    res.status(500).json({ error: 'Giriş yaparken hata oluştu.' });
  }
});

app.get('/api/me', authMiddleware, async (req, res) => {
  const result = await pool.query(
    'SELECT id, username, avatar_url FROM users WHERE id = $1',
    [req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
  }

  res.json({
    user: result.rows[0]
  });
});

app.get('/api/messages/:room', authMiddleware, async (req, res) => {
  const room = cleanText(req.params.room, 50).toLowerCase() || 'genel';

  const result = await pool.query(
    `
    SELECT id, room, username, text, created_at
    FROM messages
    WHERE room = $1
    ORDER BY created_at DESC
    LIMIT 50
    `,
    [room]
  );

  res.json({
    messages: result.rows.reverse()
  });
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Token yok.'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error('Geçersiz token.'));
  }
});

io.on('connection', (socket) => {
  socket.on('join', async ({ room }) => {
    const cleanRoom = cleanText(room, 50).toLowerCase() || 'genel';

    socket.data.room = cleanRoom;
    socket.join(cleanRoom);

    onlineUsers.set(socket.id, {
      id: socket.user.id,
      username: socket.user.username,
      room: cleanRoom
    });

    socket.emit('system_message', `Hoş geldin ${socket.user.username}. Oda: ${cleanRoom}`);
    socket.to(cleanRoom).emit('system_message', `${socket.user.username} odaya katıldı.`);

    updateRoomUsers(cleanRoom);
  });

  socket.on('chat_message', async (message) => {
    try {
      const text = cleanText(message, 1000);

      if (!text || !socket.data.room) return;

      const room = socket.data.room;

      const saved = await pool.query(
        `
        INSERT INTO messages (room, user_id, username, text)
        VALUES ($1, $2, $3, $4)
        RETURNING id, room, username, text, created_at
        `,
        [room, socket.user.id, socket.user.username, text]
      );

      const msg = saved.rows[0];

      io.to(room).emit('chat_message', {
        id: msg.id,
        username: msg.username,
        text: msg.text,
        time: nowTime()
      });
    } catch (error) {
      console.error('Mesaj kayıt hatası:', error);
      socket.emit('system_message', 'Mesaj gönderilemedi.');
    }
  });

  socket.on('typing', () => {
    if (!socket.data.room) return;
    socket.to(socket.data.room).emit('typing', socket.user.username);
  });

  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);

    onlineUsers.delete(socket.id);

    if (user) {
      socket.to(user.room).emit('system_message', `${user.username} çıktı.`);
      updateRoomUsers(user.room);
    }
  });
});

function updateRoomUsers(room) {
  const users = Array.from(onlineUsers.values())
    .filter((user) => user.room === room)
    .map((user) => user.username);

  io.to(room).emit('users', users);
}

initDatabase()
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Chat app çalışıyor. Port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database başlatma hatası:', error);
    process.exit(1);
  });
