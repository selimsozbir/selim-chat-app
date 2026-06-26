const authScreen = document.getElementById('authScreen');
const chatScreen = document.getElementById('chatScreen');

const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const authForm = document.getElementById('authForm');
const authButton = document.getElementById('authButton');
const authError = document.getElementById('authError');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');

const currentUsername = document.getElementById('currentUsername');
const logoutButton = document.getElementById('logoutButton');
const avatarInput = document.getElementById('avatarInput');
const avatarImg = document.getElementById('avatarImg');
const avatarLetter = document.getElementById('avatarLetter');

const roomModeButton = document.getElementById('roomModeButton');
const dmModeButton = document.getElementById('dmModeButton');
const roomPanel = document.getElementById('roomPanel');
const friendsPanel = document.getElementById('friendsPanel');

const roomInput = document.getElementById('roomInput');
const joinRoomButton = document.getElementById('joinRoomButton');
const chatTitle = document.getElementById('chatTitle');
const statusText = document.getElementById('statusText');

const messagesEl = document.getElementById('messages');
const usersList = document.getElementById('usersList');
const typingText = document.getElementById('typingText');

const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchResults = document.getElementById('searchResults');
const requestsList = document.getElementById('requestsList');
const friendsList = document.getElementById('friendsList');

const notificationsList = document.getElementById('notificationsList');
const notificationBadge = document.getElementById('notificationBadge');
const enableNotificationsButton = document.getElementById('enableNotificationsButton');

let mode = 'login';
let chatMode = 'room';
let activeFriend = null;

let socket = null;
let token = localStorage.getItem('chat_token');
let user = JSON.parse(localStorage.getItem('chat_user') || 'null');
let currentRoom = localStorage.getItem('chat_room') || 'genel';
let typingTimer = null;
let unreadNotifications = 0;

function setMode(nextMode) {
  mode = nextMode;
  loginTab.classList.toggle('active', mode === 'login');
  registerTab.classList.toggle('active', mode === 'register');
  authButton.textContent = mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol';
  authError.textContent = '';
}

loginTab.addEventListener('click', () => setMode('login'));
registerTab.addEventListener('click', () => setMode('register'));

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  authError.textContent = '';
  authButton.disabled = true;

  try {
    const endpoint = mode === 'login' ? '/api/login' : '/api/register';
    const data = await api(endpoint, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }, false);

    token = data.token;
    user = data.user;

    localStorage.setItem('chat_token', token);
    localStorage.setItem('chat_user', JSON.stringify(user));

    startApp();
  } catch (error) {
    authError.textContent = error.message;
  } finally {
    authButton.disabled = false;
  }
});

logoutButton.addEventListener('click', () => {
  localStorage.clear();
  token = null;
  user = null;
  if (socket) socket.disconnect();
  chatScreen.classList.add('hidden');
  authScreen.classList.remove('hidden');
});

roomModeButton.addEventListener('click', () => setChatMode('room'));
dmModeButton.addEventListener('click', () => {
  setChatMode('dm');
  loadFriends();
  loadRequests();
});

joinRoomButton.addEventListener('click', () => joinRoom(roomInput.value.trim() || 'genel'));

searchButton.addEventListener('click', searchUsers);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') searchUsers();
});

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text || !socket) return;

  if (chatMode === 'dm') {
    if (!activeFriend) {
      addSystemMessage('Önce bir arkadaş seç.');
      return;
    }
    socket.emit('dm_message', { receiverId: activeFriend.id, text });
  } else {
    socket.emit('chat_message', text);
  }

  messageInput.value = '';
  messageInput.focus();
});

messageInput.addEventListener('input', () => {
  if (!socket || chatMode !== 'room') return;
  socket.emit('typing');
});

avatarInput.addEventListener('change', async () => {
  const file = avatarInput.files?.[0];
  if (!file) return;

  try {
    const avatarData = await resizeImage(file, 256);
    const data = await api('/api/avatar', {
      method: 'POST',
      body: JSON.stringify({ avatarData })
    });

    user = data.user;
    localStorage.setItem('chat_user', JSON.stringify(user));
    renderProfile();
    addSystemMessage('Profil fotoğrafı güncellendi.');
  } catch (error) {
    addSystemMessage(error.message);
  }
});

