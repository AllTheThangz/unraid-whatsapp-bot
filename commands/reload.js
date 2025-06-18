const fs = require("fs");
const path = require("path");
exports.run = async (sock, msg) => {
  console.log("♻️ Running !reload command");
  const commands = new Map();
  const commandFiles = fs.readdirSync(path.join(__dirname)).filter(f => f.endsWith(".js") && f !== "reload.js");
  for (const file of commandFiles) {
    delete require.cache[require.resolve(`./${file}`)];
    const command = require(`./${file}`);
    const name = file.split(".")[0];
    commands.set(name, command);
  }
  await sock.sendMessage(msg.key.remoteJid, { text: "✅ Commands reloaded." });
};