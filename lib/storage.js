// lib/storage.js
//
// Uses a private Telegram chat (set via STORAGE_CHAT_ID) as a tiny database.
// We keep a single message in that chat whose text is a JSON blob:
//   { "enabledChats": { "-1001234567890": { "enabledAt": "...", "enabledBy": 123 } } }
//
// The message ID of that JSON blob is itself cached in-memory per cold start,
// but since Vercel functions are stateless between invocations, we also
// store the "pointer" message_id by pinning it — on each read we fetch the
// pinned message of the storage chat, which is fast and reliable.
//
// This avoids needing Vercel KV / Redis / any external DB.

const { callTelegram } = require("./telegram");

function getStorageBotToken() {
  // We use MAIN_BOT_TOKEN to talk to the storage chat — it just needs to be
  // a member of that chat. Any single bot token works for this.
  const token = process.env.MAIN_BOT_TOKEN;
  if (!token) throw new Error("MAIN_BOT_TOKEN missing — required for storage too");
  return token;
}

function getStorageChatId() {
  const id = process.env.STORAGE_CHAT_ID;
  if (!id) throw new Error("STORAGE_CHAT_ID env var is not set");
  return id;
}

/**
 * Reads current state JSON from the pinned message in the storage chat.
 * Returns a default empty structure if nothing is pinned yet.
 */
async function readState() {
  const token = getStorageBotToken();
  const chatId = getStorageChatId();

  const chatInfo = await callTelegram(token, "getChat", { chat_id: chatId });
  const pinned = chatInfo?.result?.pinned_message;

  if (!pinned || !pinned.text) {
    return { enabledChats: {} };
  }

  try {
    return JSON.parse(pinned.text);
  } catch (e) {
    console.error("Failed to parse storage state JSON, resetting.", e);
    return { enabledChats: {} };
  }
}

/**
 * Writes the state JSON back: edits the existing pinned message if present,
 * otherwise sends a new message and pins it.
 */
async function writeState(state) {
  const token = getStorageBotToken();
  const chatId = getStorageChatId();
  const text = JSON.stringify(state);

  const chatInfo = await callTelegram(token, "getChat", { chat_id: chatId });
  const pinned = chatInfo?.result?.pinned_message;

  if (pinned && pinned.message_id) {
    const editResult = await callTelegram(token, "editMessageText", {
      chat_id: chatId,
      message_id: pinned.message_id,
      text,
    });
    if (editResult.ok) return;
    // If edit fails (e.g. message too old/deleted), fall through to send+pin.
  }

  const sendResult = await callTelegram(token, "sendMessage", {
    chat_id: chatId,
    text,
  });

  if (sendResult.ok && sendResult.result?.message_id) {
    await callTelegram(token, "pinChatMessage", {
      chat_id: chatId,
      message_id: sendResult.result.message_id,
      disable_notification: true,
    });
  }
}

/**
 * Marks a chat (channel/group) as opted-in.
 */
async function enableChat(chatId, meta = {}) {
  const state = await readState();
  state.enabledChats[String(chatId)] = {
    enabledAt: new Date().toISOString(),
    ...meta,
  };
  await writeState(state);
}

/**
 * Marks a chat as opted-out (removes it).
 */
async function disableChat(chatId) {
  const state = await readState();
  delete state.enabledChats[String(chatId)];
  await writeState(state);
}

/**
 * Checks whether a chat is currently opted-in.
 */
async function isChatEnabled(chatId) {
  const state = await readState();
  return Boolean(state.enabledChats[String(chatId)]);
}

module.exports = {
  readState,
  writeState,
  enableChat,
  disableChat,
  isChatEnabled,
};
