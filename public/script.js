const socket = io();

const loginScreen = document.getElementById('loginScreen');
const chatScreen = document.getElementById('chatScreen');
const usernameInput = document.getElementById('usernameInput');
const roomInput = document.getElementById('roomInput');
const joinBtn = document.getElementById('joinBtn');
const leaveBtn = document.getElementById('leaveBtn');
const roomTitle = document.getElementById('roomTitle');
const messages = document.getElementById('messages');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const usersList = document.getElementById('usersList');
const typingText = document.getElementById('typingText');

let currentUsername = '';
let typingTimer;

joinBtn.addEventListener('click', joinChat);
leaveBtn.addEventListener('click', () => window.location.reload());

usernameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') joinChat();
});

roomInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') joinChat();
});

function joinChat() {
  const username = usernameInput.value.trim();
  const room = roomInput.value.trim() || 'genel';

  if (!username) {
    alert('Kullanıcı adı gir.');
    return;
  }

  currentUsername = username;
  socket.emit('join', { username, room });

  roomTitle.textContent = `#${room.toLowerCase()}`;
  loginScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
  messageInput.focus();
}

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  socket.emit('chat_message', text);
  messageInput.value = '';
});

messageInput.addEventListener('input', () => {
  socket.emit('typing');
});

socket.on('chat_message', (message) => {
  addMessage(message);
});

socket.on('system_message', (text) => {
  const div = document.createElement('div');
  div.className = 'system';
  div.textContent = text;
  messages.appendChild(div);
  scrollToBottom();
});

socket.on('users', (users) => {
  usersList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.textContent = user;
    usersList.appendChild(li);
  });
});

socket.on('typing', (username) => {
  typingText.textContent = `${username} yazıyor...`;
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    typingText.textContent = '';
  }, 900);
});

function addMessage(message) {
  const div = document.createElement('div');
  div.className = message.username === currentUsername ? 'message me' : 'message';

  const meta = document.createElement('div');
  meta.className = 'meta';

  const name = document.createElement('span');
  name.textContent = message.username;

  const time = document.createElement('span');
  time.textContent = message.time;

  const text = document.createElement('div');
  text.className = 'text';
  text.textContent = message.text;

  meta.appendChild(name);
  meta.appendChild(time);
  div.appendChild(meta);
  div.appendChild(text);
  messages.appendChild(div);

  scrollToBottom();
}

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}
