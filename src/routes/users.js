const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.put('/user_draft', authMiddleware, (req, res) => {
  const { draft_id, ss_id, myhome_id, myhome_expired_date } = req.body;
  const draft = db.drafts.findByUserAndId(draft_id, req.user.id);
  if (!draft) return res.status(404).json({ message: 'დრაფტი ვერ მოიძებნა' });
  const fields = {};
  if (ss_id !== undefined) fields.ss_id = ss_id;
  if (myhome_id !== undefined) fields.myhome_id = myhome_id;
  if (myhome_expired_date !== undefined) fields.myhome_expired_date = myhome_expired_date;
  db.drafts.update(draft_id, req.user.id, fields);
  res.json({ ok: true });
});

module.exports = router;