enableNotificationsButton.addEventListener('click', async () => {
  if (!('Notification' in window)) {
    addSystemMessage('Tarayıcın bildirim desteklemiyor.');
    return;
  }

  const permission = await Notification.requestPermission();
  addSystemMessage(permission === 'granted' ? 'Bildirimler açıldı.' : 'Bildirim izni verilmedi.');
});

async function api(url, options = {}, withAuth = true) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  if (withAuth && token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error(data.error || 'İşlem başarısız.');
  return data;
}

async function startApp() {
  if (!token || !user) {
    authScreen.classList.remove('hidden');
    chatScreen.classList.add('hidden');
    return;
  }

  authScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');

  renderProfile();
  roomInput.value = currentRoom;
  connectSocket();

  await Promise.allSettled([loadFriends(), loadRequests(), loadNotifications()]);
}

function renderProfile() {
  currentUsername.textContent = user.username;
  avatarLetter.textContent = user.username.charAt(0).toUpperCase();

  if (user.avatar_url) {
    avatarImg.src = user.avatar_url;
    avatarImg.classList.remove('hidden');
    avatarLetter.classList.add('hidden');
  } else {
    avatarImg.classList.add('hidden');
    avatarLetter.classList.remove('hidden');
  }
}

function connectSocket() {
  if (socket) socket.disconnect();

  socket = io({ auth: { token } });

  socket.on('connect', () => {
    statusText.textContent = 'Bağlandı';
    joinRoom(currentRoom);
  });

  socket.on('disconnect', () => {
    statusText.textContent = 'Bağlantı koptu';
  });

  socket.on('connect_error', (error) => {
    statusText.textContent = 'Bağlantı hatası: ' + error.message;
    addSystemMessage(error.message || 'Bağlantı hatası.');
  });

  socket.on('system_message', addSystemMessage);
  socket.on('chat_message', addRoomMessage);
  socket.on('users', renderUsers);

  socket.on('typing', (username) => {
    typingText.textContent = `${username} yazıyor...`;
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => typingText.textContent = '', 1200);
  });

  socket.on('dm_message', (message) => {
    const otherId = message.sender_id === user.id ? message.receiver_id : message.sender_id;

    if (chatMode === 'dm' && activeFriend && activeFriend.id === otherId) {
      addDmMessage(message);
    } else if (message.sender_id !== user.id) {
      showBrowserNotification('Yeni DM', `${message.sender_username}: ${message.text}`);
      addNotificationToList({
        type: 'dm',
        payload: { fromUsername: message.sender_username, text: message.text },
        created_at: new Date().toISOString()
      }, true);
    }
  });

  socket.on('notification', (notification) => {
    if (notification.type === 'error') {
      addSystemMessage(notification.payload?.message || 'Hata oluştu.');
      return;
    }

    addNotificationToList(notification, true);

    if (notification.type === 'friend_request') {
      loadRequests();
      showBrowserNotification('Arkadaş isteği', `${notification.payload.fromUsername} arkadaş isteği gönderdi.`);
    }

    if (notification.type === 'friend_accept') {
      loadFriends();
      showBrowserNotification('Arkadaş isteği kabul edildi', `${notification.payload.fromUsername} isteğini kabul etti.`);
    }

    if (notification.type === 'dm') {
      showBrowserNotification('Yeni DM', `${notification.payload.fromUsername}: ${notification.payload.text}`);
    }
  });
}

function setChatMode(nextMode) {
  chatMode = nextMode;

  roomModeButton.classList.toggle('active', chatMode === 'room');
  dmModeButton.classList.toggle('active', chatMode === 'dm');
  roomPanel.classList.toggle('hidden', chatMode !== 'room');
  friendsPanel.classList.toggle('hidden', chatMode !== 'dm');

  messagesEl.innerHTML = '';
  typingText.textContent = '';

  if (chatMode === 'room') {
    activeFriend = null;
    chatTitle.textContent = `# ${currentRoom}`;
    loadOldRoomMessages(currentRoom);
  } else {
    chatTitle.textContent = activeFriend ? `DM: ${activeFriend.username}` : 'DM seç';
    addSystemMessage('DM için soldan arkadaş seç.');
  }
}

