const { WAConnection } = require('@adiwajshing/baileys');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const express = require('express');

const app = express();
const API_URL = "https://cinesubz.mizta-x.com/movie-search?name=";

// Initialize the Baileys client
const waClient = new WAConnection();
waClient.on('qr', (qr) => {
    console.log('Scan this QR code to connect your WhatsApp!');
    // You can use a library like `qrcode-terminal` to print the QR code in your terminal
});
waClient.on('open', () => {
    console.log('Bot is connected!');
});

// Function to connect to the WhatsApp client
async function connectWaClient() {
    await waClient.connect();
}

connectWaClient().catch(console.error);

// Handle incoming messages
waClient.ev.on('messages.upsert', async (messageUpdate) => {
    const message = messageUpdate.messages[0];
    if (!message || message.key.fromMe) return;

    const { from, body } = message;
    
    // Example of how to handle a '.cine' command
    if (body.startsWith('.cine')) {
        const query = body.split(' ').slice(1).join(' ');  // Get the movie name after '.cine'

        if (!query) {
            await waClient.sendMessage(from, { text: '❌ Please provide a movie name!' });
            return;
        }

        try {
            // Fetch movie search results from CineSubz API
            const searchUrl = `${API_URL}${encodeURIComponent(query)}`;
            const response = await axios.get(searchUrl);
            
            if (!response.data || !response.data.results || response.data.results.length === 0) {
                await waClient.sendMessage(from, { text: `❌ No results found for: *${query}*` });
                return;
            }

            // List first 5 results
            let movieList = response.data.results.slice(0, 5).map((movie, index) =>
                `${index + 1}. *${movie.title}*`
            ).join("\n\n");

            await waClient.sendMessage(from, {
                text: `🔎 *Search Results for:* ${query}\n\n${movieList}\n\n👉 Reply with the number to get download links.`
            });

            // Wait for user response with the selected number
            // Assuming you already have a mechanism to wait for responses

            // Simulate selecting the first movie (you can customize this part for your actual logic)
            const selectedMovie = response.data.results[0];  // Example: select the first movie

            const detailsUrl = `https://cinesubz.mizta-x.com${selectedMovie.movieLink}`;
            const detailsResponse = await axios.get(detailsUrl);

            if (!detailsResponse.data || !detailsResponse.data.download || detailsResponse.data.download.length === 0) {
                await waClient.sendMessage(from, { text: '❌ No download links found.' });
                return;
            }

            let downloadOptions = detailsResponse.data.download.map((link, index) =>
                `${index + 1}. *${link.quality}* - [Download](${link.url})`
            ).join("\n\n");

            await waClient.sendMessage(from, {
                text: `🎬 *${selectedMovie.title}*\n\n📥 *Download Links:*\n\n${downloadOptions}\n\n👉 Reply with the number to start downloading.`
            });

            // Handle downloading logic here (you can integrate a download manager or direct download)
            // For now, just acknowledge
            await waClient.sendMessage(from, {
                text: `✅ *Download process initiated for*: ${selectedMovie.title}`
            });

        } catch (error) {
            console.error('Error during CineSubz movie search:', error);
            await waClient.sendMessage(from, { text: '❌ Something went wrong. Please try again later.' });
        }
    }
});

// Start the Express server (optional, for any web-related handling)
app.listen(3000, () => {
    console.log('Express server is running on port 3000');
});
