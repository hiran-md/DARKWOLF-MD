const axios = require('axios')
const { cmd } = require('../command')
// Sl Nethu-MAX & Thenu-MD

cmd({
    pattern: "spotify",
    alias: ["spotifydl", "song"],
    desc: "Download songs from Spotify",
    category: "downloader",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        // Check if Spotify URL is provided
        if (!args[0]) {
            return reply("Please provide a Spotify song URL\nExample: .spotify https://open.spotify.com/track/...")
        }

        // Send processing message
        const processingMessage = await reply("🎶 Downloading Spotify track... Please wait.\n> ʜɪʀᴀɴ ᴍᴅ")

        // Fetch song details from API
        const response = await axios.get(`https://www.dark-yasiya-api.site/download/spotify`, {
            params: { url: args[0] }
        })

        const songData = response.data.result

        // Construct song details message
        const songMessage = `🎵 *Spotify Song Download* 🎵

*Title:* ${songData.title}\n
*Artist:* ${songData.author}\n

> ʜɪʀᴀɴ-ᴍᴅ 🌝

📥 Downloading...`

        // Send song thumbnail
        await conn.sendMessage(from, {
            image: { url: songData.thumbnail },
            caption: songMessage
        })

        // Send audio file
        await conn.sendMessage(from, {
            audio: { url: songData.music },
            mimetype: 'audio/mpeg',
            fileName: `${songData.title} - ${songData.author}.mp3`
        }, { quoted: mek })

        // Delete processing message
        await conn.sendMessage(from, { delete: processingMessage.key })

    } catch (error) {
        console.error("Spotify Download Error:", error)
        reply("Failed to download the song. Please check the URL and try again.")
    }
})