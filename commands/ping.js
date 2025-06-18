exports.run = async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, { text: "🏓 Pong!" });
};
