const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const API_URL = "https://cinesubz.mizta-x.com/movie-search?name=";

cmd({
    pattern: ".cine",
    alias: ["cine"],
    react: '🎬',
    category: "download",
    desc: "Search and download movies from CineSubz",
    filename: __filename
}, async (robin, m, mek, { from, q, reply, waitForMessage }) => {
    try {
        if (!q || q.trim() === '') return await reply('❌ Please provide a movie name! (e.g., Avatar)');

        // Fetch movie search results
        const searchUrl = `${API_URL}${encodeURIComponent(q)}`;
        let response = await fetchJson(searchUrl);

        if (!response || !response.results || response.results.length === 0) {
            return await reply(`❌ No results found for: *${q}*`);
        }

        let movieList = response.results.slice(0, 5).map((movie, index) =>
            `${index + 1}. *${movie.title}*`  
        ).join("\n\n");

        await reply(`🔎 *Search Results for:* ${q}\n\n${movieList}\n\n👉 Reply with the number to get download links.`);

        // Wait for user selection
        let msg = await waitForMessage(from);
        let choice = parseInt(msg.body.trim());
        if (isNaN(choice) || choice < 1 || choice > response.results.length) {
            return await reply('❌ Invalid selection. Please choose a valid number.');
        }

        const selectedMovie = response.results[choice - 1];
        const detailsUrl = `https://cinesubz.mizta-x.com${selectedMovie.movieLink}`;
        let detailsResponse = await fetchJson(detailsUrl);

        if (!detailsResponse || !detailsResponse.download || detailsResponse.download.length === 0) {
            return await reply('❌ No download links found.');
        }

        let downloadOptions = detailsResponse.download.map((link, index) =>
            `${index + 1}. *${link.quality}* - [Download](${link.url})`
        ).join("\n\n");

        await reply(`🎬 *${selectedMovie.title}*\n\n📥 *Download Links:*\n\n${downloadOptions}\n\n👉 Reply with the number to start downloading.`);

        // Wait for user to select a download link
        let downloadMsg = await waitForMessage(from);
        let downloadChoice = parseInt(downloadMsg.body.trim());
        if (isNaN(downloadChoice) || downloadChoice < 1 || downloadChoice > detailsResponse.download.length) {
            return await reply('❌ Invalid selection. Please choose a valid number.');
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
            await robin.sendMessage(from, {
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
            await reply('❌ Failed to download movie. Please try again.');
        });

    } catch (error) {
        console.error('Error in .cine command:', error);
        await reply('❌ Sorry, something went wrong. Please try again later.');
    }
});
