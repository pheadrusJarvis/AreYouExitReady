// Vercel Serverless Function — Participant Data Storage
// Uses Vercel KV (Redis). Enable it in your Vercel project:
//   Dashboard → Storage → Create → KV → Connect to project
// Vercel adds the required env vars automatically.

import { kv } from '@vercel/kv';

const TTL_SECONDS = 60 * 60 * 24; // 24-hour expiry — clears between workshops

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // ── POST: save a participant's results ──────────────────────────────────
    if (req.method === 'POST') {
      const { key, value } = req.body;
      if (!key || value === undefined) return res.status(400).json({ error: 'Missing key or value' });
      await kv.set(key, value, { ex: TTL_SECONDS });
      return res.json({ ok: true });
    }

    // ── GET: fetch one record or list all by prefix ─────────────────────────
    if (req.method === 'GET') {
      const { key, prefix } = req.query;

      if (key) {
        const value = await kv.get(key);
        return res.json({ value });
      }

      if (prefix) {
        // Returns all participant objects for this session in one call
        const keys = await kv.keys(`${prefix}*`);
        if (!keys.length) return res.json({ keys: [], values: [] });
        const values = await kv.mget(...keys);
        return res.json({ keys, values });
      }

      return res.status(400).json({ error: 'Provide key or prefix query param' });
    }

    return res.status(405).end();
  } catch (err) {
    console.error('KV error:', err);
    return res.status(500).json({ error: 'Storage error — check that Vercel KV is connected to this project.' });
  }
}