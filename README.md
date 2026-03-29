# JamberTech-WA 🤖

> **Fast, Smart & Packed with Features — Your Ultimate WhatsApp Bot**

---

## 📌 About

**JamberTech-WA** is a powerful WhatsApp Multi-Device (MD) bot built for 2025.  
It supports auto-reply, group management, AI chat, sticker making, media downloading, and much more.

---

## ✨ Features

- 🔄 Auto Read & Like Status
- 🛡️ Anti-Delete, Anti-Link, Anti-Call, Anti-Bad Words
- 🤖 **Nexy_JTJarvis AI** — Roman Urdu Friendly AI Assistant (No API Key!)
- 🎵 Music & Video Downloader
- 🖼️ Sticker Maker
- 👋 Welcome & Goodbye Messages
- ⚙️ Group Management Tools
- 🌐 Multi-language Support
- 📞 Auto Call Reject
- 💬 Auto React to Messages

---

## 🚀 Deployment

### Option 1: Railway (Recommended)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)

1. Create account on [Railway](https://railway.app)
2. Click **New Project → Deploy from GitHub Repo**
3. Select this repo
4. Add all environment variables from `.env.example`
5. Deploy!

### Option 2: Koyeb
1. Create account on [Koyeb](https://koyeb.com)
2. Deploy via GitHub repo
3. Add environment variables
4. Deploy!

### Option 3: Heroku
1. Create account on [Heroku](https://heroku.com)
2. Create a new app
3. Connect your GitHub repo
4. Add all env variables in **Settings → Config Vars**
5. Deploy!

### Option 4: Local / VPS
```bash
git clone https://github.com/afnan-altaf/JamberTech-WA.git
cd JamberTech-WA
npm install
cp .env.example .env
# Edit .env with your details
npm start
```

---

## ⚙️ Configuration

Copy `.env.example` to `.env` and fill in your details:

```env
SESSION_ID=your_session_id_here
OWNER_NUMBER=923XXXXXXXXX
OWNER_NAME=YourName
BOT_NAME=JamberTech-WA
MODE=public
PREFIX=.
```

---

## 🔑 Getting Your Session ID

1. Go to the pairing site
2. Enter your WhatsApp number
3. Scan the QR code or use the pairing code
4. Copy the Session ID that starts with `IK~`
5. Paste it in your `.env` as `SESSION_ID`

---

## 🤖 Nexy_JTJarvis — AI Assistant

**Nexy_JTJarvis** is the built-in AI assistant of JamberTech-WA. It replies in **Roman Urdu** with a friendly, helpful personality — and requires **zero API keys**!

### How to Use

```
.ai Bhai mujhe Python seekhni hai
.nexy Aaj ka mausam kaisa hai?
```

### Example Conversation

```
You:   .ai Yaar koi funny joke sunao
Nexy:  Haan yaar! Sunao ek zabardast joke 😄
       Ek baar ek programmer ghar aya toh biwi ne pucha...
       — JamberTech WA
```

### Setup

In your `.env` file:
```env
NEXY_CHAT=true
NEXY_NAME=Nexy_JTJarvis
```

### Features
- Roman Urdu mein friendly replies
- Koi API key nahi chahiye (Pollinations.AI use hota hai)
- `.ai` ya `.nexy` command se activate
- Smart, funny aur helpful responses

---

## 📋 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SESSION_ID` | WhatsApp session ID (required) | — |
| `OWNER_NUMBER` | Your number with country code | — |
| `OWNER_NAME` | Your name | JamberTech |
| `BOT_NAME` | Bot display name | JamberTech-WA |
| `PREFIX` | Command prefix | `.` |
| `MODE` | Bot mode (public/private/inbox/groups) | public |
| `SUDO_NUMBERS` | Extra admin numbers | — |
| `ANTI_DELETE` | Anti-delete (true/false/inboxonly) | true |
| `AUTO_READ_STATUS` | Auto view statuses | true |
| `AUTO_LIKE_STATUS` | Auto like statuses | true |
| `ANTICALL` | Block incoming calls | false |
| `ANTILINK` | Anti-link in groups | true |
| `CHAT_BOT` | AI chat bot | false |
| `NEXY_CHAT` | Nexy AI (Roman Urdu) | false |
| `NEXY_NAME` | Nexy AI name | Nexy_JTJarvis |
| `WELCOME` | Welcome new members | false |
| `PRESENCE` | Bot online status | online |
| `TIME_ZONE` | Your timezone | Asia/Karachi |

---

## 🤝 Support

For issues and help, open a [GitHub Issue](https://github.com/afnan-altaf/JamberTech-WA/issues).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

**Made with ❤️ by JamberTech | 2025**
