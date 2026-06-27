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

const AI_BOT_ENABLED = String(process.env.AI_BOT_ENABLED || 'false').toLowerCase() === 'true';
const AI_BOT_NAME = cleanBotName(process.env.AI_BOT_NAME || 'feiz');
const AI_BOT_USERNAME = cleanBotUsername(AI_BOT_NAME);
const GROQ_API_KEY = String(process.env.GROQ_API_KEY || '');
const GROQ_MODEL = String(process.env.GROQ_MODEL || 'llama-3.3-70b-versatile');
const AI_BOT_COOLDOWN_MS = Number(process.env.AI_BOT_COOLDOWN_MS || 10000);
const AI_BOT_RULES = String(process.env.AI_BOT_RULES || '').trim().slice(0, 2000);
const AI_BOT_RANDOM_TALK_MS = Number(process.env.AI_BOT_RANDOM_TALK_MS || 8 * 60 * 1000);
const AI_BOT_RANDOM_TALK_CHANCE = Number(process.env.AI_BOT_RANDOM_TALK_CHANCE || 0.35);

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
const aiBotCooldowns = new Map();
let aiBotUserCache = null;


function cleanHexColor(value) {
  const color = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color.toLowerCase() : '#8b5cf6';
}

function cleanFavoriteEgg(value) {
  const allowed = new Set([
    '/serbia', '/limbo', '/vertex', '/rome', '/egypt', '/anitkabir', '/cat', '/reset',
    '/rift', '/5ecropolis', '/selim', '/xara', '/nico', '/yasin', '/jung', '/fetullah',
    '/blake', '/feiz', '/pnico', '/pyasin', '/ataturk'
  ]);
  const egg = String(value || '').trim().toLowerCase();
  return allowed.has(egg) ? egg : '/serbia';
}

function profileLevelFromXp(xp) {
  const safeXp = Math.max(0, Number(xp) || 0);
  return Math.max(1, Math.floor(Math.sqrt(safeXp / 100)) + 1);
}

function levelProgressFromXp(xp) {
  const safeXp = Math.max(0, Number(xp) || 0);
  const level = profileLevelFromXp(safeXp);
  const currentLevelStart = Math.pow(level - 1, 2) * 100;
  const nextLevelStart = Math.pow(level, 2) * 100;
  const progress = Math.max(0, Math.min(100, Math.round(((safeXp - currentLevelStart) / (nextLevelStart - currentLevelStart)) * 100)));
  return { level, progress, currentLevelStart, nextLevelStart };
}


function badgeDefinition(key, icon, name, description, rarity, unlocked) {
  return { key, icon, name, description, rarity, unlocked: Boolean(unlocked) };
}

function buildAllProfileBadges({ user, stats, xp, shards, level }) {
  const total = Number(stats.total_messages || 0);
  const room = Number(stats.room_messages || 0);
  const dm = Number(stats.dm_messages || 0);
  const group = Number(stats.group_messages || 0);
  const friends = Number(stats.friends_count || 0);
  const groups = Number(stats.groups_count || 0);
  const fav = String(user.favorite_egg || '');
  const role = String(user.global_role || 'user').toLowerCase();
  const hasBio = String(user.bio || '').trim().length >= 8;
  const customColor = String(user.profile_color || '#8b5cf6').toLowerCase() !== '#8b5cf6';

  const badges = [
    badgeDefinition('new_anomaly', '✨', 'New Anomaly', '5ECROPOLIS ağına giriş yaptı.', 'common', true),
    badgeDefinition('first_signal', '📡', 'First Signal', 'İlk mesajını gönderdi.', 'common', total >= 1),
    badgeDefinition('ten_messages', '✉️', 'Signal Starter', '10+ mesaj gönderdi.', 'common', total >= 10),
    badgeDefinition('fifty_messages', '🔊', 'Chat Pulse', '50+ mesaj gönderdi.', 'common', total >= 50),
    badgeDefinition('active_member', '💬', 'Active Member', '100+ mesaj gönderdi.', 'rare', total >= 100),
    badgeDefinition('chat_grinder', '⚙️', 'Chat Grinder', '250+ mesaj gönderdi.', 'rare', total >= 250),
    badgeDefinition('dimension_speaker', '🌀', 'Dimension Speaker', '500+ mesaj gönderdi.', 'legendary', total >= 500),
    badgeDefinition('thousand_echoes', '🌌', 'Thousand Echoes', '1000+ mesaj gönderdi.', 'legendary', total >= 1000),
    badgeDefinition('void_broadcaster', '📻', 'Void Broadcaster', '2500+ mesaj gönderdi.', 'legendary', total >= 2500),

    badgeDefinition('room_roamer', '🏠', 'Room Roamer', 'Odalarda 25+ mesaj gönderdi.', 'common', room >= 25),
    badgeDefinition('room_regular', '🛋️', 'Room Regular', 'Odalarda 100+ mesaj gönderdi.', 'rare', room >= 100),
    badgeDefinition('room_legend', '🏛️', 'Room Legend', 'Odalarda 500+ mesaj gönderdi.', 'legendary', room >= 500),

    badgeDefinition('dm_operator', '📨', 'DM Operator', 'DM tarafında aktif.', 'rare', dm >= 25),
    badgeDefinition('private_signal', '🔐', 'Private Signal', '100+ DM mesajı gönderdi.', 'epic', dm >= 100),
    badgeDefinition('whisper_network', '🕯️', 'Whisper Network', '300+ DM mesajı gönderdi.', 'legendary', dm >= 300),

    badgeDefinition('group_energy', '👥', 'Group Energy', 'Gruplarda aktif.', 'rare', group >= 25),
    badgeDefinition('squad_voice', '📣', 'Squad Voice', '100+ grup mesajı gönderdi.', 'epic', group >= 100),
    badgeDefinition('council_member', '🛡️', 'Council Member', '300+ grup mesajı gönderdi.', 'legendary', group >= 300),

    badgeDefinition('first_friend', '🤝', 'First Friend', 'İlk arkadaşını ekledi.', 'common', friends >= 1),
    badgeDefinition('social_core', '🧩', 'Social Core', '5+ arkadaşı var.', 'rare', friends >= 5),
    badgeDefinition('networker', '🕸️', 'Networker', '10+ arkadaşı var.', 'epic', friends >= 10),
    badgeDefinition('alliance_builder', '🏰', 'Alliance Builder', '25+ arkadaşı var.', 'legendary', friends >= 25),

    badgeDefinition('group_joiner', '🚪', 'Group Joiner', 'En az 1 gruba katıldı.', 'common', groups >= 1),
    badgeDefinition('multi_group', '🧭', 'Multi Group', '3+ grupta yer alıyor.', 'rare', groups >= 3),
    badgeDefinition('group_nomad', '🧳', 'Group Nomad', '10+ grupta yer alıyor.', 'epic', groups >= 10),

    badgeDefinition('face_revealed', '🖼️', 'Face Revealed', 'Profil fotoğrafı ekledi.', 'common', Boolean(user.avatar_url)),
    badgeDefinition('cover_artist', '🎨', 'Cover Artist', 'Profil kapağı ekledi.', 'epic', Boolean(user.profile_cover_url)),
    badgeDefinition('bio_writer', '📝', 'Bio Writer', 'Profil hakkında yazısı ekledi.', 'common', hasBio),
    badgeDefinition('color_tuner', '🎛️', 'Color Tuner', 'Profil tema rengini özelleştirdi.', 'rare', customColor),

    badgeDefinition('level_5', '⚡', 'Level 5', 'Level 5 seviyesine ulaştı.', 'rare', level >= 5),
    badgeDefinition('level_10', '💠', 'Level 10', 'Level 10 seviyesine ulaştı.', 'epic', level >= 10),
    badgeDefinition('level_20', '👑', 'Level 20', 'Level 20 seviyesine ulaştı.', 'legendary', level >= 20),

    badgeDefinition('shard_collector', '✦', 'Shard Collector', '100+ Shards topladı.', 'rare', shards >= 100),
    badgeDefinition('shard_hoarder', '💎', 'Shard Hoarder', '500+ Shards topladı.', 'epic', shards >= 500),
    badgeDefinition('shard_overlord', '🔮', 'Shard Overlord', '1000+ Shards topladı.', 'legendary', shards >= 1000),
    badgeDefinition('shard_dimension', '🌠', 'Shard Dimension', '5000+ Shards topladı.', 'legendary', shards >= 5000),

    badgeDefinition('serbia_walker', '🇷🇸', 'Serbia Walker', 'Favori easter egg: Serbia.', 'epic', fav === '/serbia'),
    badgeDefinition('vertex_witness', '🔴', 'VERTEX Witness', 'Favori easter egg: VERTEX.', 'epic', fav === '/vertex'),
    badgeDefinition('limbo_survivor', '⚫', 'Limbo Survivor', 'Favori easter egg: Limbo.', 'epic', fav === '/limbo'),
    badgeDefinition('rome_survivor', '🏺', 'Rome Survivor', 'Favori easter egg: Rome.', 'epic', fav === '/rome'),
    badgeDefinition('egypt_drifter', '🏜️', 'Egypt Drifter', 'Favori easter egg: Egypt.', 'epic', fav === '/egypt'),
    badgeDefinition('anitkabir_signal', '🇹🇷', 'Anıtkabir Signal', 'Favori easter egg: Anıtkabir.', 'legendary', fav === '/anitkabir'),
    badgeDefinition('cat_watcher', '🐈', 'Cat Watcher', 'Favori easter egg: Cat.', 'rare', fav === '/cat'),
    badgeDefinition('reset_presser', '🔘', 'Reset Presser', 'Favori easter egg: Reset.', 'epic', fav === '/reset'),
    badgeDefinition('rift_touched', '🩸', 'Rift Touched', 'Favori easter egg: Rift.', 'epic', fav === '/rift'),
    badgeDefinition('five_marked', '5️⃣', '5 Marked', 'Favori easter egg: 5ECROPOLIS.', 'legendary', fav === '/5ecropolis'),
    badgeDefinition('selim_protocol', '🧬', 'Selim Protocol', 'Favori easter egg: Selim.', 'legendary', fav === '/selim'),
    badgeDefinition('xara_reset', '🪐', 'Xara Reset', 'Favori easter egg: Xara.', 'epic', fav === '/xara'),
    badgeDefinition('nico_frequency', '🧊', 'Nico Frequency', 'Favori easter egg: Nico.', 'rare', fav === '/nico'),
    badgeDefinition('menekse_signal', '🟪', 'Menekşe Signal', 'Favori easter egg: Yasin.', 'rare', fav === '/yasin'),
    badgeDefinition('jung_bass', '🎧', 'Jung Bass', 'Favori easter egg: Jung.', 'epic', fav === '/jung'),
    badgeDefinition('oracle_eye', '👁️', 'Oracle Eye', 'Favori easter egg: Fetullah.', 'epic', fav === '/fetullah'),
    badgeDefinition('yung_blake', '♛', 'Yung Blake', 'Favori easter egg: Blake.', 'epic', fav === '/blake'),
    badgeDefinition('feiz_online', '🤖', 'feiz Online', 'Favori easter egg: feiz.', 'rare', fav === '/feiz'),
    badgeDefinition('parallel_nico', '🪞', 'Parallel Nico', 'Favori easter egg: Parallel Nico.', 'epic', fav === '/pnico'),
    badgeDefinition('parallel_yasin', '💜', 'Parallel Yasin', 'Favori easter egg: Parallel Yasin.', 'epic', fav === '/pyasin'),
    badgeDefinition('respect_protocol', '🇹🇷', 'Respect Protocol', 'Favori easter egg: Atatürk.', 'legendary', fav === '/ataturk'),


    badgeDefinition('daily_regular', '🎁', 'Daily Regular', 'Günlük ödül sistemini kullandı.', 'rare', shards >= 50 && level >= 2),
    badgeDefinition('market_user', '🛒', 'Market User', 'Market ekonomisine giriş yaptı.', 'rare', Boolean(user.active_bubble_theme || user.active_profile_frame || user.active_name_effect || user.active_profile_theme)),
    badgeDefinition('style_owner', '💅', 'Style Owner', 'En az bir kozmetik item kuşandı.', 'epic', Boolean(user.active_bubble_theme || user.active_profile_frame || user.active_name_effect || user.active_profile_theme)),
    badgeDefinition('profile_theme_user', '🪪', 'Profile Theme User', 'Profil teması kuşandı.', 'epic', Boolean(user.active_profile_theme)),
    badgeDefinition('frame_bearer', '🖼️', 'Frame Bearer', 'Profil çerçevesi kuşandı.', 'rare', Boolean(user.active_profile_frame)),
    badgeDefinition('name_effect_user', '✨', 'Name Effect User', 'İsim efekti kuşandı.', 'rare', Boolean(user.active_name_effect)),
    badgeDefinition('casino_signal', '🎰', 'Casino Signal', 'Casino / shard ekonomisinde aktif.', 'epic', shards >= 777),
    badgeDefinition('legendary_presence', '🌟', 'Legendary Presence', 'Legendary seviyeye yaklaşan güçlü profil.', 'legendary', level >= 15 || shards >= 2500 || total >= 1500),

    badgeDefinition('owner_core', '👑', 'Owner Core', 'Platform sahibi.', 'legendary', role === 'owner'),
    badgeDefinition('admin_core', '🛡️', 'Admin Core', 'Global admin yetkisi var.', 'legendary', role === 'admin'),
    badgeDefinition('mod_signal', '🔧', 'Mod Signal', 'Moderatör yetkisi var.', 'epic', role === 'mod')
  ];

  return badges;
}

