require("dotenv").config();
const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const config = require("./config");

const commands = {};
const commandsDir = path.join(__dirname, "commands");
fs.readdirSync(commandsDir).forEach(file => {
    if (file.endsWith(".js")) {
        const name = file.replace(".js", "");
        commands[name] = require(path.join(commandsDir, file));
    }
});

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Connection closed. Reconnecting...", shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        try {
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
            if (!text || !text.startsWith("!")) return;

            const commandName = text.trim().split(" ")[0].substring(1).toLowerCase();
            const command = commands[commandName];
            if (command) {
                await command.run(sock, msg, text);
            }
        } catch (err) {
            console.error("Error handling message:", err);
            await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Error handling your message." });
        }
    });
}

startBot();
