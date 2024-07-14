const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const ytdl = require('ytdl-core');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot está listo');
});

client.on('message', async msg => {
    const chat = await msg.getChat();

    // Genshin Impact guide command
    if (msg.body.startsWith('.guia ')) {
        const query = msg.body.slice(6).trim();
        const youtubeSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' Genshin Impact guide')}&key=YOUR_YOUTUBE_API_KEY`;
        try {
            const response = await axios.get(youtubeSearchUrl);
            const videoId = response.data.items[0].id.videoId;
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            msg.reply(`Aquí tienes una guía: ${videoUrl}`);
        } catch (error) {
            msg.reply('Lo siento, no pude encontrar una guía para eso.');
        }
    }

    // Mini-games: Truth or Dare
    if (msg.body === '.verdadoreto') {
        const truths = ['¿Cuál es tu mayor miedo?', '¿Cuál es tu mayor secreto?'];
        const dares = ['Baila durante 1 minuto', 'Envía un mensaje vergonzoso a alguien'];
        const isTruth = Math.random() < 0.5;
        msg.reply(isTruth ? `Verdad: ${truths[Math.floor(Math.random() * truths.length)]}` : `Reto: ${dares[Math.floor(Math.random() * dares.length)]}`);
    }

    // Admin-only commands
    if (chat.isGroup && msg.body.startsWith('.eliminar ') && msg.author === chat.owner._serialized) {
        const number = msg.body.split(' ')[1].replace('@', '') + '@c.us';
        const member = chat.participants.find(participant => participant.id._serialized === number);
        if (member) {
            chat.removeParticipants([member.id._serialized]);
            msg.reply('Usuario eliminado.');
        } else {
            msg.reply('No pude encontrar ese usuario.');
        }
    }

    // Tag all members
    if (msg.body === '.@todos') {
        const mentions = chat.participants.map(participant => participant.id._serialized);
        chat.sendMessage('@everyone', { mentions });
    }

    // Music and video download commands
    if (msg.body.startsWith('.musica ')) {
        const url = msg.body.split(' ')[1];
        if (ytdl.validateURL(url)) {
            const info = await ytdl.getInfo(url);
            const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
            msg.reply(`Descargando música: ${info.videoDetails.title}`);
            ytdl(url, { format: audioFormats[0] }).pipe(fs.createWriteStream('music.mp3'));
        } else {
            msg.reply('URL no válida.');
        }
    }

    if (msg.body.startsWith('.video ')) {
        const url = msg.body.split(' ')[1];
        if (ytdl.validateURL(url)) {
            const info = await ytdl.getInfo(url);
            msg.reply(`Descargando video: ${info.videoDetails.title}`);
            ytdl(url).pipe(fs.createWriteStream('video.mp4'));
        } else {
            msg.reply('URL no válida.');
        }
    }
});

client.initialize();