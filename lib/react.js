// lib/react.js
const { BOTS, MIN_REACTORS, MAX_REACTORS } = require("./config");
const { setReaction } = require("./telegram");
const { isChatEnabled } = require("./storage");

/**
 * Picks a random count (MIN..MAX) of bots, without repetition, from BOTS.
 */
function pickRandomBots() {
  const count =
    MIN_REACTORS + Math.floor(Math.random() * (MAX_REACTORS - MIN_REACTORS + 1));
  const shuffled = [...BOTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Given a new post (message or channel_post) and the chat it belongs to,
 * checks consent and, if enabled, fires reactions from a random subset of
 * the 5 bots (each restricted to its own configured emoji).
 */
async function reactToPost(chat, messageId) {
  const enabled = await isChatEnabled(chat.id);
  if (!enabled) return { reacted: false, reason: "chat not opted in" };

  const chosen = pickRandomBots();

  const results = await Promise.allSettled(
    chosen.map((bot) => {
      const token = process.env[bot.envVar];
      if (!token) {
        console.error(`Missing env var ${bot.envVar}, skipping bot ${bot.key}`);
        return Promise.resolve(null);
      }
      return setReaction(token, chat.id, messageId, bot.emoji);
    })
  );

  return {
    reacted: true,
    botsUsed: chosen.map((b) => b.key),
    results,
  };
}

module.exports = { reactToPost, pickRandomBots };
