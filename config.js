require("dotenv").config();

const requiredVars = ["OWNER_NUMBER"];
requiredVars.forEach((v) => {
    if (!process.env[v]) {
        console.error(`❌ Missing required environment variable: ${v}`);
        process.exit(1);
    }
});

module.exports = {
    OWNER_NUMBER: process.env.OWNER_NUMBER
};
