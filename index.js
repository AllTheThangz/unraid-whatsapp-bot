require("dotenv").config();
const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        try {
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
            if (!text) return;

            const commandName = text.trim().split(" ")[0].toLowerCase().replace("!", "");
            const commandPath = path.join(__dirname, "commands", `${commandName}.js`);
            if (fs.existsSync(commandPath)) {
                const command = require(commandPath);
                await command.run(sock, msg, text);
            }
        } catch (err) {
            console.error("Error handling message:", err);
            await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Error handling your message." });
        }
    });
}

startBot();
