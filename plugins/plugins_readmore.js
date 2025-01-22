const config = require('../config');
const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');


cmd({
    pattern: "readmore",
    desc: "Readmore message",
    category: "convert",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q, isGroup, sender
}) => {
    try {
        let readmoreText = q ? q : "No text provided";
        let readmore = "\u200B".repeat(4000); 
        let replyText = `...\n\n${readmore}${readmoreText}`;
        await conn.sendMessage(from, { text: replyText }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "", key: mek.key } });

    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});
