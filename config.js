const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    SESSION_ID: process.env.SESSION_ID || "auR1GK6Y#aIu4Z15TstkMb3wj-XM4Nc00oqsflXcSbzAXkDdmOkI",
    CAPTION: process.env.CAPTION || "POWERED BY HIRANYA SATHSARA",
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
    READ_MESSAGE: process.env.READ_MESSAGE || "false", // Added auto-read configuration
    MODE: process.env.MODE || "public",
    AUTO_VOICE: process.env.AUTO_VOICE || "true",
    AUTO_STICKER: process.env.AUTO_STICKER || "false",
    AUTO_REPLY: process.env.AUTO_REPLY || "true",
    ALIVE_IMG: process.env.ALIVE_IMG || "https://raw.githubusercontent.com/Reshantha1986/DARKWOLF-MD-V1/refs/heads/main/file-UtUL3R7BtcVRTn2Z2N21rv.webp",
    ANTI_LINK: process.env.ANTI_LINK || "false",
    ANTI_BAD: process.env.ANTI_BAD || "true",
    PREFIX: process.env.PREFIX || ".",
    FAKE_RECORDING: process.env.FAKE_RECORDING || "false",
    AUTO_REACT: process.env.AUTO_REACT || "true",
    HEART_REACT: process.env.HEART_REACT || "true",
    OWNER_REACT: process.env.OWNER_REACT || "true",
    BOT_NAME: process.env.BOT_NAME || "ᴅᴀʀᴋᴡᴏʟꜰ ᴍᴅ࿐",
    OMDB_API_KEY: process.env.OMDB_API_KEY || "76cb7f39", // omdbapi.com
};
