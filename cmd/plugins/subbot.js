const axios = require("axios");

module.exports = {
  config: {
    name: "subbot",
    credits: "Emon",
    aliases: ["startsub", "sub"],
    prefix: true,
    description: "Build your own personal video-downloader bot — a private. easy-to-use tool tailored just for you.",
    permission: 0
  },

  start: async ({ api, event }) => {
    const threadId = event.threadID || event.threadId || event.chatID;
    const messageId = event.messageID || event.messageId;

    // Raw user message
    const raw = (event.body || "").trim();

    if (!raw) {
      return api.sendMessage(threadId, `🔹 Please provide token and name in one line:
Example:
/subbot bot Token = Your Name`, { reply_to_message_id: messageId });
    }

    // Parse token = name
    let token, name;
    const match = raw.match(/\/?subbot\s+([^\s=]+)\s*=\s*(.+)/i);
    if (match) {
      token = match[1].trim();
      name = match[2].trim();
    } else {
      // fallback: first word token, rest name
      const words = raw.replace(/^\/?subbot\s+/i, "").split(" ");
      if (words.length >= 2) {
        token = words[0].trim();
        name = words.slice(1).join(" ").trim();
      }
    }

    // Validate token & name
    if (!token) return api.sendMessage(threadId, "❌ Token not found! Example:\n/subbot <token> = <name>", { reply_to_message_id: messageId });
    if (!name) return api.sendMessage(threadId, "❌ Name not found! Example:\n/subbot <token> = <name>", { reply_to_message_id: messageId });
    if (!token.includes(":")) return api.sendMessage(threadId, "❌ Invalid Telegram token! Must include ':'", { reply_to_message_id: messageId });

    // Send POST request to server
    const url = "http://51.75.118.17:20080/start";
    const formBody = new URLSearchParams({ token, name }).toString();

    try {
      const res = await axios.post(url, formBody, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 15000
      });

      const responseText = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
      return api.sendMessage(threadId, `✅ Server responded:\n${responseText}`, { reply_to_message_id: messageId });
    } catch (err) {
      const errMsg = err.response
        ? `❌ Server returned HTTP ${err.response.status}:\n${typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data)}`
        : `❌ Error: ${err.message}`;
      return api.sendMessage(threadId, errMsg, { reply_to_message_id: messageId });
    }
  }
};
    
