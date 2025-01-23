const config = require('../config')
const {cmd , commands} = require('../command')
cmd({
    pattern: "script",
    alias: ["sc","repo","info"],
    desc: "bot repo",
    react: "🤖",
    category: "main",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
let repo =`
*╭──────────────●●►*
> *BOT OWNER:*
*|* *HIRANYA SATHSARA*

> *DARK WOLF_MD REPO:*
*|* *https://github.com/hiran-md/DARKWOLF-MD*

> *SUPPORT CHANNEL:*
*|* *https://whatsapp.com/channel/0029Vb0Anqe9RZAcEYc2fT2c*
> * *SYSTEM SETTING:*
*|* *ᴍʀ ʜɪʀᴀɴʏᴀ*
*|* *94768698018*
*╰──────────────●●►*

> *CREATED BY HIRANYA SATHSARA*
`
await conn.sendMessage(from, { text: repo ,
  contextInfo: {
    mentionedJid: [ '' ],
    groupMentions: [],
    forwardingScore: 999,
    isForwarded: false,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363365603549809@newsletter',
      newsletterName: "ᴅᴀʀᴋᴡᴏʟꜰ_ᴍᴅ",
      serverMessageId: 999
    },
externalAdReply: { 
title: 'DARK WOLF_MD',
body: `${pushname}`,
mediaType: 1,
sourceUrl: "https://github.com/hiran-md" ,
thumbnailUrl: "https://raw.githubusercontent.com/Reshantha1986/DARKWOLF-MD-V1/refs/heads/main/file-UtUL3R7BtcVRTn2Z2N21rv.webp" ,
renderLargerThumbnail: true,
showAdAttribution: true
}
}}, { quoted: mek})}catch(e){
console.log(e)
reply(`${e}`)
}
});
