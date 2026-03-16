const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { scrape_myhome } = require('../services/scraper_myhome');

router.post('/save/:phone', authMiddleware, async (req, res) => {
  const { url, next_data } = req.body;
  const owner_phone = req.params.phone;
  const user_id = req.user.id;
  try {
    const scraped = await scrape_myhome(url, next_data, owner_phone);
    if (!scraped) return res.status(400).json({ message: 'განცხადება ვერ მოიძებნა' });
    const existing = db.drafts.findByUserAndUrl(user_id, url);
    if (existing) {
      db.drafts.update(existing.id, user_id, { template: JSON.stringify(scraped.template), files: JSON.stringify(scraped.files), title: scraped.title });
      return res.json({ id: existing.id });
    }
    const draft = db.drafts.create({ user_id, title: scraped.title, source: 'myhome', source_url: url, template: JSON.stringify(scraped.template), files: JSON.stringify(scraped.files) });
    res.json({ id: draft.id });
  } catch (e) {
    res.status(500).json({ message: 'შეცდომა: ' + e.message });
  }
});

router.get('/template/:id', authMiddleware, (req, res) => {
  const draft = db.drafts.findByUserAndId(Number(req.params.id), req.user.id);
  if (!draft) return res.status(404).json({ message: 'დრაფტი ვერ მოიძებნა' });
  res.json({ template: JSON.parse(draft.template || '{}'), files: JSON.parse(draft.files || '[]') });
});

router.put('/update_global_authorization/:token', authMiddleware, (req, res) => {
  db.users.update(req.user.id, { myhome_token: req.params.token });
  res.json({ ok: true });
});

module.exports = router;
