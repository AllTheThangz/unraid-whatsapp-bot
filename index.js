require("dotenv").config({ path: "./.env" });
const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const config = require("./config");

const { state, saveCreds } = useSingleFileAuthState("./data/auth_info.json");
let sock;
let commands = new Map();

function loadCommands() {
  commands.clear();
  const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter(f => f.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.set(file.split(".")[0], command);
  }
}

function startBot() {
  sock = makeWASocket({ auth: state, printQRInTerminal: true, logger: { level: "silent" } });
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") console.log("✅ Connected to WhatsApp");
  });
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    if (!body.startsWith("!")) return;
    const commandName = body.trim().slice(1).split(" ")[0];
    if (commands.has(commandName)) {
      try { await commands.get(commandName).run(sock, msg); }
      catch (e) { console.error("Command error:", e); }
    }
  });
}

loadCommands();
startBot();
module.exports = { sock };
