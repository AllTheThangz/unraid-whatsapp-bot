exports.run = async (sock, msg, text) => {
    await sock.sendMessage(msg.key.remoteJid, { text: "🏓 Pong!" });
};
