// lib/config.js
//
// Central config: maps each bot to its env var name and the reaction
// emoji it should send. Add/remove bots here if you ever change the lineup.
//
// IMPORTANT: Telegram only allows specific emoji in the reaction API.
// The ones used below (❤️ 🥰 👌) are all in Telegram's allowed reaction set.

const BOTS = [
  { key: "MAIN", envVar: "MAIN_BOT_TOKEN", emoji: "❤️" },
  { key: "SECOND", envVar: "SECOND_BOT_TOKEN", emoji: "❤️" },
  { key: "THIRD", envVar: "THIRD_BOT_TOKEN", emoji: "🥰" },
  { key: "FORTH", envVar: "FORTH_BOT_TOKEN", emoji: "👌" },
  { key: "LAST", envVar: "LAST_BOT_TOKEN", emoji: "🥰" },
];

// How many of the 5 bots react to any single post (randomly chosen each time).
const MIN_REACTORS = 2;
const MAX_REACTORS = 3;

// Name of the private Telegram chat used as a "database" for storing which
// channels/groups have opted in. The bot must be a member/admin of this chat.
// Set this chat ID in STORAGE_CHAT_ID env var.
//
// We store opt-in state by editing a single pinned message (as JSON) in that
// chat, rather than sending a new message every time, to keep it simple.

module.exports = {
  BOTS,
  MIN_REACTORS,
  MAX_REACTORS,
};
