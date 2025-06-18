exports.run = async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, {
        text: "*✅ Bot is alive!*
Hello from the Unraid WhatsApp Bot 🎉",
        footer: "Powered by Baileys"
    });
};
