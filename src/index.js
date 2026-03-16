require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');

const authRoutes = require('./routes/auth');
const ssRoutes = require('./routes/ss');
const myhomeRoutes = require('./routes/myhome');
const draftsRoutes = require('./routes/drafts');
const usersRoutes = require('./routes/users');
const imagesRoutes = require('./routes/images');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS - Extension-ს სჭირდება
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'refreshtoken', 'refreshToken', 'Global-Authorization', 'X-Website-Key'],
  exposedHeaders: ['*'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// სტატიკური ფაილები (extension.js, სურათები)
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/auth', authRoutes);
app.use('/ss', ssRoutes);
app.use('/myhome', myhomeRoutes);
app.use('/drafts', draftsRoutes);
app.use('/users', usersRoutes);
app.use('/images', imagesRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'MyEstate Backend მუშაობს ✅' });
});

// DB ინიციალიზაცია და სერვერის გაშვება
initDB();
app.listen(PORT, () => {
  console.log(`✅ სერვერი გაეშვა: http://localhost:${PORT}`);
});
