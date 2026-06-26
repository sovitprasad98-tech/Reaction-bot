// lib/telegram.js
const fetch = require("node-fetch");

const API_BASE = "https://api.telegram.org/bot";

/**
 * Generic call to the Telegram Bot API.
 * @param {string} token - bot token to act as
 * @param {string} method - Telegram API method name, e.g. "sendMessage"
 * @param {object} payload - body params for the method
 */
async function callTelegram(token, method, payload) {
  const url = `${API_BASE}${token}/${method}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.ok) {
    // Don't throw — log and let caller decide. Telegram returns useful
    // error descriptions (e.g. "CHAT_NOT_FOUND", "not enough rights").
    console.error(`Telegram API error [${method}]:`, data.description);
  }
  return data;
}

/**
 * Set a reaction on a message using a given bot token.
 * @param {string} token
 * @param {number|string} chatId
 * @param {number} messageId
 * @param {string} emoji
 */
async function setReaction(token, chatId, messageId, emoji) {
  return callTelegram(token, "setMessageReaction", {
    chat_id: chatId,
    message_id: messageId,
    reaction: [{ type: "emoji", emoji }],
    is_big: false,
  });
}

/**
 * Send a plain text message.
 */
async function sendMessage(token, chatId, text, extra = {}) {
  return callTelegram(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...extra,
  });
}

/**
 * Get info about the bot's own membership status in a chat.
 * Useful to confirm the bot is actually an admin (real consent check),
 * not just trusting the update payload blindly.
 */
async function getChatMember(token, chatId, userId) {
  return callTelegram(token, "getChatMember", {
    chat_id: chatId,
    user_id: userId,
  });
}

/**
 * Get the bot's own identity (id, username) for a given token.
 */
async function getMe(token) {
  return callTelegram(token, "getMe", {});
}

/**
 * Register the webhook URL for a given bot token with Telegram.
 */
async function setWebhook(token, url) {
  return callTelegram(token, "setWebhook", {
    url,
    allowed_updates: ["message", "channel_post", "my_chat_member"],
  });
}

module.exports = {
  callTelegram,
  setReaction,
  sendMessage,
  getChatMember,
  getMe,
  setWebhook,
};
