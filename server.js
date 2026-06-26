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
  for (const socketId of set) io.to(socketId).emit(event, payload);
}

function dmRoom(a, b) {
  const x = Number(a);
  const y = Number(b);
  return `dm:${Math.min(x, y)}:${Math.max(x, y)}`;
}

async function isBlockedBetween(userA, userB) {
  const result = await pool.query(
    `SELECT id FROM blocked_users
     WHERE (blocker_id = $1 AND blocked_id = $2)
     OR (blocker_id = $2 AND blocked_id = $1)
     LIMIT 1`,
    [userA, userB]
  );
  return result.rows.length > 0;
}

async function areFriends(userA, userB) {
  if (await isBlockedBetween(userA, userB)) return false;

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS blocked_users (
      id SERIAL PRIMARY KEY,
      blocker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      blocked_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (blocker_id, blocked_id),
      CHECK (blocker_id <> blocked_id)
    );
  `);

  await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP`);
  await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`);
  await pool.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP`);
  await pool.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`);
  await pool.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP`);

  await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text'`);
  await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_name TEXT`);
  await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_mime TEXT`);
  await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_data TEXT`);

  await pool.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text'`);
  await pool.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS file_name TEXT`);
  await pool.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS file_mime TEXT`);
  await pool.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS file_data TEXT`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS message_reactions (
      id SERIAL PRIMARY KEY,
      message_scope VARCHAR(10) NOT NULL,
      message_id INTEGER NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      emoji VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (message_scope, message_id, user_id, emoji)
    );
  `);

  console.log('Database tabloları hazır.');
}

/* AUTH */

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

/* PROFILE */

