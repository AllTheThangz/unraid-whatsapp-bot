const express = require("express");
const session = require("express-session");
const path = require("path");
const config = require("./config");
const { sock } = require("./index");

const fs = require("fs");
const commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  const name = file.split(".")[0];
  commands.set(name, command);
}

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

let messageLogs = [];

function auth(req, res, next) {
  const apiKey = req.headers.authorization?.split(" ")[1];
  if (apiKey && apiKey === config.API_KEY) return next();
  if (req.session?.user) return next();
  return res.status(401).send("Unauthorized");
}

app.get("/login", (req, res) => res.render("login"));
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === config.ADMIN_USER && password === config.ADMIN_PASS) {
    req.session.user = true;
    res.redirect("/admin");
  } else {
    res.render("login", { error: "Invalid credentials" });
  }
});

app.get("/admin", auth, (req, res) => {
  res.render("admin", { commands: [...commands.keys()], keys: [] });
});

app.post("/send", auth, async (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) return res.status(400).send("Missing to or message");
  try {
    await sock.sendMessage(to, { text: message });
    messageLogs.push({ to, message, timestamp: new Date().toISOString() });
    res.send("Message sent");
  } catch (err) {
    console.error("Send error:", err);
    res.status(500).send("Failed to send");
  }
});

app.post("/run", auth, async (req, res) => {
  const { command } = req.body;
  if (!command || !commands.has(command)) return res.status(400).send("Invalid command");
  try {
    const msg = { key: { remoteJid: config.OWNER_NUMBER }, message: { conversation: "!" + command } };
    await commands.get(command).run(sock, msg);
    res.send("Command executed");
  } catch (err) {
    console.error("Run error:", err);
    res.status(500).send("Command failed");
  }
});

app.get("/logs", auth, (req, res) => {
  res.json(messageLogs.slice(-100));
});

const PORT = config.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Web admin running at http://localhost:${PORT}`));
