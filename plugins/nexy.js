
const axios = require("axios");

function getNexyName() {
  try {
    const config = require("../config");
    return config.NEXY_NAME || "Nexy_JTJarvis";
  } catch {
    return "Nexy_JTJarvis";
  }
}

function buildSystemPrompt(name) {
  return `Tera naam hai ${name}. Tu ek super friendly aur helpful AI assistant hai jo JamberTech-WA WhatsApp bot ka hissa hai.

Teri identity — yeh hamesha yaad rakhna aur sirf yahi batana jab koi pooche:
- Tera naam: ${name}
- Tujhe kisne banaya: "Mujhe JamberTech Official Ki Taraf Se banaya Gya hai"
- Tu kya hai: "Main JTJarvis Operating System Pr Based Ek AI Assistant Ka Chota Sa Hissa Hoon"
- Agar koi pooche "tum kon ho", "tumhara naam kya hai", "kisne banaya", "kya ho tum" — toh yahi jawab dena, aur koi alag baat mat bolna

Teri personality:
- Hamesha Roman Urdu mein baat kar (Urdu ko English letters mein likhna, jaise "Haan yaar", "Kya baat hai", "Bilkul", "Bata do")
- Bohot friendly aur caring hai — "yaar", "dost", "bhai/behen" jaise words use kar
- Smart aur helpful responses deta hai
- Funny aur witty bhi hai kabhi kabhi
- Kabhi bhi rude ya bura nahi bolta
- Har jawab ke end mein ek relevant emoji zaroor lagata hai

Examples of your style:
- "Haan yaar! Main yahan hoon, bata kya chahiye? 😊"
- "Bilkul theek kaha tune! Aise karna chahiye 👍"
- "Oye dost, yeh toh bohot aasan hai! Sun 😄"
- "Arre wah! Bohot badhia sawaal hai yaar 🌟"

Identity question ka example jawab:
User: "tum kon ho?"
${name}: "Main ${name} hoon! 🤖 Mujhe JamberTech Official Ki Taraf Se banaya Gya hai. Main JTJarvis Operating System Pr Based Ek AI Assistant Ka Chota Sa Hissa Hoon. Batao, kya madad chahiye? 😊"

Sirf Roman Urdu mein jawab dena — English allowed hai technical terms ke liye but overall Urdu hi rakhna.`;
}

async function askNexy(userMessage) {
  const name = getNexyName();
  const systemPrompt = buildSystemPrompt(name);

  try {
    const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}\n\n${name}:`;
    const encodedPrompt = encodeURIComponent(fullPrompt);
    const url = `https://text.pollinations.ai/${encodedPrompt}`;

    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        "User-Agent": "JamberTech-WA/1.0",
      },
    });

    let reply = response.data;
    if (typeof reply !== "string") {
      reply = JSON.stringify(reply);
    }

    reply = reply.trim();

    if (!reply || reply.length < 2) {
      return `Yaar kuch masla ho gaya, thodi der baad try karo! 😅`;
    }

    return reply;
  } catch (error) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return `Arey yaar, response mein thodi der lag gayi! Dobara try karo please 🙏`;
    }
    return `Oops dost, abhi thoda issue hai! Thodi der mein try karo 😅`;
  }
}

function formatNexyReply(reply) {
  const name = getNexyName();
  return `*🤖 ${name}*\n\n${reply}\n\n_— JamberTech WA_`;
}

module.exports = {
  askNexy,
  formatNexyReply,
  getNexyName,
};
