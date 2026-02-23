require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const User = require("./models/User");
const Booking = require("./models/Booking");

const app = express();

app.use(cors());
app.use(express.json());

/* ================= JWT MIDDLEWARE ================= */
const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "Access denied. No token." });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token" });
  }
};

/* ================= MongoDB ================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

/* ================= AUTH ROUTES ================= */
app.post("/api/auth/signup", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    email = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    await User.create({ name, email, password: hash });

    res.status(201).json({ message: "Signup successful" });

  } catch (err) {
    console.log("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.log("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= SERVICES ================= */
app.get("/api/services", (req, res) => {
  res.json([
    "Home Cleaning",
    "AC Repair",
    "Salon & Spa",
    "Plumbing",
    "Painting",
    "Electrician"
  ]);
});

/* ================= BOOKINGS ================= */
/* ================= BOOKINGS ================= */

// Create booking
app.post("/api/bookings", verifyToken, async (req, res) => {
  try {
    const { name, phone, service, date } = req.body;

    if (!name || !phone || !service || !date) {
      return res.status(400).json({ message: "All booking fields required" });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      name,
      phone,
      service,
      date
    });

    res.status(201).json({
      message: "Booking saved successfully",
      booking
    });

  } catch (err) {
    console.log("Booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get logged-in user's bookings
app.get("/api/bookings", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= SERVE FRONTEND ================= */
app.use(express.static(path.join(__dirname, "frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/index.html"));
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log("Backend running on " + PORT);
});

