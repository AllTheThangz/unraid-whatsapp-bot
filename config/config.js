const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

function required(key) {
  if (!process.env[key]) throw new Error(`❌ Missing required environment variable: ${key}`);
  return process.env[key];
}

module.exports = {
  ADMIN_USER: required("ADMIN_USER"),
  ADMIN_PASS: required("ADMIN_PASS"),
  SESSION_SECRET: required("SESSION_SECRET"),
  OWNER_NUMBER: required("OWNER_NUMBER"),
  PORT: process.env.PORT || 3000,
  API_KEY: required("API_KEY")
};
