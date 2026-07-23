const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const translate = require('translate');

// Configurazione traduzione (usa Google Translate gratis)
translate.engine = 'google';
translate.key = process.env.GOOGLE_API_KEY || ''; // opzionale

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('✅ Utente connesso');

    socket.on('message', async (data) => {
        const { text, lang } = data;
        console.log(`📩 Ricevuto: "${text}" (${lang})`);

        let translated = text;
        try {
            if (lang === 'it') {
                translated = await translate(text, { from: 'it', to: 'pl' });
                console.log(`📝 Tradotto (IT→PL): "${translated}"`);
            } else if (lang === 'pl') {
                translated = await translate(text, { from: 'pl', to: 'it' });
                console.log(`📝 Tradotto (PL→IT): "${translated}"`);
            }
        } catch (e) {
            console.error('❌ Errore traduzione:', e.message);
            translated = text; // fallback
        }

        // Invia a TUTTI i client (incluso chi ha scritto)
        io.emit('message', {
            original: text,
            translated: translated,
            lang: lang,
            timestamp: Date.now()
        });
    });

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
