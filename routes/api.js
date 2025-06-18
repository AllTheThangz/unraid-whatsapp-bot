const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const dataDir = path.join(__dirname, "..", "data");
const apiKeysPath = path.join(dataDir, "api_keys.json");
const logPath = path.join(dataDir, "message_log.json");
const numbersPath = path.join(dataDir, "authorized.json");

function ensureFile(filePath, defaultData) {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
}

router.use((req, res, next) => {
    const token = req.headers["x-api-key"];
    ensureFile(apiKeysPath, []);
    const keys = JSON.parse(fs.readFileSync(apiKeysPath));
    if (!keys.includes(token)) return res.status(401).json({ error: "Unauthorized" });
    next();
});

router.get("/logs", (req, res) => {
    ensureFile(logPath, []);
    const logs = JSON.parse(fs.readFileSync(logPath));
    res.json(logs);
});

router.get("/numbers", (req, res) => {
    ensureFile(numbersPath, []);
    const numbers = JSON.parse(fs.readFileSync(numbersPath));
    res.json(numbers);
});

router.post("/send", (req, res) => {
    const { number, message } = req.body;
    if (!number || !message) return res.status(400).json({ error: "Missing number or message" });

    global.sendQueue = global.sendQueue || [];
    global.sendQueue.push({ number, message });
    res.json({ status: "Queued" });
});

module.exports = router;
