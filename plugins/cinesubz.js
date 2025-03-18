const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

const API_URL = "https://api.skymansion.site/movies-dl/search";
const DOWNLOAD_URL = "https://api.skymansion.site/movies-dl/download";
const API_KEY = config.MOVIE_API_KEY;

let movieSelections = {}; // Store user selections temporarily

cmd({
    pattern: "movie",
    alias: ["moviedl", "films"],
    react: '🎬',
    category: "download",
    desc: "Search and download movies from PixelDrain",
    filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
    try {
        if (!q || q.trim() === '') return await reply('❌ Please provide a movie name! (e.g., Deadpool)');

        // Fetch movie search results
        const searchUrl = `${API_URL}?q=${encodeURIComponent(q)}&api_key=${API_KEY}`;
        let response = await fetchJson(searchUrl);

        if (!response || !response.SearchResult || !response.SearchResult.result.length) {
            return await reply(`❌ No results found for: *${q}*`);
        }

        const selectedMovie = response.SearchResult.result[0]; // Select first result
        const detailsUrl = `${DOWNLOAD_URL}/?id=${selectedMovie.id}&api_key=${API_KEY}`;
        let detailsResponse = await fetchJson(detailsUrl);

        if (!detailsResponse || !detailsResponse.downloadLinks || !detailsResponse.downloadLinks.result.links.driveLinks.length) {
            return await reply('❌ No download links found.');
        }

        // Store available download links for the user
        const driveLinks = detailsResponse.downloadLinks.result.links.driveLinks;
        movieSelections[from] = { movie: selectedMovie, links: driveLinks };

        // Prepare quality selection message
        let qualityOptions = driveLinks.map((link, index) => `*${index + 1}.* ${link.quality}`).join("\n");
        let msg = `🎬 *${selectedMovie.title}* (${selectedMovie.year})\n📌 *IMDB:* ${selectedMovie.rating}\n\n🎥 *Available Qualities:*\n${qualityOptions}\n\n📥 *Reply with the quality number to download!*`;

        await reply(msg);
    } catch (error) {
        console.error('Error in movie command:', error);
        await reply('❌ Sorry, something went wrong. Please try again later.');
    }
});

// Handle quality selection and download
cmd({
    pattern: "quality",
    alias: ["q"],
    category: "download",
    desc: "Select a movie quality to download",
    filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
    try {
        if (!movieSelections[from]) return await reply('❌ No movie selected. Please search for a movie first.');

        let userSelection = parseInt(q);
        let availableLinks = movieSelections[from].links;

        if (isNaN(userSelection) || userSelection < 1 || userSelection > availableLinks.length) {
            return await reply('❌ Invalid selection! Reply with a valid quality number.');
        }

        let selectedDownload = availableLinks[userSelection - 1]; // Get selected quality
        const fileId = selectedDownload.link.split('/').pop();
        const directDownloadLink = `https://pixeldrain.com/api/file/${fileId}?download`;

        // Download the movie
        const filePath = path.join(__dirname, `${movieSelections[from].movie.title}-${selectedDownload.quality}.mp4`);
        const writer = fs.createWriteStream(filePath);

        const { data } = await axios({
            url: directDownloadLink,
            method: 'GET',
            responseType: 'stream'
        });

        data.pipe(writer);

        writer.on('finish', async () => {
            // Send the downloaded file
            await robin.sendMessage(from, {
                document: fs.readFileSync(filePath),
                mimetype: 'video/mp4',
                fileName: `${movieSelections[from].movie.title}-${selectedDownload.quality}.mp4`,
                caption: `🎬 *${movieSelections[from].movie.title}*\n📌 Quality: ${selectedDownload.quality}\n✅ *Download Complete!*`,
                quoted: mek
            });

            // Cleanup
            fs.unlinkSync(filePath);
            delete movieSelections[from]; // Remove user's selection after sending
        });

        writer.on('error', async (err) => {
            console.error('Download Error:', err);
            await reply('❌ Failed to download movie. Please try again.');
        });

    } catch (error) {
        console.error('Error in quality selection and download:', error);
        await reply('❌ Sorry, something went wrong. Please try again.');
    }
});
