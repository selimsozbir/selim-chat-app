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
const removeAvatarButton = document.getElementById('removeAvatarButton');

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
const attachButton = document.getElementById('attachButton');
const voiceButton = document.getElementById('voiceButton');
const fileInput = document.getElementById('fileInput');
const replyBar = document.getElementById('replyBar');
const replyUsername = document.getElementById('replyUsername');
const replyText = document.getElementById('replyText');
const cancelReplyButton = document.getElementById('cancelReplyButton');

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchResults = document.getElementById('searchResults');
const requestsList = document.getElementById('requestsList');
const friendsList = document.getElementById('friendsList');
const blockedList = document.getElementById('blockedList');

const notificationsList = document.getElementById('notificationsList');
const notificationBadge = document.getElementById('notificationBadge');
const enableNotificationsButton = document.getElementById('enableNotificationsButton');
const clearNotificationsButton = document.getElementById('clearNotificationsButton');

const messageSearchInput = document.getElementById('messageSearchInput');
const messageSearchButton = document.getElementById('messageSearchButton');
const messageSearchResults = document.getElementById('messageSearchResults');
const myRoleText = document.getElementById('myRoleText');
const adminMembersList = document.getElementById('adminMembersList');
const mutedMembersList = document.getElementById('mutedMembersList');

const globalAdminPanel = document.getElementById('globalAdminPanel');
const refreshAdminButton = document.getElementById('refreshAdminButton');
const adminUsersList = document.getElementById('adminUsersList');
const ipBansList = document.getElementById('ipBansList');
const ipBanInput = document.getElementById('ipBanInput');
const ipBanButton = document.getElementById('ipBanButton');

const profileModal = document.getElementById('profileModal');
const profileCloseButton = document.getElementById('profileCloseButton');
const profileAvatar = document.getElementById('profileAvatar');
const profileUsername = document.getElementById('profileUsername');
const profileStatus = document.getElementById('profileStatus');
const profileBio = document.getElementById('profileBio');
const profileBioInput = document.getElementById('profileBioInput');
const profileSaveBioButton = document.getElementById('profileSaveBioButton');

const mentionPopup = document.getElementById('mentionPopup');

let mode = 'login';
let chatMode = 'room';
let activeFriend = null;

let socket = null;
let token = localStorage.getItem('chat_token');
let user = JSON.parse(localStorage.getItem('chat_user') || 'null');
let currentRoom = localStorage.getItem('chat_room') || 'genel';
let unreadNotifications = 0;
let typingTimer = null;
let dmTypingTimer = null;
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let contextTarget = null;
let longPressTimer = null;
let replyingTo = null;
let roomMembers = [];
let mentionCandidates = [];
let selectedMentionIndex = 0;
let myRoomRole = null;
let roomMutedUsers = [];
let canOpenGlobalAdmin = false;
let isUploadingFile = false;

const contextMenu = document.createElement('div');
contextMenu.className = 'message-context-menu hidden';
contextMenu.innerHTML = `
  <button data-emoji="❤️">❤️</button>
  <button data-emoji="👍">👍</button>
  <button data-emoji="😂">😂</button>
  <button data-emoji="🔥">🔥</button>
  <button data-emoji="😘">😘</button>
  <button data-action="reply">Yanıtla</button>
  <button data-action="edit">Düzenle</button>
  <button data-action="delete" class="danger">Sil</button>
`;
document.body.appendChild(contextMenu);

contextMenu.addEventListener('click', (event) => {
  event.stopPropagation();
  const button = event.target.closest('button');
  if (!button || !contextTarget) return;

  if (button.dataset.emoji) {
    sendReaction(contextTarget.type, contextTarget.id, button.dataset.emoji);
    hideContextMenu();
    return;
  }

  if (button.dataset.action === 'reply') {
    startReply(contextTarget);
    hideContextMenu();
    return;
  }

  if (button.dataset.action === 'edit') {
    editMessage(contextTarget.type, contextTarget.id, contextTarget.text);
    hideContextMenu();
    return;
  }

  if (button.dataset.action === 'delete') {
    deleteMessage(contextTarget.type, contextTarget.id);
    hideContextMenu();
  }
});

document.addEventListener('click', () => hideContextMenu());
document.addEventListener('scroll', () => hideContextMenu(), true);
window.addEventListener('resize', () => hideContextMenu());

const imageModal = document.createElement('div');
imageModal.className = 'image-modal hidden';
imageModal.innerHTML = '<button class="image-modal-close" type="button">×</button><img alt="Büyük fotoğraf">';
document.body.appendChild(imageModal);

const imageModalImg = imageModal.querySelector('img');
const imageModalClose = imageModal.querySelector('.image-modal-close');

imageModalClose.addEventListener('click', closeImageModal);
imageModal.addEventListener('click', (event) => {
  if (event.target === imageModal) closeImageModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeImageModal();
});


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

cancelReplyButton.addEventListener('click', clearReply);

roomModeButton.addEventListener('click', () => {
  clearReply();
  setChatMode('room');
});
dmModeButton.addEventListener('click', () => {
  clearReply();
  setChatMode('dm');
  loadFriends();
  loadRequests();
  loadBlocked();
});

joinRoomButton.addEventListener('click', () => joinRoom(roomInput.value.trim() || 'genel'));
searchButton.addEventListener('click', searchUsers);
messageSearchButton.addEventListener('click', searchMessages);
messageSearchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') searchMessages();
});

profileCloseButton.addEventListener('click', closeProfile);
profileModal.addEventListener('click', (event) => {
  if (event.target === profileModal) closeProfile();
});

profileSaveBioButton.addEventListener('click', saveBio);
refreshAdminButton.addEventListener('click', loadGlobalAdminPanel);
ipBanButton.addEventListener('click', banIpFromInput);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') searchUsers();
});

