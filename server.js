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
  console.log('DATABASE_URL bulunamadı.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const onlineUsers = new Map();
const userSockets = new Map();

function nowTime() {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function createToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');

  if (!token) return res.status(401).json({ error: 'Token yok.' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Geçersiz token.' });
  }
}

function addSocketForUser(userId, socketId) {
  const key = String(userId);
  if (!userSockets.has(key)) userSockets.set(key, new Set());
  userSockets.get(key).add(socketId);
}

function removeSocketForUser(userId, socketId) {
  const key = String(userId);
  const set = userSockets.get(key);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) userSockets.delete(key);
}

function emitToUser(userId, event, payload) {
  const set = userSockets.get(String(userId));
  if (!set) return;

  for (const socketId of set) {
    io.to(socketId).emit(event, payload);
  }
}

async function createNotification(userId, type, payload) {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, payload)
     VALUES ($1, $2, $3)
     RETURNING id, type, payload, is_read, created_at`,
    [userId, type, payload]
  );

  const notification = result.rows[0];
  emitToUser(userId, 'notification', notification);
  return notification;
}

async function areFriends(userA, userB) {
  const result = await pool.query(
    `SELECT id FROM friendships
     WHERE status = 'accepted'
     AND (
       (requester_id = $1 AND addressee_id = $2)
       OR
       (requester_id = $2 AND addressee_id = $1)
     )
     LIMIT 1`,
    [userA, userB]
  );

  return result.rows.length > 0;
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS friendships (
      id SERIAL PRIMARY KEY,
      requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      addressee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (requester_id, addressee_id),
      CHECK (requester_id <> addressee_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS dm_messages (
      id SERIAL PRIMARY KEY,
      sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(40) NOT NULL,
      payload JSONB NOT NULL DEFAULT '{}',
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Database tabloları hazır.');
}

app.post('/api/register', async (req, res) => {
  try {
    const username = cleanText(req.body.username, 30);
    const password = String(req.body.password || '');

    if (username.length < 3) return res.status(400).json({ error: 'Kullanıcı adı en az 3 karakter olmalı.' });
    if (password.length < 6) return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı.' });

    const existing = await pool.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Bu kullanıcı adı zaten alınmış.' });

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, avatar_url',
      [username, passwordHash]
    );

    const user = result.rows[0];
    res.json({ token: createToken(user), user });
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

    if (result.rows.length === 0) return res.status(400).json({ error: 'Kullanıcı adı veya şifre yanlış.' });

    const dbUser = result.rows[0];
    const isCorrect = await bcrypt.compare(password, dbUser.password_hash);
    if (!isCorrect) return res.status(400).json({ error: 'Kullanıcı adı veya şifre yanlış.' });

    const user = { id: dbUser.id, username: dbUser.username, avatar_url: dbUser.avatar_url };
    res.json({ token: createToken(user), user });
  } catch (error) {
    console.error('Login hatası:', error);
    res.status(500).json({ error: 'Giriş yaparken hata oluştu.' });
  }
});

app.get('/api/me', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT id, username, avatar_url FROM users WHERE id = $1', [req.user.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
  res.json({ user: result.rows[0] });
});

app.post('/api/avatar', authMiddleware, async (req, res) => {
  try {
    const avatarData = String(req.body.avatarData || '');

    if (!avatarData.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Geçerli bir resim seç.' });
    }

    if (avatarData.length > 1500000) {
      return res.status(400).json({ error: 'Profil fotoğrafı çok büyük. Daha küçük görsel seç.' });
    }

    const result = await pool.query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, username, avatar_url',
      [avatarData, req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Avatar hatası:', error);
    res.status(500).json({ error: 'Profil fotoğrafı güncellenemedi.' });
  }
});

app.delete('/api/avatar', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE users SET avatar_url = NULL WHERE id = $1 RETURNING id, username, avatar_url',
      [req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Avatar kaldırma hatası:', error);
    res.status(500).json({ error: 'Profil fotoğrafı kaldırılamadı.' });
  }
});

app.get('/api/messages/:room', authMiddleware, async (req, res) => {
  const room = cleanText(req.params.room, 50).toLowerCase() || 'genel';

  const result = await pool.query(
    `SELECT m.id, m.room, m.username, m.text, m.created_at, u.avatar_url
     FROM messages m
     LEFT JOIN users u ON u.id = m.user_id
     WHERE m.room = $1
     ORDER BY m.created_at DESC
     LIMIT 50`,
    [room]
  );

  res.json({ messages: result.rows.reverse() });
});

app.get('/api/users/search', authMiddleware, async (req, res) => {
  const q = cleanText(req.query.q, 30);
  if (q.length < 2) return res.json({ users: [] });

  const result = await pool.query(
    `SELECT id, username, avatar_url
     FROM users
     WHERE LOWER(username) LIKE LOWER($1)
     AND id <> $2
     ORDER BY username ASC
     LIMIT 10`,
    [`%${q}%`, req.user.id]
  );

  res.json({ users: result.rows });
});

app.get('/api/friends', authMiddleware, async (req, res) => {
  const result = await pool.query(
    `SELECT u.id, u.username, u.avatar_url
     FROM friendships f
     JOIN users u ON u.id = CASE
       WHEN f.requester_id = $1 THEN f.addressee_id
       ELSE f.requester_id
     END
     WHERE (f.requester_id = $1 OR f.addressee_id = $1)
     AND f.status = 'accepted'
     ORDER BY u.username ASC`,
    [req.user.id]
  );

  res.json({ friends: result.rows });
});

app.get('/api/friends/requests', authMiddleware, async (req, res) => {
  const result = await pool.query(
    `SELECT f.id, f.requester_id, u.username, u.avatar_url, f.created_at
     FROM friendships f
     JOIN users u ON u.id = f.requester_id
     WHERE f.addressee_id = $1
     AND f.status = 'pending'
     ORDER BY f.created_at DESC`,
    [req.user.id]
  );

  res.json({ requests: result.rows });
});

app.post('/api/friends/request', authMiddleware, async (req, res) => {
  try {
    const username = cleanText(req.body.username, 30);

    const targetResult = await pool.query(
      'SELECT id, username FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );

    if (targetResult.rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

    const target = targetResult.rows[0];
    if (target.id === req.user.id) return res.status(400).json({ error: 'Kendine arkadaş isteği gönderemezsin.' });

    const existing = await pool.query(
      `SELECT id, status FROM friendships
       WHERE (requester_id = $1 AND addressee_id = $2)
       OR (requester_id = $2 AND addressee_id = $1)`,
      [req.user.id, target.id]
    );

    if (existing.rows.length > 0) {
      const status = existing.rows[0].status;
      if (status === 'accepted') return res.status(400).json({ error: 'Zaten arkadaşsınız.' });
      return res.status(400).json({ error: 'Zaten bekleyen arkadaş isteği var.' });
    }

    const insert = await pool.query(
      `INSERT INTO friendships (requester_id, addressee_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING id`,
      [req.user.id, target.id]
    );

    await createNotification(target.id, 'friend_request', {
      requestId: insert.rows[0].id,
      fromId: req.user.id,
      fromUsername: req.user.username
    });

    res.json({ ok: true, message: 'Arkadaş isteği gönderildi.' });
  } catch (error) {
    console.error('Arkadaş isteği hatası:', error);
    res.status(500).json({ error: 'Arkadaş isteği gönderilemedi.' });
  }
});

app.post('/api/friends/respond', authMiddleware, async (req, res) => {
  try {
    const requestId = Number(req.body.requestId);
    const action = String(req.body.action || '');

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Geçersiz işlem.' });
    }

    const request = await pool.query(
      `SELECT f.id, f.requester_id, f.addressee_id
       FROM friendships f
       WHERE f.id = $1
       AND f.addressee_id = $2
       AND f.status = 'pending'`,
      [requestId, req.user.id]
    );

    if (request.rows.length === 0) return res.status(404).json({ error: 'İstek bulunamadı.' });

    const row = request.rows[0];

    if (action === 'accept') {
      await pool.query(
        `UPDATE friendships
         SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [requestId]
      );

      await createNotification(row.requester_id, 'friend_accept', {
        fromId: req.user.id,
        fromUsername: req.user.username
      });

      return res.json({ ok: true, message: 'Arkadaş isteği kabul edildi.' });
    }

    await pool.query('DELETE FROM friendships WHERE id = $1', [requestId]);
    res.json({ ok: true, message: 'Arkadaş isteği reddedildi.' });
  } catch (error) {
    console.error('Arkadaş yanıt hatası:', error);
    res.status(500).json({ error: 'İstek yanıtlanamadı.' });
  }
});

