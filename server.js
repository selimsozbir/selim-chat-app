const express = require('express');
const http = require('http');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const crypto = require('crypto');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 12 * 1024 * 1024 });

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this';
const OWNER_USERNAME = String(process.env.OWNER_USERNAME || 'selim').toLowerCase();
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '');
const SUPABASE_BUCKET = String(process.env.SUPABASE_BUCKET || 'chat-uploads');

app.set('trust proxy', true);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

function storageEnabled() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && SUPABASE_BUCKET);
}

function safeFileName(name) {
  return String(name || 'file')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120) || 'file';
}

function storagePublicUrl(objectPath) {
  return `${SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(SUPABASE_BUCKET)}/${objectPath.split('/').map(encodeURIComponent).join('/')}`;
}

async function uploadToSupabaseStorage(file, userId) {
  if (!storageEnabled()) {
    const error = new Error('Storage ayarlı değil. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_BUCKET kontrol et.');
    error.status = 500;
    throw error;
  }

  if (!file) {
    const error = new Error('Dosya yok.');
    error.status = 400;
    throw error;
  }

  const mime = file.mimetype || 'application/octet-stream';
  const allowed = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'audio/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4',
    'application/pdf', 'text/plain', 'application/zip', 'application/x-zip-compressed',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];

  if (!allowed.includes(mime) && !mime.startsWith('image/') && !mime.startsWith('audio/')) {
    const error = new Error('Bu dosya tipi desteklenmiyor.');
    error.status = 400;
    throw error;
  }

  let folder = 'files';
  if (mime.startsWith('image/')) folder = 'images';
  if (mime.startsWith('audio/')) folder = 'audio';

  const cleanOriginal = safeFileName(file.originalname);
  const extFromName = cleanOriginal.includes('.') ? cleanOriginal.split('.').pop() : '';
  const ext = extFromName && extFromName.length <= 8 ? extFromName : 'bin';
  const objectPath = `${folder}/${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/');
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(SUPABASE_BUCKET)}/${encodedPath}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  let response;
  try {
    response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': mime,
        'x-upsert': 'false'
      },
      body: file.buffer,
      signal: controller.signal
    });
  } catch (error) {
    clearTimeout(timeout);
    const err = new Error(error.name === 'AbortError'
      ? 'Storage upload zaman aşımına uğradı. Bucket/key ayarlarını kontrol et.'
      : `Storage bağlantı hatası: ${error.message}`);
    err.status = 500;
    throw err;
  }

  clearTimeout(timeout);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const error = new Error(`Storage upload başarısız: HTTP ${response.status} ${text.slice(0, 200)}`);
    error.status = 500;
    throw error;
  }

  return {
    url: storagePublicUrl(objectPath),
    path: objectPath,
    mime,
    name: cleanOriginal,
    size: file.size
  };
}

const onlineUsers = new Map();
const userSockets = new Map();

function nowTime() {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || '';
}

function getClientUserAgent(req) {
  return String(req.headers['user-agent'] || '').slice(0, 300);
}

async function isIpBanned(ip) {
  if (!ip) return false;
  const result = await pool.query('SELECT id FROM ip_bans WHERE ip = $1 LIMIT 1', [ip]);
  return result.rows.length > 0;
}

function isGlobalStaff(role) {
  return ['owner', 'admin', 'mod'].includes(role);
}

function canOpenAdmin(role) {
  return role === 'owner' || role === 'admin';
}

function canControlUser(actorRole, targetRole) {
  if (actorRole === 'owner') return true;
  if (actorRole === 'admin') return !['owner', 'admin'].includes(targetRole);
  return false;
}

async function requireGlobalAdmin(req, res, next) {
  const result = await pool.query('SELECT id, username, global_role, is_banned FROM users WHERE id = $1', [req.user.id]);
  const actor = result.rows[0];

  if (!actor || actor.is_banned) return res.status(403).json({ error: 'Yetkin yok.' });
  if (!canOpenAdmin(actor.global_role)) return res.status(403).json({ error: 'Admin panel yetkin yok.' });

  req.adminUser = actor;
  next();
}

function createToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token yok.' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);

    const ip = getClientIp(req);
    const userAgent = getClientUserAgent(req);

    if (await isIpBanned(ip)) {
      return res.status(403).json({ error: 'Bu IP adresi banlı.' });
    }

    const userResult = await pool.query('SELECT is_banned, ban_reason FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows[0]?.is_banned) {
      return res.status(403).json({ error: userResult.rows[0].ban_reason || 'Bu hesap banlı.' });
    }

    await pool.query(
      `UPDATE users
       SET last_ip = $1, last_user_agent = $2, last_active = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [ip, userAgent, req.user.id]
    );

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

async function getRoomRole(room, userId) {
  const result = await pool.query(
    'SELECT role FROM room_roles WHERE room = $1 AND user_id = $2',
    [room, userId]
  );
  return result.rows[0]?.role || null;
}

