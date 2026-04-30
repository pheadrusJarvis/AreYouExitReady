# Deploying the Exit Readiness Workshop Tool

A clean URL for your Zoom sessions — live in about 10 minutes.

---

## What You're Deploying

- **Participant tool** — assessment + AI-generated personalized plan
- **Facilitator dashboard** — live participant data, aggregate radar chart, AI group insights
- **Serverless API proxy** — your Anthropic key stays server-side, never in the browser
- **Vercel KV storage** — participants' results are shared across devices in real time

---

## Step 1 — GitHub

1. Create a new repository at [github.com/new](https://github.com/new)
2. Copy all files from this folder into it (maintaining folder structure)
3. Commit and push

```
workshop-deploy/
├── api/
│   ├── claude.js
│   └── participants.js
├── src/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

---

## Step 2 — Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (free account works)
2. Click **Add New → Project**
3. Import your GitHub repository
4. Vercel auto-detects Vite. Leave all build settings as-is.
5. Click **Deploy** — it'll build in about 60 seconds
6. You'll get a URL like `your-project.vercel.app` — that's your shareable link

---

## Step 3 — Anthropic API Key

1. In your Vercel project, go to **Settings → Environment Variables**
2. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your key from [console.anthropic.com](https://console.anthropic.com)
   - **Environment:** Production, Preview, Development (check all three)
3. Click **Save**
4. Go to **Deployments → Redeploy** (required to pick up new env vars)

Your API key is now server-side only. It never appears in the browser or the client bundle.

---

## Step 4 — Vercel KV Storage

This enables the facilitator dashboard to see participant results in real time.

1. In your Vercel project, go to **Storage → Create → KV**
2. Name it anything (e.g., `workshop-store`)
3. Click **Connect to Project** and select your project
4. Vercel automatically adds the required environment variables (`KV_URL`, `KV_REST_API_URL`, etc.)
5. Go to **Deployments → Redeploy** again

---

## Step 5 — Run a Test

1. Open your deployed URL
2. Select **Facilitator**, enter a session code like `TEST01`, set a PIN
3. Open the same URL in a second tab → select **Participant**, enter `TEST01`
4. Complete a few categories and generate a plan
5. Check your facilitator dashboard — participant should appear within 20 seconds

---

## Workshop Day

**Before the session:**
- Open the facilitator dashboard (your URL → Facilitator → your session code)
- Put your session code in a Zoom chat message, ready to send

**During Segment 5:**
- Drop the URL and session code in Zoom chat
- Participants open it on their device, enter their name + session code, and begin
- Your dashboard auto-refreshes every 20 seconds

**When most participants have finished:**
- Click **✦ Generate** on your dashboard for AI talking points tailored to this room's data
- Use those points to lead Segment 6 discussion

---

## Local Development (Optional)

To run locally before deploying:

```bash
npm install
npm install -g vercel
vercel dev
```

`vercel dev` runs both Vite and the serverless functions together on port 3000.
You'll need to add your env vars to a `.env.local` file for local testing:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

(Get the KV values from Vercel → Storage → your KV store → `.env.local` tab)

---

## Support

Questions? info@jarvislegacy.com · (520) 333-5123