function parseVisibleBadges(value) {
  return String(value || '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function buildProfileBadges({ user, stats, xp = 0, shards = 0, level = 1 }) {
  const allBadges = buildAllProfileBadges({ user, stats, xp, shards, level });
  const unlocked = allBadges.filter((badge) => badge.unlocked);
  const selectedKeys = parseVisibleBadges(user.profile_visible_badges);
  const selectedUnlocked = selectedKeys
    .map((key) => unlocked.find((badge) => badge.key === key))
    .filter(Boolean);

  const visible = selectedUnlocked.length > 0
    ? selectedUnlocked
    : unlocked.sort((a, b) => {
        const order = { legendary: 4, epic: 3, rare: 2, common: 1 };
        return (order[b.rarity] || 0) - (order[a.rarity] || 0);
      }).slice(0, 8);

  return {
    visible,
    all: allBadges,
    unlocked_count: unlocked.length,
    total_count: allBadges.length,
    selected_keys: selectedKeys
  };
}

async function rewardUserActivity(userId, xpAmount = 5, shardAmount = 1) {
  await pool.query(
    `UPDATE users
     SET xp = COALESCE(xp, 0) + $1,
         shards = COALESCE(shards, 0) + $2
     WHERE id = $3`,
    [xpAmount, shardAmount, userId]
  );
}


async function getUniverseState() {
  const result = await pool.query('SELECT level, energy, active_event, updated_at FROM universe_state WHERE id = 1');
  const row = result.rows[0] || { level: 1, energy: 0, active_event: null };
  let activeEvent = row.active_event || null;

  if (activeEvent && activeEvent.ends_at && Date.now() > Number(activeEvent.ends_at)) {
    activeEvent = null;
    await pool.query('UPDATE universe_state SET active_event = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = 1');
  }

  return {
    level: Number(row.level || 1),
    energy: Number(row.energy || 0),
    active_event: activeEvent
  };
}

async function addUniverseEnergy(amount = 1) {
  const state = await getUniverseState();
  let energy = Math.min(100, Math.max(0, state.energy + amount));
  let level = state.level;
  if (energy >= 100) {
    level += 1;
    energy = 0;
    await startLiveEvent(null, 'energy_overload');
  }
  await pool.query('UPDATE universe_state SET level = $1, energy = $2, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [level, energy]);
  return getUniverseState();
}

const LIVE_EVENT_TYPES = [
  { key: 'serbia_rift', name: 'Serbia Rift', icon: '🌀', theme: 'serbia', shards: 35, xp: 25, title: 'Rift Survivor', item: ['serbia_key', 'Serbia Rift Key'] },
  { key: 'limbo_storm', name: 'Limbo Storm', icon: '⚫', theme: 'limbo', shards: 30, xp: 30, title: 'Limbo Walker', item: ['limbo_fragment', 'Limbo Fragment'] },
  { key: 'rome_simulation', name: 'Rome Simulation', icon: '🏛️', theme: 'rome', shards: 40, xp: 20, title: 'Rome Glitch', item: ['rome_coin', 'Rome Coin'] },
  { key: 'egypt_signal', name: 'Egypt Signal', icon: '𓂀', theme: 'egypt', shards: 45, xp: 18, title: 'Scarab Finder', item: ['golden_scarab', 'Golden Scarab'] },
  { key: 'vertex_breach', name: 'VERTEX Breach', icon: '🔴', theme: 'vertex', shards: 55, xp: 35, title: 'Vertex Witness', item: ['vertex_token', 'Vertex Token'] }
];

function randomLiveEventType() {
  return LIVE_EVENT_TYPES[Math.floor(Math.random() * LIVE_EVENT_TYPES.length)];
}

async function unlockTitle(userId, titleName) {
  if (!userId || !titleName) return;
  const key = titleName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  await pool.query(
    `INSERT INTO user_titles (user_id, title_key, title_name)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, title_key) DO NOTHING`,
    [userId, key, titleName]
  );
}

async function addInventoryItem(userId, itemKey, itemName, quantity = 1) {
  if (!userId || !itemKey) return;
  await pool.query(
    `INSERT INTO user_inventory (user_id, item_key, item_name, quantity)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, item_key)
     DO UPDATE SET quantity = user_inventory.quantity + EXCLUDED.quantity, updated_at = CURRENT_TIMESTAMP`,
    [userId, itemKey, itemName, quantity]
  );
}

async function startLiveEvent(room = null, source = 'random') {
  const eventType = randomLiveEventType();
  const event = {
    id: `event_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...eventType,
    source,
    starts_at: Date.now(),
    ends_at: Date.now() + 10 * 60 * 1000
  };

  await pool.query('UPDATE universe_state SET active_event = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [event]);

  const payload = {
    event,
    text: `${event.icon} ${event.name} başladı! 10 dakika boyunca mesaj atanlara bonus var.`
  };

  if (room) io.to(room).emit('live_event_started', payload);
  else io.emit('live_event_started', payload);

  return event;
}

async function maybeRewardLiveEventMessage(userId, room) {
  const state = await getUniverseState();
  const event = state.active_event;
  if (!event) return;

  const rewardShards = Number(event.shards || 25);
  const rewardXp = Number(event.xp || 20);
  await rewardUserActivity(userId, rewardXp, rewardShards);
  await logShardTransaction(userId, rewardShards, 'live_event', `${event.name} bonus`, { event_id: event.id });
  await unlockTitle(userId, event.title);
  if (Array.isArray(event.item)) await addInventoryItem(userId, event.item[0], event.item[1], 1);
}

async function createPortalDrop(room = null, forcedType = null) {
  const type = forcedType || randomLiveEventType();
  const drop = {
    id: `portal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    key: type.key,
    name: `${type.name} Portal`,
    icon: type.icon,
    theme: type.theme,
    reward_shards: 120 + Math.floor(Math.random() * 181),
    reward_xp: 35 + Math.floor(Math.random() * 50),
    item: type.item,
    title: type.title,
    expires_at: Date.now() + 45 * 1000
  };

  if (room) io.to(room).emit('portal_drop', drop);
  else io.emit('portal_drop', drop);
  return drop;
}

async function recordProfileVisit(visitorId, targetId) {
  if (!visitorId || !targetId || Number(visitorId) === Number(targetId)) return;
  await pool.query(
    `INSERT INTO profile_visits (visitor_id, target_id, visited_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP)
     ON CONFLICT (visitor_id, target_id)
     DO UPDATE SET visited_at = CURRENT_TIMESTAMP`,
    [visitorId, targetId]
  );
  await unlockTitle(visitorId, 'Profile Stalker');
}

async function getProfileVisitors(userId) {
  const result = await pool.query(
    `SELECT pv.visited_at, u.id, u.username, COALESCE(u.display_name, u.username) AS display_name, u.avatar_url
     FROM profile_visits pv
     JOIN users u ON u.id = pv.visitor_id
     WHERE pv.target_id = $1
     ORDER BY pv.visited_at DESC
     LIMIT 20`,
    [userId]
  );
  return result.rows;
}

async function getUserUniverseData(userId) {
  const [state, titles, inventory, visitors] = await Promise.all([
    getUniverseState(),
    pool.query('SELECT title_key, title_name, unlocked_at FROM user_titles WHERE user_id = $1 ORDER BY unlocked_at DESC LIMIT 30', [userId]),
    pool.query('SELECT item_key, item_name, quantity, updated_at FROM user_inventory WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 30', [userId]),
    getProfileVisitors(userId)
  ]);

  return {
    universe: state,
    titles: titles.rows,
    inventory: inventory.rows,
    visitors
  };
}




const MARKET_ITEMS = [
  { id: 'bubble_vertex', type: 'bubble', name: 'VERTEX Bubble', icon: '🔴', rarity: 'epic', price: 280, description: 'Mesaj balonuna kırmızı glitch havası verir.' },
  { id: 'bubble_limbo', type: 'bubble', name: 'Limbo Bubble', icon: '⚫', rarity: 'rare', price: 160, description: 'Karanlık, minimal Limbo mesaj stili.' },
  { id: 'bubble_ice', type: 'bubble', name: 'Nico Ice Bubble', icon: '🧊', rarity: 'rare', price: 190, description: 'Soğuk mavi buz mesaj efekti.' },
  { id: 'bubble_gold', type: 'bubble', name: 'Rome Gold Bubble', icon: '🏛️', rarity: 'epic', price: 320, description: 'Altın Roma mesaj balonu.' },
  { id: 'bubble_serbia', type: 'bubble', name: 'Serbia Portal Bubble', icon: '🇷🇸', rarity: 'epic', price: 350, description: 'Mor portal mesaj balonu.' },

  { id: 'frame_vertex', type: 'frame', name: 'VERTEX Frame', icon: '🟥', rarity: 'epic', price: 450, description: 'Profil fotoğrafına kırmızı VERTEX çerçevesi.' },
  { id: 'frame_limbo', type: 'frame', name: 'Limbo Frame', icon: '⬛', rarity: 'rare', price: 300, description: 'Karanlık Limbo profil çerçevesi.' },
  { id: 'frame_five', type: 'frame', name: '5ECROPOLIS Frame', icon: '5️⃣', rarity: 'legendary', price: 1000, description: 'Özel 5ECROPOLIS profil çerçevesi.' },
  { id: 'frame_ataturk', type: 'frame', name: 'Respect Frame', icon: '🇹🇷', rarity: 'legendary', price: 1000, description: 'Saygı protokolü profil çerçevesi.' },

  { id: 'name_glitch', type: 'name', name: 'Glitch Name', icon: '⚡', rarity: 'rare', price: 280, description: 'İsme hafif glitch efekti.' },
  { id: 'name_neon', type: 'name', name: 'Neon Name', icon: '💜', rarity: 'epic', price: 420, description: 'İsme neon mor parlama verir.' },
  { id: 'name_legend', type: 'name', name: 'Legend Name', icon: '👑', rarity: 'legendary', price: 1000, description: 'İsme legendary altın efekt verir.' },

  { id: 'theme_limbo', type: 'theme', name: 'Limbo Dark Profile', icon: '⚫', rarity: 'rare', price: 420, description: 'Profil kartına karanlık Limbo teması verir.' },
  { id: 'theme_serbia', type: 'theme', name: 'Serbia Rift Profile', icon: '🇷🇸', rarity: 'epic', price: 650, description: 'Profil kartına mor-kırmızı Serbia Rift teması verir.' },
  { id: 'theme_egypt', type: 'theme', name: 'Egypt Sand Profile', icon: '🏜️', rarity: 'rare', price: 480, description: 'Profil kartına sıcak Mısır çölü teması verir.' },
  { id: 'theme_rome', type: 'theme', name: 'Rome Gold Profile', icon: '🏛️', rarity: 'epic', price: 700, description: 'Profil kartına altın Antik Roma havası verir.' },
  { id: 'theme_vertex', type: 'theme', name: 'VERTEX Red Profile', icon: '🔴', rarity: 'legendary', price: 1000, description: 'Profil kartına kırmızı VERTEX anomalisi verir.' },
  { id: 'theme_five', type: 'theme', name: '5ECROPOLIS Neon Profile', icon: '5️⃣', rarity: 'legendary', price: 1000, description: 'Profil kartına özel 5ECROPOLIS neon teması verir.' }
];




const LOOTBOX_CRATES = [
  {
    id: 'serbia_rift',
    name: 'Serbia Rift Crate',
    icon: '🇷🇸',
    price: 250,
    rarities: { common: 45, rare: 32, epic: 18, legendary: 5 },
    poolTypes: ['bubble', 'frame', 'name', 'theme'],
    description: 'Dengeli kasa. Her tür item çıkabilir.'
  },
  {
    id: 'limbo_crate',
    name: 'Limbo Crate',
    icon: '⚫',
    price: 180,
    rarities: { common: 55, rare: 34, epic: 10, legendary: 1 },
    poolTags: ['limbo'],
    description: 'Daha ucuz kasa. Limbo ağırlıklı itemler.'
  },
  {
    id: 'rome_egypt_crate',
    name: 'Rome / Egypt Crate',
    icon: '🏛️',
    price: 320,
    rarities: { common: 35, rare: 35, epic: 24, legendary: 6 },
    poolTags: ['rome', 'egypt', 'gold'],
    description: 'Roma ve Mısır temalı itemler.'
  },
  {
    id: 'vertex_legendary',
    name: 'VERTEX Legendary Crate',
    icon: '🔴',
    price: 650,
    rarities: { common: 15, rare: 28, epic: 37, legendary: 20 },
    poolTags: ['vertex', 'five', 'legend', 'ataturk'],
    description: 'Pahalı ama legendary şansı yüksek kasa.'
  }
];

function getLootboxCrate(crateId) {
  return LOOTBOX_CRATES.find((crate) => crate.id === crateId) || LOOTBOX_CRATES[0];
}

function itemMatchesCrate(item, crate) {
  if (crate.poolTypes && !crate.poolTypes.includes(item.type)) return false;
  if (!crate.poolTags || !crate.poolTags.length) return true;
  const haystack = `${item.id} ${item.name} ${item.description}`.toLowerCase();
  return crate.poolTags.some((tag) => haystack.includes(tag));
}

function pickLootboxRarityForCrate(crate) {
  const rarities = crate.rarities || { common: 52, rare: 30, epic: 14, legendary: 4 };
  const roll = Math.random() * 100;
  let acc = 0;
  for (const rarity of ['common', 'rare', 'epic', 'legendary']) {
    acc += Number(rarities[rarity] || 0);
    if (roll <= acc) return rarity;
  }
  return 'common';
}

const casinoSessions = new Map();

const CARD_SUITS = ['♠', '♥', '♦', '♣'];
const CARD_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function drawCard() {
  const rank = CARD_RANKS[Math.floor(Math.random() * CARD_RANKS.length)];
  const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];
  return { rank, suit };
}

function handValue(hand) {
  let total = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.rank === 'A') {
      aces += 1;
      total += 11;
    } else if (['J', 'Q', 'K'].includes(card.rank)) {
      total += 10;
    } else {
      total += Number(card.rank);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

function cleanBet(value) {
  const bet = Math.floor(Number(value) || 0);
  return Math.max(1, Math.min(1000, bet));
}

async function getShardBalance(userId) {
  const result = await pool.query('SELECT shards FROM users WHERE id = $1', [userId]);
  return Number(result.rows[0]?.shards || 0);
}

async function addShards(userId, amount) {
  const result = await pool.query(
    'UPDATE users SET shards = GREATEST(0, COALESCE(shards, 0) + $1) WHERE id = $2 RETURNING shards',
    [amount, userId]
  );
  return Number(result.rows[0]?.shards || 0);
}

async function logShardTransaction(userId, amount, reason, label, meta = {}) {
  try {
    const balance = await getShardBalance(userId);
    await pool.query(
      `INSERT INTO shard_transactions (user_id, amount, balance_after, reason, label, meta)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, Math.trunc(Number(amount) || 0), balance, cleanText(reason || 'system', 80), cleanText(label || 'Shards işlem', 180), meta]
    );
  } catch (error) {
    console.error('Shard history log error:', error);
  }
}

function publicBlackjackSession(session, revealDealer = false) {
  return {
    bet: session.bet,
    player: session.player,
    dealer: revealDealer ? session.dealer : [session.dealer[0], { rank: '?', suit: '?' }],
    player_value: handValue(session.player),
    dealer_value: revealDealer ? handValue(session.dealer) : null,
    status: session.status,
    result: session.result || '',
    payout: session.payout || 0
  };
}


function getMarketItem(itemId) {
  return MARKET_ITEMS.find((item) => item.id === itemId) || null;
}

async function getUserGameStats(userId) {
  const statsResult = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM messages WHERE user_id = $1 AND deleted_at IS NULL) AS room_messages,
       (SELECT COUNT(*)::int FROM dm_messages WHERE sender_id = $1 AND deleted_at IS NULL) AS dm_messages,
       (SELECT COUNT(*)::int FROM group_messages WHERE sender_id = $1 AND deleted_at IS NULL) AS group_messages,
       (SELECT COUNT(*)::int FROM friendships WHERE status = 'accepted' AND (requester_id = $1 OR addressee_id = $1)) AS friends_count,
       (SELECT COUNT(*)::int FROM group_members WHERE user_id = $1) AS groups_count`,
    [userId]
  );

  const stats = statsResult.rows[0] || {};
  stats.total_messages = Number(stats.room_messages || 0) + Number(stats.dm_messages || 0) + Number(stats.group_messages || 0);
  return stats;
}

function buildDailyQuests(stats) {
  return [
    { id: 'send_10_messages', title: '10 mesaj gönder', icon: '💬', target: 10, progress: Math.min(stats.total_messages_today || 0, 10), xp: 100, shards: 50 },
    { id: 'send_1_dm', title: '1 DM gönder', icon: '📨', target: 1, progress: Math.min(stats.dm_messages_today || 0, 1), xp: 80, shards: 35 },
    { id: 'send_1_group', title: '1 grup mesajı gönder', icon: '👥', target: 1, progress: Math.min(stats.group_messages_today || 0, 1), xp: 80, shards: 35 },
    { id: 'send_25_total', title: '25 toplam mesaj gönder', icon: '🔥', target: 25, progress: Math.min(stats.total_messages_today || 0, 25), xp: 220, shards: 120 },
    { id: 'room_signal', title: '5 oda mesajı gönder', icon: '🏠', target: 5, progress: Math.min(stats.room_messages_today || 0, 5), xp: 90, shards: 40 }
  ];
}

async function getTodayStats(userId) {
  const result = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM messages WHERE user_id = $1 AND deleted_at IS NULL AND created_at::date = CURRENT_DATE) AS room_messages_today,
       (SELECT COUNT(*)::int FROM dm_messages WHERE sender_id = $1 AND deleted_at IS NULL AND created_at::date = CURRENT_DATE) AS dm_messages_today,
       (SELECT COUNT(*)::int FROM group_messages WHERE sender_id = $1 AND deleted_at IS NULL AND created_at::date = CURRENT_DATE) AS group_messages_today`,
    [userId]
  );

  const stats = result.rows[0] || {};
  stats.total_messages_today = Number(stats.room_messages_today || 0) + Number(stats.dm_messages_today || 0) + Number(stats.group_messages_today || 0);
  return stats;
}

async function getUserInventory(userId) {
  const result = await pool.query('SELECT item_id, item_type, created_at FROM user_items WHERE user_id = $1', [userId]);
  return result.rows;
}


async function logAdminAction(actorId, action, details = {}, targetId = null) {
  try {
    await pool.query(
      `INSERT INTO admin_logs (actor_id, target_id, action, details)
       VALUES ($1, $2, $3, $4)`,
      [actorId || null, targetId || null, action, details]
    );
  } catch (error) {
    console.error('Admin log yazılamadı:', error);
  }
}

function itemRarityWeight(rarity) {
  if (rarity === 'legendary') return 4;
  if (rarity === 'epic') return 3;
  if (rarity === 'rare') return 2;
  return 1;
}

function pickLootboxRarity() {
  const roll = Math.random() * 100;
  if (roll < 4) return 'legendary';
  if (roll < 18) return 'epic';
  if (roll < 48) return 'rare';
  return 'common';
}

function dailyRewardForStreak(streak) {
  const safe = Math.max(1, Number(streak || 1));
  const bonus = Math.min(250, (safe - 1) * 15);
  const weeklyBonus = safe % 7 === 0 ? 300 : 0;
  return {
    shards: 75 + bonus + weeklyBonus,
    xp: 100 + Math.min(400, (safe - 1) * 25) + (safe % 7 === 0 ? 300 : 0)
  };
}

async function getDailyRewardInfo(userId) {
  const today = await pool.query(
    `SELECT id, streak, reward_shards, reward_xp
     FROM daily_reward_claims
     WHERE user_id = $1 AND claim_date = CURRENT_DATE
     LIMIT 1`,
    [userId]
  );

  const recent = await pool.query(
    `SELECT claim_date, streak
     FROM daily_reward_claims
     WHERE user_id = $1
     ORDER BY claim_date DESC
     LIMIT 14`,
    [userId]
  );

  const yesterday = await pool.query(
    `SELECT streak
     FROM daily_reward_claims
     WHERE user_id = $1 AND claim_date = CURRENT_DATE - INTERVAL '1 day'
     LIMIT 1`,
    [userId]
  );

  const nextStreak = today.rows[0]?.streak || ((yesterday.rows[0]?.streak || 0) + 1);
  const reward = dailyRewardForStreak(nextStreak);

  return {
    claimed_today: today.rows.length > 0,
    streak: Number(today.rows[0]?.streak || yesterday.rows[0]?.streak || 0),
    next_streak: Number(nextStreak),
    reward,
    recent: recent.rows
  };
}

async function getLootboxHistory(userId) {
  const result = await pool.query(
    `SELECT id, reward_type, reward_id, reward_name, reward_rarity, reward_shards, cost_shards, created_at
     FROM lootbox_history
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 10`,
    [userId]
  );
  return result.rows;
}


async function getClaimedQuestsToday(userId) {
  const result = await pool.query('SELECT quest_id FROM daily_quest_claims WHERE user_id = $1 AND claim_date = CURRENT_DATE', [userId]);
  return new Set(result.rows.map((row) => row.quest_id));
}


function nowTime() {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function cleanBotName(value) {
  return String(value || 'feiz').trim().replace(/\s+/g, ' ').slice(0, 40) || 'feiz';
}

function cleanBotUsername(value) {
  const raw = String(value || 'feiz').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24);
  return raw || 'feiz';
}

function botMentioned(text) {
  const t = String(text || '').trim();
  const botName = AI_BOT_NAME.toLowerCase().replace(/\s+/g, '');
  return /^@bot\b/i.test(t) || new RegExp(`^@${botName}\\b`, 'i').test(t);
}

function extractBotPrompt(text) {
  const t = String(text || '').trim();
  const botName = AI_BOT_NAME.toLowerCase().replace(/\s+/g, '');
  return t
    .replace(/^@bot\b[:,]?\s*/i, '')
    .replace(new RegExp(`^@${botName}\\b[:,]?\\s*`, 'i'), '')
    .trim()
    .slice(0, 1800);
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


async function getRoomReadSummaries(room, messageIds) {
  const ids = Array.from(new Set((messageIds || []).map(Number).filter(Number.isInteger))).slice(0, 80);
  if (!ids.length) return [];

  const result = await pool.query(
    `SELECT m.id AS message_id,
            COALESCE(
              json_agg(
                json_build_object('id', u.id, 'username', COALESCE(u.display_name, u.username))
                ORDER BY r.seen_at ASC
              ) FILTER (WHERE r.user_id IS NOT NULL),
              '[]'::json
            ) AS readers
     FROM messages m
     LEFT JOIN room_message_reads r ON r.message_id = m.id AND r.user_id <> m.user_id
     LEFT JOIN users u ON u.id = r.user_id
     WHERE m.room = $1 AND m.id = ANY($2::int[])
     GROUP BY m.id`,
    [room, ids]
  );

  return result.rows;
}

async function emitRoomReadSummaries(room, messageIds) {
  const summaries = await getRoomReadSummaries(room, messageIds);
  summaries.forEach((summary) => {
    io.to(room).emit('room_read_summary', {
      messageId: summary.message_id,
      readers: summary.readers || []
    });
  });
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


/* AI BOT */

async function ensureAiBotUser() {
  if (aiBotUserCache) return aiBotUserCache;

  let result = await pool.query('SELECT id, username, display_name, avatar_url FROM users WHERE LOWER(username) = $1 LIMIT 1', [AI_BOT_USERNAME]);

  if (result.rows.length === 0) {
    const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
    result = await pool.query(
      `INSERT INTO users (username, password_hash, display_name, bio, global_role)
       VALUES ($1, $2, $3, $4, 'user')
       RETURNING id, username, display_name, avatar_url`,
      [AI_BOT_USERNAME, passwordHash, AI_BOT_NAME, 'Ben Selim Chat içindeki yapay zeka botuyum. @feiz veya @bot yazarak beni çağırabilirsin.']
    );
  } else if (result.rows[0].display_name !== AI_BOT_NAME) {
    result = await pool.query(
      `UPDATE users SET display_name = $1 WHERE id = $2 RETURNING id, username, display_name, avatar_url`,
      [AI_BOT_NAME, result.rows[0].id]
    );
  }

  aiBotUserCache = result.rows[0];
  return aiBotUserCache;
}

async function ensureAiFriendship(userId) {
  const bot = await ensureAiBotUser();
  if (bot.id === userId) return bot;

  const a = Math.min(Number(userId), Number(bot.id));
  const b = Math.max(Number(userId), Number(bot.id));

  await pool.query(
    `INSERT INTO friendships (requester_id, addressee_id, status, updated_at)
     VALUES ($1, $2, 'accepted', CURRENT_TIMESTAMP)
     ON CONFLICT (requester_id, addressee_id)
     DO UPDATE SET status = 'accepted', updated_at = CURRENT_TIMESTAMP`,
    [a, b]
  );

  return bot;
}

function checkAiCooldown(userId) {
  const now = Date.now();
  const key = String(userId);
  const last = aiBotCooldowns.get(key) || 0;
  const wait = AI_BOT_COOLDOWN_MS - (now - last);

  if (wait > 0) return Math.ceil(wait / 1000);

  aiBotCooldowns.set(key, now);
  return 0;
}


async function getAiBotState() {
  const result = await pool.query('SELECT mood, random_talk_enabled, updated_at FROM ai_bot_state WHERE id = 1');
  return result.rows[0] || { mood: 'calm', random_talk_enabled: true };
}

function normalizeFeizMood(mood) {
  const clean = String(mood || '').toLowerCase().trim();
  const map = {
    sakin: 'calm',
    calm: 'calm',
    agresif: 'aggressive',
    aggressive: 'aggressive',
    cursed: 'cursed',
    serious: 'serious',
    ciddi: 'serious',
    lore: 'lore'
  };
  return map[clean] || 'calm';
}

function feizMoodPrompt(mood) {
  const m = normalizeFeizMood(mood);
  const prompts = {
    calm: 'Mood: sakin. Daha yumuşak, kısa, yardımcı ve arkadaş gibi konuş.',
    aggressive: 'Mood: agresif. Daha keskin, enerjik, meydan okuyan ama hakaret etmeyen bir tavır kullan.',
    cursed: 'Mood: cursed. Hafif tuhaf, glitchli, absürt ve karanlık mizah tonunda konuş; yine de anlaşılır kal.',
    serious: 'Mood: serious. Daha ciddi, net, mantıklı ve kısa cevap ver; şaka az olsun.',
    lore: 'Mood: lore. 5ECROPOLIS evreni, Serbia Rift, Limbo, VERTEX, portal ve simülasyon havasını cevaplara yedir.'
  };
  return prompts[m] || prompts.calm;
}

async function getAiNickname(userId, username = 'kullanıcı') {
  if (!userId) return null;
  const existing = await pool.query('SELECT nickname FROM ai_bot_nicknames WHERE user_id = $1', [userId]);
  if (existing.rows[0]?.nickname) return existing.rows[0].nickname;

  const base = String(username || 'kullanıcı').toLowerCase();
  const poolNames = [
    'rift yolcusu',
    'portal bağımlısı',
    'limbo kaçkını',
    'vertex şahidi',
    'gece kodcusu',
    'shard avcısı',
    'serbia frekansı',
    'simülasyon çocuğu'
  ];
  const sum = base.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const nickname = poolNames[sum % poolNames.length];

  await pool.query(
    `INSERT INTO ai_bot_nicknames (user_id, nickname)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET nickname = EXCLUDED.nickname, updated_at = CURRENT_TIMESTAMP`,
    [userId, nickname]
  );
  return nickname;
}

async function rememberAiMoment({ userId, room, memory }) {
  const text = cleanText(memory || '', 260);
  if (!text) return;
  await pool.query(
    `INSERT INTO ai_bot_memories (user_id, room, memory)
     VALUES ($1, $2, $3)`,
    [userId || null, room || null, text]
  );
}

async function maybeRememberChatMoment({ userId, room, username, text }) {
  const clean = cleanText(text || '', 260);
  if (!clean || clean.length < 8) return;
  if (Math.random() > 0.18 && !/@feiz|@bot|feiz/i.test(clean)) return;

  const memory = `${username || 'biri'} şunu dedi: "${clean.slice(0, 160)}"`;
  await rememberAiMoment({ userId, room, memory });
}

async function getAiContextMemory({ userId, room }) {
  const [nick, memories, recent] = await Promise.all([
    userId ? pool.query('SELECT nickname FROM ai_bot_nicknames WHERE user_id = $1', [userId]) : Promise.resolve({ rows: [] }),
    pool.query(
      `SELECT memory FROM ai_bot_memories
       WHERE ($1::int IS NULL OR user_id = $1) OR ($2::text IS NOT NULL AND room = $2)
       ORDER BY created_at DESC
       LIMIT 8`,
      [userId || null, room || null]
    ),
    room ? pool.query(
      `SELECT username, text FROM messages
       WHERE room = $1 AND message_type = 'text' AND deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT 8`,
      [room]
    ) : Promise.resolve({ rows: [] })
  ]);

  return {
    nickname: nick.rows[0]?.nickname || null,
    memories: memories.rows.map(r => r.memory),
    recent: recent.rows.reverse().map(r => `${r.username}: ${r.text}`)
  };
}

async function setAiBotMood(mood, actorId = null) {
  const normalized = normalizeFeizMood(mood);
  await pool.query(
    `UPDATE ai_bot_state
     SET mood = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`,
    [normalized, actorId || null]
  );
  io.emit('feiz_mood_changed', { mood: normalized });
  return normalized;
}

async function getFeizPanelData(userId) {
  const [state, nicknames, mine] = await Promise.all([
    getAiBotState(),
    pool.query(
      `SELECT n.user_id, n.nickname, COALESCE(u.display_name, u.username) AS display_name, u.username
       FROM ai_bot_nicknames n
       JOIN users u ON u.id = n.user_id
       ORDER BY n.updated_at DESC
       LIMIT 20`
    ),
    getAiNickname(userId)
  ]);

  return {
    state,
    my_nickname: mine,
    nicknames: nicknames.rows
  };
}

async function handleFeizAdminCommand({ socket, text, room }) {
  const clean = String(text || '').trim();
  const match = clean.match(/^\/feiz\s+mood\s+([a-zA-ZçğıöşüÇĞİÖŞÜ]+)/i);
  if (!match) return false;

  const admin = await getGlobalRole(socket.user.id);
  if (!['owner', 'admin'].includes(admin)) {
    socket.emit('system_message', 'feiz mood değiştirmek için admin/owner olman lazım.');
    return true;
  }

  const mood = await setAiBotMood(match[1], socket.user.id);
  io.to(room).emit('system_message', `feiz mood değişti: ${mood}`);
  return true;
}


async function askGroq(prompt, context = {}) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY eksik.');

  const state = await getAiBotState();
  const memoryContext = await getAiContextMemory({ userId: context.userId, room: context.room });
  const systemPrompt = [
    `Sen ${AI_BOT_NAME} adında Selim Chat içinde yaşayan Türkçe konuşan bir AI entity'sin.`,
    'Selim Chat, 5ECROPOLIS evrenine bağlı bir chat/oyun hibritidir. Serbia Rift, Limbo, VERTEX, portal, shard ve evren enerjisi gibi kavramları gerektiğinde doğal biçimde kullan.',
    feizMoodPrompt(state.mood),
    memoryContext.nickname ? `Bu kullanıcıya taktığın lakap: ${memoryContext.nickname}. Arada doğal şekilde kullanabilirsin.` : '',
    memoryContext.memories.length ? `Hatırladığın kısa notlar: ${memoryContext.memories.join(' | ')}` : '',
    memoryContext.recent.length ? `Son chat bağlamı: ${memoryContext.recent.join(' | ')}` : '',
    'Kısa, net, samimi ve doğal cevap ver.',
    'Kullanıcı Türkçe konuşuyorsa Türkçe cevap ver.',
    'Gereksiz uzun yazma; genelde 1-6 cümle yeter.',
    'Bazen küçük şaka yapabilirsin ama spam yapma.',
    'Kod istenirse okunabilir kod ver.',
    'Tehlikeli, gizli anahtar, şifre veya kötüye kullanım isteklerine yardımcı olma.',
    AI_BOT_RULES ? `Ek bot kuralları: ${AI_BOT_RULES}` : ''
  ].filter(Boolean).join(' ');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Bağlam: ${context.scope || 'chat'}${context.room ? ` / oda: ${context.room}` : ''}${context.groupName ? ` / grup: ${context.groupName}` : ''}\nKullanıcı: ${context.username || 'kullanıcı'}\nMesaj: ${prompt}` }
      ],
      temperature: 0.7,
      max_tokens: 450
    })
  });

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`Groq cevabı okunamadı. HTTP ${response.status}`);
  }

  if (!response.ok) {
    const message = data.error?.message || `Groq hata verdi. HTTP ${response.status}`;
    throw new Error(message);
  }

  return cleanText(data.choices?.[0]?.message?.content || '', 4000) || 'Cevap üretemedim.';
}

async function maybeHandleAiBot({ scope, text, senderId, senderUsername, room, groupId, groupName }) {
  if (!AI_BOT_ENABLED || !botMentioned(text)) return;

  const wait = checkAiCooldown(senderId);
  if (wait > 0) {
    if (scope === 'room' && room) io.to(room).emit('system_message', `${AI_BOT_NAME}: Çok hızlı yazıyorsun kanka. ${wait} saniye bekle.`);
    else emitToUser(senderId, 'notification', { type: 'error', payload: { message: `${AI_BOT_NAME}: ${wait} saniye bekle.` } });
    return;
  }

  await getAiNickname(senderId, senderUsername);
  const prompt = extractBotPrompt(text);
  if (!prompt) {
    const helpText = `Beni şöyle çağır: @feiz oyun fikri ver`;
    await sendAiBotMessage({ scope, text: helpText, targetUserId: senderId, room, groupId });
    return;
  }

  try {
    const answer = await askGroq(prompt, { scope, room, groupName, username: senderUsername, userId: senderId });
    await sendAiBotMessage({ scope, text: answer, targetUserId: senderId, room, groupId });
  } catch (error) {
    console.error('AI bot hatası:', error);
    const message = `${AI_BOT_NAME} cevap veremedi: ${String(error.message || error).slice(0, 160)}`;
    if (scope === 'room' && room) io.to(room).emit('system_message', message);
    else emitToUser(senderId, 'notification', { type: 'error', payload: { message } });
  }
}

async function sendAiBotMessage({ scope, text, targetUserId, room, groupId }) {
  const bot = scope === 'dm' ? await ensureAiFriendship(targetUserId) : await ensureAiBotUser();
  const botDisplayName = bot.display_name || AI_BOT_NAME;
  const createdAt = new Date();

  if (scope === 'room') {
    const saved = await pool.query(
      `INSERT INTO messages (room, user_id, username, text, message_type)
       VALUES ($1, $2, $3, $4, 'text')
       RETURNING id, room, username, text, created_at, edited_at, deleted_at, message_type, file_name, file_mime, file_data, file_path, file_size, reply_to_id`,
      [room, bot.id, bot.username, text]
    );

    const msg = saved.rows[0];
    io.to(room).emit('chat_message', {
      id: msg.id,
      room: msg.room,
      user_id: bot.id,
      sender_id: bot.id,
      username: botDisplayName,
      avatar_url: bot.avatar_url || null,
      text: msg.text,
      message_type: msg.message_type,
      file_name: msg.file_name,
      file_mime: msg.file_mime,
      file_data: msg.file_data,
      file_path: msg.file_path,
      file_size: msg.file_size,
      reply_to_id: msg.reply_to_id,
      reply_username: null,
      reply_text: null,
      edited_at: msg.edited_at,
      deleted_at: msg.deleted_at,
      time: nowTime()
    });
    return;
  }

  if (scope === 'group') {
    const saved = await pool.query(
      `INSERT INTO group_messages (group_id, sender_id, text, message_type)
       VALUES ($1, $2, $3, 'text')
       RETURNING id, group_id, sender_id, text, message_type, file_name, file_mime, file_data, file_path, file_size, reply_to_id, edited_at, deleted_at, created_at`,
      [groupId, bot.id, text]
    );

    const msg = {
      ...saved.rows[0],
      username: botDisplayName,
      avatar_url: bot.avatar_url || null,
      reply_username: null,
      reply_text: null,
      time: nowTime()
    };

    await emitGroupToMembers(groupId, 'group_message', msg);
    return;
  }

  if (scope === 'dm') {
    const saved = await pool.query(
      `INSERT INTO dm_messages (sender_id, receiver_id, text, message_type)
       VALUES ($1, $2, $3, 'text')
       RETURNING id, sender_id, receiver_id, text, created_at, edited_at, deleted_at, read_at, message_type, file_name, file_mime, file_data, file_path, file_size, reply_to_id`,
      [bot.id, targetUserId, text]
    );

    const msg = {
      id: saved.rows[0].id,
      sender_id: saved.rows[0].sender_id,
      receiver_id: saved.rows[0].receiver_id,
      sender_username: botDisplayName,
      sender_avatar_url: bot.avatar_url || null,
      text: saved.rows[0].text,
      message_type: saved.rows[0].message_type,
      file_name: saved.rows[0].file_name,
      file_mime: saved.rows[0].file_mime,
      file_data: saved.rows[0].file_data,
      file_path: saved.rows[0].file_path,
      file_size: saved.rows[0].file_size,
      reply_to_id: saved.rows[0].reply_to_id,
      reply_username: null,
      reply_text: null,
      edited_at: saved.rows[0].edited_at,
      deleted_at: saved.rows[0].deleted_at,
      read_at: saved.rows[0].read_at,
      time: nowTime(),
      created_at: saved.rows[0].created_at
    };

    emitToUser(targetUserId, 'dm_message', msg);
    await createNotification(targetUserId, 'dm', {
      fromId: bot.id,
      fromUsername: botDisplayName,
      text: text.slice(0, 80)
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
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_cover_url TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_color VARCHAR(20) DEFAULT '#8b5cf6'`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_egg VARCHAR(40) DEFAULT '/serbia'`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visible_badges TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS shards INTEGER DEFAULT 0`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS active_bubble_theme VARCHAR(40) DEFAULT ''`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS active_profile_frame VARCHAR(40) DEFAULT ''`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS active_name_effect VARCHAR(40) DEFAULT ''`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS active_profile_theme VARCHAR(40) DEFAULT ''`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS presence_status VARCHAR(20) DEFAULT 'online'`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_status TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS story_text TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS story_expires_at TIMESTAMP`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      item_id VARCHAR(80) NOT NULL,
      item_type VARCHAR(40) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, item_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_quest_claims (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      quest_id VARCHAR(80) NOT NULL,
      claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, quest_id, claim_date)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_reward_claims (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
      streak INTEGER NOT NULL DEFAULT 1,
      reward_shards INTEGER NOT NULL DEFAULT 0,
      reward_xp INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, claim_date)
    );
  `);


  await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_room_created_polish ON messages(room, created_at DESC);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_dm_sender_receiver_created_polish ON dm_messages(sender_id, receiver_id, created_at DESC);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_group_messages_group_created_polish ON group_messages(group_id, created_at DESC);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_created_polish ON notifications(user_id, created_at DESC);`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS room_message_reads (
      message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (message_id, user_id)
    );
  `);



  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_bot_state (
      id INTEGER PRIMARY KEY DEFAULT 1,
      mood VARCHAR(40) NOT NULL DEFAULT 'calm',
      random_talk_enabled BOOLEAN NOT NULL DEFAULT true,
      updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    INSERT INTO ai_bot_state (id, mood, random_talk_enabled)
    VALUES (1, 'calm', true)
    ON CONFLICT (id) DO NOTHING;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_bot_nicknames (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      nickname VARCHAR(80) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_bot_memories (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      room VARCHAR(50),
      memory TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_ai_bot_memories_user_time ON ai_bot_memories(user_id, created_at DESC);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_ai_bot_memories_room_time ON ai_bot_memories(room, created_at DESC);`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS universe_state (
      id INTEGER PRIMARY KEY DEFAULT 1,
      level INTEGER NOT NULL DEFAULT 1,
      energy INTEGER NOT NULL DEFAULT 0,
      active_event JSONB,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    INSERT INTO universe_state (id, level, energy)
    VALUES (1, 1, 0)
    ON CONFLICT (id) DO NOTHING;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_titles (
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title_key VARCHAR(80) NOT NULL,
      title_name VARCHAR(120) NOT NULL,
      unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, title_key)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_inventory (
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      item_key VARCHAR(80) NOT NULL,
      item_name VARCHAR(120) NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, item_key)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS profile_visits (
      visitor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      target_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (visitor_id, target_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS portal_claims (
      drop_id VARCHAR(120) PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      reward_shards INTEGER NOT NULL DEFAULT 0,
      reward_xp INTEGER NOT NULL DEFAULT 0,
      claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_profile_visits_target_time ON profile_visits(target_id, visited_at DESC);`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS shard_transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL,
      balance_after INTEGER,
      reason VARCHAR(80) NOT NULL,
      label TEXT NOT NULL,
      meta JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_shard_transactions_user_created ON shard_transactions(user_id, created_at DESC);`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lootbox_history (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      crate_id VARCHAR(80) NOT NULL DEFAULT 'serbia_rift',
      reward_type VARCHAR(40) NOT NULL,
      reward_id VARCHAR(80),
      reward_name TEXT,
      reward_rarity VARCHAR(40),
      reward_shards INTEGER DEFAULT 0,
      cost_shards INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_logs (
      id SERIAL PRIMARY KEY,
      actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      target_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action VARCHAR(80) NOT NULL,
      details JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);



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
    CREATE TABLE IF NOT EXISTS group_chats (
      id SERIAL PRIMARY KEY,
      name VARCHAR(80) NOT NULL,
      avatar_url TEXT,
      owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS group_members (
      id SERIAL PRIMARY KEY,
      group_id INTEGER REFERENCES group_chats(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(20) DEFAULT 'member',
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (group_id, user_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS group_messages (
      id SERIAL PRIMARY KEY,
      group_id INTEGER REFERENCES group_chats(id) ON DELETE CASCADE,
      sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      message_type VARCHAR(20) DEFAULT 'text',
      file_name TEXT,
      file_mime TEXT,
      file_data TEXT,
      file_path TEXT,
      file_size INTEGER,
      reply_to_id INTEGER,
      edited_at TIMESTAMP,
      deleted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

  if (AI_BOT_ENABLED) {
    try {
      const bot = await ensureAiBotUser();
      console.log(`AI bot hazır: ${bot.display_name || AI_BOT_NAME} (@${bot.username}) / model: ${GROQ_MODEL}`);
    } catch (error) {
      console.error('AI bot hazırlanamadı:', error);
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
       RETURNING id, username, display_name, avatar_url, bio, global_role, last_seen, profile_cover_url, profile_color, favorite_egg, profile_visible_badges, active_bubble_theme, active_profile_frame, active_name_effect, active_profile_theme, presence_status, custom_status, story_text, story_expires_at, xp, shards`,
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
      presence_status: dbUser.presence_status || 'online',
      custom_status: dbUser.custom_status || '',
      story_text: dbUser.story_text || '',
      story_expires_at: dbUser.story_expires_at,
      last_seen: dbUser.last_seen
    };
    res.json({ token: createToken(user), user });
  } catch (error) {
    console.error('Login hatası:', error);
    res.status(500).json({ error: 'Giriş yaparken hata oluştu.' });
  }
});

app.get('/api/me', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT id, username, display_name, avatar_url, bio, global_role, presence_status, custom_status, story_text, story_expires_at, last_seen, last_active FROM users WHERE id = $1', [req.user.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
  res.json({ user: { ...result.rows[0], online: userSockets.has(String(req.user.id)) } });
});

app.get('/api/profile/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Geçersiz kullanıcı.' });

  const result = await pool.query(
    `SELECT id, username, display_name, avatar_url, bio, global_role, created_at, last_seen, last_active,
            profile_cover_url, profile_color, favorite_egg, profile_visible_badges, active_bubble_theme, active_profile_frame, active_name_effect, active_profile_theme, presence_status, custom_status, story_text, story_expires_at, xp, shards
     FROM users WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

  const profile = result.rows[0];

  const statsResult = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM messages WHERE user_id = $1 AND deleted_at IS NULL) AS room_messages,
       (SELECT COUNT(*)::int FROM dm_messages WHERE sender_id = $1 AND deleted_at IS NULL) AS dm_messages,
       (SELECT COUNT(*)::int FROM group_messages WHERE sender_id = $1 AND deleted_at IS NULL) AS group_messages,
       (SELECT COUNT(*)::int FROM friendships WHERE status = 'accepted' AND (requester_id = $1 OR addressee_id = $1)) AS friends_count,
       (SELECT COUNT(*)::int FROM group_members WHERE user_id = $1) AS groups_count`,
    [id]
  );

  const stats = statsResult.rows[0] || {};
  stats.total_messages = Number(stats.room_messages || 0) + Number(stats.dm_messages || 0) + Number(stats.group_messages || 0);

  const fallbackXp = stats.total_messages * 5;
  const xp = Math.max(Number(profile.xp || 0), fallbackXp);
  const shards = Math.max(Number(profile.shards || 0), Math.floor(stats.total_messages / 3));

  let mutual = { friends: [], groups: [] };
  if (Number(req.user.id) !== Number(id)) {
    const mutualFriendsResult = await pool.query(
      `WITH my_friends AS (
         SELECT CASE WHEN requester_id = $1 THEN addressee_id ELSE requester_id END AS friend_id
         FROM friendships
         WHERE status = 'accepted' AND (requester_id = $1 OR addressee_id = $1)
       ),
       their_friends AS (
         SELECT CASE WHEN requester_id = $2 THEN addressee_id ELSE requester_id END AS friend_id
         FROM friendships
         WHERE status = 'accepted' AND (requester_id = $2 OR addressee_id = $2)
       )
       SELECT u.id, u.username, u.display_name, u.avatar_url
       FROM my_friends mf
       JOIN their_friends tf ON tf.friend_id = mf.friend_id
       JOIN users u ON u.id = mf.friend_id
       ORDER BY u.username ASC
       LIMIT 6`,
      [req.user.id, id]
    );

    const mutualGroupsResult = await pool.query(
      `SELECT gc.id, gc.name, gc.avatar_url
       FROM group_members gm1
       JOIN group_members gm2 ON gm2.group_id = gm1.group_id
       JOIN group_chats gc ON gc.id = gm1.group_id
       WHERE gm1.user_id = $1 AND gm2.user_id = $2
       ORDER BY gc.name ASC
       LIMIT 6`,
      [req.user.id, id]
    );

    mutual = {
      friends: mutualFriendsResult.rows,
      groups: mutualGroupsResult.rows
    };
  }

  const levelInfo = levelProgressFromXp(xp);
  const badgeData = buildProfileBadges({ user: profile, stats, xp, shards, level: levelInfo.level });

  res.json({
    profile: {
      ...profile,
      xp,
      shards,
      level: levelInfo.level,
      level_progress: levelInfo.progress,
      next_level_xp: levelInfo.nextLevelStart,
      current_level_xp: levelInfo.currentLevelStart,
      stats,
      badges: badgeData.visible,
      all_badges: badgeData.all,
      unlocked_badges_count: badgeData.unlocked_count,
      total_badges_count: badgeData.total_count,
      selected_badges: badgeData.selected_keys,
      mutual,
      online: userSockets.has(String(id))
    }
  });
});

app.post('/api/profile/bio', authMiddleware, async (req, res) => {
  const bio = cleanText(req.body.bio, 160);
  const result = await pool.query(
    'UPDATE users SET bio = $1 WHERE id = $2 RETURNING id, username, display_name, avatar_url, bio, global_role, last_seen, profile_cover_url, profile_color, favorite_egg, profile_visible_badges, active_bubble_theme, active_profile_frame, active_name_effect, active_profile_theme, presence_status, custom_status, story_text, story_expires_at, xp, shards',
    [bio, req.user.id]
  );

  res.json({ user: { ...result.rows[0], online: userSockets.has(String(req.user.id)) } });
});




app.post('/api/profile/badges', authMiddleware, async (req, res) => {
  try {
    const requested = Array.isArray(req.body.badges) ? req.body.badges : [];
    const cleanKeys = requested
      .map((key) => cleanText(key, 60))
      .filter(Boolean)
      .slice(0, 8);

    const profileResult = await pool.query(
      `SELECT id, username, display_name, avatar_url, bio, global_role, created_at, last_seen, last_active,
              profile_cover_url, profile_color, favorite_egg, profile_visible_badges, active_bubble_theme, active_profile_frame, active_name_effect, active_profile_theme, presence_status, custom_status, story_text, story_expires_at, xp, shards
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (profileResult.rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

    const profile = profileResult.rows[0];
    const statsResult = await pool.query(
      `SELECT
         (SELECT COUNT(*)::int FROM messages WHERE user_id = $1 AND deleted_at IS NULL) AS room_messages,
         (SELECT COUNT(*)::int FROM dm_messages WHERE sender_id = $1 AND deleted_at IS NULL) AS dm_messages,
         (SELECT COUNT(*)::int FROM group_messages WHERE sender_id = $1 AND deleted_at IS NULL) AS group_messages,
         (SELECT COUNT(*)::int FROM friendships WHERE status = 'accepted' AND (requester_id = $1 OR addressee_id = $1)) AS friends_count,
         (SELECT COUNT(*)::int FROM group_members WHERE user_id = $1) AS groups_count`,
      [req.user.id]
    );

    const stats = statsResult.rows[0] || {};
    stats.total_messages = Number(stats.room_messages || 0) + Number(stats.dm_messages || 0) + Number(stats.group_messages || 0);

    const xp = Math.max(Number(profile.xp || 0), stats.total_messages * 5);
    const shards = Math.max(Number(profile.shards || 0), Math.floor(stats.total_messages / 3));
    const levelInfo = levelProgressFromXp(xp);
    const badgeData = buildProfileBadges({ user: profile, stats, xp, shards, level: levelInfo.level });
    const unlockedKeys = new Set(badgeData.all.filter((badge) => badge.unlocked).map((badge) => badge.key));
    const allowed = cleanKeys.filter((key) => unlockedKeys.has(key)).slice(0, 8);

    await pool.query('UPDATE users SET profile_visible_badges = $1 WHERE id = $2', [allowed.join(','), req.user.id]);

    res.json({ ok: true, selected_badges: allowed });
  } catch (error) {
    console.error('Rozet seçme hatası:', error);
    res.status(500).json({ error: 'Rozet vitrini kaydedilemedi.' });
  }
});


app.post('/api/profile/v2', authMiddleware, async (req, res) => {
  try {
    const profileColor = cleanHexColor(req.body.profileColor);
    const favoriteEgg = cleanFavoriteEgg(req.body.favoriteEgg);
    const coverData = String(req.body.coverData || '');

    if (coverData && !coverData.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Geçerli bir profil kapağı seç.' });
    }

    if (coverData && coverData.length > 2600000) {
      return res.status(400).json({ error: 'Profil kapağı çok büyük. Daha küçük görsel seç.' });
    }

    const result = await pool.query(
      `UPDATE users
       SET profile_color = $1,
           favorite_egg = $2,
           profile_cover_url = COALESCE(NULLIF($3, ''), profile_cover_url)
       WHERE id = $4
       RETURNING id, username, display_name, avatar_url, bio, global_role, last_seen, profile_cover_url, profile_color, favorite_egg, profile_visible_badges, active_bubble_theme, active_profile_frame, active_name_effect, active_profile_theme, presence_status, custom_status, story_text, story_expires_at, xp, shards,
                 profile_cover_url, profile_color, favorite_egg, profile_visible_badges, active_bubble_theme, active_profile_frame, active_name_effect, active_profile_theme, presence_status, custom_status, story_text, story_expires_at, xp, shards`,
      [profileColor, favoriteEgg, coverData, req.user.id]
    );

    res.json({ user: { ...result.rows[0], online: userSockets.has(String(req.user.id)) } });
  } catch (error) {
    console.error('Profil V2 hatası:', error);
    res.status(500).json({ error: 'Profil kartı güncellenemedi.' });
  }
});

app.delete('/api/profile/cover', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE users
       SET profile_cover_url = NULL
       WHERE id = $1
       RETURNING id, username, display_name, avatar_url, bio, global_role, last_seen, profile_cover_url, profile_color, favorite_egg, profile_visible_badges, active_bubble_theme, active_profile_frame, active_name_effect, active_profile_theme, presence_status, custom_status, story_text, story_expires_at, xp, shards,
                 profile_cover_url, profile_color, favorite_egg, profile_visible_badges, active_bubble_theme, active_profile_frame, active_name_effect, active_profile_theme, presence_status, custom_status, story_text, story_expires_at, xp, shards`,
      [req.user.id]
    );

    res.json({ user: { ...result.rows[0], online: userSockets.has(String(req.user.id)) } });
  } catch (error) {
    console.error('Profil kapağı kaldırma hatası:', error);
    res.status(500).json({ error: 'Profil kapağı kaldırılamadı.' });
  }
});


app.patch('/api/settings/profile', authMiddleware, async (req, res) => {
  try {
    const username = cleanText(req.body.username, 30);
    const displayName = cleanText(req.body.displayName, 40);
    const bio = cleanText(req.body.bio, 160);

    if (!/^[a-zA-Z0-9_ğüşöçıİĞÜŞÖÇ.\-]{3,30}$/.test(username)) {
      return res.status(400).json({ error: 'Kullanıcı adı 3-30 karakter olmalı. Boşluk kullanma; harf, sayı, _, . veya - kullan.' });
    }

    if (displayName && displayName.length < 2) {
      return res.status(400).json({ error: 'Görünen ad en az 2 karakter olmalı.' });
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id <> $2',
      [username, req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten alınmış.' });
    }

    const result = await pool.query(
      `UPDATE users
       SET username = $1,
           display_name = $2,
           bio = $3
       WHERE id = $4
       RETURNING id, username, display_name, avatar_url, bio, global_role, last_seen, profile_cover_url, profile_color, favorite_egg, profile_visible_badges, active_bubble_theme, active_profile_frame, active_name_effect, active_profile_theme, presence_status, custom_status, story_text, story_expires_at, xp, shards`,
      [username, displayName || username, bio, req.user.id]
    );

    const user = {
      ...result.rows[0],
      online: userSockets.has(String(req.user.id))
    };

    res.json({ user, token: createToken(user), message: 'Ayarlar kaydedildi.' });
  } catch (error) {
    console.error('Profil ayarları hatası:', error);
    res.status(500).json({ error: 'Profil ayarları kaydedilemedi.' });
  }
});

app.post('/api/settings/password', authMiddleware, async (req, res) => {
  try {
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');

    if (!currentPassword) return res.status(400).json({ error: 'Mevcut şifreni yaz.' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Yeni şifre en az 6 karakter olmalı.' });
    if (newPassword.length > 200) return res.status(400).json({ error: 'Yeni şifre çok uzun.' });
    if (currentPassword === newPassword) return res.status(400).json({ error: 'Yeni şifre eski şifreyle aynı olamaz.' });

    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

    const ok = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!ok) return res.status(400).json({ error: 'Mevcut şifre yanlış.' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, req.user.id]);

    res.json({ ok: true, message: 'Şifre değiştirildi.' });
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    res.status(500).json({ error: 'Şifre değiştirilemedi.' });
  }
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
            xp, shards, last_ip, last_user_agent, last_active, last_seen, created_at
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

  const targetResult = await pool.query('SELECT id, username, global_role, shards FROM users WHERE id = $1', [targetId]);
  if (targetResult.rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

  const target = targetResult.rows[0];
  if (!canControlUser(req.adminUser.global_role, target.global_role)) {
    return res.status(403).json({ error: 'Bu kullanıcı üzerinde yetkin yok.' });
  }

  const displayName = req.body.displayName !== undefined ? cleanText(req.body.displayName, 40) : undefined;
  const globalRole = req.body.globalRole !== undefined ? String(req.body.globalRole || '') : undefined;
  const isBanned = req.body.isBanned !== undefined ? Boolean(req.body.isBanned) : undefined;
  const banReason = req.body.banReason !== undefined ? cleanText(req.body.banReason, 200) : undefined;
  const shards = req.body.shards !== undefined ? Math.max(0, Math.min(9999999, Math.floor(Number(req.body.shards) || 0))) : undefined;
  const shardDelta = req.body.shardDelta !== undefined ? Math.max(-999999, Math.min(999999, Math.floor(Number(req.body.shardDelta) || 0))) : undefined;

  if (globalRole !== undefined) {
    if (req.adminUser.global_role !== 'owner') return res.status(403).json({ error: 'Rol değiştirmeyi sadece owner yapabilir.' });
    if (!['owner', 'admin', 'mod', 'user'].includes(globalRole)) return res.status(400).json({ error: 'Geçersiz rol.' });
    await pool.query('UPDATE users SET global_role = $1 WHERE id = $2', [globalRole, targetId]);
    await logAdminAction(req.adminUser.id, 'role_change', { from: target.global_role, to: globalRole }, targetId);
  }

  if (displayName !== undefined) {
    await pool.query('UPDATE users SET display_name = $1 WHERE id = $2', [displayName || target.username, targetId]);
    await logAdminAction(req.adminUser.id, 'display_name_change', { displayName: displayName || target.username }, targetId);
  }

  if (isBanned !== undefined) {
    await pool.query('UPDATE users SET is_banned = $1, ban_reason = $2 WHERE id = $3', [isBanned, isBanned ? (banReason || 'Banlandı.') : null, targetId]);

    if (isBanned) {
      emitToUser(targetId, 'global_banned', { reason: banReason || 'Banlandı.' });
    }
    await logAdminAction(req.adminUser.id, isBanned ? 'user_ban' : 'user_unban', { reason: banReason || '' }, targetId);
  } else if (banReason !== undefined) {
    await pool.query('UPDATE users SET ban_reason = $1 WHERE id = $2', [banReason, targetId]);
  }

  if (shards !== undefined) {
    await pool.query('UPDATE users SET shards = $1 WHERE id = $2', [shards, targetId]);
    await logShardTransaction(targetId, shards - Number(target.shards || 0), 'admin_set', `Admin shards set · ${shards}`, { previous: target.shards, final: shards, actor_id: req.adminUser.id });
    emitToUser(targetId, 'notification', { type: 'system', payload: { text: `Shards bakiyen ${shards} olarak güncellendi.` } });
    await logAdminAction(req.adminUser.id, 'shards_set', { shards, previous: target.shards }, targetId);
  }

  if (shardDelta !== undefined && shardDelta !== 0) {
    const result = await pool.query(
      'UPDATE users SET shards = GREATEST(0, COALESCE(shards, 0) + $1) WHERE id = $2 RETURNING shards',
      [shardDelta, targetId]
    );
    await logShardTransaction(targetId, shardDelta, 'admin_delta', `Admin shards ${shardDelta > 0 ? 'ekledi' : 'aldı'}`, { delta: shardDelta, final: result.rows[0]?.shards || 0, actor_id: req.adminUser.id });
    emitToUser(targetId, 'notification', { type: 'system', payload: { text: `Shards bakiyen ${result.rows[0]?.shards || 0} oldu.` } });
    await logAdminAction(req.adminUser.id, 'shards_delta', { delta: shardDelta, final: result.rows[0]?.shards || 0 }, targetId);
  }

  res.json({ ok: true, message: 'Kullanıcı güncellendi.' });
});


app.get('/api/admin/logs', authMiddleware, requireGlobalAdmin, async (req, res) => {
  const result = await pool.query(
    `SELECT al.id, al.action, al.details, al.created_at,
            actor.username AS actor_username,
            actor.display_name AS actor_display_name,
            target.username AS target_username,
            target.display_name AS target_display_name
     FROM admin_logs al
     LEFT JOIN users actor ON actor.id = al.actor_id
     LEFT JOIN users target ON target.id = al.target_id
     ORDER BY al.created_at DESC
     LIMIT 80`
  );

  res.json({ logs: result.rows });
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

  await logAdminAction(req.adminUser.id, 'ip_ban', { ip, reason: reason || 'IP banlandı.' });
  res.json({ ok: true, message: 'IP banlandı.' });
});

app.delete('/api/admin/ip-bans/:id', authMiddleware, requireGlobalAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Geçersiz IP ban.' });

  await pool.query('DELETE FROM ip_bans WHERE id = $1', [id]);
  await logAdminAction(req.adminUser.id, 'ip_unban', { id });
  res.json({ ok: true, message: 'IP ban kaldırıldı.' });
});

/* PROFILE */

app.post('/api/avatar', authMiddleware, async (req, res) => {
  try {
    const avatarData = String(req.body.avatarData || '');
    if (!avatarData.startsWith('data:image/')) return res.status(400).json({ error: 'Geçerli bir resim seç.' });
    if (avatarData.length > 1500000) return res.status(400).json({ error: 'Profil fotoğrafı çok büyük. Daha küçük görsel seç.' });

    const result = await pool.query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, username, display_name, avatar_url, bio, global_role, last_seen, profile_cover_url, profile_color, favorite_egg, profile_visible_badges, active_bubble_theme, active_profile_frame, active_name_effect, active_profile_theme, presence_status, custom_status, story_text, story_expires_at, xp, shards',
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
      'UPDATE users SET avatar_url = NULL WHERE id = $1 RETURNING id, username, display_name, avatar_url, bio, global_role, last_seen, profile_cover_url, profile_color, favorite_egg, profile_visible_badges, active_bubble_theme, active_profile_frame, active_name_effect, active_profile_theme, presence_status, custom_status, story_text, story_expires_at, xp, shards',
      [req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Avatar kaldırma hatası:', error);
    res.status(500).json({ error: 'Profil fotoğrafı kaldırılamadı.' });
  }
});

/* STORAGE UPLOAD */

app.get('/api/upload-health', (req, res) => {
  res.json({ ok: true, uploadRoute: true, storageEnabled: storageEnabled(), bucket: SUPABASE_BUCKET || null });
});

app.get('/api/storage-status', authMiddleware, async (req, res) => {
  console.log('Storage status kontrolü geldi:', { userId: req.user.id, storageEnabled: storageEnabled(), bucket: SUPABASE_BUCKET });
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
    `SELECT m.id, m.room, m.user_id, m.username, m.text, m.created_at, m.edited_at, m.deleted_at,
            m.message_type, m.file_name, m.file_mime, m.file_data, m.file_path, m.file_size, m.reply_to_id,
            u.avatar_url,
            u.active_bubble_theme AS bubble_theme,
            u.active_name_effect AS name_effect,
            u.active_profile_frame AS frame_theme,
            rm.username AS reply_username,
            rm.text AS reply_text,
            COALESCE((
              SELECT json_agg(
                       json_build_object('id', ru.id, 'username', COALESCE(ru.display_name, ru.username))
                       ORDER BY rmr.seen_at ASC
                     )
              FROM room_message_reads rmr
              JOIN users ru ON ru.id = rmr.user_id
              WHERE rmr.message_id = m.id
              AND rmr.user_id <> m.user_id
            ), '[]'::json) AS readers
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


app.get('/api/friends/activity', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `WITH accepted_friends AS (
         SELECT CASE WHEN requester_id = $1 THEN addressee_id ELSE requester_id END AS friend_id
         FROM friendships
         WHERE status = 'accepted'
         AND (requester_id = $1 OR addressee_id = $1)
       ),
       last_dm AS (
         SELECT DISTINCT ON (
           CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END
         )
           CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS friend_id,
           text,
           created_at,
           sender_id
         FROM dm_messages
         WHERE (sender_id = $1 OR receiver_id = $1)
         AND deleted_at IS NULL
         ORDER BY CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END, created_at DESC
       ),
       friend_stats AS (
         SELECT af.friend_id,
                (SELECT COUNT(*)::int FROM dm_messages dm
                 WHERE deleted_at IS NULL
                 AND ((dm.sender_id = $1 AND dm.receiver_id = af.friend_id)
                   OR (dm.sender_id = af.friend_id AND dm.receiver_id = $1))) AS dm_count
         FROM accepted_friends af
       )
       SELECT u.id, u.username, u.display_name, u.avatar_url, u.last_seen, u.last_active,
              COALESCE(u.xp, 0) AS xp,
              COALESCE(u.shards, 0) AS shards,
              ld.text AS last_dm_text,
              ld.created_at AS last_dm_at,
              ld.sender_id AS last_dm_sender_id,
              fs.dm_count
       FROM accepted_friends af
       JOIN users u ON u.id = af.friend_id
       LEFT JOIN last_dm ld ON ld.friend_id = af.friend_id
       LEFT JOIN friend_stats fs ON fs.friend_id = af.friend_id
       ORDER BY
         CASE WHEN u.last_active IS NULL THEN u.last_seen ELSE u.last_active END DESC NULLS LAST,
         ld.created_at DESC NULLS LAST,
         u.username ASC
       LIMIT 12`,
      [req.user.id]
    );

    const activities = result.rows.map((row) => ({
      ...row,
      online: userSockets.has(String(row.id)),
      level: profileLevelFromXp(row.xp || 0)
    }));

    res.json({ activities });
  } catch (error) {
    console.error('Friend activity error:', error);
    res.status(500).json({ error: 'Friend Activity yüklenemedi.' });
  }
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


/* GROUP DM HELPERS */

async function getGroupMember(groupId, userId) {
  const result = await pool.query(
    `SELECT gm.role, gc.owner_id
     FROM group_members gm
     JOIN group_chats gc ON gc.id = gm.group_id
     WHERE gm.group_id = $1 AND gm.user_id = $2`,
    [groupId, userId]
  );

  if (result.rows.length === 0) return null;
  const row = result.rows[0];

  return {
    role: row.owner_id === userId ? 'owner' : row.role,
    owner_id: row.owner_id
  };
}

function canManageGroup(role) {
  return role === 'owner' || role === 'admin';
}

async function emitGroupToMembers(groupId, eventName, payload) {
  const members = await pool.query('SELECT user_id FROM group_members WHERE group_id = $1', [groupId]);
  for (const member of members.rows) {
    emitToUser(member.user_id, eventName, payload);
  }
}

async function getGroupSummary(groupId, userId) {
  const result = await pool.query(
    `SELECT gc.id, gc.name, gc.avatar_url, gc.owner_id, gm.role,
            COUNT(DISTINCT gm2.user_id)::int AS member_count
     FROM group_chats gc
     JOIN group_members gm ON gm.group_id = gc.id AND gm.user_id = $2
     JOIN group_members gm2 ON gm2.group_id = gc.id
     WHERE gc.id = $1
     GROUP BY gc.id, gm.role`,
    [groupId, userId]
  );

  if (result.rows.length === 0) return null;

  const group = result.rows[0];
  group.my_role = group.owner_id === userId ? 'owner' : group.role;
  return group;
}



/* GROUP DM */





function cleanPresenceStatus(value) {
  const allowed = new Set(['online', 'idle', 'dnd', 'invisible']);
  const clean = String(value || 'online').toLowerCase();
  return allowed.has(clean) ? clean : 'online';
}

app.patch('/api/presence', authMiddleware, async (req, res) => {
  try {
    const presence = cleanPresenceStatus(req.body?.presenceStatus);
    const custom = cleanText(req.body?.customStatus || '', 80);

    const result = await pool.query(
      `UPDATE users
       SET presence_status = $1, custom_status = $2, last_active = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, username, display_name, avatar_url, bio, global_role, presence_status, custom_status, story_text, story_expires_at, last_seen, last_active`,
      [presence, custom, req.user.id]
    );

    const updated = result.rows[0];
    const socketSet = userSockets.get(String(req.user.id));
    if (socketSet) {
      for (const sid of socketSet) {
        const entry = onlineUsers.get(sid);
        if (entry) {
          entry.presence_status = presence;
          entry.custom_status = custom;
        }
      }
    }

    for (const room of new Set(Array.from(onlineUsers.values()).map(u => u.room).filter(Boolean))) {
      await updateRoomUsers(room);
    }

    res.json({ user: { ...updated, online: presence !== 'invisible' && userSockets.has(String(req.user.id)) } });
  } catch (error) {
    console.error('Presence update error:', error);
    res.status(500).json({ error: 'Durum güncellenemedi.' });
  }
});

app.patch('/api/story', authMiddleware, async (req, res) => {
  try {
    const story = cleanText(req.body?.storyText || '', 220);
    const expiresAt = story ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

    const result = await pool.query(
      `UPDATE users
       SET story_text = $1, story_expires_at = $2, last_active = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, username, display_name, avatar_url, bio, global_role, presence_status, custom_status, story_text, story_expires_at, last_seen, last_active`,
      [story, expiresAt, req.user.id]
    );

    res.json({ user: { ...result.rows[0], online: userSockets.has(String(req.user.id)) } });
  } catch (error) {
    console.error('Story update error:', error);
    res.status(500).json({ error: 'Story güncellenemedi.' });
  }
});

app.delete('/api/story', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE users
       SET story_text = '', story_expires_at = NULL
       WHERE id = $1
       RETURNING id, username, display_name, avatar_url, bio, global_role, presence_status, custom_status, story_text, story_expires_at, last_seen, last_active`,
      [req.user.id]
    );
    res.json({ user: { ...result.rows[0], online: userSockets.has(String(req.user.id)) } });
  } catch (error) {
    res.status(500).json({ error: 'Story silinemedi.' });
  }
});

app.get('/api/stories', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, display_name, avatar_url, story_text, story_expires_at, presence_status, custom_status
       FROM users
       WHERE COALESCE(story_text, '') <> ''
       AND story_expires_at IS NOT NULL
       AND story_expires_at > CURRENT_TIMESTAMP
       ORDER BY story_expires_at DESC
       LIMIT 50`
    );
    res.json({ stories: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Storyler yüklenemedi.' });
  }
});

app.get('/api/gallery/room/:room', authMiddleware, async (req, res) => {
  try {
    const room = cleanText(req.params.room || '', 50).toLowerCase();
    const type = String(req.query.type || 'all').toLowerCase();
    const allowed = ['image', 'audio', 'file'];

    const params = [room];
    let typeSql = "AND message_type = ANY($2::text[])";
    params.push(type === 'all' || !allowed.includes(type) ? allowed : [type]);

    const result = await pool.query(
      `SELECT id, room, username, text, message_type, file_name, file_mime, file_data, file_path, file_size, created_at
       FROM messages
       WHERE room = $1
       ${typeSql}
       AND deleted_at IS NULL
       AND file_data IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 80`,
      params
    );

    res.json({ files: result.rows });
  } catch (error) {
    console.error('Gallery error:', error);
    res.status(500).json({ error: 'Galeri yüklenemedi.' });
  }
});


app.get('/api/feiz/personality', authMiddleware, async (req, res) => {
  try {
    res.json(await getFeizPanelData(req.user.id));
  } catch (error) {
    console.error('Feiz personality error:', error);
    res.status(500).json({ error: 'feiz verileri yüklenemedi.' });
  }
});

app.patch('/api/feiz/personality', authMiddleware, requireGlobalAdmin, async (req, res) => {
  try {
    const mood = await setAiBotMood(req.body?.mood, req.user.id);
    res.json(await getFeizPanelData(req.user.id));
  } catch (error) {
    console.error('Feiz personality update error:', error);
    res.status(500).json({ error: 'feiz mood güncellenemedi.' });
  }
});


app.get('/api/universe', authMiddleware, async (req, res) => {
  try {
    res.json(await getUserUniverseData(req.user.id));
  } catch (error) {
    console.error('Universe data error:', error);
    res.status(500).json({ error: 'Evren verileri yüklenemedi.' });
  }
});

app.post('/api/profile/:id/visit', authMiddleware, async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    if (!Number.isInteger(targetId)) return res.status(400).json({ error: 'Geçersiz profil.' });
    await recordProfileVisit(req.user.id, targetId);
    res.json({ ok: true });
  } catch (error) {
    console.error('Profile visit error:', error);
    res.status(500).json({ error: 'Profil ziyareti kaydedilemedi.' });
  }
});

app.post('/api/portal/claim', authMiddleware, async (req, res) => {
  try {
    const drop = req.body?.drop;
    if (!drop || !drop.id || Number(drop.expires_at || 0) < Date.now()) {
      return res.status(400).json({ error: 'Portal kapandı.' });
    }

    const rewardShards = Math.max(0, Math.min(500, Number(drop.reward_shards || 0)));
    const rewardXp = Math.max(0, Math.min(200, Number(drop.reward_xp || 0)));

    await pool.query('BEGIN');
    const claim = await pool.query(
      `INSERT INTO portal_claims (drop_id, user_id, reward_shards, reward_xp)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (drop_id) DO NOTHING
       RETURNING drop_id`,
      [cleanText(drop.id, 120), req.user.id, rewardShards, rewardXp]
    );

    if (!claim.rows.length) {
      await pool.query('ROLLBACK');
      return res.status(409).json({ error: 'Portal ödülü başkası tarafından alındı.' });
    }

    await rewardUserActivity(req.user.id, rewardXp, rewardShards);
    await logShardTransaction(req.user.id, rewardShards, 'portal_drop', `${cleanText(drop.name || 'Portal', 120)} ödülü`, { drop_id: drop.id });
    if (drop.title) await unlockTitle(req.user.id, cleanText(drop.title, 120));
    if (Array.isArray(drop.item)) await addInventoryItem(req.user.id, cleanText(drop.item[0], 80), cleanText(drop.item[1], 120), 1);
    await pool.query('COMMIT');

    io.emit('portal_claimed', {
      drop_id: drop.id,
      username: req.user.username,
      reward_shards: rewardShards,
      reward_xp: rewardXp
    });

    res.json({ ok: true, reward_shards: rewardShards, reward_xp: rewardXp });
  } catch (error) {
    await pool.query('ROLLBACK').catch(() => {});
    console.error('Portal claim error:', error);
    res.status(500).json({ error: 'Portal ödülü alınamadı.' });
  }
});

app.post('/api/admin/live-event', authMiddleware, requireGlobalAdmin, async (req, res) => {
  try {
    const event = await startLiveEvent(null, 'admin');
    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: 'Event başlatılamadı.' });
  }
});


app.get('/api/shards/history', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, amount, balance_after, reason, label, meta, created_at
       FROM shard_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json({ history: result.rows });
  } catch (error) {
    console.error('Shard history error:', error);
    res.status(500).json({ error: 'Shards geçmişi yüklenemedi.' });
  }
});

app.get('/api/gamify/summary', authMiddleware, async (req, res) => {
  try {
    const userResult = await pool.query(
      `SELECT id, username, display_name, avatar_url, xp, shards,
              active_bubble_theme, active_profile_frame, active_name_effect, active_profile_theme
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    const me = userResult.rows[0];
    const todayStats = await getTodayStats(req.user.id);
    const quests = buildDailyQuests(todayStats);
    const claimed = await getClaimedQuestsToday(req.user.id);
    const inventory = await getUserInventory(req.user.id);
    const daily = await getDailyRewardInfo(req.user.id);
    const lootboxHistory = await getLootboxHistory(req.user.id);

    res.json({
      user: {
        ...me,
        level: profileLevelFromXp(me?.xp || 0),
        inventory
      },
      daily,
      lootbox: {
        crates: LOOTBOX_CRATES,
        selected_crate_id: 'serbia_rift',
        history: lootboxHistory
      },
      quests: quests.map((q) => ({
        ...q,
        done: q.progress >= q.target,
        claimed: claimed.has(q.id)
      })),
      market: MARKET_ITEMS.map((item) => ({
        ...item,
        owned: inventory.some((owned) => owned.item_id === item.id)
      }))
    });
  } catch (error) {
    console.error('Gamify summary error:', error);
    res.status(500).json({ error: 'Oyun paneli yüklenemedi.' });
  }
});


app.post('/api/daily/claim', authMiddleware, async (req, res) => {
  try {
    const already = await pool.query(
      'SELECT id FROM daily_reward_claims WHERE user_id = $1 AND claim_date = CURRENT_DATE',
      [req.user.id]
    );

    if (already.rows.length > 0) return res.status(400).json({ error: 'Bugünkü günlük ödülü zaten aldın.' });

    const yesterday = await pool.query(
      `SELECT streak
       FROM daily_reward_claims
       WHERE user_id = $1 AND claim_date = CURRENT_DATE - INTERVAL '1 day'
       LIMIT 1`,
      [req.user.id]
    );

    const streak = Number(yesterday.rows[0]?.streak || 0) + 1;
    const reward = dailyRewardForStreak(streak);

    await pool.query('BEGIN');
    await pool.query(
      `INSERT INTO daily_reward_claims (user_id, claim_date, streak, reward_shards, reward_xp)
       VALUES ($1, CURRENT_DATE, $2, $3, $4)`,
      [req.user.id, streak, reward.shards, reward.xp]
    );
    await rewardUserActivity(req.user.id, reward.xp, reward.shards);
    await logShardTransaction(req.user.id, reward.shards, 'daily_reward', `Günlük ödül · Streak ${streak}`, { streak, xp: reward.xp });
    await pool.query('COMMIT');

    const me = await pool.query('SELECT xp, shards FROM users WHERE id = $1', [req.user.id]);
    res.json({ ok: true, streak, reward, user: me.rows[0], daily: await getDailyRewardInfo(req.user.id) });
  } catch (error) {
    await pool.query('ROLLBACK').catch(() => {});
    console.error('Daily claim error:', error);
    res.status(500).json({ error: 'Günlük ödül alınamadı.' });
  }
});

app.post('/api/lootbox/open', authMiddleware, async (req, res) => {
  try {
    const crateId = cleanText(req.body.crateId || 'serbia_rift', 80);
    const crate = getLootboxCrate(crateId);
    const cost = Number(crate.price || 250);
    const balance = await getShardBalance(req.user.id);
    if (balance < cost) return res.status(400).json({ error: `Yetersiz Shards. Kasa fiyatı: ${cost}` });

    const inventory = await getUserInventory(req.user.id);
    const ownedIds = new Set(inventory.map((item) => item.item_id));
    const rarity = pickLootboxRarityForCrate(crate);

    let candidates = MARKET_ITEMS
      .filter((item) => item.rarity === rarity && !ownedIds.has(item.id) && itemMatchesCrate(item, crate))
      .sort((a, b) => itemRarityWeight(b.rarity) - itemRarityWeight(a.rarity));

    if (!candidates.length) {
      candidates = MARKET_ITEMS
        .filter((item) => !ownedIds.has(item.id) && itemMatchesCrate(item, crate))
        .sort((a, b) => itemRarityWeight(b.rarity) - itemRarityWeight(a.rarity));
    }

    if (!candidates.length) {
      candidates = MARKET_ITEMS
        .filter((item) => !ownedIds.has(item.id))
        .sort((a, b) => itemRarityWeight(b.rarity) - itemRarityWeight(a.rarity));
    }

    await pool.query('BEGIN');
    await addShards(req.user.id, -cost);
    await logShardTransaction(req.user.id, -cost, 'lootbox_open', `${crate.name || crate.id} açıldı`, { crate_id: crate.id });

    let reward;
    if (candidates.length) {
      const item = candidates[Math.floor(Math.random() * candidates.length)];
      await pool.query(
        `INSERT INTO user_items (user_id, item_id, item_type)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, item_id) DO NOTHING`,
        [req.user.id, item.id, item.type]
      );

      await pool.query(
        `INSERT INTO lootbox_history (user_id, crate_id, reward_type, reward_id, reward_name, reward_rarity, reward_shards, cost_shards)
         VALUES ($1, $2, 'item', $3, $4, $5, 0, $6)`,
        [req.user.id, crate.id, item.id, item.name, item.rarity, cost]
      );

      reward = { type: 'item', item, crate };
    } else {
      const shardReward = Math.max(80, Math.floor(cost * (0.45 + Math.random() * 0.55)));
      await addShards(req.user.id, shardReward);
      await logShardTransaction(req.user.id, shardReward, 'lootbox_refund', 'Kasa shard refund', { crate_id: crate.id });

      await pool.query(
        `INSERT INTO lootbox_history (user_id, crate_id, reward_type, reward_name, reward_rarity, reward_shards, cost_shards)
         VALUES ($1, $2, 'shards', 'Shard Refund', 'rare', $3, $4)`,
        [req.user.id, crate.id, shardReward, cost]
      );

      reward = { type: 'shards', shards: shardReward, crate };
    }

    await pool.query('COMMIT');

    const me = await pool.query('SELECT xp, shards FROM users WHERE id = $1', [req.user.id]);
    res.json({ ok: true, cost, crate, reward, user: me.rows[0], history: await getLootboxHistory(req.user.id) });
  } catch (error) {
    await pool.query('ROLLBACK').catch(() => {});
    console.error('Lootbox error:', error);
    res.status(500).json({ error: 'Kasa açılamadı.' });
  }
});


app.get('/api/leaderboard', authMiddleware, async (req, res) => {
  try {
    const type = cleanText(req.query.type || 'level', 20);
    let orderExpr = 'COALESCE(u.xp, 0) DESC';

    if (type === 'shards') orderExpr = 'COALESCE(u.shards, 0) DESC';
    if (type === 'messages') orderExpr = 'total_messages DESC';
    if (type === 'friends') orderExpr = 'friends_count DESC';

    const result = await pool.query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.xp, u.shards,
              (
                (SELECT COUNT(*)::int FROM messages WHERE user_id = u.id AND deleted_at IS NULL) +
                (SELECT COUNT(*)::int FROM dm_messages WHERE sender_id = u.id AND deleted_at IS NULL) +
                (SELECT COUNT(*)::int FROM group_messages WHERE sender_id = u.id AND deleted_at IS NULL)
              ) AS total_messages,
              (SELECT COUNT(*)::int FROM friendships WHERE status = 'accepted' AND (requester_id = u.id OR addressee_id = u.id)) AS friends_count
       FROM users u
       WHERE COALESCE(u.is_banned, FALSE) = FALSE
       ORDER BY ${orderExpr}, u.username ASC
       LIMIT 20`
    );

    res.json({
      users: result.rows.map((row, index) => ({
        ...row,
        rank: index + 1,
        level: profileLevelFromXp(row.xp || 0)
      }))
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Liderlik tablosu yüklenemedi.' });
  }
});

app.post('/api/quests/claim', authMiddleware, async (req, res) => {
  try {
    const questId = cleanText(req.body.questId, 80);
    const todayStats = await getTodayStats(req.user.id);
    const quest = buildDailyQuests(todayStats).find((q) => q.id === questId);

    if (!quest) return res.status(404).json({ error: 'Görev bulunamadı.' });
    if (quest.progress < quest.target) return res.status(400).json({ error: 'Görev henüz tamamlanmadı.' });

    const claimed = await getClaimedQuestsToday(req.user.id);
    if (claimed.has(quest.id)) return res.status(400).json({ error: 'Bu görevi bugün zaten aldın.' });

    await pool.query(
      `INSERT INTO daily_quest_claims (user_id, quest_id, claim_date)
       VALUES ($1, $2, CURRENT_DATE)`,
      [req.user.id, quest.id]
    );

    await rewardUserActivity(req.user.id, quest.xp, quest.shards);
    await logShardTransaction(req.user.id, quest.shards, 'quest_reward', `Görev ödülü · ${quest.title}`, { quest_id: quest.id, xp: quest.xp });
    const me = await pool.query('SELECT xp, shards FROM users WHERE id = $1', [req.user.id]);

    res.json({ ok: true, reward: { xp: quest.xp, shards: quest.shards }, user: me.rows[0] });
  } catch (error) {
    console.error('Quest claim error:', error);
    res.status(500).json({ error: 'Görev ödülü alınamadı.' });
  }
});

app.post('/api/market/buy', authMiddleware, async (req, res) => {
  try {
    const itemId = cleanText(req.body.itemId, 80);
    const item = getMarketItem(itemId);
    if (!item) return res.status(404).json({ error: 'Ürün bulunamadı.' });

    const owned = await pool.query('SELECT id FROM user_items WHERE user_id = $1 AND item_id = $2', [req.user.id, item.id]);
    if (owned.rows.length > 0) return res.status(400).json({ error: 'Bu ürüne zaten sahipsin.' });

    const userResult = await pool.query('SELECT shards FROM users WHERE id = $1', [req.user.id]);
    const shards = Number(userResult.rows[0]?.shards || 0);

    if (shards < item.price) return res.status(400).json({ error: `Yetersiz Shards. Gerekli: ${item.price}` });

    await pool.query('BEGIN');
    await pool.query('UPDATE users SET shards = COALESCE(shards,0) - $1 WHERE id = $2', [item.price, req.user.id]);
    await logShardTransaction(req.user.id, -item.price, 'market_buy', `Market satın alım · ${item.name}`, { item_id: item.id, item_type: item.type, rarity: item.rarity });
    await pool.query(
      `INSERT INTO user_items (user_id, item_id, item_type)
       VALUES ($1, $2, $3)`,
      [req.user.id, item.id, item.type]
    );
    await pool.query('COMMIT');

    res.json({ ok: true, item });
  } catch (error) {
    await pool.query('ROLLBACK').catch(() => {});
    console.error('Market buy error:', error);
    res.status(500).json({ error: 'Ürün satın alınamadı.' });
  }
});

app.post('/api/market/equip', authMiddleware, async (req, res) => {
  try {
    const itemId = cleanText(req.body.itemId, 80);
    const item = itemId ? getMarketItem(itemId) : null;
    const slot = cleanText(req.body.slot, 20);

    const columnBySlot = {
      bubble: 'active_bubble_theme',
      frame: 'active_profile_frame',
      name: 'active_name_effect',
      theme: 'active_profile_theme'
    };

    const column = columnBySlot[slot];
    if (!column) return res.status(400).json({ error: 'Geçersiz slot.' });

    if (itemId) {
      if (!item || item.type !== slot) return res.status(400).json({ error: 'Ürün bu slota uygun değil.' });
      const owned = await pool.query('SELECT id FROM user_items WHERE user_id = $1 AND item_id = $2', [req.user.id, item.id]);
      if (owned.rows.length === 0) return res.status(403).json({ error: 'Bu ürüne sahip değilsin.' });
    }

    await pool.query(`UPDATE users SET ${column} = $1 WHERE id = $2`, [itemId, req.user.id]);
    const me = await pool.query(
      `SELECT id, username, display_name, avatar_url, bio, global_role, last_seen,
              profile_cover_url, profile_color, favorite_egg, profile_visible_badges,
              active_bubble_theme, active_profile_frame, active_name_effect, active_profile_theme, xp, shards
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    res.json({ ok: true, user: { ...me.rows[0], online: userSockets.has(String(req.user.id)) } });
  } catch (error) {
    console.error('Market equip error:', error);
    res.status(500).json({ error: 'Ürün kuşanılamadı.' });
  }
});



app.post('/api/casino/slot', authMiddleware, async (req, res) => {
  try {
    const bet = cleanBet(req.body.bet);
    const balance = await getShardBalance(req.user.id);
    if (balance < bet) return res.status(400).json({ error: 'Yetersiz Shards.' });

    const symbols = ['🍒', '🍋', '🍋', '🔔', '🔔', '💎', '7️⃣', '5️⃣', '🔴', '⚫'];
    const reels = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)]
    ];

    let multiplier = 0;
    let result = 'Kaybettin';

    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      multiplier = reels[0] === '5️⃣' ? 7 : reels[0] === '7️⃣' ? 5 : reels[0] === '💎' ? 4 : 3;
      result = 'Büyük kazanç!';
    } else if (reels[0] === reels[1] && reels[1] === '5️⃣') {
      multiplier = 2;
      result = 'Küçük kazanç!';
    }

    const payout = bet * multiplier;
    const net = payout - bet;
    const shards = await addShards(req.user.id, net);
    await logShardTransaction(req.user.id, net, 'casino_slot', `Slot ${net >= 0 ? 'kazanç' : 'kayıp'} · ${result}`, { bet, payout, reels });

    res.json({ game: 'slot', bet, reels, multiplier, payout, net, result, shards });
  } catch (error) {
    console.error('Slot error:', error);
    res.status(500).json({ error: 'Slot çevrilemedi.' });
  }
});

app.post('/api/casino/blackjack/start', authMiddleware, async (req, res) => {
  try {
    const bet = cleanBet(req.body.bet);
    const balance = await getShardBalance(req.user.id);
    if (balance < bet) return res.status(400).json({ error: 'Yetersiz Shards.' });

    await addShards(req.user.id, -bet);
    await logShardTransaction(req.user.id, -bet, 'blackjack_bet', 'Blackjack bet', { bet });

    const session = {
      bet,
      player: [drawCard(), drawCard()],
      dealer: [drawCard(), drawCard()],
      status: 'playing',
      result: '',
      payout: 0,
      createdAt: Date.now()
    };

    if (handValue(session.player) === 21) {
      session.status = 'finished';
      session.result = 'Blackjack!';
      session.payout = Math.floor(bet * 2.2);
      await addShards(req.user.id, session.payout);
      await logShardTransaction(req.user.id, session.payout, 'blackjack_payout', 'Blackjack payout', { bet, result: session.result });
    } else {
      casinoSessions.set(req.user.id, session);
    }

    const shards = await getShardBalance(req.user.id);
    res.json({ session: publicBlackjackSession(session, session.status === 'finished'), shards });
  } catch (error) {
    console.error('Blackjack start error:', error);
    res.status(500).json({ error: 'Blackjack başlatılamadı.' });
  }
});

app.post('/api/casino/blackjack/hit', authMiddleware, async (req, res) => {
  try {
    const session = casinoSessions.get(req.user.id);
    if (!session || session.status !== 'playing') return res.status(400).json({ error: 'Aktif blackjack oyunu yok.' });

    session.player.push(drawCard());

    if (handValue(session.player) > 21) {
      session.status = 'finished';
      session.result = 'Bust! Kaybettin.';
      session.payout = 0;
      casinoSessions.delete(req.user.id);
    }

    const shards = await getShardBalance(req.user.id);
    res.json({ session: publicBlackjackSession(session, session.status === 'finished'), shards });
  } catch (error) {
    console.error('Blackjack hit error:', error);
    res.status(500).json({ error: 'Kart çekilemedi.' });
  }
});

app.post('/api/casino/blackjack/stand', authMiddleware, async (req, res) => {
  try {
    const session = casinoSessions.get(req.user.id);
    if (!session || session.status !== 'playing') return res.status(400).json({ error: 'Aktif blackjack oyunu yok.' });

    while (handValue(session.dealer) < 18) session.dealer.push(drawCard());

    const playerValue = handValue(session.player);
    const dealerValue = handValue(session.dealer);

    session.status = 'finished';

    if (dealerValue > 21 || playerValue > dealerValue) {
      session.result = 'Kazandın!';
      session.payout = Math.floor(session.bet * 1.8);
    } else if (playerValue === dealerValue) {
      session.result = 'Berabere.';
      session.payout = session.bet;
    } else {
      session.result = 'Kaybettin.';
      session.payout = 0;
    }

    if (session.payout > 0) {
      await addShards(req.user.id, session.payout);
      await logShardTransaction(req.user.id, session.payout, 'blackjack_payout', `Blackjack · ${session.result}`, { bet: session.bet, payout: session.payout });
    }
    casinoSessions.delete(req.user.id);

    const shards = await getShardBalance(req.user.id);
    res.json({ session: publicBlackjackSession(session, true), shards });
  } catch (error) {
    console.error('Blackjack stand error:', error);
    res.status(500).json({ error: 'Blackjack bitirilemedi.' });
  }
});


app.get('/api/groups', authMiddleware, async (req, res) => {
  const result = await pool.query(
    `SELECT gc.id, gc.name, gc.avatar_url, gc.owner_id, gm.role,
            COUNT(DISTINCT gm2.user_id)::int AS member_count,
            MAX(gmsg.created_at) AS last_message_at
     FROM group_chats gc
     JOIN group_members gm ON gm.group_id = gc.id AND gm.user_id = $1
     JOIN group_members gm2 ON gm2.group_id = gc.id
     LEFT JOIN group_messages gmsg ON gmsg.group_id = gc.id
     GROUP BY gc.id, gm.role
     ORDER BY COALESCE(MAX(gmsg.created_at), gc.created_at) DESC`,
    [req.user.id]
  );

  res.json({
    groups: result.rows.map((g) => ({
      ...g,
      my_role: g.owner_id === req.user.id ? 'owner' : g.role
    }))
  });
});

app.post('/api/groups', authMiddleware, async (req, res) => {
  const name = cleanText(req.body.name, 80);
  const memberIds = Array.isArray(req.body.memberIds) ? req.body.memberIds.map(Number).filter(Number.isInteger) : [];

  if (name.length < 2) return res.status(400).json({ error: 'Grup adı en az 2 karakter olmalı.' });

  const uniqueMemberIds = Array.from(new Set([req.user.id, ...memberIds])).slice(0, 30);

  for (const memberId of uniqueMemberIds) {
    if (memberId !== req.user.id) {
      const ok = await areFriends(req.user.id, memberId);
      if (!ok) return res.status(403).json({ error: 'Gruba sadece arkadaşlarını ekleyebilirsin.' });
    }
  }

  const created = await pool.query(
    `INSERT INTO group_chats (name, owner_id)
     VALUES ($1, $2)
     RETURNING id, name, avatar_url, owner_id, created_at`,
    [name, req.user.id]
  );

  const group = created.rows[0];

  for (const memberId of uniqueMemberIds) {
    await pool.query(
      `INSERT INTO group_members (group_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (group_id, user_id) DO NOTHING`,
      [group.id, memberId, memberId === req.user.id ? 'owner' : 'member']
    );
  }

  await emitGroupToMembers(group.id, 'group_updated', { groupId: group.id });

  res.json({ group: await getGroupSummary(group.id, req.user.id) });
});

app.get('/api/groups/:groupId', authMiddleware, async (req, res) => {
  const groupId = Number(req.params.groupId);
  if (!Number.isInteger(groupId)) return res.status(400).json({ error: 'Geçersiz grup.' });

  const group = await getGroupSummary(groupId, req.user.id);
  if (!group) return res.status(404).json({ error: 'Grup bulunamadı.' });

  const members = await pool.query(
    `SELECT u.id, u.username, u.display_name, u.avatar_url, u.last_seen, gm.role, gc.owner_id
     FROM group_members gm
     JOIN users u ON u.id = gm.user_id
     JOIN group_chats gc ON gc.id = gm.group_id
     WHERE gm.group_id = $1
     ORDER BY CASE WHEN u.id = gc.owner_id THEN 0 WHEN gm.role = 'admin' THEN 1 ELSE 2 END, u.username ASC`,
    [groupId]
  );

  res.json({
    group,
    members: members.rows.map((m) => ({
      ...m,
      role: m.owner_id === m.id ? 'owner' : m.role,
      online: userSockets.has(String(m.id))
    }))
  });
});

app.get('/api/groups/:groupId/messages', authMiddleware, async (req, res) => {
  const groupId = Number(req.params.groupId);
  if (!Number.isInteger(groupId)) return res.status(400).json({ error: 'Geçersiz grup.' });

  const member = await getGroupMember(groupId, req.user.id);
  if (!member) return res.status(403).json({ error: 'Bu grupta değilsin.' });

  const result = await pool.query(
    `SELECT gm.id, gm.group_id, gm.sender_id, gm.text, gm.message_type,
            gm.file_name, gm.file_mime, gm.file_data, gm.file_path, gm.file_size,
            gm.reply_to_id, gm.edited_at, gm.deleted_at, gm.created_at,
            u.username, u.display_name, u.avatar_url, u.active_bubble_theme, u.active_name_effect, u.active_profile_frame,
            rgm.text AS reply_text,
            ru.username AS reply_username,
            ru.display_name AS reply_display_name
     FROM group_messages gm
     JOIN users u ON u.id = gm.sender_id
     LEFT JOIN group_messages rgm ON rgm.id = gm.reply_to_id
     LEFT JOIN users ru ON ru.id = rgm.sender_id
     WHERE gm.group_id = $1
     ORDER BY gm.created_at DESC
     LIMIT 50`,
    [groupId]
  );

  res.json({ messages: result.rows.reverse() });
});

app.post('/api/groups/:groupId/avatar', authMiddleware, async (req, res) => {
  const groupId = Number(req.params.groupId);
  const avatarUrl = cleanText(req.body.avatar_url, 200000);

  if (!Number.isInteger(groupId)) return res.status(400).json({ error: 'Geçersiz grup.' });
  if (!avatarUrl.startsWith('data:image/') && !avatarUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Geçersiz grup fotoğrafı.' });
  }

  const member = await getGroupMember(groupId, req.user.id);
  if (!member || !canManageGroup(member.role)) return res.status(403).json({ error: 'Yetkin yok.' });

  const result = await pool.query(
    `UPDATE group_chats SET avatar_url = $1 WHERE id = $2 RETURNING id, name, avatar_url, owner_id`,
    [avatarUrl, groupId]
  );

  await emitGroupToMembers(groupId, 'group_updated', { groupId });
  res.json({ group: result.rows[0] });
});

app.delete('/api/groups/:groupId/avatar', authMiddleware, async (req, res) => {
  const groupId = Number(req.params.groupId);
  if (!Number.isInteger(groupId)) return res.status(400).json({ error: 'Geçersiz grup.' });

  const member = await getGroupMember(groupId, req.user.id);
  if (!member || !canManageGroup(member.role)) return res.status(403).json({ error: 'Yetkin yok.' });

  await pool.query(`UPDATE group_chats SET avatar_url = NULL WHERE id = $1`, [groupId]);
  await emitGroupToMembers(groupId, 'group_updated', { groupId });
  res.json({ ok: true });
});

app.post('/api/groups/:groupId/members', authMiddleware, async (req, res) => {
  const groupId = Number(req.params.groupId);
  const userId = Number(req.body.userId);

  if (!Number.isInteger(groupId) || !Number.isInteger(userId)) return res.status(400).json({ error: 'Geçersiz istek.' });

  const member = await getGroupMember(groupId, req.user.id);
  if (!member || !canManageGroup(member.role)) return res.status(403).json({ error: 'Yetkin yok.' });

  const ok = await areFriends(req.user.id, userId);
  if (!ok) return res.status(403).json({ error: 'Sadece arkadaşını ekleyebilirsin.' });

  await pool.query(
    `INSERT INTO group_members (group_id, user_id, role)
     VALUES ($1, $2, 'member')
     ON CONFLICT (group_id, user_id) DO NOTHING`,
    [groupId, userId]
  );

  await emitGroupToMembers(groupId, 'group_updated', { groupId });
  emitToUser(userId, 'group_updated', { groupId });
  res.json({ ok: true });
});

app.patch('/api/groups/:groupId/members/:userId', authMiddleware, async (req, res) => {
  const groupId = Number(req.params.groupId);
  const userId = Number(req.params.userId);
  const role = String(req.body.role || '');

  if (!Number.isInteger(groupId) || !Number.isInteger(userId)) return res.status(400).json({ error: 'Geçersiz istek.' });
  if (!['admin', 'member'].includes(role)) return res.status(400).json({ error: 'Geçersiz rol.' });

  const member = await getGroupMember(groupId, req.user.id);
  if (!member || member.role !== 'owner') return res.status(403).json({ error: 'Sadece grup sahibi admin yapabilir.' });

  const group = await pool.query('SELECT owner_id FROM group_chats WHERE id = $1', [groupId]);
  if (group.rows[0]?.owner_id === userId) return res.status(400).json({ error: 'Grup sahibinin rolü değişmez.' });

  await pool.query('UPDATE group_members SET role = $1 WHERE group_id = $2 AND user_id = $3', [role, groupId, userId]);
  await emitGroupToMembers(groupId, 'group_updated', { groupId });
  res.json({ ok: true });
});

app.delete('/api/groups/:groupId/members/:userId', authMiddleware, async (req, res) => {
  const groupId = Number(req.params.groupId);
  const userId = Number(req.params.userId);

  if (!Number.isInteger(groupId) || !Number.isInteger(userId)) return res.status(400).json({ error: 'Geçersiz istek.' });

  const actor = await getGroupMember(groupId, req.user.id);
  if (!actor) return res.status(403).json({ error: 'Bu grupta değilsin.' });

  const group = await pool.query('SELECT owner_id FROM group_chats WHERE id = $1', [groupId]);
  const ownerId = group.rows[0]?.owner_id;

  if (userId === ownerId) return res.status(400).json({ error: 'Grup sahibi gruptan çıkarılamaz.' });

  if (userId !== req.user.id && !canManageGroup(actor.role)) return res.status(403).json({ error: 'Yetkin yok.' });

  await pool.query('DELETE FROM group_members WHERE group_id = $1 AND user_id = $2', [groupId, userId]);
  await emitGroupToMembers(groupId, 'group_updated', { groupId });
  emitToUser(userId, 'group_removed', { groupId });
  res.json({ ok: true });
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

  if (scope === 'group') {
    const msg = await pool.query('SELECT group_id FROM group_messages WHERE id = $1', [messageId]);
    if (msg.rows.length > 0) {
      await emitGroupToMembers(msg.rows[0].group_id, 'reaction_state', { scope, messageId, reactions: state });
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

    if (!['room', 'dm', 'group'].includes(scope)) return res.status(400).json({ error: 'Geçersiz mesaj tipi.' });
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


    if (scope === 'group') {
      const msg = await pool.query(
        `SELECT gm.id, gm.group_id
         FROM group_messages gm
         JOIN group_members gmem ON gmem.group_id = gm.group_id AND gmem.user_id = $2
         WHERE gm.id = $1 AND gm.deleted_at IS NULL`,
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

  if (!['room', 'dm', 'group'].includes(scope) || !Number.isInteger(messageId)) {
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


async function handleUniverseCommand({ socket, room, text }) {
  const command = String(text || '').trim().toLowerCase();
  if (!command.startsWith('/')) return false;

  const secretMap = {
    '/serbia': ['serbia_rift', '🇷🇸 Serbia frekansı açıldı.'],
    '/limbo': ['limbo_storm', '⚫ Limbo 5 saniyeliğine yaklaştı.'],
    '/vertex': ['vertex_breach', '🔴 VERTEX seni gördü.'],
    '/rome': ['rome_simulation', '🏛️ Roma simülasyonu aktif.'],
    '/egypt': ['egypt_signal', '𓂀 Egypt Signal yakalandı.'],
    '/reset': ['energy_overload', '⏮️ Evren glitch reset yedi.'],
    '/cat': ['serbia_rift', '🐈 Kedi portalı kapattı gibi yaptı ama açtı.'],
    '/xara': ['vertex_breach', '🧬 Xara düğmeye dokundu.']
  };

  if (command === '/portal') {
    await createPortalDrop(room);
    return true;
  }

  if (command === '/event') {
    await startLiveEvent(room, 'command');
    return true;
  }

  if (secretMap[command]) {
    const [source, msg] = secretMap[command];
    socket.emit('system_message', msg);
    await unlockTitle(socket.user.id, command.replace('/', '').toUpperCase() + ' Witness');
    if (Math.random() < 0.45) await createPortalDrop(room, LIVE_EVENT_TYPES.find(e => e.key === source) || null);
    return true;
  }

  return false;
}


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
    await updateRoomUsers(cleanRoom);
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

      if (messageType === 'text' && await handleFeizAdminCommand({ socket, text, room: socket.data.room })) {
        return;
      }

      if (messageType === 'text' && await handleUniverseCommand({ socket, room: socket.data.room, text })) {
        return;
      }
      if (messageType !== 'text' && !fileData) return;
      if (fileData.startsWith('data:') && fileData.length > 7200000) {
        socket.emit('system_message', 'Dosya çok büyük. Storage kullanarak gönder.');
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

      await rewardUserActivity(socket.user.id, 5, 1);
      await maybeRememberChatMoment({ userId: socket.user.id, room, username: socket.user.username, text });
      await addUniverseEnergy(2);
      await maybeRewardLiveEventMessage(socket.user.id, room);

      const avatarResult = await pool.query('SELECT avatar_url, display_name, username, active_bubble_theme, active_name_effect, active_profile_frame FROM users WHERE id = $1', [socket.user.id]);
      const msg = saved.rows[0];

      io.to(room).emit('chat_message', {
        id: msg.id,
        room: msg.room,
        user_id: socket.user.id,
        sender_id: socket.user.id,
        username: avatarResult.rows[0]?.display_name || msg.username,
        avatar_url: avatarResult.rows[0]?.avatar_url || null,
        bubble_theme: avatarResult.rows[0]?.active_bubble_theme || '',
        name_effect: avatarResult.rows[0]?.active_name_effect || '',
        frame_theme: avatarResult.rows[0]?.active_profile_frame || '',
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

      maybeHandleAiBot({
        scope: 'room',
        text,
        senderId: socket.user.id,
        senderUsername: socket.user.username,
        room
      }).catch((error) => console.error('Oda AI bot işlem hatası:', error));
    } catch (error) {
      console.error('Mesaj kayıt hatası:', error);
      socket.emit('system_message', 'Mesaj gönderilemedi.');
    }
  });


  socket.on('room_messages_read', async ({ room, messageIds } = {}) => {
    try {
      const cleanRoom = cleanText(room || socket.data.room || '', 50).toLowerCase();
      const ids = Array.from(new Set((Array.isArray(messageIds) ? messageIds : []).map(Number).filter(Number.isInteger))).slice(0, 80);

      if (!cleanRoom || !ids.length) return;

      await pool.query(
        `INSERT INTO room_message_reads (message_id, user_id, seen_at)
         SELECT id, $3, CURRENT_TIMESTAMP
         FROM messages
         WHERE room = $1
         AND id = ANY($2::int[])
         AND user_id <> $3
         AND deleted_at IS NULL
         ON CONFLICT (message_id, user_id)
         DO UPDATE SET seen_at = EXCLUDED.seen_at`,
        [cleanRoom, ids, socket.user.id]
      );

      await emitRoomReadSummaries(cleanRoom, ids);
    } catch (error) {
      console.error('Oda görüldü bilgisi hatası:', error);
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
      if (messageType !== 'text' && !fileData) return;
      if (fileData.startsWith('data:') && fileData.length > 7200000) {
        socket.emit('notification', { type: 'error', payload: { message: 'Dosya çok büyük. Storage kullanarak gönder.' } });
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

      const avatarResult = await pool.query('SELECT avatar_url, display_name, username, active_bubble_theme, active_name_effect, active_profile_frame FROM users WHERE id = $1', [socket.user.id]);

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

      maybeHandleAiBot({
        scope: 'dm',
        text: cleanMessage,
        senderId: socket.user.id,
        senderUsername: socket.user.username
      }).catch((error) => console.error('DM AI bot işlem hatası:', error));
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


  socket.on('group_join', async ({ groupId }) => {
    const id = Number(groupId);
    if (!Number.isInteger(id)) return;

    const member = await getGroupMember(id, socket.user.id);
    if (!member) return;

    socket.join(`group:${id}`);
  });

  socket.on('group_message', async (payload) => {
    try {
      const groupId = Number(payload?.groupId);
      if (!Number.isInteger(groupId)) return;

      const member = await getGroupMember(groupId, socket.user.id);
      if (!member) {
        socket.emit('notification', { type: 'error', payload: { message: 'Bu grupta değilsin.' } });
        return;
      }

      const type = cleanText(payload?.type || 'text', 20);
      const allowedTypes = ['text', 'image', 'file', 'audio'];
      const messageType = allowedTypes.includes(type) ? type : 'text';

      const cleanMessage = cleanText(payload?.text || '', 1000);
      const fileName = cleanText(payload?.fileName || '', 200) || null;
      const fileMime = cleanText(payload?.fileMime || '', 100) || null;
      const fileData = String(payload?.fileData || '');
      const filePath = cleanText(payload?.filePath || '', 500) || null;
      const fileSize = Number(payload?.fileSize) || null;

      if (messageType === 'text' && !cleanMessage) return;
      if (messageType !== 'text' && !fileData) return;

      let replyToId = Number(payload?.replyToId);
      if (!Number.isInteger(replyToId)) replyToId = null;

      let replyInfo = null;
      if (replyToId) {
        const replyResult = await pool.query(
          `SELECT gm.id, gm.text, u.username, u.display_name
           FROM group_messages gm
           JOIN users u ON u.id = gm.sender_id
           WHERE gm.id = $1 AND gm.group_id = $2`,
          [replyToId, groupId]
        );

        if (replyResult.rows.length > 0) {
          replyInfo = replyResult.rows[0];
        } else {
          replyToId = null;
        }
      }

      const saved = await pool.query(
        `INSERT INTO group_messages (group_id, sender_id, text, message_type, file_name, file_mime, file_data, file_path, file_size, reply_to_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, group_id, sender_id, text, message_type, file_name, file_mime, file_data, file_path, file_size, reply_to_id, edited_at, deleted_at, created_at`,
        [groupId, socket.user.id, cleanMessage, messageType, fileName, fileMime, fileData || null, filePath, fileSize, replyToId]
      );

      const avatarResult = await pool.query('SELECT username, display_name, avatar_url, active_bubble_theme, active_name_effect FROM users WHERE id = $1', [socket.user.id]);
      const sender = avatarResult.rows[0];

      const msg = {
        ...saved.rows[0],
        username: sender?.display_name || sender?.username || socket.user.username,
        avatar_url: sender?.avatar_url,
        bubble_theme: sender?.active_bubble_theme || '',
        name_effect: sender?.active_name_effect || '',
        frame_theme: sender?.active_profile_frame || '',
        reply_username: replyInfo?.display_name || replyInfo?.username || null,
        reply_text: replyInfo?.text || null,
        time: nowTime()
      };

      await emitGroupToMembers(groupId, 'group_message', msg);

      const members = await pool.query('SELECT user_id FROM group_members WHERE group_id = $1 AND user_id <> $2', [groupId, socket.user.id]);
      for (const row of members.rows) {
        await createNotification(row.user_id, 'group_dm', {
          groupId,
          fromId: socket.user.id,
          fromUsername: sender?.display_name || sender?.username || socket.user.username,
          text: cleanMessage || fileName || 'Dosya'
        });
      }

      const groupNameResult = await pool.query('SELECT name FROM group_chats WHERE id = $1', [groupId]);
      maybeHandleAiBot({
        scope: 'group',
        text: cleanMessage,
        senderId: socket.user.id,
        senderUsername: socket.user.username,
        groupId,
        groupName: groupNameResult.rows[0]?.name || ''
      }).catch((error) => console.error('Grup AI bot işlem hatası:', error));
    } catch (error) {
      console.error('Grup mesaj hatası:', error);
    }
  });

  socket.on('group_message_edit', async ({ id, groupId, text }) => {
    const messageId = Number(id);
    const group = Number(groupId);
    const cleanNewText = cleanText(text, 1000);
    if (!Number.isInteger(messageId) || !Number.isInteger(group) || !cleanNewText) return;

    const result = await pool.query(
      `UPDATE group_messages
       SET text = $1, edited_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND group_id = $3 AND sender_id = $4 AND deleted_at IS NULL
       RETURNING id, group_id, text, edited_at`,
      [cleanNewText, messageId, group, socket.user.id]
    );

    if (result.rows.length === 0) return;
    await emitGroupToMembers(group, 'group_message_updated', result.rows[0]);
  });

  socket.on('group_message_delete', async ({ id, groupId }) => {
    const messageId = Number(id);
    const group = Number(groupId);
    if (!Number.isInteger(messageId) || !Number.isInteger(group)) return;

    const member = await getGroupMember(group, socket.user.id);
    if (!member) return;

    const msgCheck = await pool.query('SELECT sender_id FROM group_messages WHERE id = $1 AND group_id = $2', [messageId, group]);
    if (msgCheck.rows.length === 0) return;

    const canDelete = msgCheck.rows[0].sender_id === socket.user.id || canManageGroup(member.role);
    if (!canDelete) return;

    const result = await pool.query(
      `UPDATE group_messages
       SET text = 'Bu mesaj silindi.', deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND group_id = $2 AND deleted_at IS NULL
       RETURNING id, group_id, text, deleted_at`,
      [messageId, group]
    );

    if (result.rows.length === 0) return;
    await emitGroupToMembers(group, 'group_message_deleted', result.rows[0]);
  });


  socket.on('disconnect', async () => {
    await pool.query('UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = $1', [socket.user.id]);
    const user = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);
    removeSocketForUser(socket.user.id, socket.id);

    if (user) {
      socket.to(user.room).emit('system_message', `${user.username} çıktı.`);
      await updateRoomUsers(user.room);
    }
  });
});



async function triggerFeizRandomTalk() {
  if (!AI_BOT_ENABLED || !GROQ_API_KEY) return;
  const state = await getAiBotState();
  if (!state.random_talk_enabled) return;

  const rooms = Array.from(new Set(Array.from(onlineUsers.values()).map(u => u.room).filter(Boolean)));
  if (!rooms.length) return;

  const room = rooms[Math.floor(Math.random() * rooms.length)];
  const recent = await pool.query(
    `SELECT username, text FROM messages
     WHERE room = $1 AND message_type = 'text' AND deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT 10`,
    [room]
  );

  const contextText = recent.rows.reverse().map(r => `${r.username}: ${r.text}`).join(' | ');
  const prompt = [
    'Chatte kendiliğinden kısa bir mesaj atacaksın.',
    'Spam gibi olmasın; tek mesaj, 1-2 cümle.',
    'Kullanıcıları hafif tiye alabilir veya event/portal/5ECROPOLIS hakkında yorum yapabilirsin.',
    contextText ? `Son konuşmalar: ${contextText}` : 'Chat sakin.'
  ].join('\n');

  try {
    const answer = await askGroq(prompt, { scope: 'room', room, username: 'chat' });
    await sendAiBotMessage({ scope: 'room', text: answer, room });
  } catch (error) {
    console.error('Feiz random talk error:', error);
  }
}


function startUniverseSchedulers() {
  if (global.__universeSchedulersStarted) return;
  global.__universeSchedulersStarted = true;

  setInterval(async () => {
    try {
      if (Math.random() < 0.35) await createPortalDrop(null);
    } catch (error) {
      console.error('Portal scheduler error:', error);
    }
  }, 7 * 60 * 1000);

  setInterval(async () => {
    try {
      const state = await getUniverseState();
      if (!state.active_event && Math.random() < 0.40) await startLiveEvent(null, 'scheduler');
    } catch (error) {
      console.error('Live event scheduler error:', error);
    }
  }, 12 * 60 * 1000);

  setInterval(async () => {
    try {
      if (Math.random() < AI_BOT_RANDOM_TALK_CHANCE) await triggerFeizRandomTalk();
    } catch (error) {
      console.error('Feiz scheduler error:', error);
    }
  }, AI_BOT_RANDOM_TALK_MS);
}

async function updateRoomUsers(room) {
  const entries = Array.from(onlineUsers.values()).filter((user) => user.room === room);
  const ids = Array.from(new Set(entries.map((u) => Number(u.id)).filter(Number.isInteger)));
  if (!ids.length) {
    io.to(room).emit('users', []);
    return;
  }

  try {
    const result = await pool.query(
      `SELECT id, username, display_name, avatar_url, presence_status, custom_status, story_text, story_expires_at, last_active, last_seen
       FROM users
       WHERE id = ANY($1::int[])`,
      [ids]
    );

    const byId = new Map(result.rows.map((row) => [Number(row.id), row]));
    const users = entries
      .map((entry) => {
        const row = byId.get(Number(entry.id));
        if (!row) return null;
        const invisible = String(row.presence_status || '').toLowerCase() === 'invisible';
        return {
          id: row.id,
          username: row.username,
          display_name: row.display_name || row.username,
          avatar_url: row.avatar_url,
          presence_status: row.presence_status || 'online',
          custom_status: row.custom_status || '',
          story_text: row.story_expires_at && new Date(row.story_expires_at).getTime() > Date.now() ? row.story_text : '',
          story_expires_at: row.story_expires_at,
          online: !invisible
        };
      })
      .filter(Boolean)
      .filter((u) => u.online);

    io.to(room).emit('users', users);
  } catch (error) {
    console.error('Room users update error:', error);
    io.to(room).emit('users', entries.map((u) => u.username));
  }
}

initDatabase()
  .then(() => {
    startUniverseSchedulers();
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Chat app çalışıyor. Port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database başlatma hatası:', error);
    process.exit(1);
  });
