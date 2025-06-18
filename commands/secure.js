const { OWNER_NUMBER } = require("../config");

exports.run = async (sock, msg) => {
    const sender = msg.key.participant || msg.key.remoteJid;
    if (sender !== OWNER_NUMBER) {
        return sock.sendMessage(msg.key.remoteJid, {
            text: "🚫 You are not authorized to run this command."
        });
    }

    await sock.sendMessage(msg.key.remoteJid, {
        text: "🔐 Secure command executed!"
    });
};
