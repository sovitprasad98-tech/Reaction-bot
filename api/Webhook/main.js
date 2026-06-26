// api/webhook/main.js
const { handleUpdate } = require("../../lib/webhookHandler");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(200).send("OK - webhook alive (MAIN)");
    return;
  }
  try {
    await handleUpdate("MAIN_BOT_TOKEN", req.body);
  } catch (err) {
    console.error("MAIN webhook error:", err);
  }
  // Always 200 quickly so Telegram doesn't retry/backoff.
  res.status(200).send("OK");
};