async function joinRoom(room) {
  currentRoom = room.toLowerCase();
  localStorage.setItem('chat_room', currentRoom);

  chatMode = 'room';
  roomModeButton.classList.add('active');
  dmModeButton.classList.remove('active');
  roomPanel.classList.remove('hidden');
  friendsPanel.classList.add('hidden');

  roomInput.value = currentRoom;
  chatTitle.textContent = `# ${currentRoom}`;
  messagesEl.innerHTML = '';
  typingText.textContent = '';

  await loadOldRoomMessages(currentRoom);

  if (socket && socket.connected) socket.emit('join', { room: currentRoom });
}

async function loadOldRoomMessages(room) {
  try {
    const data = await api(`/api/messages/${encodeURIComponent(room)}`);
    data.messages.forEach((message) => {
      addRoomMessage({
        username: message.username,
        text: message.text,
        time: formatTime(message.created_at)
      });
    });
    scrollToBottom();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

function addRoomMessage(message) {
  addMessage({
    username: message.username,
    text: message.text,
    time: message.time,
    mine: user && message.username === user.username
  });
}

async function searchUsers() {
  const q = searchInput.value.trim();
  searchResults.innerHTML = '';

  if (q.length < 2) {
    searchResults.innerHTML = '<div class="mini-item">En az 2 karakter yaz.</div>';
    return;
  }

  try {
    const data = await api(`/api/users/search?q=${encodeURIComponent(q)}`);
    if (data.users.length === 0) {
      searchResults.innerHTML = '<div class="mini-item">Kullanıcı bulunamadı.</div>';
      return;
    }

    data.users.forEach((u) => {
      const item = document.createElement('div');
      item.className = 'mini-item';
      item.innerHTML = `<div><strong>${escapeHtml(u.username)}</strong><span>ID: ${u.id}</span></div>`;

      const btn = document.createElement('button');
      btn.className = 'action-button';
      btn.textContent = 'Ekle';
      btn.onclick = () => sendFriendRequest(u.username);

      item.appendChild(btn);
      searchResults.appendChild(item);
    });
  } catch (error) {
    searchResults.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

async function sendFriendRequest(username) {
  try {
    const data = await api('/api/friends/request', {
      method: 'POST',
      body: JSON.stringify({ username })
    });
    addSystemMessage(data.message);
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function loadRequests() {
  try {
    const data = await api('/api/friends/requests');
    requestsList.innerHTML = '';

    if (data.requests.length === 0) {
      requestsList.innerHTML = '<div class="mini-item">İstek yok.</div>';
      return;
    }

    data.requests.forEach((request) => {
      const item = document.createElement('div');
      item.className = 'mini-item';
      item.innerHTML = `<div><strong>${escapeHtml(request.username)}</strong><span>Arkadaş isteği</span></div>`;

      const actions = document.createElement('div');

      const accept = document.createElement('button');
      accept.className = 'action-button';
      accept.textContent = 'Kabul';
      accept.onclick = () => respondFriend(request.id, 'accept');

      const reject = document.createElement('button');
      reject.className = 'action-button red';
      reject.textContent = 'Red';
      reject.onclick = () => respondFriend(request.id, 'reject');

      actions.appendChild(accept);
      actions.appendChild(reject);
      item.appendChild(actions);
      requestsList.appendChild(item);
    });
  } catch (error) {
    requestsList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

async function respondFriend(requestId, action) {
  try {
    const data = await api('/api/friends/respond', {
      method: 'POST',
      body: JSON.stringify({ requestId, action })
    });

    addSystemMessage(data.message);
    await Promise.allSettled([loadRequests(), loadFriends()]);
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function loadFriends() {
  try {
    const data = await api('/api/friends');
    friendsList.innerHTML = '';

    if (data.friends.length === 0) {
      friendsList.innerHTML = '<div class="mini-item">Arkadaş yok.</div>';
      return;
    }

    data.friends.forEach((friend) => {
      const item = document.createElement('div');
      item.className = 'mini-item';
      item.innerHTML = `<div><strong>${escapeHtml(friend.username)}</strong><span>DM aç</span></div>`;

      const btn = document.createElement('button');
      btn.className = 'action-button';
      btn.textContent = 'DM';
      btn.onclick = () => openDm(friend);

      item.appendChild(btn);
      friendsList.appendChild(item);
    });
  } catch (error) {
    friendsList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

async function openDm(friend) {
  activeFriend = friend;
  chatMode = 'dm';

  roomModeButton.classList.remove('active');
  dmModeButton.classList.add('active');
  roomPanel.classList.add('hidden');
  friendsPanel.classList.remove('hidden');

  chatTitle.textContent = `DM: ${friend.username}`;
  messagesEl.innerHTML = '';
  typingText.textContent = '';

  try {
    const data = await api(`/api/dm/${friend.id}`);
    data.messages.forEach(addDmMessage);
    scrollToBottom();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

function addDmMessage(message) {
  addMessage({
    username: message.sender_username || (message.sender_id === user.id ? user.username : 'Arkadaş'),
    text: message.text,
    time: message.time || formatTime(message.created_at),
    mine: message.sender_id === user.id
  });
}

async function loadNotifications() {
  try {
    const data = await api('/api/notifications');
    notificationsList.innerHTML = '';
    unreadNotifications = data.notifications.filter(n => !n.is_read).length;
    updateBadge();

    if (data.notifications.length === 0) {
      notificationsList.innerHTML = '<div class="mini-item">Bildirim yok.</div>';
      return;
    }

    data.notifications.forEach((n) => addNotificationToList(n, false));
  } catch {
    notificationsList.innerHTML = '<div class="mini-item">Bildirimler yüklenemedi.</div>';
  }
}

function addNotificationToList(notification, isNew) {
  if (notificationsList.textContent.includes('Bildirim yok')) notificationsList.innerHTML = '';

  const item = document.createElement('div');
  item.className = 'mini-item';
  item.innerHTML = `<div><strong>${escapeHtml(notificationTitle(notification))}</strong><span>${escapeHtml(notificationText(notification))}</span></div>`;
  notificationsList.prepend(item);

  if (isNew) {
    unreadNotifications += 1;
    updateBadge();
  }
}

function notificationTitle(n) {
  if (n.type === 'friend_request') return 'Arkadaş isteği';
  if (n.type === 'friend_accept') return 'İstek kabul edildi';
  if (n.type === 'dm') return 'Yeni DM';
  return 'Bildirim';
}

function notificationText(n) {
  const p = n.payload || {};
  if (n.type === 'friend_request') return `${p.fromUsername} arkadaş isteği gönderdi.`;
  if (n.type === 'friend_accept') return `${p.fromUsername} arkadaş oldu.`;
  if (n.type === 'dm') return `${p.fromUsername}: ${p.text || ''}`;
  return p.message || '';
}

function updateBadge() {
  notificationBadge.textContent = unreadNotifications > 0 ? String(unreadNotifications) : '';
}

function renderUsers(users) {
  usersList.innerHTML = '';
  users.forEach((username) => {
    const li = document.createElement('li');
    li.textContent = username;
    usersList.appendChild(li);
  });
}

function addMessage({ username, text, time, mine }) {
  const div = document.createElement('div');
  div.className = `message ${mine ? 'mine' : ''}`;

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `${username} • ${time || ''}`;

  const body = document.createElement('div');
  body.className = 'text';
  body.textContent = text;

  div.appendChild(meta);
  div.appendChild(body);
  messagesEl.appendChild(div);
  scrollToBottom();
}

function addSystemMessage(message) {
  const div = document.createElement('div');
  div.className = 'message system';
  div.textContent = message;
  messagesEl.appendChild(div);
  scrollToBottom();
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function formatTime(dateString) {
  try {
    return new Date(dateString).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function showBrowserNotification(title, body) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body });
}

function escapeHtml(text) {
  return String(text || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function resizeImage(file, maxSize) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height && width > maxSize) {
          height = Math.round(height * (maxSize / width));
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round(width * (maxSize / height));
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };

      img.onerror = reject;
      img.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

startApp();