app.get('/api/dm/:friendId', authMiddleware, async (req, res) => {
  const friendId = Number(req.params.friendId);
  if (!Number.isInteger(friendId)) return res.status(400).json({ error: 'Geçersiz kullanıcı.' });

  const ok = await areFriends(req.user.id, friendId);
  if (!ok) return res.status(403).json({ error: 'Bu kullanıcıyla arkadaş değilsin.' });

  const result = await pool.query(
    `SELECT dm.id, dm.sender_id, dm.receiver_id, dm.text, dm.created_at,
            sender.username AS sender_username,
            sender.avatar_url AS sender_avatar_url
     FROM dm_messages dm
     JOIN users sender ON sender.id = dm.sender_id
     WHERE (dm.sender_id = $1 AND dm.receiver_id = $2)
     OR (dm.sender_id = $2 AND dm.receiver_id = $1)
     ORDER BY dm.created_at DESC
     LIMIT 50`,
    [req.user.id, friendId]
  );

  res.json({ messages: result.rows.reverse() });
});

app.get('/api/notifications', authMiddleware, async (req, res) => {
  const result = await pool.query(
    `SELECT id, type, payload, is_read, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 30`,
    [req.user.id]
  );

  res.json({ notifications: result.rows });
});

app.post('/api/notifications/read', authMiddleware, async (req, res) => {
  await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [req.user.id]);
  res.json({ ok: true });
});

