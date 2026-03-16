const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  const drafts = db.drafts.findAllByUser(req.user.id).map(d => ({
    id: d.id, title: d.title, source: d.source, source_url: d.source_url,
    ss_id: d.ss_id, myhome_id: d.myhome_id, created_at: d.created_at, updated_at: d.updated_at
  }));
  res.json(drafts);
});

router.get('/:id', authMiddleware, (req, res) => {
  const draft = db.drafts.findByUserAndId(Number(req.params.id), req.user.id);
  if (!draft) return res.status(404).json({ message: 'ვერ მოიძებნა' });
  draft.template = JSON.parse(draft.template || '{}');
  draft.files = JSON.parse(draft.files || '[]');
  res.json(draft);
});

router.delete('/:id', authMiddleware, (req, res) => {
  db.drafts.delete(Number(req.params.id), req.user.id);
  res.json({ ok: true });
});

router.post('/currency', authMiddleware, (req, res) => {
  db.currency.save(req.body.usd || req.body.USD, req.body.eur || req.body.EUR);
  res.json({ ok: true });
});

module.exports = router;
