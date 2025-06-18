require("dotenv").config();
const express = require("express");
const session = require("express-session");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(session({
    secret: process.env.SESSION_SECRET || "unraidwhatsappsecret",
    resave: false,
    saveUninitialized: true
}));

function requireLogin(req, res, next) {
    if (!req.session.loggedIn) return res.redirect("/login");
    next();
}

app.get("/login", (req, res) => res.render("login"));
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
        req.session.loggedIn = true;
        return res.redirect("/dashboard");
    }
    res.render("login", { error: "Invalid credentials" });
});

app.get("/dashboard", requireLogin, (req, res) => {
    res.render("dashboard", { user: process.env.ADMIN_USER });
});

app.get("/", (req, res) => res.redirect("/dashboard"));

app.listen(PORT, () => {
    console.log(`Web admin running on port ${PORT}`);
});
