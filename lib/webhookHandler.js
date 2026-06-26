// lib/webhookHandler.js
const { handleMyChatMember, handleDisableCommand, handleEnableCommand } = require("./consent");
const { reactToPost } = require("./react");

/**
 * Generic handler shared by every bot's webhook endpoint.
 * @param {string} envVarName - which env var holds this endpoint's bot token
 * @param {object} update - the Telegram Update object from the webhook body
 */
async function handleUpdate(envVarName, update) {
  const token = process.env[envVarName];
  if (!token) {
    console.error(`${envVarName} is not set`);
    return;
  }

  // 1. Bot's own membership/admin status changed -> consent logic.
  if (update.my_chat_member) {
    await handleMyChatMember(token, update.my_chat_member);
    return;
  }

  // 2. Commands sent in a group (text messages starting with /).
  const message = update.message;
  if (message && typeof message.text === "string") {
    const text = message.text.trim();
    if (text === "/disable") {
      await handleDisableCommand(token, message);
      return;
    }
    if (text === "/enable") {
      await handleEnableCommand(token, message);
      return;
    }
  }

  // 3. New post in a channel -> react.
  if (update.channel_post) {
    await reactToPost(update.channel_post.chat, update.channel_post.message_id);
    return;
  }

  // 4. New message in a group -> react.
  if (update.message) {
    await reactToPost(update.message.chat, update.message.message_id);
    return;
  }
}

module.exports = { handleUpdate };
