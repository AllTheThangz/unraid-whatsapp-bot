const express = require("express");
const session = require("express-session");
const path = require("path");
const config = require("./config");
const { sock } = require("./index");
const fs = require("fs");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: config.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

let commands = new Map();
fs.readdirSync(path.join(__dirname, "commands"))
  .filter(f => f.endsWith(".js"))
  .forEach(file => commands.set(file.split(".")[0], require(`./commands/${file}`)));

let logs = [];

function auth(req, res, next) {
  if (req.headers.authorization === `Bearer ${config.API_KEY}` || req.session.user) return next();
  res.status(401).send("Unauthorized");
}

app.get("/login", (req, res) => res.render("login"));
app.post("/login", (req, res) => {
  if (req.body.username === config.ADMIN_USER && req.body.password === config.ADMIN_PASS) {
    req.session.user = true; return res.redirect("/admin");
  } else res.render("login", { error: "Invalid credentials" });
});

app.get("/admin", auth, (req, res) => res.render("admin", { commands: [...commands.keys()] }));

app.post("/send", auth, async (req, res) => {
  try {
    await sock.sendMessage(req.body.to, { text: req.body.message });
    logs.push({ ...req.body, time: new Date().toISOString() });
    res.send("Message sent");
  } catch (e) {
    console.error(e); res.status(500).send("Send failed");
  }
});

app.post("/run", auth, async (req, res) => {
  try {
    const msg = { key: { remoteJid: config.OWNER_NUMBER }, message: { conversation: `!${req.body.command}` } };
    await commands.get(req.body.command).run(sock, msg);
    res.send("Command run");
  } catch (e) {
    console.error(e); res.status(500).send("Run failed");
  }
});

app.get("/logs", auth, (req, res) => res.json(logs));

app.listen(config.PORT, () => console.log(`✅ Admin at http://localhost:${config.PORT}`));
