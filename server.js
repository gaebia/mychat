const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Traduzione con fetch diretto (senza librerie)
async function translateText(text, from, to) {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();
        return data[0][0][0] || text;
    } catch (e) {
        console.error('❌ Errore traduzione:', e.message);
        return text;
    }
}

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('✅ Utente connesso');

    socket.on('message', async (data) => {
        const { text, lang } = data;
        console.log(`📩 Ricevuto: "${text}" (${lang})`);

        let translated = text;
        try {
            if (lang === 'it') {
                translated = await translateText(text, 'it', 'pl');
                console.log(`📝 Tradotto (IT→PL): "${translated}"`);
            } else if (lang === 'pl') {
                translated = await translateText(text, 'pl', 'it');
                console.log(`📝 Tradotto (PL→IT): "${translated}"`);
            }
        } catch (e) {
            console.error('❌ Errore traduzione:', e.message);
            translated = text;
        }

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
