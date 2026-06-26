const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('join', ({ username, room }) => {
    const cleanUsername = String(username || 'Anonim').trim().slice(0, 20);
    const cleanRoom = String(room || 'genel').trim().slice(0, 30).toLowerCase();

    socket.data.username = cleanUsername;
    socket.data.room = cleanRoom;
    socket.join(cleanRoom);

    onlineUsers.set(socket.id, { username: cleanUsername, room: cleanRoom });

    socket.emit('system_message', `Hoş geldin ${cleanUsername}. Oda: ${cleanRoom}`);
    socket.to(cleanRoom).emit('system_message', `${cleanUsername} odaya katıldı.`);

    updateRoomUsers(cleanRoom);
  });

  socket.on('chat_message', (message) => {
    const text = String(message || '').trim().slice(0, 500);
    if (!text || !socket.data.room || !socket.data.username) return;

    io.to(socket.data.room).emit('chat_message', {
      username: socket.data.username,
      text,
      time: new Date().toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    });
  });

  socket.on('typing', () => {
    if (!socket.data.room || !socket.data.username) return;
    socket.to(socket.data.room).emit('typing', socket.data.username);
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

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Chat app çalışıyor. Port: ${PORT}`);
});
