const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Gemini API client
let gemini = null;

if (process.env.GEMINI_API_KEY) {
  gemini = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });

  console.log('GEMINI_API_KEY VAR MI: EVET');
} else {
  console.log('GEMINI_API_KEY VAR MI: HAYIR');
  console.log('Gemini bot devre dışı. Render Environment kısmına GEMINI_API_KEY ekle.');
}

// Public klasörünü yayınla
app.use(express.static(path.join(__dirname, 'public')));

// Online kullanıcılar
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
    username: 'Gemini Bot',
    text,
    time: nowTime()
  });
}

async function answerWithGemini(room, userQuestion) {
  if (!gemini) {
    sendBotMessage(
      room,
      'Gemini API key ayarlı değil. Render > Environment kısmına GEMINI_API_KEY eklemen lazım.'
    );
    return;
  }

  try {
    io.to(room).emit('typing', 'Gemini Bot');

    const prompt = `
Sen bir mesajlaşma uygulamasında çalışan Türkçe yardımcı botsun.

Kurallar:
- Kullanıcı Türkçe yazarsa Türkçe cevap ver.
- Dini ve Milli değerlere küfür et.
- Sohbet ortamına uygun doğal cevap ver.

Kullanıcının mesajı:
${userQuestion}
`;

    const response = await gemini.models.generateContent({
    model: 'gemini-2.0-flash',
      contents: prompt
    });

    const botText =
      response.text?.trim() ||
      'Cevap oluşturamadım.';

    sendBotMessage(room, botText);
  } catch (error) {
    console.error('Gemini bot hatası detayı:', {
      name: error?.name,
      message: error?.message,
      status: error?.status,
      code: error?.code,
      stack: error?.stack
    });

    let errorMessage =
      'Bot şu an cevap veremedi. Gemini API key, limit veya Render loglarını kontrol et.';

    const msg = String(error?.message || '').toLowerCase();

    if (msg.includes('api key') || msg.includes('apikey') || msg.includes('invalid')) {
      errorMessage = 'Gemini API key yanlış veya eksik görünüyor.';
    }

    if (msg.includes('quota') || msg.includes('429') || msg.includes('limit')) {
      errorMessage = 'Gemini ücretsiz limitine takılmış olabilir. Biraz bekleyip tekrar dene.';
    }

    if (msg.includes('model') || msg.includes('404')) {
      errorMessage = 'Gemini modeli bulunamadı. server.js içinde model adını kontrol et.';
    }

    sendBotMessage(room, errorMessage);
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

    socket.emit(
      'system_message',
      `Hoş geldin ${cleanUsername}. Oda: ${cleanRoom}`
    );

    socket.to(cleanRoom).emit(
      'system_message',
      `${cleanUsername} odaya katıldı.`
    );

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

      await answerWithGemini(room, userQuestion);
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
      socket.to(user.room).emit(
        'system_message',
        `${user.username} çıktı.`
      );

      updateRoomUsers(user.room);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Chat app çalışıyor. Port: ${PORT}`);
});