function canModerate(role) {
  return role === 'admin' || role === 'mod';
}

async function ensureRoomHasAdmin(room, userId) {
  const result = await pool.query('SELECT id FROM room_roles WHERE room = $1 AND role = $2 LIMIT 1', [room, 'admin']);
  if (result.rows.length === 0) {
    await pool.query(
      `INSERT INTO room_roles (room, user_id, role)
       VALUES ($1, $2, 'admin')
       ON CONFLICT (room, user_id) DO UPDATE SET role = 'admin'`,
      [room, userId]
    );
    return 'admin';
  }

  return await getRoomRole(room, userId);
}

async function isRoomBanned(room, userId) {
  const result = await pool.query('SELECT id FROM room_bans WHERE room = $1 AND user_id = $2', [room, userId]);
  return result.rows.length > 0;
}

async function isRoomMuted(room, userId) {
  const result = await pool.query('SELECT id FROM room_mutes WHERE room = $1 AND user_id = $2', [room, userId]);
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

function extractMentions(text) {
  const matches = String(text || '').match(/@[a-zA-Z0-9_ğüşöçıİĞÜŞÖÇ.\-]+/g) || [];
  return Array.from(new Set(matches.map((m) => m.slice(1).toLowerCase())));
}

async function notifyRoomMentions({ room, text, senderId, senderUsername }) {
  const mentions = extractMentions(text);
  if (mentions.length === 0) return;

  const usersInRoom = Array.from(onlineUsers.values())
    .filter((u) => u.room === room && u.id !== senderId);

  const targetIds = new Set();

  if (mentions.includes('everyone')) {
    usersInRoom.forEach((u) => targetIds.add(u.id));
  } else {
    usersInRoom.forEach((u) => {
      if (mentions.includes(String(u.username || '').toLowerCase())) {
        targetIds.add(u.id);
      }
    });
  }

  for (const userId of targetIds) {
    await createNotification(userId, mentions.includes('everyone') ? 'mention_everyone' : 'mention', {
      room,
      fromId: senderId,
      fromUsername: senderUsername,
      text: String(text || '').slice(0, 120)
    });
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

  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(40)`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS global_role VARCHAR(20) DEFAULT 'user'`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_ip TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_user_agent TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ip_bans (
      id SERIAL PRIMARY KEY,
      ip TEXT UNIQUE NOT NULL,
      reason TEXT,
      banned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
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
  await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_path TEXT`);
  await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_size INTEGER`);

  await pool.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text'`);
  await pool.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS file_name TEXT`);
  await pool.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS file_mime TEXT`);
  await pool.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS file_data TEXT`);
  await pool.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS file_path TEXT`);
  await pool.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS file_size INTEGER`);

  await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id INTEGER`);
  await pool.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS reply_to_id INTEGER`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS room_roles (
      id SERIAL PRIMARY KEY,
      room VARCHAR(50) NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (room, user_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS room_bans (
      id SERIAL PRIMARY KEY,
      room VARCHAR(50) NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      banned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (room, user_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS room_mutes (
      id SERIAL PRIMARY KEY,
      room VARCHAR(50) NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      muted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (room, user_id)
    );
  `);

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

  const preferred = await pool.query('SELECT id FROM users WHERE LOWER(username) = $1 LIMIT 1', [OWNER_USERNAME]);

  if (preferred.rows.length > 0) {
    await pool.query(`UPDATE users SET global_role = 'user' WHERE global_role = 'owner' AND id <> $1`, [preferred.rows[0].id]);
    await pool.query(`UPDATE users SET global_role = 'owner' WHERE id = $1`, [preferred.rows[0].id]);
    console.log(`Owner senkronlandı: ${OWNER_USERNAME}`);
  } else {
    const ownerCount = await pool.query(`SELECT id FROM users WHERE global_role = 'owner' LIMIT 1`);
    if (ownerCount.rows.length === 0) {
      await pool.query(
        `UPDATE users SET global_role = 'owner'
         WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1)`
      );
      console.log('Owner otomatik en eski kullanıcıya verildi.');
    } else {
      console.log(`OWNER_USERNAME bulunamadı: ${OWNER_USERNAME}`);
    }
  }

  console.log('Database tabloları hazır.');
}

/* AUTH */

