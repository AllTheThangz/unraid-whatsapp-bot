# 📱 Unraid WhatsApp Bot

A full-featured WhatsApp bot built with [Baileys](https://github.com/WhiskeySockets/Baileys), running on Node.js with integrated Web Admin Dashboard, secure HTTP API, and Docker support. Designed for Unraid or standalone Docker deployment.

---

## 🔧 Features

### 🤖 WhatsApp Bot Core
- Modular command system (`!ping`, `!media`, `!secure`, `!reload`)
- Admin-only protected commands
- Media support (images, captions, etc.)
- Auto-reconnect and session caching
- `.env`-driven configuration

### 🌐 Web Admin Panel
- Login-secured dashboard (username/password via `.env`)
- Message sending form
- Message log viewer
- Command execution UI
- API Key + Authorized Numbers (coming soon)

### 📡 HTTP API
All endpoints require `x-api-key` header.

| Method | Route          | Description                  |
|--------|----------------|------------------------------|
| POST   | `/api/send`    | Queue message to send        |
| GET    | `/api/logs`    | Fetch message log            |
| GET    | `/api/numbers` | List authorized numbers      |

---

## 🚀 Quick Start

### 🔌 Requirements
- Node.js 18+
- Docker (optional)
- WhatsApp number with QR access

### 🧪 Local Dev

```bash
git clone https://github.com/AllTheThangz/unraid-whatsapp-bot.git
cd unraid-whatsapp-bot

cp .env.example .env
# Fill in OWNER_NUMBER, ADMIN_USER, ADMIN_PASS, etc.

npm install
npm start
```

Scan the QR in terminal to activate the session.

---

### 🐳 Docker (Recommended)

```bash
docker build -t whatsapp-bot .
docker run -d -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --env-file .env \
  --name whatsapp-bot \
  whatsapp-bot
```

Access the admin dashboard at:  
📍 `http://localhost:3000`

---

## 🗂 Directory Structure

```
.
├── index.js          # WhatsApp bot logic
├── server.js         # Admin panel + API server
├── commands/         # Bot command modules
├── routes/api.js     # API endpoints
├── views/            # Admin panel templates (EJS)
├── data/             # Persisted data (auth, logs, keys)
├── Dockerfile
├── .env.example
```

---

## 🔐 Environment Variables

See `.env.example`

```env
OWNER_NUMBER=1234567890@s.whatsapp.net
ADMIN_USER=admin
ADMIN_PASS=supersecurepassword
SESSION_SECRET=verysecret
PORT=3000
```

---

## 🛡️ Security Notes

- Never commit `.env` or `auth_info/` to public repos
- Use strong `ADMIN_PASS` and rotate `x-api-key` regularly
- All API traffic should ideally be behind reverse proxy w/ HTTPS

---

## 📈 Roadmap

- [x] Admin dashboard UI
- [x] Basic API support
- [ ] API key generation & management
- [ ] QR login panel (for browser scanning)
- [ ] SQLite or lowdb message storage
- [ ] Webhook triggers + command chaining

---

## 🤝 Contributing

PRs welcome. Please lint and structure routes or commands inside their respective folders.

---

## 🧠 Credits

Built with:
- [Baileys WhatsApp Library](https://github.com/WhiskeySockets/Baileys)
- [Express](https://expressjs.com)
- [EJS](https://ejs.co)

MIT Licensed. 2025.
