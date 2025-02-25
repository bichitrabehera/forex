const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const app = express();
const PORT = process.env.PORT || 1516;

const mongoURI = "mongodb://localhost:27017/login-app";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const hashedPassword = await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;
  next();
});

const User = mongoose.model("User", userSchema);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res.send("Invalid credentials. Please try again.");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    res.send("Login successful!");
  } else {
    res.send("Invalid credentials. Please try again.");
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return res.send("User already exists. Please try a different username.");
  }

  const newUser = new User({ username, password });

  try {
    await newUser.save();
    res.send("Registration successful!");
  } catch (err) {
    res.send("Error registering user. Please try again.");
  }
});

app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