app.post('/api/register', async (req, res) => {
  try {
    const ip = getClientIp(req);
    if (await isIpBanned(ip)) return res.status(403).json({ error: 'Bu IP adresi banlı.' });

    const username = cleanText(req.body.username, 30);
    const password = String(req.body.password || '');

    if (username.length < 3) return res.status(400).json({ error: 'Kullanıcı adı en az 3 karakter olmalı.' });
    if (password.length < 6) return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı.' });

    const existing = await pool.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Bu kullanıcı adı zaten alınmış.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, display_name, last_ip, last_user_agent, last_active)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING id, username, display_name, avatar_url, bio, global_role, last_seen`,
      [username, passwordHash, username, ip, getClientUserAgent(req)]
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
    const ip = getClientIp(req);
    if (await isIpBanned(ip)) return res.status(403).json({ error: 'Bu IP adresi banlı.' });

    const username = cleanText(req.body.username, 30);
    const password = String(req.body.password || '');

    const result = await pool.query(
      'SELECT id, username, display_name, password_hash, avatar_url, bio, global_role, is_banned, ban_reason, last_seen FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );

    if (result.rows.length === 0) return res.status(400).json({ error: 'Kullanıcı adı veya şifre yanlış.' });

    const dbUser = result.rows[0];
    const isCorrect = await bcrypt.compare(password, dbUser.password_hash);
    if (!isCorrect) return res.status(400).json({ error: 'Kullanıcı adı veya şifre yanlış.' });

    if (dbUser.is_banned) return res.status(403).json({ error: dbUser.ban_reason || 'Bu hesap banlı.' });

    await pool.query(
      `UPDATE users
       SET last_ip = $1, last_user_agent = $2, last_active = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [ip, getClientUserAgent(req), dbUser.id]
    );

    const user = {
      id: dbUser.id,
      username: dbUser.username,
      display_name: dbUser.display_name || dbUser.username,
      avatar_url: dbUser.avatar_url,
      bio: dbUser.bio,
      global_role: dbUser.global_role,
      last_seen: dbUser.last_seen
    };
    res.json({ token: createToken(user), user });
  } catch (error) {
    console.error('Login hatası:', error);
    res.status(500).json({ error: 'Giriş yaparken hata oluştu.' });
  }
});

app.get('/api/me', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT id, username, display_name, avatar_url, bio, global_role, last_seen, last_active FROM users WHERE id = $1', [req.user.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
  res.json({ user: { ...result.rows[0], online: userSockets.has(String(req.user.id)) } });
});

