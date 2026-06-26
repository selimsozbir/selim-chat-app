const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

function updateRoomUsers(room) {
  const users = Array.from(onlineUsers.values())
    .filter((user) => user.room === room)
    .map((user) => user.username);

  io.to(room).emit('users', users);
}

function sendBotMessage(room, text) {
  io.to(room).emit('chat_message', {
    username: 'ChatGPT Bot',
    text,
    time: nowTime()
  });
}

async function answerWithBot(room, userQuestion) {
  if (!process.env.OPENAI_API_KEY) {
    sendBotMessage(
      room,
      'Bot API key ayarlı değil. Render > Environment kısmına OPENAI_API_KEY eklemen lazım.'
    );
    return;
  }

  try {
    io.to(room).emit('typing', 'ChatGPT Bot');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Sen bir mesajlaşma uygulamasındaki Türkçe konuşan yardımcı botsun. Cevapların kısa, net ve samimi olsun. Tehlikeli veya yasa dışı şeylerde yardımcı olma.'
        },
        {
          role: 'user',
          content: userQuestion
        }
      ],
      max_tokens: 350
    });

    const botText =
      response.choices?.[0]?.message?.content?.trim() ||
      'Cevap oluşturamadım.';

    sendBotMessage(room, botText);
  } catch (error) {
    console.error('OpenAI bot hatası:', error);

    sendBotMessage(
      room,
      'Bot şu an cevap veremedi. API key, bakiye veya Render loglarını kontrol et.'
    );
  }
}

io.on('connection', (socket) => {
  socket.on('join', ({ username, room }) => {
    const cleanUsername = cleanText(username, 20) || 'Anonim';
    const cleanRoom = cleanText(room, 30).toLowerCase() || 'genel';

    socket.data.username = cleanUsername;
    socket.data.room = cleanRoom;

    socket.join(cleanRoom);

    onlineUsers.set(socket.id, {
      username: cleanUsername,
      room: cleanRoom
    });

    socket.emit('system_message', `Hoş geldin ${cleanUsername}. Oda: ${cleanRoom}`);
    socket.to(cleanRoom).emit('system_message', `${cleanUsername} odaya katıldı.`);

    updateRoomUsers(cleanRoom);
  });

  socket.on('chat_message', async (message) => {
    const text = cleanText(message, 500);

    if (!text || !socket.data.room || !socket.data.username) return;

    const room = socket.data.room;
    const username = socket.data.username;

    io.to(room).emit('chat_message', {
      username,
      text,
      time: nowTime()
    });

    if (text.toLowerCase().startsWith('@bot')) {
      const userQuestion = text.replace(/^@bot/i, '').trim();

      if (!userQuestion) {
        sendBotMessage(room, 'Bana soru sormak için şöyle yaz: @bot Merhaba');
        return;
      }

      await answerWithBot(room, userQuestion);
    }
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Chat app çalışıyor. Port: ${PORT}`);
});
