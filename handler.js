
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  getContentType,
  jidNormalizedUser,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

const config = require("./config");
const { askNexy, formatNexyReply } = require("./plugins/nexy");

const SESSION_DIR = path.join(__dirname, "session");
const PINO_LOGGER = pino({ level: "silent" });

if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });

// ─── Helpers ────────────────────────────────────────────────────────────────
const PREFIX      = config.PREFIX || ".";
const OWNER_JID   = config.OWNER_NUMBER ? config.OWNER_NUMBER + "@s.whatsapp.net" : "";
const REACT_LIST  = config.REACT_EMOJIS.split(",").map(e => e.trim()).filter(Boolean);
const OWNER_REACT_LIST = config.OWNER_EMOJIS.split(",").map(e => e.trim()).filter(Boolean);
const NEXY_CMDS   = ["ai", "nexy"];

const isEnabled = (val, match = "true") =>
  typeof val === "string" && (val === "true" || val === match);

const inPath = (val, jid) => {
  if (!val || val === "false") return false;
  if (val === "true" || val === "all") return true;
  const isGroup = jid && jid.endsWith("@g.us");
  if (val === "group") return isGroup;
  if (val === "inbox") return !isGroup;
  return false;
};

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+\.[^\s]{2,})/gi;

// ─── Session decode ──────────────────────────────────────────────────────────
async function getSessionFromId(sessionId) {
  const sessionPath = path.join(SESSION_DIR, "creds.json");
  if (sessionId && !fs.existsSync(sessionPath)) {
    try {
      const raw = sessionId.startsWith("IK~")
        ? sessionId.slice(3)
        : sessionId.startsWith("DJ~")
        ? sessionId.slice(3)
        : sessionId;
      const decoded = Buffer.from(raw, "base64").toString("utf-8");
      fs.writeFileSync(sessionPath, decoded);
      console.log("[JamberTech-WA] Session loaded from SESSION_ID.");
    } catch {
      console.log("[JamberTech-WA] Could not decode SESSION_ID — will use QR.");
    }
  }
}

