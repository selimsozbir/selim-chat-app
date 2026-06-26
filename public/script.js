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
const avatarPreview = document.getElementById('avatarPreview');
const logoutButton = document.getElementById('logoutButton');

const roomInput = document.getElementById('roomInput');
const joinRoomButton = document.getElementById('joinRoomButton');
const roomTitle = document.getElementById('roomTitle');
const statusText = document.getElementById('statusText');

const messagesEl = document.getElementById('messages');
const usersList = document.getElementById('usersList');
const typingText = document.getElementById('typingText');

const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');

let mode = 'login';
let socket = null;
let token = localStorage.getItem('chat_token');
let user = JSON.parse(localStorage.getItem('chat_user') || 'null');
let currentRoom = localStorage.getItem('chat_room') || 'genel';
let typingTimer = null;

function setMode(nextMode) {
  mode = nextMode;

  if (mode === 'login') {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    authButton.textContent = 'Giriş Yap';
  } else {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    authButton.textContent = 'Kayıt Ol';
  }

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

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'İşlem başarısız.');
    }

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
  localStorage.removeItem('chat_token');
  localStorage.removeItem('chat_user');
  localStorage.removeItem('chat_room');

  token = null;
  user = null;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  chatScreen.classList.add('hidden');
  authScreen.classList.remove('hidden');
});

joinRoomButton.addEventListener('click', () => {
  const room = roomInput.value.trim() || 'genel';
  joinRoom(room);
});

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = messageInput.value.trim();

  if (!text || !socket) return;

  socket.emit('chat_message', text);
  messageInput.value = '';
  messageInput.focus();
});

messageInput.addEventListener('input', () => {
  if (!socket) return;

  socket.emit('typing');

  clearTimeout(typingTimer);

  typingTimer = setTimeout(() => {
    typingText.textContent = '';
  }, 1000);
});

async function startApp() {
  if (!token || !user) {
    authScreen.classList.remove('hidden');
    chatScreen.classList.add('hidden');
    return;
  }

  authScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');

  currentUsername.textContent = user.username;
  avatarPreview.textContent = user.username.charAt(0).toUpperCase();

  roomInput.value = currentRoom;

  connectSocket();
}

function connectSocket() {
  if (socket) {
    socket.disconnect();
  }

  socket = io({
    auth: {
      token
    }
  });

  socket.on('connect', () => {
    statusText.textContent = 'Bağlandı';
    joinRoom(currentRoom);
  });

  socket.on('disconnect', () => {
    statusText.textContent = 'Bağlantı koptu';
  });

  socket.on('connect_error', (error) => {
    statusText.textContent = 'Giriş süresi dolmuş olabilir.';
    addSystemMessage(error.message || 'Bağlantı hatası.');

    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_user');
  });

  socket.on('system_message', (message) => {
    addSystemMessage(message);
  });

  socket.on('chat_message', (message) => {
    addMessage(message);
  });

  socket.on('users', (users) => {
    renderUsers(users);
  });

  socket.on('typing', (username) => {
    typingText.textContent = `${username} yazıyor...`;

    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {
      typingText.textContent = '';
    }, 1200);
  });
}

async function joinRoom(room) {
  currentRoom = room.toLowerCase();
  localStorage.setItem('chat_room', currentRoom);

  roomTitle.textContent = `# ${currentRoom}`;
  messagesEl.innerHTML = '';
  typingText.textContent = '';

  await loadOldMessages(currentRoom);

  if (socket && socket.connected) {
    socket.emit('join', {
      room: currentRoom
    });
  }
}

async function loadOldMessages(room) {
  try {
    const response = await fetch(`/api/messages/${encodeURIComponent(room)}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Mesajlar yüklenemedi.');
    }

    data.messages.forEach((message) => {
      addMessage({
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

function addMessage(message) {
  const div = document.createElement('div');

  const isMine = user && message.username === user.username;

  div.className = `message ${isMine ? 'mine' : ''}`;

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `${message.username} • ${message.time || ''}`;

  const text = document.createElement('div');
  text.className = 'text';
  text.textContent = message.text;

  div.appendChild(meta);
  div.appendChild(text);

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

function renderUsers(users) {
  usersList.innerHTML = '';

  users.forEach((username) => {
    const li = document.createElement('li');
    li.textContent = username;
    usersList.appendChild(li);
  });
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function formatTime(dateString) {
  try {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

startApp();
