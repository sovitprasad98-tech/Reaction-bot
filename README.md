# Telegram Multi-Bot Reaction System

5 alag Telegram bots, 1 hi codebase, Vercel par hosted. Jab koi channel/group
**explicitly consent** deta hai (kisi bhi bot ko admin banakar), tab se us
chat ke naye posts par random 2-3 bots auto-react karte hain.

## Kaise kaam karta hai

1. Har bot ka apna webhook endpoint hai: `/api/webhook/main`, `/second`,
   `/third`, `/forth`, `/last`.
2. Jab koi user kisi bot ko apne channel/group mein **admin** banata hai,
   Telegram `my_chat_member` update bhejta hai. Bot ye verify karta hai
   (`getChatMember` se) ki wo sach mein admin bana diya gaya hai, aur tabhi
   us chat ko "enabled" mark karta hai. **Yahi consent signal hai.**
3. Enabled chat mein jab bhi naya post/message aata hai, system randomly
   2-3 bots choose karta hai (5 mein se) aur unke fixed emoji se react
   karta hai:
   - MAIN → ❤️
   - SECOND → ❤️
   - THIRD → 🥰
   - FORTH → 👌
   - LAST → 🥰
4. Koi bhi admin `/disable` bhej kar kabhi bhi band kar sakta hai.
5. Opt-in status ek **private Telegram group** mein JSON ke roop mein store
   hota hai (pinned message) — koi external database/KV ki zarurat nahi.

## Setup steps

### 1. 5 bots banayein
@BotFather ko Telegram par message karein, `/newbot` 5 baar chalayein, har
ek ka token note kar lein.

### 2. Storage group banayein
- Ek naya **private group** banayein (sirf aapke liye).
- MAIN bot ko us group mein add karein aur **admin** bana dein.
- Group ka numeric chat ID nikalein — `@userinfobot` ko group mein add
  karke, ya `getUpdates` API call karke (group mein koi msg bhejne ke baad)
  `chat.id` field dekh kar. Ye negative number hoga, e.g. `-1001234567890`.

### 3. Code GitHub par push karein
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <aapka-repo-url>
git push -u origin main
```

### 4. Vercel par deploy karein
- Vercel.com par GitHub repo import karein.
- Deploy hone do (env vars abhi blank rahenge, koi baat nahi).

### 5. Environment variables daalein
Vercel Project → Settings → Environment Variables mein `.env.txt` ki saari
values daal dein:
- `MAIN_BOT_TOKEN`, `SECOND_BOT_TOKEN`, `THIRD_BOT_TOKEN`, `FORTH_BOT_TOKEN`,
  `LAST_BOT_TOKEN`
- `STORAGE_CHAT_ID`
- `SETUP_SECRET` (khud koi random string chunein)
- `PUBLIC_BASE_URL` (deploy ke baad mila hua URL, e.g.
  `https://telegram-reaction-bots.vercel.app`)

Env vars daalne ke baad **redeploy** karein (Vercel Deployments tab → ... →
Redeploy) taaki naye vars apply ho jaayein.

### 6. Webhooks register karein
Browser mein ya curl se ye URL hit karein (apna actual domain aur secret
daal kar):
```
https://your-project.vercel.app/api/setup?key=choose-a-random-string-here
```
Ye automatically saare 5 bots ke webhooks Telegram ke saath register kar
dega. Response mein har bot ka status dikhega.

### 7. Test karein
- Koi test channel/group banayein.
- Usme koi bhi ek bot (MAIN, SECOND, etc.) add karein aur **admin** banayein.
- Bot ek confirmation message bhejega: "✅ Reaction bots enabled..."
- Ab us channel/group mein koi post karein — 2-3 random bots react karenge.
- Band karna ho to `/disable` bhej dein.

## File structure
```
telegram-reaction-bots/
├── api/
│   ├── setup.js              # one-time webhook registration endpoint
│   └── webhook/
│       ├── main.js
│       ├── second.js
│       ├── third.js
│       ├── forth.js
│       └── last.js
├── lib/
│   ├── config.js              # bot list, emoji mapping, reactor count range
│   ├── telegram.js             # Telegram Bot API wrapper functions
│   ├── storage.js              # Telegram-chat-as-database read/write
│   ├── consent.js               # admin-promotion = consent logic, /disable
│   └── react.js                # random bot selection + reaction firing
├── package.json
├── vercel.json
├── .env.txt                    # template — fill in & copy into Vercel
├── .gitignore
└── README.md
```

## Important notes
- Storage group mein **bina kisi message ko delete kiye** rakhein — agar
  pinned message delete ho gaya to state reset ho jayega.
- `STORAGE_CHAT_ID` wala group **private** hi rakhein, kisi ko add na karein.
- Agar koi bot kisi chat se remove/demote ho jaata hai, wo chat automatically
  "disabled" mark ho jaati hai.
- Telegram reactions API rate-limited hai — bahut zyada chats enabled hone
  par thoda delay ho sakta hai, ye normal hai.
