const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const path = require("path");
const config = require("./config");

const { state, saveCreds } = useSingleFileAuthState("./data/auth_info.json");

let sock;
let reconnecting = false;
let commands = new Map();

function loadCommands() {
  commands.clear();
  const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter(file => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    const name = file.split(".")[0];
    commands.set(name, command);
  }
  console.log(`✅ Loaded ${commands.size} command(s)`);
}

function startBot() {
  sock = makeWASocket({ auth: state, printQRInTerminal: true, logger: { level: "silent" } });
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("📴 Disconnected.", shouldReconnect ? "Reconnecting…" : "Logged out.");
      if (shouldReconnect && !reconnecting) {
        reconnecting = true;
        setTimeout(() => { reconnecting = false; startBot(); }, 5000);
      }
    } else if (connection === "open") {
      console.log("✅ WhatsApp bot is connected.");
    }
  });
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const commandName = body.trim().split(" ")[0].substring(1);
    if (body.startsWith("!") && commands.has(commandName)) {
      try {
        await commands.get(commandName).run(sock, msg);
      } catch (err) {
        console.error(`❌ Error executing !${commandName}:`, err);
      }
    }
  });
}

loadCommands();
startBot();
module.exports = { sock };
