
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

const config = require("./config");
const { askNexy, formatNexyReply } = require("./plugins/nexy");

const SESSION_DIR = path.join(__dirname, "session");
const PINO_LOGGER = pino({ level: "silent" });

if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

const PREFIX = config.PREFIX || ".";
const NEXY_CHAT_ENABLED = config.NEXY_CHAT === "true";
const NEXY_COMMANDS = ["ai", "nexy"];

async function getSessionFromId(sessionId) {
  const sessionPath = path.join(SESSION_DIR, "creds.json");
  if (sessionId && !fs.existsSync(sessionPath)) {
    try {
      const decoded = Buffer.from(sessionId.replace("IK~", ""), "base64").toString("utf-8");
      fs.writeFileSync(sessionPath, decoded);
    } catch {
    }
  }
}

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
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg?.message || undefined;
      }
      return { conversation: "hello" };
    },
  });

  store.bind(sock.ev);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(
        `[JamberTech-WA] Connection closed. Reconnecting: ${shouldReconnect}`
      );
      if (shouldReconnect) {
        setTimeout(connectToWhatsApp, 3000);
      } else {
        console.log("[JamberTech-WA] Logged out. Please re-add session.");
      }
    } else if (connection === "open") {
      console.log("[JamberTech-WA] Connected to WhatsApp!");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe) continue;

      const from = msg.key.remoteJid;
      const isGroup = from.endsWith("@g.us");

      const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        "";

      if (!body.startsWith(PREFIX)) continue;

      const rawCommand = body.slice(PREFIX.length).trim();
      const [command, ...argParts] = rawCommand.split(" ");
      const cmdLower = command.toLowerCase();
      const args = argParts.join(" ").trim();

      if (NEXY_COMMANDS.includes(cmdLower)) {
        if (!NEXY_CHAT_ENABLED) {
          await sock.sendMessage(from, {
            text: `Nexy AI abhi disabled hai. Admin se bolo NEXY_CHAT=true set kare! 😊`,
          }, { quoted: msg });
          return;
        }

        if (!args) {
          const nexyName = config.NEXY_NAME || "Nexy_JTJarvis";
          await sock.sendMessage(from, {
            text: `*${nexyName}* ko kuch poochhna hai? Aise likho:\n\n*${PREFIX}ai Yaar kya haal hai?*`,
          }, { quoted: msg });
          return;
        }

        try {
          await sock.sendMessage(from, { react: { text: "🤔", key: msg.key } });

          const aiReply = await askNexy(args);
          const formattedReply = formatNexyReply(aiReply);

          await sock.sendMessage(from, { text: formattedReply }, { quoted: msg });

          await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });
        } catch (err) {
          await sock.sendMessage(from, {
            text: `Oops dost, Nexy abhi available nahi! Thodi der baad try karo 😅`,
          }, { quoted: msg });
        }
      }
    }
  });

  return sock;
}

module.exports = { connectToWhatsApp };
