// api/setup.js
//
// Visit this URL once after deploying (in browser or via curl) to register
// all 5 bot webhooks with Telegram automatically:
//
//   https://<your-vercel-app>.vercel.app/api/setup?key=<SETUP_SECRET>
//
// Protected by SETUP_SECRET env var so randoms can't re-point your bots'
// webhooks elsewhere.

const { setWebhook, getMe } = require("../lib/telegram");
const { BOTS } = require("../lib/config");

module.exports = async (req, res) => {
  const providedKey = req.query?.key;
  if (!process.env.SETUP_SECRET || providedKey !== process.env.SETUP_SECRET) {
    res.status(403).json({ error: "Forbidden — missing or wrong setup key" });
    return;
  }

  const baseUrl = process.env.PUBLIC_BASE_URL; // e.g. https://my-app.vercel.app
  if (!baseUrl) {
    res.status(500).json({ error: "PUBLIC_BASE_URL env var not set" });
    return;
  }

  const endpointMap = {
    MAIN: "main",
    SECOND: "second",
    THIRD: "third",
    FORTH: "forth",
    LAST: "last",
  };

  const results = [];

  for (const bot of BOTS) {
    const token = process.env[bot.envVar];
    if (!token) {
      results.push({ bot: bot.key, ok: false, error: `${bot.envVar} not set` });
      continue;
    }

    const me = await getMe(token);
    const webhookUrl = `${baseUrl}/api/webhook/${endpointMap[bot.key]}`;
    const setResult = await setWebhook(token, webhookUrl);

    results.push({
      bot: bot.key,
      username: me?.result?.username,
      webhookUrl,
      ok: Boolean(setResult.ok),
      description: setResult.description,
    });
  }

  res.status(200).json({ results });
};