messageInput.addEventListener('keydown', (event) => {
  if (mentionPopup.classList.contains('hidden')) return;

  if (event.key === 'Tab' || event.key === 'Enter') {
    event.preventDefault();
    applyMention(selectedMentionIndex);
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    selectedMentionIndex = Math.min(selectedMentionIndex + 1, mentionCandidates.length - 1);
    renderMentionPopup();
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    selectedMentionIndex = Math.max(selectedMentionIndex - 1, 0);
    renderMentionPopup();
  }

  if (event.key === 'Escape') {
    hideMentionPopup();
  }
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
    socket.emit('dm_message', { receiverId: activeFriend.id, text, type: 'text', replyToId: replyingTo?.id || null });
    clearReply();
  } else {
    socket.emit('chat_message', { text, type: 'text', replyToId: replyingTo?.id || null });
    clearReply();
  }

  messageInput.value = '';
  messageInput.focus();
});

messageInput.addEventListener('input', () => {
  updateMentionSuggestions();
  if (!socket) return;

  if (chatMode === 'dm' && activeFriend) {
    socket.emit('dm_typing', { receiverId: activeFriend.id });
  } else if (chatMode === 'room') {
    socket.emit('typing');
  }
});

attachButton.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  try {
    await sendFileMessage(file);
  } catch (error) {
    addSystemMessage(error.name === 'AbortError' ? 'Yükleme zaman aşımına uğradı.' : error.message);
    console.error('Upload client error:', error);
  } finally {
    fileInput.value = '';
  }
});

voiceButton.addEventListener('click', async () => {
  if (isRecording) {
    stopVoiceRecording();
    return;
  }

  await startVoiceRecording();
});

async function sendFileMessage(file) {
  if (isUploadingFile) {
    addSystemMessage('Zaten bir dosya yükleniyor.');
    return;
  }

  if (!file) {
    throw new Error('Dosya seçilmedi.');
  }

  if (file.size > 25_000_000) {
    throw new Error('Dosya çok büyük. 25 MB altı dosya seç.');
  }

  isUploadingFile = true;
  attachButton.disabled = true;
  voiceButton.disabled = true;

  try {
    const formData = new FormData();
    formData.append('file', file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 70000);

    let response;
    try {
      response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const rawText = await response.text();
    let data = {};

    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      throw new Error(`Upload cevabı okunamadı. HTTP ${response.status}: ${rawText.slice(0, 120)}`);
    }

    if (!response.ok) {
      throw new Error(data.error || `Dosya yüklenemedi. HTTP ${response.status}`);
    }

    const uploaded = data.file;
    if (!uploaded || !uploaded.fileUrl || !uploaded.type) {
      throw new Error('Upload cevabı eksik geldi.');
    }

    const uploadedType = uploaded.type;
    const payload = {
      text: uploadedType === 'image' ? 'Fotoğraf' : uploadedType === 'audio' ? 'Ses dosyası' : uploaded.fileName,
      type: uploadedType,
      fileName: uploaded.fileName,
      fileMime: uploaded.fileMime,
      fileData: uploaded.fileUrl,
      filePath: uploaded.filePath,
      fileSize: uploaded.fileSize
    };

    if (chatMode === 'dm') {
      if (!activeFriend) {
        addSystemMessage('Önce bir arkadaş seç.');
        return;
      }

      socket.emit('dm_message', {
        receiverId: activeFriend.id,
        ...payload,
        replyToId: replyingTo?.id || null
      });

      clearReply();
    } else {
      socket.emit('chat_message', {
        ...payload,
        replyToId: replyingTo?.id || null
      });

      clearReply();
    }
  } catch (error) {
    addSystemMessage(error.name === 'AbortError'
      ? 'Yükleme zaman aşımına uğradı.'
      : error.message);
    console.error('Upload client error:', error);
  } finally {
    isUploadingFile = false;
    attachButton.disabled = false;
    voiceButton.disabled = false;
    fileInput.value = '';
  }
}

async function startVoiceRecording() {
  if (!navigator.mediaDevices?.getUserMedia) {
    addSystemMessage('Tarayıcın ses kaydı desteklemiyor.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(track => track.stop());

      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });

      try {
        await sendFileMessage(file);
      } catch (error) {
        addSystemMessage(error.message);
      }
    };

    mediaRecorder.start();
    isRecording = true;
    voiceButton.classList.add('recording');
    voiceButton.textContent = '⏹️';
    addSystemMessage('Ses kaydı başladı. Durdurmak için kırmızı butona bas.');
  } catch {
    addSystemMessage('Mikrofon izni verilmedi.');
  }
}

function stopVoiceRecording() {
  if (!mediaRecorder || !isRecording) return;

  mediaRecorder.stop();
  isRecording = false;
  voiceButton.classList.remove('recording');
  voiceButton.textContent = '🎙️';
}


