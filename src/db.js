const fs = require('fs');
const path = require('path');

// Railway Volume-ზე შენახვისთვის DB_PATH env variable გამოიყენება
// Railway Variables-ში დაამატე: DB_PATH=/app/data/db.json
// ლოკალურად .env-ში: DB_PATH=../../data/db.json (ან არაფერი — default-ი გამოიყენება)
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/db.json');

const EMPTY_DB = {
  users: [],
  drafts: [],
  currency: [],
  _next_id: { users: 1, drafts: 1, currency: 1 }
};

// ერთი in-memory ასლი — loadDB/saveDB-ის ყოველ ოპერაციაზე გამოძახების ნაცვლად
let _cache = null;
let _saveTimer = null;

function loadDB() {
  if (_cache) return _cache;
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(EMPTY_DB, null, 2));
      _cache = JSON.parse(JSON.stringify(EMPTY_DB));
      return _cache;
    }
    _cache = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    return _cache;
  } catch (e) {
    console.error('DB load error:', e.message);
    _cache = JSON.parse(JSON.stringify(EMPTY_DB));
    return _cache;
  }
}

// debounced write — ბევრი ოპერაციის დროს ერთხელ წერს
function saveDB() {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(_cache, null, 2));
    } catch (e) {
      console.error('DB save error:', e.message);
    }
  }, 100);
}

const db = {
  users: {
    findBySub: (ss_sub) => { const d = loadDB(); return d.users.find(u => u.ss_sub === ss_sub) || null; },
    findById: (id) => { const d = loadDB(); return d.users.find(u => u.id === id) || null; },
    create: (user) => {
      const data = loadDB();
      const id = data._next_id.users++;
      const newUser = { id, ...user, roles: JSON.stringify(user.roles || ['USER']), created_at: new Date().toISOString() };
      data.users.push(newUser);
      saveDB();
      return newUser;
    },
    update: (id, fields) => {
      const data = loadDB();
      const idx = data.users.findIndex(u => u.id === id);
      if (idx === -1) return null;
      data.users[idx] = { ...data.users[idx], ...fields };
      saveDB();
      return data.users[idx];
    }
  },
  drafts: {
    findByUserAndUrl: (user_id, source_url) => { const d = loadDB(); return d.drafts.find(x => x.user_id === user_id && x.source_url === source_url) || null; },
    findByUserAndId: (id, user_id) => { const d = loadDB(); return d.drafts.find(x => x.id === id && x.user_id === user_id) || null; },
    findAllByUser: (user_id) => { const d = loadDB(); return d.drafts.filter(x => x.user_id === user_id).sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at)); },
    create: (draft) => {
      const data = loadDB();
      const id = data._next_id.drafts++;
      const now = new Date().toISOString();
      const newDraft = { id, ...draft, created_at: now, updated_at: now };
      data.drafts.push(newDraft);
      saveDB();
      return newDraft;
    },
    update: (id, user_id, fields) => {
      const data = loadDB();
      const idx = data.drafts.findIndex(x => x.id === id && x.user_id === user_id);
      if (idx === -1) return null;
      data.drafts[idx] = { ...data.drafts[idx], ...fields, updated_at: new Date().toISOString() };
      saveDB();
      return data.drafts[idx];
    },
    delete: (id, user_id) => {
      const data = loadDB();
      data.drafts = data.drafts.filter(x => !(x.id === id && x.user_id === user_id));
      saveDB();
    }
  },
  currency: {
    save: (usd_gel, eur_gel) => {
      const data = loadDB();
      data.currency.push({ id: data._next_id.currency++, usd_gel, eur_gel, updated_at: new Date().toISOString() });
      if (data.currency.length > 100) data.currency = data.currency.slice(-100);
      saveDB();
    }
  }
};

function initDB() {
  loadDB();
  console.log('Database ready:', DB_PATH);
}

module.exports = { db, initDB };
