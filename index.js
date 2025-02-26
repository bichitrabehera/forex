// server.js
const express = require("express");
require("dotenv").config();
require("./server/config/db"); // Ensures the database connection is established
const User = require("./server/models/User");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 1516;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => res.render("index"));
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.send("Invalid credentials. Please try again.");
  }

  res.render("index");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (await User.findOne({ username })) {
    return res.send("User already exists. Please try a different username.");
  }

  try {
    await new User({ username, password }).save();
    res.send("Registration successful!");
  } catch (err) {
    res.send("Error registering user. Please try again.");
  }
});

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
