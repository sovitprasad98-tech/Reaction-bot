// lib/consent.js
//
// Consent model (as decided): a channel/group is considered opted-in the
// moment a user promotes ANY of the 5 bots to admin in that chat. This is
// treated as the consent signal — Telegram requires an explicit admin action
// from someone with rights in that chat to promote a bot, so it can't happen
// by accident or from outside.
//
// We double check the update by re-querying getChatMember for the bot itself,
// rather than blindly trusting the webhook payload, to avoid spoofing.
//
// /disable can be sent by any admin of the chat at any time to opt back out.

const { getChatMember, sendMessage } = require("./telegram");
const { enableChat, disableChat, isChatEnabled } = require("./storage");

/**
 * Handles a "my_chat_member" update — fired whenever the bot's own status
 * in a chat changes (added, promoted, demoted, removed).
 */
async function handleMyChatMember(token, update) {
  const chat = update.chat;
  const newStatus = update.new_chat_member?.status;
  const fromUser = update.from; // the admin who made the change

  if (newStatus === "administrator") {
    // Re-verify directly with Telegram rather than trusting the payload alone.
    const me = await getChatMember(token, chat.id, update.new_chat_member.user.id);
    if (me?.result?.status === "administrator") {
      await enableChat(chat.id, {
        chatTitle: chat.title || chat.username || String(chat.id),
        enabledBy: fromUser?.id,
        enabledByName: fromUser?.username || fromUser?.first_name,
      });
      // Let the admin know reactions are now active, and how to turn it off.
      await sendMessage(
        token,
        chat.id,
        "✅ Reaction bots enabled for this chat.\nSend /disable here anytime to turn this off."
      );
    }
  }

  if (newStatus === "member" || newStatus === "left" || newStatus === "kicked") {
    // Bot was demoted or removed — treat as automatic opt-out for this bot's
    // relationship with the chat. (Other bots remain governed by their own
    // my_chat_member updates.)
    await disableChat(chat.id);
  }
}

/**
 * Handles the /disable command sent inside a group/channel by an admin.
 */
async function handleDisableCommand(token, message) {
  const chatId = message.chat.id;
  const userId = message.from?.id;

  const member = await getChatMember(token, chatId, userId);
  const isAdmin =
    member?.result?.status === "administrator" || member?.result?.status === "creator";

  if (!isAdmin) {
    await sendMessage(token, chatId, "⚠️ Only an admin of this chat can disable reactions.");
    return;
  }

  await disableChat(chatId);
  await sendMessage(token, chatId, "🛑 Reaction bots disabled for this chat.");
}

/**
 * Handles the /enable command — informational only, since real enabling
 * happens via promoting the bot to admin. This just tells the admin the
 * current status / what to do.
 */
async function handleEnableCommand(token, message) {
  const chatId = message.chat.id;
  const alreadyEnabled = await isChatEnabled(chatId);

  if (alreadyEnabled) {
    await sendMessage(token, chatId, "✅ Reaction bots are already enabled here.");
    return;
  }

  await sendMessage(
    token,
    chatId,
    "ℹ️ To enable auto-reactions, promote this bot to <b>admin</b> in this chat. That action itself turns reactions on."
  );
}

module.exports = {
  handleMyChatMember,
  handleDisableCommand,
  handleEnableCommand,
};