app.post('/api/avatar', authMiddleware, async (req, res) => {
  try {
    const avatarData = String(req.body.avatarData || '');
    if (!avatarData.startsWith('data:image/')) return res.status(400).json({ error: 'Geçerli bir resim seç.' });
    if (avatarData.length > 1500000) return res.status(400).json({ error: 'Profil fotoğrafı çok büyük. Daha küçük görsel seç.' });

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

/* ROOM MESSAGES */

app.get('/api/messages/:room', authMiddleware, async (req, res) => {
  const room = cleanText(req.params.room, 50).toLowerCase() || 'genel';

  const result = await pool.query(
    `SELECT m.id, m.room, m.username, m.text, m.created_at, m.edited_at, m.deleted_at,
            m.message_type, m.file_name, m.file_mime, m.file_data, u.avatar_url
     FROM messages m
     LEFT JOIN users u ON u.id = m.user_id
     WHERE m.room = $1
     ORDER BY m.created_at DESC
     LIMIT 50`,
    [room]
  );

  res.json({ messages: result.rows.reverse() });
});

/* USERS, FRIENDS, BLOCKS */

app.get('/api/users/search', authMiddleware, async (req, res) => {
  const q = cleanText(req.query.q, 30);
  if (q.length < 2) return res.json({ users: [] });

  const result = await pool.query(
    `SELECT u.id, u.username, u.avatar_url
     FROM users u
     WHERE LOWER(u.username) LIKE LOWER($1)
     AND u.id <> $2
     AND NOT EXISTS (
       SELECT 1 FROM blocked_users b
       WHERE (b.blocker_id = $2 AND b.blocked_id = u.id)
       OR (b.blocker_id = u.id AND b.blocked_id = $2)
     )
     ORDER BY u.username ASC
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
     AND NOT EXISTS (
       SELECT 1 FROM blocked_users b
       WHERE (b.blocker_id = $1 AND b.blocked_id = u.id)
       OR (b.blocker_id = u.id AND b.blocked_id = $1)
     )
     ORDER BY u.username ASC`,
    [req.user.id]
  );

  res.json({ friends: result.rows });
});

app.delete('/api/friends/:friendId', authMiddleware, async (req, res) => {
  const friendId = Number(req.params.friendId);
  if (!Number.isInteger(friendId)) return res.status(400).json({ error: 'Geçersiz kullanıcı.' });

  await pool.query(
    `DELETE FROM friendships
     WHERE status = 'accepted'
     AND ((requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1))`,
    [req.user.id, friendId]
  );

  emitToUser(friendId, 'friend_removed', { byId: req.user.id, byUsername: req.user.username });
  res.json({ ok: true, message: 'Arkadaş silindi.' });
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
    const targetResult = await pool.query('SELECT id, username FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    if (targetResult.rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

    const target = targetResult.rows[0];
    if (target.id === req.user.id) return res.status(400).json({ error: 'Kendine arkadaş isteği gönderemezsin.' });
    if (await isBlockedBetween(req.user.id, target.id)) return res.status(403).json({ error: 'Bu kullanıcıyla etkileşim engellenmiş.' });

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
    if (!['accept', 'reject'].includes(action)) return res.status(400).json({ error: 'Geçersiz işlem.' });

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
    if (await isBlockedBetween(row.requester_id, row.addressee_id)) return res.status(403).json({ error: 'Bu kullanıcıyla etkileşim engellenmiş.' });

    if (action === 'accept') {
      await pool.query('UPDATE friendships SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['accepted', requestId]);

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

app.get('/api/blocked', authMiddleware, async (req, res) => {
  const result = await pool.query(
    `SELECT b.id, u.id AS user_id, u.username, u.avatar_url, b.created_at
     FROM blocked_users b
     JOIN users u ON u.id = b.blocked_id
     WHERE b.blocker_id = $1
     ORDER BY b.created_at DESC`,
    [req.user.id]
  );

  res.json({ blocked: result.rows });
});

app.post('/api/block', authMiddleware, async (req, res) => {
  try {
    const userId = Number(req.body.userId);
    if (!Number.isInteger(userId)) return res.status(400).json({ error: 'Geçersiz kullanıcı.' });
    if (userId === req.user.id) return res.status(400).json({ error: 'Kendini engelleyemezsin.' });

    await pool.query(
      `INSERT INTO blocked_users (blocker_id, blocked_id)
       VALUES ($1, $2)
       ON CONFLICT (blocker_id, blocked_id) DO NOTHING`,
      [req.user.id, userId]
    );

    await pool.query(
      `DELETE FROM friendships
       WHERE (requester_id = $1 AND addressee_id = $2)
       OR (requester_id = $2 AND addressee_id = $1)`,
      [req.user.id, userId]
    );

    emitToUser(userId, 'blocked_by_user', { byId: req.user.id });
    res.json({ ok: true, message: 'Kullanıcı engellendi.' });
  } catch (error) {
    console.error('Engelleme hatası:', error);
    res.status(500).json({ error: 'Kullanıcı engellenemedi.' });
  }
});

app.delete('/api/block/:userId', authMiddleware, async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) return res.status(400).json({ error: 'Geçersiz kullanıcı.' });

  await pool.query('DELETE FROM blocked_users WHERE blocker_id = $1 AND blocked_id = $2', [req.user.id, userId]);
  res.json({ ok: true, message: 'Engel kaldırıldı.' });
});

/* DM */

app.get('/api/dm/:friendId', authMiddleware, async (req, res) => {
  const friendId = Number(req.params.friendId);
  if (!Number.isInteger(friendId)) return res.status(400).json({ error: 'Geçersiz kullanıcı.' });

  const ok = await areFriends(req.user.id, friendId);
  if (!ok) return res.status(403).json({ error: 'Bu kullanıcıyla arkadaş değilsin veya engel var.' });

  const result = await pool.query(
    `SELECT dm.id, dm.sender_id, dm.receiver_id, dm.text, dm.created_at, dm.edited_at, dm.deleted_at, dm.read_at,
            dm.message_type, dm.file_name, dm.file_mime, dm.file_data,
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

app.post('/api/dm/:friendId/read', authMiddleware, async (req, res) => {
  const friendId = Number(req.params.friendId);
  if (!Number.isInteger(friendId)) return res.status(400).json({ error: 'Geçersiz kullanıcı.' });

  await pool.query(
    `UPDATE dm_messages
     SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
     WHERE sender_id = $1 AND receiver_id = $2 AND read_at IS NULL`,
    [friendId, req.user.id]
  );

  emitToUser(friendId, 'dm_read', { byId: req.user.id });
  res.json({ ok: true });
});

/* REACTIONS */

app.post('/api/reactions', authMiddleware, async (req, res) => {
  try {
    const scope = String(req.body.scope || '');
    const messageId = Number(req.body.messageId);
    const emoji = cleanText(req.body.emoji, 20);

    if (!['room', 'dm'].includes(scope)) return res.status(400).json({ error: 'Geçersiz mesaj tipi.' });
    if (!Number.isInteger(messageId)) return res.status(400).json({ error: 'Geçersiz mesaj.' });
    if (!emoji) return res.status(400).json({ error: 'Emoji yok.' });

    if (scope === 'room') {
      const msg = await pool.query('SELECT id, room FROM messages WHERE id = $1 AND deleted_at IS NULL', [messageId]);
      if (msg.rows.length === 0) return res.status(404).json({ error: 'Mesaj bulunamadı.' });

      await pool.query(
        `INSERT INTO message_reactions (message_scope, message_id, user_id, emoji)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (message_scope, message_id, user_id, emoji) DO NOTHING`,
        [scope, messageId, req.user.id, emoji]
      );

      io.to(msg.rows[0].room).emit('reaction_added', {
        scope,
        messageId,
        emoji,
        username: req.user.username
      });

      return res.json({ ok: true });
    }

    const msg = await pool.query(
      `SELECT id, sender_id, receiver_id
       FROM dm_messages
       WHERE id = $1 AND deleted_at IS NULL
       AND (sender_id = $2 OR receiver_id = $2)`,
      [messageId, req.user.id]
    );

    if (msg.rows.length === 0) return res.status(404).json({ error: 'Mesaj bulunamadı.' });

    await pool.query(
      `INSERT INTO message_reactions (message_scope, message_id, user_id, emoji)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (message_scope, message_id, user_id, emoji) DO NOTHING`,
      [scope, messageId, req.user.id, emoji]
    );

    emitToUser(msg.rows[0].sender_id, 'reaction_added', {
      scope,
      messageId,
      emoji,
      username: req.user.username
    });

    emitToUser(msg.rows[0].receiver_id, 'reaction_added', {
      scope,
      messageId,
      emoji,
      username: req.user.username
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('Reaksiyon hatası:', error);
    res.status(500).json({ error: 'Reaksiyon eklenemedi.' });
  }
});

app.get('/api/reactions/:scope/:messageId', authMiddleware, async (req, res) => {
  const scope = String(req.params.scope || '');
  const messageId = Number(req.params.messageId);

  if (!['room', 'dm'].includes(scope) || !Number.isInteger(messageId)) {
    return res.status(400).json({ error: 'Geçersiz istek.' });
  }

  const result = await pool.query(
    `SELECT emoji, COUNT(*)::int AS count
     FROM message_reactions
     WHERE message_scope = $1 AND message_id = $2
     GROUP BY emoji
     ORDER BY emoji ASC`,
    [scope, messageId]
  );

  res.json({ reactions: result.rows });
});

/* NOTIFICATIONS */

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
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Geçersiz bildirim.' });

  await pool.query('DELETE FROM notifications WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  res.json({ ok: true });
});

app.delete('/api/notifications', authMiddleware, async (req, res) => {
  await pool.query('DELETE FROM notifications WHERE user_id = $1', [req.user.id]);
  res.json({ ok: true });
});

/* SOCKET */

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
      const payload = typeof message === 'object' && message !== null ? message : { text: message };
      const type = cleanText(payload.type || 'text', 20);
      const allowedTypes = ['text', 'image', 'file', 'audio'];
      const messageType = allowedTypes.includes(type) ? type : 'text';

      const text = cleanText(payload.text || '', 1000);
      const fileName = cleanText(payload.fileName || '', 200) || null;
      const fileMime = cleanText(payload.fileMime || '', 100) || null;
      const fileData = String(payload.fileData || '');

      if (!socket.data.room) return;
      if (messageType === 'text' && !text) return;
      if (messageType !== 'text' && !fileData.startsWith('data:')) return;
      if (fileData.length > 7200000) {
        socket.emit('system_message', 'Dosya çok büyük. 5 MB altı dosya gönder.');
        return;
      }

      const room = socket.data.room;
      const saved = await pool.query(
        `INSERT INTO messages (room, user_id, username, text, message_type, file_name, file_mime, file_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, room, username, text, created_at, edited_at, deleted_at, message_type, file_name, file_mime, file_data`,
        [room, socket.user.id, socket.user.username, text, messageType, fileName, fileMime, fileData || null]
      );

      const avatarResult = await pool.query('SELECT avatar_url FROM users WHERE id = $1', [socket.user.id]);
      const msg = saved.rows[0];

      io.to(room).emit('chat_message', {
        id: msg.id,
        username: msg.username,
        avatar_url: avatarResult.rows[0]?.avatar_url || null,
        text: msg.text,
        message_type: msg.message_type,
        file_name: msg.file_name,
        file_mime: msg.file_mime,
        file_data: msg.file_data,
        edited_at: msg.edited_at,
        deleted_at: msg.deleted_at,
        time: nowTime()
      });
    } catch (error) {
      console.error('Mesaj kayıt hatası:', error);
      socket.emit('system_message', 'Mesaj gönderilemedi.');
    }
  });

  socket.on('room_message_edit', async ({ messageId, text }) => {
    try {
      const id = Number(messageId);
      const newText = cleanText(text, 1000);
      if (!Number.isInteger(id) || !newText) return;

      const result = await pool.query(
        `UPDATE messages
         SET text = $1, edited_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND user_id = $3 AND deleted_at IS NULL
         RETURNING id, room, text, edited_at`,
        [newText, id, socket.user.id]
      );

      if (result.rows.length === 0) return;
      const msg = result.rows[0];
      io.to(msg.room).emit('room_message_updated', msg);
    } catch (error) {
      console.error('Oda mesaj düzenleme hatası:', error);
    }
  });

  socket.on('room_message_delete', async ({ messageId }) => {
    try {
      const id = Number(messageId);
      if (!Number.isInteger(id)) return;

      const result = await pool.query(
        `UPDATE messages
         SET text = 'Bu mesaj silindi.', deleted_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
         RETURNING id, room, text, deleted_at`,
        [id, socket.user.id]
      );

      if (result.rows.length === 0) return;
      const msg = result.rows[0];
      io.to(msg.room).emit('room_message_deleted', msg);
    } catch (error) {
      console.error('Oda mesaj silme hatası:', error);
    }
  });

  socket.on('dm_join', ({ friendId }) => {
    const targetId = Number(friendId);
    if (!Number.isInteger(targetId)) return;
    socket.join(dmRoom(socket.user.id, targetId));
  });

  socket.on('dm_typing', ({ receiverId }) => {
    const targetId = Number(receiverId);
    if (!Number.isInteger(targetId)) return;
    emitToUser(targetId, 'dm_typing', { fromId: socket.user.id, fromUsername: socket.user.username });
  });

  socket.on('dm_message', async (payload) => {
    try {
      const receiverId = payload?.receiverId;
      const type = cleanText(payload?.type || 'text', 20);
      const allowedTypes = ['text', 'image', 'file', 'audio'];
      const messageType = allowedTypes.includes(type) ? type : 'text';

      const cleanMessage = cleanText(payload?.text || '', 1000);
      const fileName = cleanText(payload?.fileName || '', 200) || null;
      const fileMime = cleanText(payload?.fileMime || '', 100) || null;
      const fileData = String(payload?.fileData || '');
      const targetId = Number(receiverId);

      if (!Number.isInteger(targetId)) return;
      if (messageType === 'text' && !cleanMessage) return;
      if (messageType !== 'text' && !fileData.startsWith('data:')) return;
      if (fileData.length > 7200000) {
        socket.emit('notification', { type: 'error', payload: { message: 'Dosya çok büyük. 5 MB altı dosya gönder.' } });
        return;
      }

      const ok = await areFriends(socket.user.id, targetId);
      if (!ok) {
        socket.emit('notification', { type: 'error', payload: { message: 'DM göndermek için arkadaş olmanız ve engel olmaması gerekiyor.' } });
        return;
      }

      const saved = await pool.query(
        `INSERT INTO dm_messages (sender_id, receiver_id, text, message_type, file_name, file_mime, file_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, sender_id, receiver_id, text, created_at, edited_at, deleted_at, read_at, message_type, file_name, file_mime, file_data`,
        [socket.user.id, targetId, cleanMessage, messageType, fileName, fileMime, fileData || null]
      );

      const avatarResult = await pool.query('SELECT avatar_url FROM users WHERE id = $1', [socket.user.id]);

      const msg = {
        id: saved.rows[0].id,
        sender_id: saved.rows[0].sender_id,
        receiver_id: saved.rows[0].receiver_id,
        sender_username: socket.user.username,
        sender_avatar_url: avatarResult.rows[0]?.avatar_url || null,
        text: saved.rows[0].text,
        message_type: saved.rows[0].message_type,
        file_name: saved.rows[0].file_name,
        file_mime: saved.rows[0].file_mime,
        file_data: saved.rows[0].file_data,
        edited_at: saved.rows[0].edited_at,
        deleted_at: saved.rows[0].deleted_at,
        read_at: saved.rows[0].read_at,
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
      socket.emit('notification', { type: 'error', payload: { message: 'DM gönderilemedi.' } });
    }
  });

  socket.on('dm_message_edit', async ({ messageId, text }) => {
    try {
      const id = Number(messageId);
      const newText = cleanText(text, 1000);
      if (!Number.isInteger(id) || !newText) return;

      const result = await pool.query(
        `UPDATE dm_messages
         SET text = $1, edited_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND sender_id = $3 AND deleted_at IS NULL
         RETURNING id, sender_id, receiver_id, text, edited_at`,
        [newText, id, socket.user.id]
      );

      if (result.rows.length === 0) return;
      const msg = result.rows[0];
      emitToUser(msg.sender_id, 'dm_message_updated', msg);
      emitToUser(msg.receiver_id, 'dm_message_updated', msg);
    } catch (error) {
      console.error('DM düzenleme hatası:', error);
    }
  });

  socket.on('dm_message_delete', async ({ messageId }) => {
    try {
      const id = Number(messageId);
      if (!Number.isInteger(id)) return;

      const result = await pool.query(
        `UPDATE dm_messages
         SET text = 'Bu mesaj silindi.', deleted_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND sender_id = $2 AND deleted_at IS NULL
         RETURNING id, sender_id, receiver_id, text, deleted_at`,
        [id, socket.user.id]
      );

      if (result.rows.length === 0) return;
      const msg = result.rows[0];
      emitToUser(msg.sender_id, 'dm_message_deleted', msg);
      emitToUser(msg.receiver_id, 'dm_message_deleted', msg);
    } catch (error) {
      console.error('DM silme hatası:', error);
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
