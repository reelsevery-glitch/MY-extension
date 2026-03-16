const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { scrape_ss } = require('../services/scraper_ss');

// დრაფტის შენახვა
router.post('/save', authMiddleware, async (req, res) => {
  const { url } = req.body;
  const user_id = req.user.id;
  if (!url || !url.includes('home.ss.ge')) return res.status(400).json({ message: 'SS.GE-ს URL არ არის სწორი' });
  try {
    const scraped = await scrape_ss(url);
    if (!scraped) return res.status(400).json({ message: 'განცხადება ვერ მოიძებნა' });
    const existing = db.drafts.findByUserAndUrl(user_id, url);
    if (existing) {
      db.drafts.update(existing.id, user_id, { template: JSON.stringify(scraped.template), files: JSON.stringify(scraped.files), title: scraped.title });
      return res.json({ id: existing.id });
    }
    const draft = db.drafts.create({ user_id, title: scraped.title, source: 'ss', source_url: url, template: JSON.stringify(scraped.template), files: JSON.stringify(scraped.files) });
    res.json({ id: draft.id });
  } catch (e) {
    res.status(500).json({ message: 'შეცდომა: ' + e.message });
  }
});

// template წამოღება
router.get('/template/:id', authMiddleware, (req, res) => {
  const draft = db.drafts.findByUserAndId(Number(req.params.id), req.user.id);
  if (!draft) return res.status(404).json({ message: 'დრაფტი ვერ მოიძებნა' });
  res.json({ template: JSON.parse(draft.template || '{}'), files: JSON.parse(draft.files || '[]') });
});

// DEBUG
router.post('/debug2', async (req, res) => {
  const { url } = req.body;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
    const html = await response.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!match) return res.json({ error: 'not found' });
    const data = JSON.parse(match[1]);
    res.json(data?.props?.pageProps?.applicationData);
  } catch(e) {
    res.json({ error: e.message });
  }
});

module.exports = router;
