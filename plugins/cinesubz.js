const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const API_URL = "https://cinesubz.mizta-x.com/movie-search?name=";

let waitingForSelection = false;  // Flag to track if we are waiting for a selection
let currentUser = '';            // To track the user who is selecting a movie
let movieResults = [];           // Store the results of the search

// Replace robin with waClient for the bot instance
cmd({
    pattern: ".cine",
    alias: ["cine"],
    react: '🎬',
    category: "download",
    desc: "Search and download movies from CineSubz",
    filename: __filename
}, async (waClient, m, mek, { from, q, reply }) => {
    try {
        if (!q || q.trim() === '') return await reply('❌ Please provide a movie name! (e.g., Avatar)');

        // Fetch movie search results
        const searchUrl = `${API_URL}${encodeURIComponent(q)}`;
        let response = await fetchJson(searchUrl);

        if (!response || !response.results || response.results.length === 0) {
            return await reply(`❌ No results found for: *${q}*`);
        }

        movieResults = response.results.slice(0, 5);  // Store the results globally

        let movieList = movieResults.map((movie, index) =>
            `${index + 1}. *${movie.title}*`
        ).join("\n\n");

        await reply(`🔎 *Search Results for:* ${q}\n\n${movieList}\n\n👉 Reply with the number to get download links.`);

        // Set flags to track user selection
        waitingForSelection = true;
        currentUser = from;

    } catch (error) {
        console.error('Error in .cine command:', error);
        await reply('❌ Sorry, something went wrong. Please try again later.');
    }
});

// Listen for incoming messages and handle user selection
waClient.ev.on('messages.upsert', async (messageUpdate) => {
    const message = messageUpdate.messages[0];
    if (!message || message.key.fromMe || !waitingForSelection) return;

    // Ensure the message is from the correct user and corresponds to the selection
    if (message.key.remoteJid === currentUser) {
        const selectedNumber = parseInt(message.message.conversation.trim());
        if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > movieResults.length) {
            await waClient.sendMessage(currentUser, { text: '❌ Invalid selection. Please choose a valid number.' });
            return;
        }

        const selectedMovie = movieResults[selectedNumber - 1];
        const detailsUrl = `https://cinesubz.mizta-x.com${selectedMovie.movieLink}`;
        let detailsResponse = await fetchJson(detailsUrl);

        if (!detailsResponse || !detailsResponse.download || detailsResponse.download.length === 0) {
            await waClient.sendMessage(currentUser, { text: '❌ No download links found.' });
            return;
        }

        let downloadOptions = detailsResponse.download.map((link, index) =>
            `${index + 1}. *${link.quality}* - [Download](${link.url})`
        ).join("\n\n");

        await waClient.sendMessage(currentUser, {
            text: `🎬 *${selectedMovie.title}*\n\n📥 *Download Links:*\n\n${downloadOptions}\n\n👉 Reply with the number to start downloading.`
        });

        // Update the flag to wait for download selection
        waitingForSelection = false;

        // Handle the download selection
        waClient.ev.on('messages.upsert', async (downloadUpdate) => {
            const downloadMessage = downloadUpdate.messages[0];
            if (downloadMessage.key.remoteJid !== currentUser) return;

            const downloadChoice = parseInt(downloadMessage.message.conversation.trim());
            if (isNaN(downloadChoice) || downloadChoice < 1 || downloadChoice > detailsResponse.download.length) {
                await waClient.sendMessage(currentUser, { text: '❌ Invalid selection. Please choose a valid number.' });
                return;
            }

            const downloadLink = detailsResponse.download[downloadChoice - 1].url;
            const filePath = path.join(__dirname, `${selectedMovie.title}.mp4`);
            const writer = fs.createWriteStream(filePath);

            const { data } = await axios({
                url: downloadLink,
                method: 'GET',
                responseType: 'stream'
            });

            data.pipe(writer);

            writer.on('finish', async () => {
                await waClient.sendMessage(currentUser, {
                    document: fs.readFileSync(filePath),
                    mimetype: 'video/mp4',
                    fileName: `${selectedMovie.title}.mp4`,
                    caption: `🎬 *${selectedMovie.title}*\n✅ *Download Complete!*`,
                    quoted: mek
                });
                fs.unlinkSync(filePath);
            });

            writer.on('error', async (err) => {
                console.error('Download Error:', err);
                await waClient.sendMessage(currentUser, { text: '❌ Failed to download movie. Please try again.' });
            });
        });
    }
});
