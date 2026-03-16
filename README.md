# MyEstate Backend

ss.ge და myhome.ge განცხადებების მართვის სისტემა.

## დაყენება

### 1. Node.js დაყენება
გადმოწერე: https://nodejs.org (LTS ვერსია)

### 2. პროექტის გახსნა
```bash
cd backend
npm install
```

### 3. .env ფაილი
შეცვალე `.env` ფაილში JWT_SECRET:
```
PORT=3000
JWT_SECRET=შენი-საიდუმლო-გასაღები
```

### 4. გაშვება (ლოკალური)
```bash
npm start
```
სერვერი გაეშვება: http://localhost:3000

### 5. Chrome Extension
- `my-extension` ფოლდერი გახსენი
- `injected.js`-ში SERVER_URL უნდა იყოს: `http://localhost:3000/`
- Chrome → chrome://extensions/ → Developer mode → Load unpacked

---

## Railway-ზე განთავსება (უფასო)

1. გადადი: https://railway.app
2. GitHub-ით შედი
3. "New Project" → "Deploy from GitHub"
4. ატვირთე backend ფოლდერი GitHub-ზე
5. Railway ავტომატურად გაუშვებს
6. Settings → Variables-ში დაამატე JWT_SECRET
7. მიიღებ URL-ს (მაგ: `https://myestate.railway.app`)
8. `injected.js`-ში შეცვალე SERVER_URL ამ URL-ზე

---

## API Endpoints

| Method | Route | აღწერა |
|--------|-------|---------|
| POST | /auth/broker_login_pin | SS.GE ავტორიზაცია |
| POST | /auth/broker_registration | რეგისტრაცია |
| POST | /auth/login/access-token | ტოკენის განახლება |
| POST | /ss/save | SS.GE განცხადების შენახვა |
| GET | /ss/template/:id | SS.GE შაბლონი |
| POST | /myhome/save/:phone | Myhome განცხადების შენახვა |
| GET | /myhome/template/:id | Myhome შაბლონი |
| GET | /drafts | ყველა დრაფტი |
| DELETE | /drafts/:id | დრაფტის წაშლა |
| GET | /images/* | სურათების proxy |

---

## ფოლდერების სტრუქტურა

```
backend/
├── src/
│   ├── index.js          # მთავარი სერვერი
│   ├── db.js             # Database
│   ├── middleware/
│   │   └── auth.js       # JWT auth
│   ├── routes/
│   │   ├── auth.js       # ავტორიზაცია
│   │   ├── ss.js         # SS.GE
│   │   ├── myhome.js     # Myhome.GE
│   │   ├── drafts.js     # დრაფტები
│   │   ├── users.js      # მომხმარებლები
│   │   └── images.js     # სურათების proxy
│   └── services/
│       ├── scraper_ss.js     # SS.GE scraper
│       └── scraper_myhome.js # Myhome scraper
├── public/
│   └── scripts/
│       └── extension.js  # Extension-ის მთავარი კოდი
├── data/                 # SQLite DB (ავტომატურად იქმნება)
├── package.json
├── .env
└── README.md
```