app.delete('/api/notifications/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Geçersiz bildirim.' });
  }

  await pool.query('DELETE FROM notifications WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  res.json({ ok: true });
});

app.delete('/api/notifications', authMiddleware, async (req, res) => {
  await pool.query('DELETE FROM notifications WHERE user_id = $1', [req.user.id]);
  res.json({ ok: true });
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Token yok.'));

  try {
    socket.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    next(new Error('Geçersiz token.'));
  }
});

io.on('connection', (socket) => {
  addSocketForUser(socket.user.id, socket.id);

  socket.on('join', async ({ room }) => {
    const cleanRoom = cleanText(room, 50).toLowerCase() || 'genel';

    if (socket.data.room) socket.leave(socket.data.room);

    socket.data.room = cleanRoom;
    socket.join(cleanRoom);

    onlineUsers.set(socket.id, { id: socket.user.id, username: socket.user.username, room: cleanRoom });

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
        `INSERT INTO messages (room, user_id, username, text)
         VALUES ($1, $2, $3, $4)
         RETURNING id, room, username, text, created_at`,
        [room, socket.user.id, socket.user.username, text]
      );

      const msg = saved.rows[0];
      const avatarResult = await pool.query('SELECT avatar_url FROM users WHERE id = $1', [socket.user.id]);
      const avatarUrl = avatarResult.rows[0]?.avatar_url || null;

      io.to(room).emit('chat_message', {
        id: msg.id,
        username: msg.username,
        avatar_url: avatarUrl,
        text: msg.text,
        time: nowTime()
      });
    } catch (error) {
      console.error('Mesaj kayıt hatası:', error);
      socket.emit('system_message', 'Mesaj gönderilemedi.');
    }
  });

  socket.on('dm_message', async ({ receiverId, text }) => {
    try {
      const cleanMessage = cleanText(text, 1000);
      const targetId = Number(receiverId);

      if (!cleanMessage || !Number.isInteger(targetId)) return;

      const ok = await areFriends(socket.user.id, targetId);
      if (!ok) {
        socket.emit('notification', {
          type: 'error',
          payload: { message: 'DM göndermek için arkadaş olmanız gerekiyor.' }
        });
        return;
      }

      const saved = await pool.query(
        `INSERT INTO dm_messages (sender_id, receiver_id, text)
         VALUES ($1, $2, $3)
         RETURNING id, sender_id, receiver_id, text, created_at`,
        [socket.user.id, targetId, cleanMessage]
      );

      const msg = {
        id: saved.rows[0].id,
        sender_id: saved.rows[0].sender_id,
        receiver_id: saved.rows[0].receiver_id,
        sender_username: socket.user.username,
        sender_avatar_url: (await pool.query('SELECT avatar_url FROM users WHERE id = $1', [socket.user.id])).rows[0]?.avatar_url || null,
        text: saved.rows[0].text,
        time: nowTime(),
        created_at: saved.rows[0].created_at
      };

      emitToUser(socket.user.id, 'dm_message', msg);
      emitToUser(targetId, 'dm_message', msg);

      await createNotification(targetId, 'dm', {
        fromId: socket.user.id,
        fromUsername: socket.user.username,
        text: cleanMessage.slice(0, 80)
      });
    } catch (error) {
      console.error('DM hatası:', error);
      socket.emit('notification', {
        type: 'error',
        payload: { message: 'DM gönderilemedi.' }
      });
    }
  });

  socket.on('typing', () => {
    if (!socket.data.room) return;
    socket.to(socket.data.room).emit('typing', socket.user.username);
  });

  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);
    removeSocketForUser(socket.user.id, socket.id);

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