app.get('/api/profile/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Geçersiz kullanıcı.' });

  const result = await pool.query(
    `SELECT id, username, display_name, avatar_url, bio, global_role, created_at, last_seen, last_active
     FROM users WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

  const profile = result.rows[0];
  res.json({
    profile: {
      ...profile,
      online: userSockets.has(String(id))
    }
  });
});

app.post('/api/profile/bio', authMiddleware, async (req, res) => {
  const bio = cleanText(req.body.bio, 160);
  const result = await pool.query(
    'UPDATE users SET bio = $1 WHERE id = $2 RETURNING id, username, display_name, avatar_url, bio, global_role, last_seen',
    [bio, req.user.id]
  );

  res.json({ user: { ...result.rows[0], online: userSockets.has(String(req.user.id)) } });
});

/* GLOBAL ADMIN */

app.get('/api/admin/me', authMiddleware, async (req, res) => {
  const result = await pool.query(
    'SELECT id, username, display_name, avatar_url, global_role FROM users WHERE id = $1',
    [req.user.id]
  );

  const me = result.rows[0];
  res.json({ me, canOpenAdmin: canOpenAdmin(me?.global_role) });
});

app.get('/api/admin/users', authMiddleware, requireGlobalAdmin, async (req, res) => {
  const result = await pool.query(
    `SELECT id, username, display_name, avatar_url, global_role, is_banned, ban_reason,
            last_ip, last_user_agent, last_active, last_seen, created_at
     FROM users
     ORDER BY last_active DESC NULLS LAST, created_at DESC
     LIMIT 100`
  );

  res.json({
    users: result.rows.map((u) => ({
      ...u,
      online: userSockets.has(String(u.id))
    }))
  });
});

app.patch('/api/admin/users/:id', authMiddleware, requireGlobalAdmin, async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isInteger(targetId)) return res.status(400).json({ error: 'Geçersiz kullanıcı.' });

  const targetResult = await pool.query('SELECT id, username, global_role FROM users WHERE id = $1', [targetId]);
  if (targetResult.rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

  const target = targetResult.rows[0];
  if (!canControlUser(req.adminUser.global_role, target.global_role)) {
    return res.status(403).json({ error: 'Bu kullanıcı üzerinde yetkin yok.' });
  }

  const displayName = req.body.displayName !== undefined ? cleanText(req.body.displayName, 40) : undefined;
  const globalRole = req.body.globalRole !== undefined ? String(req.body.globalRole || '') : undefined;
  const isBanned = req.body.isBanned !== undefined ? Boolean(req.body.isBanned) : undefined;
  const banReason = req.body.banReason !== undefined ? cleanText(req.body.banReason, 200) : undefined;

  if (globalRole !== undefined) {
    if (req.adminUser.global_role !== 'owner') return res.status(403).json({ error: 'Rol değiştirmeyi sadece owner yapabilir.' });
    if (!['owner', 'admin', 'mod', 'user'].includes(globalRole)) return res.status(400).json({ error: 'Geçersiz rol.' });
    await pool.query('UPDATE users SET global_role = $1 WHERE id = $2', [globalRole, targetId]);
  }

  if (displayName !== undefined) {
    await pool.query('UPDATE users SET display_name = $1 WHERE id = $2', [displayName || target.username, targetId]);
  }

  if (isBanned !== undefined) {
    await pool.query('UPDATE users SET is_banned = $1, ban_reason = $2 WHERE id = $3', [isBanned, isBanned ? (banReason || 'Banlandı.') : null, targetId]);

    if (isBanned) {
      emitToUser(targetId, 'global_banned', { reason: banReason || 'Banlandı.' });
    }
  } else if (banReason !== undefined) {
    await pool.query('UPDATE users SET ban_reason = $1 WHERE id = $2', [banReason, targetId]);
  }

  res.json({ ok: true, message: 'Kullanıcı güncellendi.' });
});

app.get('/api/admin/ip-bans', authMiddleware, requireGlobalAdmin, async (req, res) => {
  const result = await pool.query(
    `SELECT ib.id, ib.ip, ib.reason, ib.created_at, u.username AS banned_by_username
     FROM ip_bans ib
     LEFT JOIN users u ON u.id = ib.banned_by
     ORDER BY ib.created_at DESC`
  );

  res.json({ bans: result.rows });
});

app.post('/api/admin/ip-bans', authMiddleware, requireGlobalAdmin, async (req, res) => {
  const ip = cleanText(req.body.ip, 100);
  const reason = cleanText(req.body.reason, 200);

  if (!ip) return res.status(400).json({ error: 'IP yok.' });

  await pool.query(
    `INSERT INTO ip_bans (ip, reason, banned_by)
     VALUES ($1, $2, $3)
     ON CONFLICT (ip) DO UPDATE SET reason = EXCLUDED.reason, banned_by = EXCLUDED.banned_by`,
    [ip, reason || 'IP banlandı.', req.user.id]
  );

  res.json({ ok: true, message: 'IP banlandı.' });
});

app.delete('/api/admin/ip-bans/:id', authMiddleware, requireGlobalAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Geçersiz IP ban.' });

  await pool.query('DELETE FROM ip_bans WHERE id = $1', [id]);
  res.json({ ok: true, message: 'IP ban kaldırıldı.' });
});

/* PROFILE */

app.post('/api/avatar', authMiddleware, async (req, res) => {
  try {
    const avatarData = String(req.body.avatarData || '');
    if (!avatarData.startsWith('data:image/')) return res.status(400).json({ error: 'Geçerli bir resim seç.' });
    if (avatarData.length > 1500000) return res.status(400).json({ error: 'Profil fotoğrafı çok büyük. Daha küçük görsel seç.' });

    const result = await pool.query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, username, display_name, avatar_url, bio, global_role, last_seen',
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
      'UPDATE users SET avatar_url = NULL WHERE id = $1 RETURNING id, username, display_name, avatar_url, bio, global_role, last_seen',
      [req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Avatar kaldırma hatası:', error);
    res.status(500).json({ error: 'Profil fotoğrafı kaldırılamadı.' });
  }
});

/* STORAGE UPLOAD */

app.get('/api/storage-status', authMiddleware, async (req, res) => {
  res.json({
    storageEnabled: storageEnabled(),
    hasSupabaseUrl: Boolean(SUPABASE_URL),
    hasServiceKey: Boolean(SUPABASE_SERVICE_ROLE_KEY),
    bucket: SUPABASE_BUCKET || null,
    supabaseUrlPreview: SUPABASE_URL ? `${SUPABASE_URL.slice(0, 24)}...` : null
  });
});

app.post('/api/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    console.log('Upload isteği geldi:', {
      userId: req.user.id,
      fileName: req.file?.originalname,
      mime: req.file?.mimetype,
      size: req.file?.size,
      storageEnabled: storageEnabled(),
      bucket: SUPABASE_BUCKET
    });

    const uploaded = await uploadToSupabaseStorage(req.file, req.user.id);

    let type = 'file';
    if (uploaded.mime.startsWith('image/')) type = 'image';
    if (uploaded.mime.startsWith('audio/')) type = 'audio';

    console.log('Upload başarılı:', uploaded.path);

    res.json({
      ok: true,
      file: {
        type,
        fileName: uploaded.name,
        fileMime: uploaded.mime,
        fileUrl: uploaded.url,
        filePath: uploaded.path,
        fileSize: uploaded.size
      }
    });
  } catch (error) {
    console.error('Upload hatası:', error.message);
    res.status(error.status || 500).json({ error: error.message || 'Dosya yüklenemedi.' });
  }
});

/* ROOM MESSAGES */

app.get('/api/messages/:room', authMiddleware, async (req, res) => {
  const room = cleanText(req.params.room, 50).toLowerCase() || 'genel';

  const result = await pool.query(
    `SELECT m.id, m.room, m.username, m.text, m.created_at, m.edited_at, m.deleted_at,
            m.message_type, m.file_name, m.file_mime, m.file_data, m.file_path, m.file_size, m.reply_to_id,
            u.avatar_url,
            rm.username AS reply_username,
            rm.text AS reply_text
     FROM messages m
     LEFT JOIN users u ON u.id = m.user_id
     LEFT JOIN messages rm ON rm.id = m.reply_to_id
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
    `SELECT u.id, u.username, u.avatar_url, u.last_seen
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

app.get('/api/room/:room/members', authMiddleware, async (req, res) => {
  const room = cleanText(req.params.room, 50).toLowerCase() || 'genel';

  const socketUsers = Array.from(onlineUsers.values())
    .filter((u) => u.room === room);

  const ids = Array.from(new Set(socketUsers.map((u) => u.id)));

  if (ids.length === 0) return res.json({ members: [] });

  const result = await pool.query(
    `SELECT u.id, u.username, u.avatar_url, u.bio, u.last_seen, rr.role
     FROM users u
     LEFT JOIN room_roles rr ON rr.room = $1 AND rr.user_id = u.id
     WHERE u.id = ANY($2::int[])
     ORDER BY u.username ASC`,
    [room, ids]
  );

  res.json({
    members: result.rows.map((u) => ({ ...u, online: userSockets.has(String(u.id)) }))
  });
});

app.get('/api/search/messages', authMiddleware, async (req, res) => {
  const q = cleanText(req.query.q, 80);
  const scope = String(req.query.scope || 'room');

  if (q.length < 2) return res.json({ results: [] });

  if (scope === 'dm') {
    const friendId = Number(req.query.friendId);
    if (!Number.isInteger(friendId)) return res.status(400).json({ error: 'Geçersiz DM.' });

    const ok = await areFriends(req.user.id, friendId);
    if (!ok) return res.status(403).json({ error: 'Bu kullanıcıyla arama yapamazsın.' });

    const result = await pool.query(
      `SELECT dm.id, dm.text, dm.created_at, dm.sender_id, u.username
       FROM dm_messages dm
       JOIN users u ON u.id = dm.sender_id
       WHERE dm.deleted_at IS NULL
       AND dm.text ILIKE $1
       AND ((dm.sender_id = $2 AND dm.receiver_id = $3) OR (dm.sender_id = $3 AND dm.receiver_id = $2))
       ORDER BY dm.created_at DESC
       LIMIT 20`,
      [`%${q}%`, req.user.id, friendId]
    );

    return res.json({ results: result.rows });
  }

  const room = cleanText(req.query.room, 50).toLowerCase() || 'genel';
  const result = await pool.query(
    `SELECT id, text, username, created_at
     FROM messages
     WHERE room = $1 AND deleted_at IS NULL AND text ILIKE $2
     ORDER BY created_at DESC
     LIMIT 20`,
    [room, `%${q}%`]
  );

  res.json({ results: result.rows });
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

/* ROOM MODERATION */

app.get('/api/room/:room/moderation', authMiddleware, async (req, res) => {
  const room = cleanText(req.params.room, 50).toLowerCase() || 'genel';
  const myRole = await getRoomRole(room, req.user.id);

  const roles = await pool.query(
    `SELECT rr.user_id, rr.role, u.username, u.avatar_url
     FROM room_roles rr
     JOIN users u ON u.id = rr.user_id
     WHERE rr.room = $1
     ORDER BY rr.role ASC, u.username ASC`,
    [room]
  );

  const bans = await pool.query(
    `SELECT rb.user_id, u.username, u.avatar_url, rb.created_at
     FROM room_bans rb
     JOIN users u ON u.id = rb.user_id
     WHERE rb.room = $1
     ORDER BY rb.created_at DESC`,
    [room]
  );

  const mutes = await pool.query(
    `SELECT rm.user_id, u.username, u.avatar_url, rm.created_at
     FROM room_mutes rm
     JOIN users u ON u.id = rm.user_id
     WHERE rm.room = $1
     ORDER BY rm.created_at DESC`,
    [room]
  );

  res.json({ myRole, roles: roles.rows, bans: bans.rows, mutes: mutes.rows });
});

app.post('/api/room/:room/moderate', authMiddleware, async (req, res) => {
  const room = cleanText(req.params.room, 50).toLowerCase() || 'genel';
  const action = String(req.body.action || '');
  const targetId = Number(req.body.userId);

  if (!Number.isInteger(targetId)) return res.status(400).json({ error: 'Geçersiz kullanıcı.' });
  if (targetId === req.user.id) return res.status(400).json({ error: 'Kendine işlem yapamazsın.' });

  const myRole = await getRoomRole(room, req.user.id);
  if (!canModerate(myRole)) return res.status(403).json({ error: 'Yetkin yok.' });

  const targetRole = await getRoomRole(room, targetId);
  if (targetRole === 'admin' && myRole !== 'admin') return res.status(403).json({ error: 'Admin üzerinde işlem yapamazsın.' });

  if (action === 'mod') {
    if (myRole !== 'admin') return res.status(403).json({ error: 'Sadece admin mod yapabilir.' });
    await pool.query(
      `INSERT INTO room_roles (room, user_id, role)
       VALUES ($1, $2, 'mod')
       ON CONFLICT (room, user_id) DO UPDATE SET role = 'mod'`,
      [room, targetId]
    );
  } else if (action === 'unmod') {
    if (myRole !== 'admin') return res.status(403).json({ error: 'Sadece admin modu alabilir.' });
    await pool.query(`DELETE FROM room_roles WHERE room = $1 AND user_id = $2 AND role = 'mod'`, [room, targetId]);
  } else if (action === 'mute') {
    await pool.query(
      `INSERT INTO room_mutes (room, user_id, muted_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (room, user_id) DO NOTHING`,
      [room, targetId, req.user.id]
    );
  } else if (action === 'unmute') {
    await pool.query('DELETE FROM room_mutes WHERE room = $1 AND user_id = $2', [room, targetId]);
  } else if (action === 'ban') {
    await pool.query(
      `INSERT INTO room_bans (room, user_id, banned_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (room, user_id) DO NOTHING`,
      [room, targetId, req.user.id]
    );
    await pool.query('DELETE FROM room_mutes WHERE room = $1 AND user_id = $2', [room, targetId]);
    emitToUser(targetId, 'room_banned', { room });
  } else if (action === 'unban') {
    await pool.query('DELETE FROM room_bans WHERE room = $1 AND user_id = $2', [room, targetId]);
  } else if (action === 'kick') {
    emitToUser(targetId, 'room_kicked', { room });
  } else {
    return res.status(400).json({ error: 'Geçersiz işlem.' });
  }

  res.json({ ok: true, message: 'İşlem yapıldı.' });
});

/* DM */

app.get('/api/dm/:friendId', authMiddleware, async (req, res) => {
  const friendId = Number(req.params.friendId);
  if (!Number.isInteger(friendId)) return res.status(400).json({ error: 'Geçersiz kullanıcı.' });

  const ok = await areFriends(req.user.id, friendId);
  if (!ok) return res.status(403).json({ error: 'Bu kullanıcıyla arkadaş değilsin veya engel var.' });

  const result = await pool.query(
    `SELECT dm.id, dm.sender_id, dm.receiver_id, dm.text, dm.created_at, dm.edited_at, dm.deleted_at, dm.read_at,
            dm.message_type, dm.file_name, dm.file_mime, dm.file_data, dm.file_path, dm.file_size, dm.reply_to_id,
            sender.username AS sender_username,
            sender.avatar_url AS sender_avatar_url,
            rdm.text AS reply_text,
            reply_sender.username AS reply_username
     FROM dm_messages dm
     JOIN users sender ON sender.id = dm.sender_id
     LEFT JOIN dm_messages rdm ON rdm.id = dm.reply_to_id
     LEFT JOIN users reply_sender ON reply_sender.id = rdm.sender_id
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

async function getReactionState(scope, messageId) {
  const result = await pool.query(
    `SELECT r.emoji,
            COUNT(*)::int AS count,
            COALESCE(json_agg(json_build_object('id', u.id, 'username', u.username) ORDER BY u.username), '[]') AS users
     FROM message_reactions r
     JOIN users u ON u.id = r.user_id
     WHERE r.message_scope = $1 AND r.message_id = $2
     GROUP BY r.emoji
     ORDER BY r.emoji ASC`,
    [scope, messageId]
  );

  return result.rows;
}

async function emitReactionState(scope, messageId, state) {
  if (scope === 'room') {
    const msg = await pool.query('SELECT room FROM messages WHERE id = $1', [messageId]);
    if (msg.rows.length > 0) {
      io.to(msg.rows[0].room).emit('reaction_state', { scope, messageId, reactions: state });
    }
    return;
  }

  const msg = await pool.query('SELECT sender_id, receiver_id FROM dm_messages WHERE id = $1', [messageId]);
  if (msg.rows.length > 0) {
    emitToUser(msg.rows[0].sender_id, 'reaction_state', { scope, messageId, reactions: state });
    emitToUser(msg.rows[0].receiver_id, 'reaction_state', { scope, messageId, reactions: state });
  }
}

app.post('/api/reactions', authMiddleware, async (req, res) => {
  try {
    const scope = String(req.body.scope || '');
    const messageId = Number(req.body.messageId);
    const emoji = cleanText(req.body.emoji, 20);

    if (!['room', 'dm'].includes(scope)) return res.status(400).json({ error: 'Geçersiz mesaj tipi.' });
    if (!Number.isInteger(messageId)) return res.status(400).json({ error: 'Geçersiz mesaj.' });
    if (!['👍', '😂', '❤️', '🔥', '😘'].includes(emoji)) return res.status(400).json({ error: 'Geçersiz emoji.' });

    if (scope === 'room') {
      const msg = await pool.query('SELECT id, room FROM messages WHERE id = $1 AND deleted_at IS NULL', [messageId]);
      if (msg.rows.length === 0) return res.status(404).json({ error: 'Mesaj bulunamadı.' });

      await pool.query('DELETE FROM message_reactions WHERE message_scope = $1 AND message_id = $2 AND user_id = $3', [scope, messageId, req.user.id]);

      await pool.query(
        `INSERT INTO message_reactions (message_scope, message_id, user_id, emoji)
         VALUES ($1, $2, $3, $4)`,
        [scope, messageId, req.user.id, emoji]
      );

      const state = await getReactionState(scope, messageId);
      await emitReactionState(scope, messageId, state);

      return res.json({ ok: true, reactions: state });
    }

    const msg = await pool.query(
      `SELECT id, sender_id, receiver_id
       FROM dm_messages
       WHERE id = $1 AND deleted_at IS NULL
       AND (sender_id = $2 OR receiver_id = $2)`,
      [messageId, req.user.id]
    );

    if (msg.rows.length === 0) return res.status(404).json({ error: 'Mesaj bulunamadı.' });

    await pool.query('DELETE FROM message_reactions WHERE message_scope = $1 AND message_id = $2 AND user_id = $3', [scope, messageId, req.user.id]);

    await pool.query(
      `INSERT INTO message_reactions (message_scope, message_id, user_id, emoji)
       VALUES ($1, $2, $3, $4)`,
      [scope, messageId, req.user.id, emoji]
    );

    const state = await getReactionState(scope, messageId);
    await emitReactionState(scope, messageId, state);

    res.json({ ok: true, reactions: state });
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

  const reactions = await getReactionState(scope, messageId);
  res.json({ reactions });
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

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Token yok.'));

  try {
    socket.user = jwt.verify(token, JWT_SECRET);

    const ip = String(socket.handshake.headers['x-forwarded-for'] || socket.handshake.address || '').split(',')[0].trim();
    const userAgent = String(socket.handshake.headers['user-agent'] || '').slice(0, 300);

    if (await isIpBanned(ip)) return next(new Error('Bu IP adresi banlı.'));

    const userResult = await pool.query(
      'SELECT is_banned, ban_reason FROM users WHERE id = $1',
      [socket.user.id]
    );

    if (userResult.rows[0]?.is_banned) {
      return next(new Error(userResult.rows[0].ban_reason || 'Bu hesap banlı.'));
    }

    await pool.query(
      `UPDATE users
       SET last_ip = $1, last_user_agent = $2, last_active = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [ip, userAgent, socket.user.id]
    );

    next();
  } catch (error) {
    next(new Error(error.message || 'Geçersiz token.'));
  }
});

io.on('connection', (socket) => {
  addSocketForUser(socket.user.id, socket.id);

  socket.on('join', async ({ room }) => {
    const cleanRoom = cleanText(room, 50).toLowerCase() || 'genel';

    if (await isRoomBanned(cleanRoom, socket.user.id)) {
      socket.emit('system_message', 'Bu odadan banlandın.');
      return;
    }

    const role = await ensureRoomHasAdmin(cleanRoom, socket.user.id);

    if (socket.data.room) socket.leave(socket.data.room);
    socket.data.room = cleanRoom;
    socket.join(cleanRoom);

    onlineUsers.set(socket.id, { id: socket.user.id, username: socket.user.username, room: cleanRoom });
    socket.emit('room_role', { room: cleanRoom, role });
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
      const filePath = cleanText(payload.filePath || '', 500) || null;
      const fileSize = Number(payload.fileSize) || null;

      if (!socket.data.room) return;
      if (messageType === 'text' && !text) return;
      if (messageType !== 'text' && !fileData.startsWith('data:')) return;
      if (fileData.length > 7200000) {
        socket.emit('system_message', 'Dosya çok büyük. 5 MB altı dosya gönder.');
        return;
      }

      const room = socket.data.room;

      if (await isRoomBanned(room, socket.user.id)) {
        socket.emit('system_message', 'Bu odadan banlandın.');
        return;
      }

      if (await isRoomMuted(room, socket.user.id)) {
        socket.emit('system_message', 'Bu odada susturuldun.');
        return;
      }

      let replyToId = Number(payload.replyToId);
      if (!Number.isInteger(replyToId)) replyToId = null;

      let replyInfo = null;
      if (replyToId) {
        const replyResult = await pool.query(
          `SELECT id, username, text FROM messages WHERE id = $1 AND room = $2`,
          [replyToId, room]
        );

        if (replyResult.rows.length > 0) {
          replyInfo = replyResult.rows[0];
        } else {
          replyToId = null;
        }
      }

      const saved = await pool.query(
        `INSERT INTO messages (room, user_id, username, text, message_type, file_name, file_mime, file_data, file_path, file_size, reply_to_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id, room, username, text, created_at, edited_at, deleted_at, message_type, file_name, file_mime, file_data, file_path, file_size, reply_to_id`,
        [room, socket.user.id, socket.user.username, text, messageType, fileName, fileMime, fileData || null, filePath, fileSize, replyToId]
      );

      const avatarResult = await pool.query('SELECT avatar_url, display_name, username FROM users WHERE id = $1', [socket.user.id]);
      const msg = saved.rows[0];

      io.to(room).emit('chat_message', {
        id: msg.id,
        room: msg.room,
        username: avatarResult.rows[0]?.display_name || msg.username,
        avatar_url: avatarResult.rows[0]?.avatar_url || null,
        text: msg.text,
        message_type: msg.message_type,
        file_name: msg.file_name,
        file_mime: msg.file_mime,
        file_data: msg.file_data,
        file_path: msg.file_path,
        file_size: msg.file_size,
        reply_to_id: msg.reply_to_id,
        reply_username: replyInfo?.username || null,
        reply_text: replyInfo?.text || null,
        edited_at: msg.edited_at,
        deleted_at: msg.deleted_at,
        time: nowTime()
      });

      await notifyRoomMentions({
        room,
        text,
        senderId: socket.user.id,
        senderUsername: socket.user.username
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

      const msgCheck = await pool.query('SELECT room, user_id FROM messages WHERE id = $1', [id]);
      if (msgCheck.rows.length === 0) return;

      const role = await getRoomRole(msgCheck.rows[0].room, socket.user.id);
      const canDelete = msgCheck.rows[0].user_id === socket.user.id || canModerate(role);
      if (!canDelete) return;

      const result = await pool.query(
        `UPDATE messages
         SET text = 'Bu mesaj silindi.', deleted_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id, room, text, deleted_at`,
        [id]
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

  socket.on('dm_typing', async ({ receiverId }) => {
    const targetId = Number(receiverId);
    if (!Number.isInteger(targetId)) return;

    const ok = await areFriends(socket.user.id, targetId);
    if (!ok) return;

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
      const filePath = cleanText(payload?.filePath || '', 500) || null;
      const fileSize = Number(payload?.fileSize) || null;
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

      let replyToId = Number(payload?.replyToId);
      if (!Number.isInteger(replyToId)) replyToId = null;

      let replyInfo = null;
      if (replyToId) {
        const replyResult = await pool.query(
          `SELECT dm.id, dm.text, u.username
           FROM dm_messages dm
           JOIN users u ON u.id = dm.sender_id
           WHERE dm.id = $1
           AND ((dm.sender_id = $2 AND dm.receiver_id = $3) OR (dm.sender_id = $3 AND dm.receiver_id = $2))`,
          [replyToId, socket.user.id, targetId]
        );

        if (replyResult.rows.length > 0) {
          replyInfo = replyResult.rows[0];
        } else {
          replyToId = null;
        }
      }

      const saved = await pool.query(
        `INSERT INTO dm_messages (sender_id, receiver_id, text, message_type, file_name, file_mime, file_data, file_path, file_size, reply_to_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, sender_id, receiver_id, text, created_at, edited_at, deleted_at, read_at, message_type, file_name, file_mime, file_data, file_path, file_size, reply_to_id`,
        [socket.user.id, targetId, cleanMessage, messageType, fileName, fileMime, fileData || null, filePath, fileSize, replyToId]
      );

      const avatarResult = await pool.query('SELECT avatar_url, display_name, username FROM users WHERE id = $1', [socket.user.id]);

      const msg = {
        id: saved.rows[0].id,
        sender_id: saved.rows[0].sender_id,
        receiver_id: saved.rows[0].receiver_id,
        sender_username: avatarResult.rows[0]?.display_name || socket.user.username,
        sender_avatar_url: avatarResult.rows[0]?.avatar_url || null,
        text: saved.rows[0].text,
        message_type: saved.rows[0].message_type,
        file_name: saved.rows[0].file_name,
        file_mime: saved.rows[0].file_mime,
        file_data: saved.rows[0].file_data,
        file_path: saved.rows[0].file_path,
        file_size: saved.rows[0].file_size,
        reply_to_id: saved.rows[0].reply_to_id,
        reply_username: replyInfo?.username || null,
        reply_text: replyInfo?.text || null,
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

  socket.on('disconnect', async () => {
    await pool.query('UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = $1', [socket.user.id]);
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
