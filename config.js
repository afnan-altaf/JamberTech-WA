
const fs = require('fs');
if (fs.existsSync('.env')) require('dotenv').config({ path: './.env' });

module.exports = {
  // Core
  SESSION_ID:        process.env.SESSION_ID        || "",
  PREFIX:            process.env.PREFIX            || ".",
  BOT_NAME:          process.env.BOT_NAME          || "JamberTech-WA",
  MODE:              process.env.MODE              || "public",   // public / private / inbox / groups
  TIME_ZONE:         process.env.TIME_ZONE         || "Asia/Karachi",
  VERSION:           process.env.VERSION           || "1.0.0",

  // Owner
  OWNER_NUMBER:      process.env.OWNER_NUMBER      || "",
  OWNER_NAME:        process.env.OWNER_NAME        || "JamberTech",
  DESCRIPTION:       process.env.DESCRIPTION       || "© Powered by JamberTech Official",
  BOT_MEDIA_URL:     process.env.BOT_MEDIA_URL     || "",

  // Auto Actions
  AUTO_REPLY:        process.env.AUTO_REPLY        || "false",   // true / false
  READ_MESSAGE:      process.env.READ_MESSAGE      || "false",   // true / false
  AUTO_REACT:        process.env.AUTO_REACT        || "false",   // true / false
  OWNER_REACT:       process.env.OWNER_REACT       || "false",   // true / false
  ALWAYS_ONLINE:     process.env.ALWAYS_ONLINE     || "false",   // true / false
  AUTO_TYPING:       process.env.AUTO_TYPING       || "false",   // true / false / inbox / group
  AUTO_RECORDING:    process.env.AUTO_RECORDING    || "false",   // true / false / inbox / group
  AUTO_DOWNLOADER:   process.env.AUTO_DOWNLOADER   || "false",   // true / false

  // React Emojis
  REACT_EMOJIS:      process.env.REACT_EMOJIS      || "❤️,🔥,👍,😍,😂,😮,😎,🥰,👋,💯,✨,⭐,🎉,🤗,😊,💪,👏,✅",
  OWNER_EMOJIS:      process.env.OWNER_EMOJIS      || "👑,💎,⭐,✨,🔥,💯,✅,🎉,🤖,⚡,💫,🌟,🏆",

  // Anti features
  ANTI_LINK:         process.env.ANTI_LINK         || "true",    // true / warn / delete / false
  ANTI_DELETE:       process.env.ANTI_DELETE       || "true",    // true / false
  ANTI_DELETE_PATH:  process.env.ANTI_DELETE_PATH  || "inbox",   // inbox / group / all
  ANTI_EDIT:         process.env.ANTI_EDIT         || "false",   // true / false
  ANTIEDIT_PATH:     process.env.ANTIEDIT_PATH     || "inbox",   // inbox / group / all
  ANTI_CALL:         process.env.ANTI_CALL         || "false",   // true / false
  REJECT_MSG:        process.env.REJECT_MSG        || "*📞 Call not allowed. You don't have permission. 📵*",
  ANTIBAD:           process.env.ANTIBAD           || "false",
  BAD_WORDS:         process.env.BAD_WORDS         || "",

  // Status
  AUTO_STATUS_SEEN:  process.env.AUTO_STATUS_SEEN  || "true",    // true / false
  AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "false",   // true / false
  AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",   // true / false
  STATUS_REPLY_MSG:  process.env.STATUS_REPLY_MSG  || "✅ Status Viewed By JamberTech-WA",

  // Welcome / Goodbye
  WELCOME:           process.env.WELCOME           || "false",
  GOODBYE:           process.env.GOODBYE           || "false",
  MENTION_REPLY:     process.env.MENTION_REPLY     || "false",   // true / false
  WELCOME_MESSAGE:   process.env.WELCOME_MESSAGE   || "*_@user joined the group, welcome! 🎉_*",
  GOODBYE_MESSAGE:   process.env.GOODBYE_MESSAGE   || "*_@user has left the group, we will miss them! 👋_*",

  // Admin
  ADMIN_ACTION:      process.env.ADMIN_ACTION      || "false",   // notify on admin changes
  WELCOME_ADMIN:     process.env.WELCOME_ADMIN     || "false",

  // Sticker
  PACK_AUTHOR:       process.env.PACK_AUTHOR       || "JamberTech",
  PACK_NAME:         process.env.PACK_NAME         || "JamberTech-WA",

  // Nexy AI
  NEXY_CHAT:         process.env.NEXY_CHAT         || "false",
  NEXY_NAME:         process.env.NEXY_NAME         || "Nexy_JTJarvis",
  NEXY_MODEL:        process.env.NEXY_MODEL        || "openai",

  // Sudo
  SUDO_NUMBERS:      process.env.SUDO_NUMBERS      || "",
};

let file = require.resolve(__filename);
fs.watchFile(file, () => { fs.unwatchFile(file); delete require.cache[file]; require(file); });
