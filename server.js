const express = require('express');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const multer = require('multer');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');

const app = express();
const port = 3000;
const configPath = './config/config.json';
const logPath = './logs/messages.log';

let config = JSON.parse(fs.readFileSync(configPath));
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "changeme";

const client = new Client({ authStrategy: new LocalAuth() });

client.on('qr', qr => {
  console.log('Scan this QR with your WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp Bot is ready!');
});

client.on('message', message => {
  if (message.body.toLowerCase() === 'status') {
    message.reply('✅ Bot is online.');
  }
});

client.initialize();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const upload = multer({ dest: './uploads/' });

app.get('/send', (req, res) => {
  const { to, text, apikey } = req.query;
  if (!to || !text || !apikey) return res.status(400).send('Missing fields');
  if (!Object.values(config.apiKeys).includes(apikey)) return res.status(403).send('Invalid API key');

  const chatId = to.includes('@c.us') ? to : `${to}@c.us`;
  client.sendMessage(chatId, text)
    .then(() => {
      fs.appendFileSync(logPath, `[TEXT] ${to}: ${text}
`);
      res.send('Message sent');
    })
    .catch(err => res.status(500).send('Error sending: ' + err));
});

app.post('/upload', upload.single('file'), (req, res) => {
  const { to, caption, apikey } = req.body;
  if (!to || !apikey || !req.file) return res.status(400).send('Missing fields');
  if (!Object.values(config.apiKeys).includes(apikey)) return res.status(403).send('Invalid API key');

  const chatId = to.includes('@c.us') ? to : `${to}@c.us`;
  const filePath = path.join(__dirname, req.file.path);

  client.sendMessage(chatId, fs.readFileSync(filePath), { caption: caption || '' })
    .then(() => {
      fs.appendFileSync(logPath, `[MEDIA] ${to}: ${req.file.originalname}
`);
      res.send('Media sent');
    })
    .catch(err => res.status(500).send('Error sending media: ' + err));
});

app.get('/admin', (req, res) => {
  if (req.query.token !== ADMIN_TOKEN) return res.status(403).send('Unauthorized');
  res.render('admin', {
    numbers: config.authorizedNumbers,
    keys: Object.values(config.apiKeys),
    token: ADMIN_TOKEN
  });
});

app.post('/admin', (req, res) => {
  if (req.query.token !== ADMIN_TOKEN) return res.status(403).send('Unauthorized');

  let body = req.body;
  let numbers = body.numbers || [];
  if (!Array.isArray(numbers)) numbers = [numbers];
  if (body.new_number) numbers.push(body.new_number);
  if (body.delete_number !== undefined) numbers.splice(parseInt(body.delete_number), 1);
  config.authorizedNumbers = numbers.map(n => n.trim());

  let keys = body.keys || [];
  if (!Array.isArray(keys)) keys = [keys];
  if (body.new_key) keys.push(body.new_key);
  if (body.delete_key !== undefined) keys.splice(parseInt(body.delete_key), 1);
  config.apiKeys = {};
  keys.forEach((k, i) => config.apiKeys['key' + i] = k.trim());

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  res.redirect('/admin?token=' + ADMIN_TOKEN);
});

app.get('/health', (req, res) => {
  res.send('OK');
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});