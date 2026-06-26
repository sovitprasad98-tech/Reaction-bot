// api/webhook/forth.js
const { handleUpdate } = require("../../lib/webhookHandler");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(200).send("OK - webhook alive (FORTH)");
    return;
  }
  try {
    await handleUpdate("FORTH_BOT_TOKEN", req.body);
  } catch (err) {
    console.error("FORTH webhook error:", err);
  }
  res.status(200).send("OK");
};
