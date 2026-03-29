
const fs = require('fs'),
      dotenv = fs.existsSync('.env') ? require('dotenv').config({ path: './.env' }) : undefined,
      convertToBool = (text, fault = 'true') => text === fault;

global.session = process.env.PAIR_URL || "https://session-pair.onrender.com";

module.exports = {
SESSION_ID: process.env.SESSION_ID || "",
SUDO_NUMBERS: process.env.SUDO_NUMBERS || "",
ANTI_DELETE: process.env.ANTI_DELETE || "true",
AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
AUTO_LIKE_STATUS: process.env.AUTO_LIKE_STATUS || "true",
AUTO_LIKE_EMOJIS: process.env.AUTO_LIKE_EMOJIS || "💛,❤️,💜,🤍,💙",
AUTO_REPLY_STATUS: process.env.AUTO_REPLY_STATUS || "false",
STATUS_REPLY_MSG: process.env.STATUS_REPLY_MSG || "✅ Status Viewed By JamberTech WA",
MODE: process.env.MODE || "public",
OWNER_NUMBER: process.env.OWNER_NUMBER || "",
OWNER_NAME: process.env.OWNER_NAME || "JamberTech",
PACK_AUTHOR: process.env.PACK_AUTHOR || "🩵",
PACK_NAME: process.env.PACK_NAME || "💙",
PREFIX: process.env.PREFIX || ".",
VERSION: process.env.VERSION || "1.0.0",
ANTILINK: process.env.ANTILINK || "true",
ANTICALL: process.env.ANTICALL || "false",
ANTIBAD: process.env.ANTIBAD || "false",
BAD_WORDS: process.env.BAD_WORDS || "null, pm, dm, idiot",
ANTICALL_MSG: process.env.ANTICALL_MSG || "*_📞 Auto Call Reject Mode Active. 📵 No Calls Allowed!_*",
AUTO_REACT: process.env.AUTO_REACT || "false",
BOT_NAME: process.env.BOT_NAME || "JamberTech-WA",
BOT_PIC: process.env.BOT_PIC || "",
AUTO_AUDIO: process.env.AUTO_AUDIO || "false",
AUTO_BIO: process.env.AUTO_BIO || "false",
AUTO_BIO_QUOTE: process.env.AUTO_BIO_QUOTE || "Powered by JamberTech",
CHAT_BOT: process.env.CHAT_BOT || "false",
NEXY_CHAT: process.env.NEXY_CHAT || "false",
NEXY_NAME: process.env.NEXY_NAME || "Nexy_JTJarvis",
WELCOME: process.env.WELCOME || "false",
GOODBYE: process.env.GOODBYE || "false",
AUTO_READ_MESSAGES: process.env.AUTO_READ_MESSAGES || "false",
AUTO_BLOCK: process.env.AUTO_BLOCK || "",
PRESENCE: process.env.PRESENCE || "online",
TIME_ZONE: process.env.TIME_ZONE || "Asia/Karachi",
};

let file = require.resolve(__filename);
fs.watchFile(file, () => { fs.unwatchFile(file); console.log(`Config updated: '${__filename}'`); delete require.cache[file]; require(file); });
