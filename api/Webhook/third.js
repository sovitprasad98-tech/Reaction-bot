// api/webhook/third.js
const { handleUpdate } = require("../../lib/webhookHandler");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(200).send("OK - webhook alive (THIRD)");
    return;
  }
  try {
    await handleUpdate("THIRD_BOT_TOKEN", req.body);
  } catch (err) {
    console.error("THIRD webhook error:", err);
  }
  res.status(200).send("OK");
};
