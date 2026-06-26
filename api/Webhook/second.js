// api/webhook/second.js
const { handleUpdate } = require("../../lib/webhookHandler");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(200).send("OK - webhook alive (SECOND)");
    return;
  }
  try {
    await handleUpdate("SECOND_BOT_TOKEN", req.body);
  } catch (err) {
    console.error("SECOND webhook error:", err);
  }
  res.status(200).send("OK");
};
