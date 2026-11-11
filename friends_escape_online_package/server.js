const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true, credentials: false }, maxHttpBufferSize: 1e5 });
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
app.use(express.static(ROOT, { index: 'FRIENDS_ESCAPE_REWORKED.html', maxAge: '1h' }));
app.get('/health', (_req, res) => res.json({ ok: true, rooms: rooms.size }));

const rooms = new Map();
const socketRoom = new Map();
const socketNames = new Map();
const cleanCode = value => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
const cleanName = value => String(value || 'O‘yinchi').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 14) || 'O‘yinchi';
const cleanText = value => String(value || '').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 180);
function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do { code = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''); } while (rooms.has(code));
  return code;
}
function leaveRoom(socket) {
  const code = socketRoom.get(socket.id);
  if (!code) return;
  const room = rooms.get(code);
  socket.leave(code);
  socketRoom.delete(socket.id);
  if (room) {
    room.delete(socket.id);
    socket.to(code).emit('peer:left', { id: socket.id, name: socketNames.get(socket.id) || 'O‘yinchi', count: room.size });
    if (room.size === 0) rooms.delete(code);
  }
}
function peerList(room) {
  return [...room].map(id => ({ id, name: socketNames.get(id) || 'O‘yinchi' }));
}

io.on('connection', socket => {
  socket.on('room:create', data => {
    leaveRoom(socket);
    let code = cleanCode(data && data.code);
    if (code.length !== 5 || rooms.has(code)) code = makeCode();
    const room = new Set([socket.id]);
    rooms.set(code, room);
    socket.join(code);
    socketRoom.set(socket.id, code);
    socketNames.set(socket.id, cleanName(data && data.name));
    socket.emit('room:created', { code, peers: [], count: 1 });
  });

  socket.on('room:join', data => {
    const code = cleanCode(data && data.code);
    const room = rooms.get(code);
    if (!room) return socket.emit('room:error', { message: 'Bunday xona topilmadi. Do‘stingizdan yangi kod so‘rang.' });
    if (room.size >= 4) return socket.emit('room:error', { message: 'Xona to‘la (maksimum 4 o‘yinchi).' });
    if (socketRoom.get(socket.id) === code) return socket.emit('room:joined', { code, peers: peerList(room).filter(p => p.id !== socket.id), count: room.size });
    leaveRoom(socket);
    const peers = peerList(room);
    socket.join(code);
    room.add(socket.id);
    socketRoom.set(socket.id, code);
    socketNames.set(socket.id, cleanName(data && data.name));
    socket.emit('room:joined', { code, peers, count: room.size });
    socket.to(code).emit('peer:joined', { id: socket.id, name: socketNames.get(socket.id), count: room.size });
  });

  socket.on('chat:send', data => {
    const code = socketRoom.get(socket.id);
    if (!code) return;
    const text = cleanText(data && data.text);
    if (!text) return;
    const now = Date.now();
    if (socket.data.lastChat && now - socket.data.lastChat < 350) return;
    socket.data.lastChat = now;
    io.to(code).emit('chat:message', { id: socket.id, name: socketNames.get(socket.id) || 'O‘yinchi', text, at: now });
  });

  socket.on('rtc:signal', data => {
    const code = socketRoom.get(socket.id);
    const to = data && data.to;
    if (!code || !to || !rooms.get(code)?.has(to) || !data.signal) return;
    socket.to(to).emit('rtc:signal', { from: socket.id, signal: data.signal });
  });

  socket.on('disconnect', () => {
    leaveRoom(socket);
    socketNames.delete(socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => console.log(`FRIENDS ESCAPE server listening on ${PORT}`));
