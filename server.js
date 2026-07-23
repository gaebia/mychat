const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const translate = require('translate');

// Configurazione traduzione
translate.engine = 'libre'; // o 'google' se hai API key
translate.from = 'it';
translate.to = 'pl';

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('✅ Utente connesso');

    // Ricezione messaggio testo
    socket.on('message', async (data) => {
        const { text, lang } = data;
        
        // Traduzione automatica
        let translated = text;
        try {
            if (lang === 'it') {
                translated = await translate(text, { from: 'it', to: 'pl' });
            } else if (lang === 'pl') {
                translated = await translate(text, { from: 'pl', to: 'it' });
            }
        } catch (e) {
            console.log('Errore traduzione:', e);
        }

        // Invia a tutti i client
        io.emit('message', {
            original: text,
            translated: translated,
            lang: lang,
            timestamp: Date.now()
        });
    });

    // Offerta WebRTC (video/audio)
    socket.on('offer', (data) => {
        socket.broadcast.emit('offer', data);
    });

    socket.on('answer', (data) => {
        socket.broadcast.emit('answer', data);
    });

    socket.on('candidate', (data) => {
        socket.broadcast.emit('candidate', data);
    });

    socket.on('disconnect', () => {
        console.log('❌ Utente disconnesso');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`🚀 Server avviato su http://localhost:${PORT}`);
});
