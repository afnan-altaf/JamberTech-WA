
/*
==============================================
  JamberTech-WA v1.0.0
==============================================
  Next-Gen WhatsApp MD Bot
  Ultra-Fast | Smart AI | Packed with Features

  Powered By JamberTech | 2025
==============================================
*/

const express = require("express");
const config = require("./config");
const { connectToWhatsApp } = require("./handler");

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    status: "JamberTech-WA is running!",
    bot: config.BOT_NAME,
    version: config.VERSION,
    mode: config.MODE,
    nexy_ai: config.NEXY_CHAT === "true" ? "enabled" : "disabled",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n====================================`);
  console.log(`  JamberTech-WA v${config.VERSION}`);
  console.log(`  Server running on port ${PORT}`);
  console.log(`  Nexy AI: ${config.NEXY_CHAT === "true" ? "Enabled" : "Disabled"}`);
  console.log(`====================================\n`);

  if (!config.SESSION_ID) {
    console.log("⚠️  SESSION_ID not set! Scan QR code to connect WhatsApp.");
  }

  connectToWhatsApp().catch((err) => {
    console.error("[JamberTech-WA] Fatal error:", err.message);
    process.exit(1);
  });
});
