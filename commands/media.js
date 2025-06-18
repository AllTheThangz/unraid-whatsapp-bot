exports.run = async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, {
        image: { url: "https://placekitten.com/300/300" },
        caption: "🐾 Here's a cute kitten!"
    });
};