document.addEventListener('paste', async (event) => {
  const items = Array.from(event.clipboardData?.items || []);
  const fileItem = items.find(item => item.kind === 'file');

  if (!fileItem) return;

  const file = fileItem.getAsFile();
  if (!file) return;

  event.preventDefault();

  try {
    await sendFileMessage(file);
  } catch (error) {
    addSystemMessage(error.message);
  }
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

removeAvatarButton.addEventListener('click', async () => {
  try {
    const data = await api('/api/avatar', { method: 'DELETE' });
    user = data.user;
    localStorage.setItem('chat_user', JSON.stringify(user));
    renderProfile();
    addSystemMessage('Profil fotoğrafı kaldırıldı.');
  } catch (error) {
    addSystemMessage(error.message);
  }
});

clearNotificationsButton.addEventListener('click', async () => {
  try {
    await api('/api/notifications', { method: 'DELETE' });
    notificationsList.innerHTML = '<div class="mini-item">Bildirim yok.</div>';
    unreadNotifications = 0;
    updateBadge();
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

  await Promise.allSettled([refreshMe(), loadFriends(), loadRequests(), loadBlocked(), loadNotifications(), loadRoomMembers(), loadModeration(), loadGlobalAdminStatus()]);
}

function renderProfile() {
  currentUsername.textContent = user.display_name || user.username;
  avatarLetter.textContent = (user.display_name || user.username).charAt(0).toUpperCase();

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

  socket.on('disconnect', () => statusText.textContent = 'Bağlantı koptu');
  socket.on('connect_error', (error) => {
    statusText.textContent = 'Bağlantı hatası: ' + error.message;
    addSystemMessage(error.message || 'Bağlantı hatası.');
  });

  socket.on('system_message', addSystemMessage);

  socket.on('room_role', ({ role }) => {
    myRoomRole = role;
    renderRole();
  });

  socket.on('global_banned', ({ reason }) => {
    alert(reason || 'Bu hesap banlandı.');
    localStorage.clear();
    location.reload();
  });

  socket.on('room_kicked', ({ room }) => {
    if (room === currentRoom) {
      addSystemMessage('Bu odadan atıldın.');
      joinRoom('genel');
    }
  });

  socket.on('room_banned', ({ room }) => {
    if (room === currentRoom) {
      addSystemMessage('Bu odadan banlandın.');
      joinRoom('genel');
    }
  });
  socket.on('chat_message', (message) => {
    if (chatMode !== 'room') return;
    if (!message.room || message.room === currentRoom) addRoomMessage(message);
  });
  socket.on('users', renderUsers);

  socket.on('room_message_updated', (msg) => updateMessageElement('room', msg.id, msg.text, true, false));
  socket.on('room_message_deleted', (msg) => updateMessageElement('room', msg.id, msg.text, false, true));

  socket.on('dm_message_updated', (msg) => updateMessageElement('dm', msg.id, msg.text, true, false));
  socket.on('dm_message_deleted', (msg) => updateMessageElement('dm', msg.id, msg.text, false, true));

  socket.on('dm_read', ({ byId }) => {
    if (activeFriend && activeFriend.id === byId) {
      document.querySelectorAll('.read-status.mine').forEach(el => el.textContent = 'Görüldü ✓✓');
    }
  });

  socket.on('typing', (username) => {
    if (chatMode !== 'room') return;

    typingText.textContent = `${username} yazıyor...`;
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => typingText.textContent = '', 1200);
  });

  socket.on('dm_typing', ({ fromId, fromUsername }) => {
    if (chatMode === 'dm' && activeFriend && String(activeFriend.id) === String(fromId)) {
      typingText.textContent = `${fromUsername} yazıyor...`;
      clearTimeout(dmTypingTimer);
      dmTypingTimer = setTimeout(() => typingText.textContent = '', 1200);
    }
  });

  socket.on('dm_message', (message) => {
    const otherId = message.sender_id === user.id ? message.receiver_id : message.sender_id;

    if (chatMode === 'dm' && activeFriend && activeFriend.id === otherId) {
      addDmMessage(message);
      markDmRead(activeFriend.id);
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

    if (notification.type === 'mention' || notification.type === 'mention_everyone') {
      showBrowserNotification('Etiketlendin', `${notification.payload.fromUsername}: ${notification.payload.text}`);
    }
  });

  socket.on('reaction_state', ({ scope, messageId, reactions }) => {
    setReactionsOnElement(scope, messageId, reactions);
  });

  socket.on('friend_removed', () => {
    loadFriends();
    addSystemMessage('Bir arkadaşlık kaldırıldı.');
  });

  socket.on('blocked_by_user', () => {
    loadFriends();
    if (chatMode === 'dm') {
      activeFriend = null;
      messagesEl.innerHTML = '';
      addSystemMessage('Bu kullanıcıyla DM kapatıldı.');
    }
  });
}

function setChatMode(nextMode) {
  clearReply();
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
  clearReply();
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
  await Promise.allSettled([loadRoomMembers(), loadModeration()]);
  if (socket && socket.connected) socket.emit('join', { room: currentRoom });
}

async function loadOldRoomMessages(room) {
  try {
    const data = await api(`/api/messages/${encodeURIComponent(room)}`);
    data.messages.forEach((message) => {
      addRoomMessage({
        id: message.id,
        username: message.username,
        avatar_url: message.avatar_url,
        text: message.text,
        message_type: message.message_type,
        file_name: message.file_name,
        file_mime: message.file_mime,
        file_data: message.file_data,
        file_path: message.file_path,
        file_size: message.file_size,
        reply_to_id: message.reply_to_id,
        reply_username: message.reply_username,
        reply_text: message.reply_text,
        edited_at: message.edited_at,
        deleted_at: message.deleted_at,
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
    type: 'room',
    id: message.id,
    username: message.username,
    avatar_url: message.avatar_url,
    text: message.text,
    message_type: message.message_type,
    file_name: message.file_name,
    file_mime: message.file_mime,
    file_data: message.file_data,
    file_path: message.file_path,
    file_size: message.file_size,
    reply_to_id: message.reply_to_id,
    reply_username: message.reply_username,
    reply_text: message.reply_text,
    time: message.time,
    mine: user && message.username === user.username,
    edited: Boolean(message.edited_at),
    deleted: Boolean(message.deleted_at)
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
      item.innerHTML = `<div class="mini-left">${avatarHtml(u.username, u.avatar_url)}<div><strong>${escapeHtml(u.username)}</strong><span>${formatPresence(u)}</span></div></div>`;
      item.querySelector('.mini-left').onclick = () => openProfile(u.id);

      const actions = document.createElement('div');
      actions.className = 'mini-actions';

      const add = document.createElement('button');
      add.className = 'action-button';
      add.textContent = 'Ekle';
      add.onclick = () => sendFriendRequest(u.username);

      const block = document.createElement('button');
      block.className = 'action-button red';
      block.textContent = 'Engelle';
      block.onclick = () => blockUser(u.id);

      actions.appendChild(add);
      actions.appendChild(block);
      item.appendChild(actions);
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
      item.innerHTML = `<div class="mini-left">${avatarHtml(request.username, request.avatar_url)}<div><strong>${escapeHtml(request.username)}</strong><span>Arkadaş isteği</span></div></div>`;

      const actions = document.createElement('div');
      actions.className = 'mini-actions';

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
      item.innerHTML = `<div class="mini-left" data-profile-id="${friend.id}">${avatarHtml(friend.username, friend.avatar_url)}<div><strong>${escapeHtml(friend.username)}</strong><span>${formatPresence(friend)}</span></div></div>`;
      item.querySelector('.mini-left').onclick = () => openProfile(friend.id);

      const actions = document.createElement('div');
      actions.className = 'mini-actions';

      const dm = document.createElement('button');
      dm.className = 'action-button';
      dm.textContent = 'DM';
      dm.onclick = () => openDm(friend);

      const remove = document.createElement('button');
      remove.className = 'action-button gray';
      remove.textContent = 'Sil';
      remove.onclick = () => removeFriend(friend.id);

      const block = document.createElement('button');
      block.className = 'action-button red';
      block.textContent = 'Engelle';
      block.onclick = () => blockUser(friend.id);

      actions.appendChild(dm);
      actions.appendChild(remove);
      actions.appendChild(block);
      item.appendChild(actions);
      friendsList.appendChild(item);
    });
  } catch (error) {
    friendsList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

async function removeFriend(friendId) {
  if (!confirm('Arkadaşı silmek istiyor musun?')) return;

  try {
    const data = await api(`/api/friends/${friendId}`, { method: 'DELETE' });
    addSystemMessage(data.message);
    if (activeFriend && activeFriend.id === friendId) {
      activeFriend = null;
      messagesEl.innerHTML = '';
    }
    loadFriends();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function blockUser(userId) {
  if (!confirm('Bu kullanıcıyı engellemek istiyor musun?')) return;

  try {
    const data = await api('/api/block', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
    addSystemMessage(data.message);
    if (activeFriend && activeFriend.id === userId) {
      activeFriend = null;
      messagesEl.innerHTML = '';
    }
    await Promise.allSettled([loadFriends(), loadBlocked(), loadRequests()]);
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function loadBlocked() {
  try {
    const data = await api('/api/blocked');
    blockedList.innerHTML = '';

    if (data.blocked.length === 0) {
      blockedList.innerHTML = '<div class="mini-item">Engellenen yok.</div>';
      return;
    }

    data.blocked.forEach((row) => {
      const item = document.createElement('div');
      item.className = 'mini-item';
      item.innerHTML = `<div class="mini-left">${avatarHtml(row.username, row.avatar_url)}<div><strong>${escapeHtml(row.username)}</strong><span>Engellendi</span></div></div>`;

      const unblock = document.createElement('button');
      unblock.className = 'action-button';
      unblock.textContent = 'Kaldır';
      unblock.onclick = () => unblockUser(row.user_id);

      item.appendChild(unblock);
      blockedList.appendChild(item);
    });
  } catch (error) {
    blockedList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

async function unblockUser(userId) {
  try {
    const data = await api(`/api/block/${userId}`, { method: 'DELETE' });
    addSystemMessage(data.message);
    loadBlocked();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function openDm(friend) {
  clearReply();
  activeFriend = friend;
  chatMode = 'dm';

  roomModeButton.classList.remove('active');
  dmModeButton.classList.add('active');
  roomPanel.classList.add('hidden');
  friendsPanel.classList.remove('hidden');

  chatTitle.textContent = `DM: ${friend.username}`;
  messagesEl.innerHTML = '';
  typingText.textContent = '';

  if (socket) socket.emit('dm_join', { friendId: friend.id });

  try {
    const data = await api(`/api/dm/${friend.id}`);
    data.messages.forEach(addDmMessage);
    await markDmRead(friend.id);
    scrollToBottom();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function markDmRead(friendId) {
  try {
    await api(`/api/dm/${friendId}/read`, { method: 'POST' });
  } catch {}
}

function addDmMessage(message) {
  addMessage({
    type: 'dm',
    id: message.id,
    username: message.sender_username || (message.sender_id === user.id ? user.username : 'Arkadaş'),
    avatar_url: message.sender_avatar_url || (message.sender_id === user.id ? user.avatar_url : null),
    text: message.text,
    message_type: message.message_type,
    file_name: message.file_name,
    file_mime: message.file_mime,
    file_data: message.file_data,
    file_path: message.file_path,
    file_size: message.file_size,
    reply_to_id: message.reply_to_id,
    reply_username: message.reply_username,
    reply_text: message.reply_text,
    time: message.time || formatTime(message.created_at),
    mine: message.sender_id === user.id,
    edited: Boolean(message.edited_at),
    deleted: Boolean(message.deleted_at),
    read: Boolean(message.read_at)
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

  if (notification.id) {
    const del = document.createElement('button');
    del.className = 'action-button gray';
    del.textContent = 'Sil';
    del.onclick = () => deleteNotification(notification.id, item);
    item.appendChild(del);
  }

  notificationsList.prepend(item);

  if (isNew) {
    unreadNotifications += 1;
    updateBadge();
  }
}

async function deleteNotification(id, element) {
  try {
    await api(`/api/notifications/${id}`, { method: 'DELETE' });
    element.remove();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

function notificationTitle(n) {
  if (n.type === 'friend_request') return 'Arkadaş isteği';
  if (n.type === 'friend_accept') return 'İstek kabul edildi';
  if (n.type === 'dm') return 'Yeni DM';
  if (n.type === 'mention') return 'Etiket';
  if (n.type === 'mention_everyone') return '@everyone';
  return 'Bildirim';
}

function notificationText(n) {
  const p = n.payload || {};
  if (n.type === 'friend_request') return `${p.fromUsername} arkadaş isteği gönderdi.`;
  if (n.type === 'friend_accept') return `${p.fromUsername} arkadaş oldu.`;
  if (n.type === 'dm') return `${p.fromUsername}: ${p.text || ''}`;
  if (n.type === 'mention' || n.type === 'mention_everyone') return `${p.fromUsername} seni ${p.room} odasında etiketledi.`;
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

  loadRoomMembers();
  loadModeration();
}

function addMessage({ type, id, username, avatar_url, text, message_type, file_name, file_mime, file_data, file_path, file_size, reply_to_id, reply_username, reply_text, time, mine, edited, deleted, read }) {
  const div = document.createElement('div');
  div.className = `message ${mine ? 'mine' : ''}`;
  div.dataset.type = type;
  div.dataset.id = id;

  const avatar = document.createElement(avatar_url ? 'img' : 'div');
  avatar.className = 'msg-avatar';
  if (avatar_url) {
    avatar.src = avatar_url;
    avatar.alt = username;
  } else {
    avatar.textContent = String(username || '?').charAt(0).toUpperCase();
  }

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `${username} • ${time || ''}${edited ? ' • düzenlendi' : ''}${deleted ? ' • silindi' : ''}`;

  const body = document.createElement('div');
  body.className = 'text';
  body.textContent = text;

  bubble.appendChild(meta);

  if (reply_to_id) {
    const reply = document.createElement('div');
    reply.className = 'reply-preview';
    reply.innerHTML = `<strong>${escapeHtml(reply_username || 'Mesaj')}</strong><span>${escapeHtml(reply_text || 'Yanıtlanan mesaj')}</span>`;
    bubble.appendChild(reply);
  }

  bubble.appendChild(body);

  if (file_data && !deleted) {
    bubble.appendChild(renderMedia({ message_type, file_name, file_mime, file_data, file_path, file_size }));
  }

  if (mine && !deleted) {
    const actions = document.createElement('div');
    actions.className = 'message-actions';

    const edit = document.createElement('button');
    edit.className = 'message-action';
    edit.textContent = 'Düzenle';
    edit.onclick = (event) => {
      event.stopPropagation();
      editMessage(type, id, body.textContent);
    };

    const del = document.createElement('button');
    del.className = 'message-action';
    del.textContent = 'Sil';
    del.onclick = (event) => {
      event.stopPropagation();
      deleteMessage(type, id);
    };

    actions.appendChild(edit);
    actions.appendChild(del);
    bubble.appendChild(actions);
  }

  addReactionPicker(bubble, type, id);

  if (type === 'dm' && mine) {
    const status = document.createElement('span');
    status.className = 'read-status mine';
    status.textContent = read ? 'Görüldü ✓✓' : 'Gönderildi ✓';
    bubble.appendChild(status);
  }

  div.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    showContextMenu(event.clientX, event.clientY, {
      type,
      id,
      text: body.textContent,
      username,
      mine,
      deleted
    });
  });

  div.addEventListener('touchstart', (event) => {
    clearTimeout(longPressTimer);
    longPressTimer = setTimeout(() => {
      const touch = event.touches[0];
      showContextMenu(touch.clientX, touch.clientY, {
        type,
        id,
        text: body.textContent,
        mine,
        deleted
      });
    }, 550);
  }, { passive: true });

  div.addEventListener('touchend', () => clearTimeout(longPressTimer));
  div.addEventListener('touchmove', () => clearTimeout(longPressTimer));

  div.addEventListener('dblclick', (event) => {
    event.stopPropagation();
    sendReaction(type, id, '❤️');
  });

  div.appendChild(avatar);
  div.appendChild(bubble);
  messagesEl.appendChild(div);
  loadReactionsForMessage(type, id);
  scrollToBottom();
}

function updateMessageElement(type, id, text, edited, deleted) {
  const el = document.querySelector(`.message[data-type="${type}"][data-id="${id}"]`);
  if (!el) return;

  const body = el.querySelector('.text');
  const meta = el.querySelector('.meta');
  const actions = el.querySelector('.message-actions');

  if (body) body.textContent = text;
  if (meta) {
    if (deleted && !meta.textContent.includes('silindi')) meta.textContent += ' • silindi';
    else if (edited && !meta.textContent.includes('düzenlendi')) meta.textContent += ' • düzenlendi';
  }
  if (deleted && actions) actions.remove();
}

function editMessage(type, id, oldText) {
  const newText = prompt('Yeni mesaj:', oldText);
  if (!newText || !newText.trim()) return;

  if (type === 'dm') {
    socket.emit('dm_message_edit', { messageId: id, text: newText.trim() });
  } else {
    socket.emit('room_message_edit', { messageId: id, text: newText.trim() });
  }
}

function deleteMessage(type, id) {
  if (!confirm('Mesajı silmek istiyor musun?')) return;

  if (type === 'dm') {
    socket.emit('dm_message_delete', { messageId: id });
  } else {
    socket.emit('room_message_delete', { messageId: id });
  }
}


function showContextMenu(x, y, target) {
  if (!target || !target.id || target.deleted) return;

  contextTarget = target;

  const editButton = contextMenu.querySelector('[data-action="edit"]');
  const deleteButton = contextMenu.querySelector('[data-action="delete"]');

  editButton.style.display = target.mine ? '' : 'none';
  deleteButton.style.display = target.mine ? '' : 'none';

  contextMenu.classList.remove('hidden');

  const width = contextMenu.offsetWidth;
  const height = contextMenu.offsetHeight;
  const left = Math.min(x, window.innerWidth - width - 12);
  const top = Math.min(y, window.innerHeight - height - 12);

  contextMenu.style.left = `${Math.max(12, left)}px`;
  contextMenu.style.top = `${Math.max(12, top)}px`;
}

function hideContextMenu() {
  contextMenu.classList.add('hidden');
  contextTarget = null;
}

function startReply(target) {
  if (!target || !target.id) return;

  replyingTo = {
    type: target.type,
    id: target.id,
    username: target.username || 'Mesaj',
    text: target.text || ''
  };

  replyUsername.textContent = `Yanıtlanıyor: ${replyingTo.username}`;
  replyText.textContent = replyingTo.text.slice(0, 80);
  replyBar.classList.remove('hidden');
  messageInput.focus();
}

function clearReply() {
  replyingTo = null;
  replyBar.classList.add('hidden');
  replyUsername.textContent = '';
  replyText.textContent = '';
}

function renderMedia({ message_type, file_name, file_mime, file_data, file_path, file_size }) {
  const wrap = document.createElement('div');
  wrap.className = 'message-media';

  if (message_type === 'image') {
    const img = document.createElement('img');
    img.src = file_data;
    img.alt = file_name || 'image';
    img.addEventListener('click', (event) => {
      event.stopPropagation();
      openImageModal(file_data);
    });
    wrap.appendChild(img);
    return wrap;
  }

  if (message_type === 'audio') {
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = file_data;
    wrap.appendChild(audio);
    return wrap;
  }

  const link = document.createElement('a');
  link.className = 'file-link';
  link.href = file_data;
  link.target = '_blank';
  link.rel = 'noopener';
  link.download = file_name || 'dosya';
  const sizeText = file_size ? ` (${formatFileSize(file_size)})` : '';
  link.textContent = `📄 ${file_name || 'Dosya aç'}${sizeText}`;
  wrap.appendChild(link);
  return wrap;
}

function addReactionPicker(bubble, scope, messageId) {
  if (!messageId) return;

  const reactions = document.createElement('div');
  reactions.className = 'reactions';
  bubble.appendChild(reactions);

  const picker = document.createElement('div');
  picker.className = 'reaction-picker';

  ['👍', '😂', '❤️', '🔥', '😘'].forEach((emoji) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'message-action';
    btn.textContent = emoji;
    btn.onclick = (event) => {
      event.stopPropagation();
      sendReaction(scope, messageId, emoji);
    };
    picker.appendChild(btn);
  });

  bubble.appendChild(picker);
}

async function sendReaction(scope, messageId, emoji) {
  try {
    const data = await api('/api/reactions', {
      method: 'POST',
      body: JSON.stringify({ scope, messageId, emoji })
    });

    if (data.reactions) {
      setReactionsOnElement(scope, messageId, data.reactions);
    }
  } catch (error) {
    addSystemMessage(error.message);
  }
}

function setReactionsOnElement(scope, messageId, reactionState) {
  const el = document.querySelector(`.message[data-type="${scope}"][data-id="${messageId}"]`);
  if (!el) return;

  const reactions = el.querySelector('.reactions');
  if (!reactions) return;

  reactions.innerHTML = '';

  (reactionState || []).forEach((reaction) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'reaction-pill';
    pill.dataset.emoji = reaction.emoji;
    pill.dataset.users = JSON.stringify(reaction.users || []);
    pill.textContent = `${reaction.emoji} ${reaction.count}`;

    pill.onclick = (event) => {
      event.stopPropagation();
      showReactionUsers(reaction.emoji, reaction.users || []);
    };

    reactions.appendChild(pill);
  });
}

async function loadReactionsForMessage(scope, messageId) {
  if (!messageId) return;

  try {
    const data = await api(`/api/reactions/${scope}/${messageId}`);
    setReactionsOnElement(scope, messageId, data.reactions || []);
  } catch {}
}

function showReactionUsers(emoji, users) {
  const names = users.map(user => user.username).join(', ');
  alert(`${emoji} bırakanlar: ${names || 'Kimse yok'}`);
}

function openImageModal(src) {
  imageModalImg.src = src;
  imageModal.classList.remove('hidden');
}

function closeImageModal() {
  imageModal.classList.add('hidden');
  imageModalImg.src = '';
}

function formatFileSize(bytes) {
  const n = Number(bytes || 0);
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function refreshMe() {
  try {
    const data = await api('/api/me');
    user = data.user;
    localStorage.setItem('chat_user', JSON.stringify(user));
    renderProfile();
  } catch {}
}

function displayName(person) {
  return person?.display_name || person?.username || 'Kullanıcı';
}

async function loadGlobalAdminStatus() {
  try {
    const data = await api('/api/admin/me');
    canOpenGlobalAdmin = Boolean(data.canOpenAdmin);
    globalAdminPanel.classList.toggle('hidden', !canOpenGlobalAdmin);

    if (canOpenGlobalAdmin) {
      await loadGlobalAdminPanel();
    }
  } catch {
    globalAdminPanel.classList.add('hidden');
  }
}

async function loadGlobalAdminPanel() {
  if (!canOpenGlobalAdmin) return;

  await Promise.allSettled([loadAdminUsers(), loadIpBans()]);
}

async function loadAdminUsers() {
  try {
    const data = await api('/api/admin/users');
    adminUsersList.innerHTML = '';

    if (!data.users.length) {
      adminUsersList.innerHTML = '<div class="mini-item">Kullanıcı yok.</div>';
      return;
    }

    data.users.forEach((u) => {
      const item = document.createElement('div');
      item.className = 'mini-item admin-user-item';

      item.innerHTML = `
        <div class="mini-left">
          ${avatarHtml(displayName(u), u.avatar_url)}
          <div>
            <strong>${escapeHtml(displayName(u))} ${u.is_banned ? '🚫' : ''}</strong>
            <span>@${escapeHtml(u.username)} • ${escapeHtml(u.global_role || 'user')}</span>
            <span>IP: ${escapeHtml(u.last_ip || 'yok')}</span>
            <span>${escapeHtml(u.last_user_agent || 'cihaz yok')}</span>
            <span>${u.online ? 'Çevrimiçi' : formatPresence(u)}</span>
          </div>
        </div>
      `;

      const actions = document.createElement('div');
      actions.className = 'mini-actions';

      const nameBtn = document.createElement('button');
      nameBtn.className = 'action-button';
      nameBtn.textContent = 'Nick';
      nameBtn.onclick = () => changeDisplayName(u);

      const roleBtn = document.createElement('button');
      roleBtn.className = 'action-button gray';
      roleBtn.textContent = 'Rol';
      roleBtn.onclick = () => changeGlobalRole(u);

      const banBtn = document.createElement('button');
      banBtn.className = `action-button ${u.is_banned ? 'gray' : 'red'}`;
      banBtn.textContent = u.is_banned ? 'Ban kaldır' : 'Ban';
      banBtn.onclick = () => toggleGlobalBan(u);

      const ipBtn = document.createElement('button');
      ipBtn.className = 'action-button red';
      ipBtn.textContent = 'IP Ban';
      ipBtn.onclick = () => banIp(u.last_ip);

      actions.appendChild(nameBtn);
      actions.appendChild(roleBtn);
      actions.appendChild(banBtn);
      actions.appendChild(ipBtn);
      item.appendChild(actions);
      adminUsersList.appendChild(item);
    });
  } catch (error) {
    adminUsersList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

async function changeDisplayName(u) {
  const displayNameValue = prompt('Yeni görünen ad:', displayName(u));
  if (displayNameValue === null) return;

  try {
    await api(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ displayName: displayNameValue })
    });
    await loadAdminUsers();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function changeGlobalRole(u) {
  const role = prompt('Rol yaz: owner / admin / mod / user', u.global_role || 'user');
  if (role === null) return;

  try {
    await api(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ globalRole: role })
    });
    await loadAdminUsers();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function toggleGlobalBan(u) {
  const reason = u.is_banned ? '' : prompt('Ban sebebi:', 'Kurallara aykırı davranış') || 'Banlandı.';

  try {
    await api(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isBanned: !u.is_banned, banReason: reason })
    });
    await loadAdminUsers();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function loadIpBans() {
  try {
    const data = await api('/api/admin/ip-bans');
    ipBansList.innerHTML = '';

    if (!data.bans.length) {
      ipBansList.innerHTML = '<div class="mini-item">IP ban yok.</div>';
      return;
    }

    data.bans.forEach((ban) => {
      const item = document.createElement('div');
      item.className = 'mini-item';
      item.innerHTML = `<div><strong>${escapeHtml(ban.ip)}</strong><span>${escapeHtml(ban.reason || '')}</span></div>`;

      const remove = document.createElement('button');
      remove.className = 'action-button gray';
      remove.textContent = 'Kaldır';
      remove.onclick = () => removeIpBan(ban.id);

      item.appendChild(remove);
      ipBansList.appendChild(item);
    });
  } catch (error) {
    ipBansList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

async function banIpFromInput() {
  await banIp(ipBanInput.value.trim());
  ipBanInput.value = '';
}

async function banIp(ip) {
  if (!ip) {
    addSystemMessage('IP yok.');
    return;
  }

  const reason = prompt('IP ban sebebi:', 'IP ban') || 'IP ban';

  try {
    await api('/api/admin/ip-bans', {
      method: 'POST',
      body: JSON.stringify({ ip, reason })
    });
    await loadIpBans();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function removeIpBan(id) {
  try {
    await api(`/api/admin/ip-bans/${id}`, { method: 'DELETE' });
    await loadIpBans();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function loadRoomMembers() {
  try {
    const data = await api(`/api/room/${encodeURIComponent(currentRoom)}/members`);
    roomMembers = data.members || [];
    renderOnlineUsersDetailed();
    renderAdminMembers();
  } catch {}
}

function renderOnlineUsersDetailed() {
  if (!roomMembers.length) return;

  usersList.innerHTML = '';
  roomMembers.forEach((member) => {
    const li = document.createElement('li');
    li.className = 'user-row';
    li.innerHTML = `${avatarHtml(member.username, member.avatar_url)}<div><strong>${escapeHtml(member.username)}</strong><span>${member.role ? member.role + ' • ' : ''}${formatPresence(member)}</span></div>`;
    li.onclick = () => openProfile(member.id);
    usersList.appendChild(li);
  });
}

function renderRole() {
  myRoleText.textContent = `Rol: ${myRoomRole || 'üye'}`;
}

async function loadModeration() {
  try {
    const data = await api(`/api/room/${encodeURIComponent(currentRoom)}/moderation`);
    myRoomRole = data.myRole || null;
    roomMutedUsers = data.mutes || [];
    renderRole();
    renderAdminMembers();
    renderMutedMembers();
  } catch {}
}

function renderAdminMembers() {
  adminMembersList.innerHTML = '';

  if (!['admin', 'mod'].includes(myRoomRole)) {
    adminMembersList.innerHTML = '<div class="mini-item">Yetkin yok.</div>';
    return;
  }

  if (!roomMembers.length) {
    adminMembersList.innerHTML = '<div class="mini-item">Online üye yok.</div>';
    return;
  }

  roomMembers
    .filter((member) => member.id !== user.id)
    .forEach((member) => {
      const item = document.createElement('div');
      item.className = 'mini-item';
      item.innerHTML = `<div class="mini-left">${avatarHtml(member.username, member.avatar_url)}<div><strong>${escapeHtml(member.username)}</strong><span>${member.role || 'üye'}</span></div></div>`;

      const actions = document.createElement('div');
      actions.className = 'mini-actions';

      if (myRoomRole === 'admin') {
        const mod = document.createElement('button');
        mod.className = 'action-button';
        mod.textContent = member.role === 'mod' ? 'Mod al' : 'Mod yap';
        mod.onclick = () => moderateUser(member.id, member.role === 'mod' ? 'unmod' : 'mod');
        actions.appendChild(mod);
      }

      const isMuted = roomMutedUsers.some((muted) => Number(muted.user_id) === Number(member.id));

      const mute = document.createElement('button');
      mute.className = 'action-button gray';
      mute.textContent = isMuted ? 'Susturma aç' : 'Sustur';
      mute.onclick = () => moderateUser(member.id, isMuted ? 'unmute' : 'mute');

      const kick = document.createElement('button');
      kick.className = 'action-button gray';
      kick.textContent = 'At';
      kick.onclick = () => moderateUser(member.id, 'kick');

      const ban = document.createElement('button');
      ban.className = 'action-button red';
      ban.textContent = 'Ban';
      ban.onclick = () => moderateUser(member.id, 'ban');

      actions.appendChild(mute);
      actions.appendChild(kick);
      actions.appendChild(ban);
      item.appendChild(actions);
      adminMembersList.appendChild(item);
    });
}

function renderMutedMembers() {
  if (!mutedMembersList) return;

  mutedMembersList.innerHTML = '';

  if (!['admin', 'mod'].includes(myRoomRole)) {
    mutedMembersList.innerHTML = '<div class="mini-item">Yetkin yok.</div>';
    return;
  }

  if (!roomMutedUsers.length) {
    mutedMembersList.innerHTML = '<div class="mini-item">Susturulan yok.</div>';
    return;
  }

  roomMutedUsers.forEach((muted) => {
    const item = document.createElement('div');
    item.className = 'mini-item';
    item.innerHTML = `<div class="mini-left">${avatarHtml(muted.username, muted.avatar_url)}<div><strong>${escapeHtml(muted.username)}</strong><span>Susturuldu</span></div></div>`;

    const unmute = document.createElement('button');
    unmute.className = 'action-button';
    unmute.textContent = 'Susturma aç';
    unmute.onclick = () => moderateUser(muted.user_id, 'unmute');

    item.appendChild(unmute);
    mutedMembersList.appendChild(item);
  });
}

async function moderateUser(userId, action) {
  try {
    const data = await api(`/api/room/${encodeURIComponent(currentRoom)}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ userId, action })
    });
    addSystemMessage(data.message);
    await Promise.allSettled([loadRoomMembers(), loadModeration()]);
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function searchMessages() {
  const q = messageSearchInput.value.trim();
  messageSearchResults.innerHTML = '';

  if (q.length < 2) {
    messageSearchResults.innerHTML = '<div class="mini-item">En az 2 karakter yaz.</div>';
    return;
  }

  try {
    const url = chatMode === 'dm' && activeFriend
      ? `/api/search/messages?scope=dm&friendId=${activeFriend.id}&q=${encodeURIComponent(q)}`
      : `/api/search/messages?scope=room&room=${encodeURIComponent(currentRoom)}&q=${encodeURIComponent(q)}`;

    const data = await api(url);

    if (!data.results.length) {
      messageSearchResults.innerHTML = '<div class="mini-item">Sonuç yok.</div>';
      return;
    }

    data.results.forEach((result) => {
      const item = document.createElement('div');
      item.className = 'mini-item';
      item.innerHTML = `<div><strong>${escapeHtml(result.username)}</strong><span>${escapeHtml(result.text)}</span></div>`;
      messageSearchResults.appendChild(item);
    });
  } catch (error) {
    messageSearchResults.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

async function openProfile(userId) {
  try {
    const data = await api(`/api/profile/${userId}`);
    const profile = data.profile;

    profileAvatar.innerHTML = avatarHtml(profile.username, profile.avatar_url, 'profile-avatar-inner');
    profileUsername.textContent = displayName(profile);
    profileStatus.textContent = formatPresence(profile);
    profileBio.textContent = profile.bio || 'Bio yok.';

    const isMe = profile.id === user.id;
    profileBioInput.classList.toggle('hidden', !isMe);
    profileSaveBioButton.classList.toggle('hidden', !isMe);

    if (isMe) profileBioInput.value = profile.bio || '';

    profileModal.classList.remove('hidden');
  } catch (error) {
    addSystemMessage(error.message);
  }
}

function closeProfile() {
  profileModal.classList.add('hidden');
}

async function saveBio() {
  try {
    const data = await api('/api/profile/bio', {
      method: 'POST',
      body: JSON.stringify({ bio: profileBioInput.value })
    });

    user = data.user;
    localStorage.setItem('chat_user', JSON.stringify(user));
    profileBio.textContent = user.bio || 'Bio yok.';
    addSystemMessage('Bio güncellendi.');
  } catch (error) {
    addSystemMessage(error.message);
  }
}

function updateMentionSuggestions() {
  if (chatMode !== 'room') {
    hideMentionPopup();
    return;
  }

  const value = messageInput.value;
  const cursor = messageInput.selectionStart;
  const beforeCursor = value.slice(0, cursor);
  const match = beforeCursor.match(/(^|\s)@([a-zA-Z0-9_ğüşöçıİĞÜŞÖÇ.\-]*)$/);

  if (!match) {
    hideMentionPopup();
    return;
  }

  const query = match[2].toLowerCase();
  const base = roomMembers.filter((member) => member.id !== user.id);
  mentionCandidates = [
    { username: 'everyone', avatar_url: null },
    ...base
  ].filter((member) => member.username.toLowerCase().includes(query)).slice(0, 6);

  selectedMentionIndex = 0;

  if (mentionCandidates.length === 0) {
    hideMentionPopup();
    return;
  }

  renderMentionPopup();
}

function renderMentionPopup() {
  mentionPopup.innerHTML = '';

  mentionCandidates.forEach((member, index) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `mention-item ${index === selectedMentionIndex ? 'active' : ''}`;
    item.innerHTML = `${avatarHtml(member.username, member.avatar_url)}<span>@${escapeHtml(member.username)}</span>`;
    item.onclick = () => applyMention(index);
    mentionPopup.appendChild(item);
  });

  const rect = messageInput.getBoundingClientRect();
  mentionPopup.style.left = `${rect.left}px`;
  mentionPopup.style.bottom = `${window.innerHeight - rect.top + 8}px`;
  mentionPopup.classList.remove('hidden');
}

function applyMention(index) {
  const member = mentionCandidates[index];
  if (!member) return;

  const value = messageInput.value;
  const cursor = messageInput.selectionStart;
  const beforeCursor = value.slice(0, cursor);
  const afterCursor = value.slice(cursor);
  const replaced = beforeCursor.replace(/(^|\s)@([a-zA-Z0-9_ğüşöçıİĞÜŞÖÇ.\-]*)$/, `$1@${member.username} `);

  messageInput.value = replaced + afterCursor;
  const newCursor = replaced.length;
  messageInput.setSelectionRange(newCursor, newCursor);
  hideMentionPopup();
  messageInput.focus();
}

function hideMentionPopup() {
  mentionPopup.classList.add('hidden');
  mentionCandidates = [];
}

function formatPresence(profile) {
  if (profile.online) return 'Çevrimiçi';
  if (!profile.last_seen) return 'Son görülme yok';

  const date = new Date(profile.last_seen);
  return `Son görülme: ${date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })}`;
}

function addSystemMessage(message) {
  const div = document.createElement('div');
  div.className = 'message system';
  div.textContent = message;
  messagesEl.appendChild(div);
  scrollToBottom();
}

function avatarHtml(username, avatarUrl, className = 'mini-avatar') {
  if (avatarUrl) return `<img class="${className}" src="${avatarUrl}" alt="">`;
  return `<div class="${className}">${escapeHtml(String(username || '?').charAt(0).toUpperCase())}</div>`;
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
