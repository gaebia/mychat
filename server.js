const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('✅ Utente connesso:', socket.id);
    
    socket.on('offer', (data) => {
        socket.broadcast.emit('offer', data);
    });
    socket.on('answer', (data) => {
        socket.broadcast.emit('answer', data);
    });
    socket.on('ice-candidate', (data) => {
        socket.broadcast.emit('ice-candidate', data);
    });
    socket.on('chat-message', (data) => {
        io.emit('chat-message', data);
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Utente disconnesso:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🔥 Server attivo su http://localhost:${PORT}`);
});