// ─── Main connect ────────────────────────────────────────────────────────────
async function connectToWhatsApp() {
  await getSessionFromId(config.SESSION_ID);

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();
  const store = makeInMemoryStore({ logger: PINO_LOGGER });

  const sock = makeWASocket({
    version,
    logger: PINO_LOGGER,
    auth: state,
    browser: ["JamberTech-WA", "Chrome", "1.0.0"],
    printQRInTerminal: true,
    getMessage: async (key) => {
      const msg = await store.loadMessage(key.remoteJid, key.id);
      return msg?.message || { conversation: "." };
    },
  });

  store.bind(sock.ev);
  sock.ev.on("creds.update", saveCreds);

  // ── ALWAYS ONLINE ──────────────────────────────────────────────────────────
  if (isEnabled(config.ALWAYS_ONLINE)) {
    setInterval(async () => {
      try { await sock.sendPresenceUpdate("available"); } catch {}
    }, 10_000);
  }

  // ── CONNECTION UPDATE ──────────────────────────────────────────────────────
  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) console.log("[JamberTech-WA] Scan QR code to connect.");
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      console.log(`[JamberTech-WA] Disconnected (code ${code}). Reconnect: ${shouldReconnect}`);
      if (shouldReconnect) setTimeout(connectToWhatsApp, 3000);
      else console.log("[JamberTech-WA] Logged out. Please update SESSION_ID.");
    } else if (connection === "open") {
      console.log(`[JamberTech-WA] ✅ Connected as ${config.BOT_NAME}!`);
    }
  });

  // ── ANTI-CALL ──────────────────────────────────────────────────────────────
  sock.ev.on("call", async (calls) => {
    if (!isEnabled(config.ANTI_CALL)) return;
    for (const call of calls) {
      if (call.status === "offer") {
        try {
          await sock.rejectCall(call.id, call.from);
          await sock.sendMessage(call.from, { text: config.REJECT_MSG });
        } catch {}
      }
    }
  });

  // ── STATUS SEEN ────────────────────────────────────────────────────────────
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    for (const msg of messages) {
      if (!msg.message) continue;
      const from = msg.key.remoteJid;

      // Status view
      if (from === "status@broadcast") {
        if (isEnabled(config.AUTO_STATUS_SEEN)) {
          try { await sock.readMessages([msg.key]); } catch {}
        }
        if (isEnabled(config.AUTO_STATUS_REACT)) {
          try {
            await sock.sendMessage("status@broadcast", {
              react: { text: randomFrom(REACT_LIST), key: msg.key },
            });
          } catch {}
        }
        if (isEnabled(config.AUTO_STATUS_REPLY)) {
          try {
            await sock.sendMessage(msg.key.participant || from, {
              text: config.STATUS_REPLY_MSG,
            });
          } catch {}
        }
        continue;
      }
    }
  });

  // ── MESSAGES ───────────────────────────────────────────────────────────────
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe) continue;

      const from    = msg.key.remoteJid;
      const isGroup = from.endsWith("@g.us");
      const sender  = msg.key.participant || msg.key.remoteJid;
      const isOwner = OWNER_JID && jidNormalizedUser(sender) === jidNormalizedUser(OWNER_JID);

      // MODE filter
      const mode = (config.MODE || "public").toLowerCase();
      if (mode === "private" && !isOwner) continue;
      if (mode === "inbox"   && isGroup)  continue;
      if (mode === "groups"  && !isGroup) continue;

      const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        "";

      // ── READ MESSAGE ──────────────────────────────────────────────────────
      if (isEnabled(config.READ_MESSAGE)) {
        try { await sock.readMessages([msg.key]); } catch {}
      }

      // ── AUTO TYPING / RECORDING presence ──────────────────────────────────
      const showTyping = inPath(config.AUTO_TYPING, from);
      const showRecord = inPath(config.AUTO_RECORDING, from);
      if (showTyping)  { try { await sock.sendPresenceUpdate("composing",  from); } catch {} }
      if (showRecord)  { try { await sock.sendPresenceUpdate("recording",  from); } catch {} }

      // ── ANTI-LINK (groups only) ────────────────────────────────────────────
      if (isGroup && config.ANTI_LINK && config.ANTI_LINK !== "false") {
        if (URL_REGEX.test(body)) {
          try {
            const groupMeta = await sock.groupMetadata(from);
            const botJid    = sock.user.id;
            const isAdmin   = groupMeta.participants
              .find(p => jidNormalizedUser(p.id) === jidNormalizedUser(botJid))?.admin;

            if (config.ANTI_LINK === "warn") {
              await sock.sendMessage(from, {
                text: `⚠️ @${sender.split("@")[0]} links yahan allowed nahi hain!`,
                mentions: [sender],
              }, { quoted: msg });
            } else if ((config.ANTI_LINK === "true" || config.ANTI_LINK === "delete") && isAdmin) {
              await sock.sendMessage(from, {
                delete: msg.key,
              });
              await sock.sendMessage(from, {
                text: `🚫 @${sender.split("@")[0]} link send karne ki permission nahi hai!`,
                mentions: [sender],
              });
            }
          } catch {}
          continue;
        }
      }

      // ── ANTI-BAD WORDS ─────────────────────────────────────────────────────
      if (isEnabled(config.ANTIBAD) && config.BAD_WORDS) {
        const badList = config.BAD_WORDS.split(",").map(w => w.trim().toLowerCase());
        if (badList.some(w => body.toLowerCase().includes(w))) {
          try {
            await sock.sendMessage(from, {
              text: `⚠️ @${sender.split("@")[0]} aisa language use mat karo!`,
              mentions: [sender],
            }, { quoted: msg });
          } catch {}
          continue;
        }
      }

      // ── MENTION REPLY ──────────────────────────────────────────────────────
      if (config.MENTION_REPLY && config.MENTION_REPLY !== "false") {
        const botJid = sock.user?.id;
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (botJid && mentioned.map(jidNormalizedUser).includes(jidNormalizedUser(botJid))) {
          try {
            await sock.sendMessage(from, {
              text: `Haan, main yahan hoon! 👋 Mujhe kuch chahiye? *${PREFIX}help* se commands dekho.`,
            }, { quoted: msg });
          } catch {}
        }
      }

      // ── AUTO REACT ────────────────────────────────────────────────────────
      if (!isOwner && isEnabled(config.AUTO_REACT)) {
        try {
          await sock.sendMessage(from, {
            react: { text: randomFrom(REACT_LIST), key: msg.key },
          });
        } catch {}
      }

      // ── OWNER REACT ───────────────────────────────────────────────────────
      if (isOwner && isEnabled(config.OWNER_REACT)) {
        try {
          await sock.sendMessage(from, {
            react: { text: randomFrom(OWNER_REACT_LIST), key: msg.key },
          });
        } catch {}
      }

      // ── AUTO REPLY ────────────────────────────────────────────────────────
      if (isEnabled(config.AUTO_REPLY) && !body.startsWith(PREFIX)) {
        try {
          await sock.sendMessage(from, {
            text: `*${config.BOT_NAME}* — Auto Reply\n\n${config.DESCRIPTION}`,
          }, { quoted: msg });
        } catch {}
      }

      // ── COMMANDS ──────────────────────────────────────────────────────────
      if (!body.startsWith(PREFIX)) continue;

      const rawCommand = body.slice(PREFIX.length).trim();
      const [command, ...argParts] = rawCommand.split(" ");
      const cmdLower = command.toLowerCase();
      const args = argParts.join(" ").trim();

      // ── NEXY AI ──────────────────────────────────────────────────────────
      if (NEXY_CMDS.includes(cmdLower)) {
        if (!isEnabled(config.NEXY_CHAT)) {
          await sock.sendMessage(from, {
            text: `Nexy AI abhi disabled hai. Admin se bolo *NEXY_CHAT=true* set kare! 😊`,
          }, { quoted: msg });
          continue;
        }

        if (!args) {
          await sock.sendMessage(from, {
            text: `*${config.NEXY_NAME}* ko kuch poochhna hai? Aise likho:\n\n*${PREFIX}ai Yaar kya haal hai?*`,
          }, { quoted: msg });
          continue;
        }

        try {
          await sock.sendMessage(from, { react: { text: "🤔", key: msg.key } });
          const aiReply = await askNexy(args);
          const formattedReply = formatNexyReply(aiReply);
          await sock.sendMessage(from, { text: formattedReply }, { quoted: msg });
          await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });
        } catch {
          await sock.sendMessage(from, {
            text: `Oops dost, Nexy abhi available nahi! Thodi der baad try karo 😅`,
          }, { quoted: msg });
        }
        continue;
      }

      // ── HELP ──────────────────────────────────────────────────────────────
      if (cmdLower === "help" || cmdLower === "menu") {
        const helpText = `╔════════════════════╗
║  *${config.BOT_NAME}*
╚════════════════════╝

*Owner:* ${config.OWNER_NAME}
*Prefix:* ${PREFIX}
*Mode:* ${config.MODE}
*Version:* ${config.VERSION}

*📋 Commands:*
• ${PREFIX}help — Ye menu
• ${PREFIX}ai <message> — Nexy AI se baat karo
• ${PREFIX}nexy <message> — Nexy AI (same)
• ${PREFIX}ping — Bot check

_${config.DESCRIPTION}_`;
        await sock.sendMessage(from, { text: helpText }, { quoted: msg });
        continue;
      }

      // ── PING ──────────────────────────────────────────────────────────────
      if (cmdLower === "ping") {
        const start = Date.now();
        await sock.sendMessage(from, {
          text: `🏓 *Pong!*\nSpeed: ${Date.now() - start}ms\nBot: ${config.BOT_NAME} ✅`,
        }, { quoted: msg });
        continue;
      }

      // ── INFO ──────────────────────────────────────────────────────────────
      if (cmdLower === "info" || cmdLower === "about") {
        await sock.sendMessage(from, {
          text: `*🤖 ${config.BOT_NAME}*\n\nVersion: ${config.VERSION}\nOwner: ${config.OWNER_NAME}\nMode: ${config.MODE}\n\n${config.DESCRIPTION}`,
        }, { quoted: msg });
        continue;
      }
    }
  });

  // ── ANTI-DELETE ──────────────────────────────────────────────────────────
  if (isEnabled(config.ANTI_DELETE) && OWNER_JID) {
    store.on("message-delete", async (item) => {
      try {
        if (!item) return;
        const jid = item.remoteJid;
        if (!jid) return;
        const isGroup = jid.endsWith("@g.us");
        if (!inPath(config.ANTI_DELETE_PATH, jid)) return;

        const deletedMsg = store.messages[jid]?.get(item.id);
        if (!deletedMsg?.message) return;

        const msgType = getContentType(deletedMsg.message);
        const body = deletedMsg.message?.conversation ||
          deletedMsg.message?.extendedTextMessage?.text || "[Media/File]";
        const deleter = item.participant || jid;

        await sock.sendMessage(OWNER_JID, {
          text: `🗑️ *Anti-Delete Alert*\n\nFrom: @${deleter.split("@")[0]}\nChat: ${isGroup ? "Group" : "Inbox"}\n\nMessage: ${body}`,
          mentions: [deleter],
        });

        if (msgType && msgType !== "conversation" && msgType !== "extendedTextMessage") {
          await sock.sendMessage(OWNER_JID, { forward: deletedMsg });
        }
      } catch {}
    });
  }

  // ── WELCOME / GOODBYE ────────────────────────────────────────────────────
  sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
    try {
      const meta = await sock.groupMetadata(id);
      const groupName = meta.subject;

      for (const participant of participants) {
        const pNum = participant.split("@")[0];

        if (action === "add" && isEnabled(config.WELCOME)) {
          const wMsg = config.WELCOME_MESSAGE
            .replace("@user", `@${pNum}`)
            .replace("@group", groupName)
            .replace("@count", meta.participants.length);

          await sock.sendMessage(id, {
            text: wMsg,
            mentions: [participant],
          });
        }

        if (action === "remove" && isEnabled(config.GOODBYE)) {
          const gbMsg = config.GOODBYE_MESSAGE
            .replace("@user", `@${pNum}`)
            .replace("@group", groupName)
            .replace("@count", meta.participants.length);

          await sock.sendMessage(id, {
            text: gbMsg,
            mentions: [participant],
          });
        }

        if (action === "promote" && isEnabled(config.ADMIN_ACTION)) {
          await sock.sendMessage(id, {
            text: `🔰 @${pNum} ko admin bana diya gaya! Congratulations! 🎉`,
            mentions: [participant],
          });
        }

        if (action === "demote" && isEnabled(config.ADMIN_ACTION)) {
          await sock.sendMessage(id, {
            text: `⬇️ @${pNum} ki admin permission hata di gayi.`,
            mentions: [participant],
          });
        }
      }
    } catch {}
  });

  return sock;
}

module.exports = { connectToWhatsApp };
