const fs = require("fs");
const path = require("path");
exports.run = async (sock, msg) => {
  const commandsDir = path.join(__dirname);
  const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith(".js") && file !== "reload.js");
  for (const file of commandFiles) {
    delete require.cache[require.resolve(`./${file}`)];
  }
  await sock.sendMessage(msg.key.remoteJid, { text: "✅ Commands reloaded." });
};