const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/db.json');

const EMPTY_DB = {
  users: [],
  drafts: [],
  currency: [],
  _next_id: { users: 1, drafts: 1, currency: 1 }
};

function loadDB() {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(EMPTY_DB, null, 2));
      return JSON.parse(JSON.stringify(EMPTY_DB));
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (e) {
    return JSON.parse(JSON.stringify(EMPTY_DB));
  }
}

function saveDB(data) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
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
      saveDB(data);
      return newUser;
    },
    update: (id, fields) => {
      const data = loadDB();
      const idx = data.users.findIndex(u => u.id === id);
      if (idx === -1) return null;
      data.users[idx] = { ...data.users[idx], ...fields };
      saveDB(data);
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
      saveDB(data);
      return newDraft;
    },
    update: (id, user_id, fields) => {
      const data = loadDB();
      const idx = data.drafts.findIndex(x => x.id === id && x.user_id === user_id);
      if (idx === -1) return null;
      data.drafts[idx] = { ...data.drafts[idx], ...fields, updated_at: new Date().toISOString() };
      saveDB(data);
      return data.drafts[idx];
    },
    delete: (id, user_id) => {
      const data = loadDB();
      data.drafts = data.drafts.filter(x => !(x.id === id && x.user_id === user_id));
      saveDB(data);
    }
  },
  currency: {
    save: (usd_gel, eur_gel) => {
      const data = loadDB();
      data.currency.push({ id: data._next_id.currency++, usd_gel, eur_gel, updated_at: new Date().toISOString() });
      if (data.currency.length > 100) data.currency = data.currency.slice(-100);
      saveDB(data);
    }
  }
};

function initDB() {
  loadDB();
  console.log('Database ready:', DB_PATH);
}

module.exports = { db, initDB };
