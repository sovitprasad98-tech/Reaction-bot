// api/webhook/last.js
const { handleUpdate } = require("../../lib/webhookHandler");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(200).send("OK - webhook alive (LAST)");
    return;
  }
  try {
    await handleUpdate("LAST_BOT_TOKEN", req.body);
  } catch (err) {
    console.error("LAST webhook error:", err);
  }
  res.status(200).send("OK");
};
