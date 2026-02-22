require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Booking = require("./models/Booking");

const app = express();

app.use(cors());
app.use(express.json());
// ================= JWT MIDDLEWARE =================
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).send("Access denied. No token.");
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};


// ================= MongoDB =================
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

// ================= SIGNUP =================
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

    await User.create({
      name,
      email,
      password: hash
    });

    res.status(201).json({ message: "Signup successful" });

  } catch (err) {
    console.log("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// ================= LOGIN =================
app.post("/api/auth/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    console.log("Request body:", req.body);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    console.log("User from DB:", user);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("Password match:", isMatch);

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
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// ================= BOOKINGS =================
app.post("/api/bookings", verifyToken, async(req,res)=>{
const { name, phone, service, date } = req.body;

if(!name || !phone || !service || !date){
  return res.status(400).send("All booking fields required");
}

 await Booking.create(req.body);
 res.send("Booking saved");
});

// ================= SERVICES =================
app.get("/api/services",(req,res)=>{
 res.json([
   "Home Cleaning",
   "AC Repair",
   "Salon & Spa",
   "Plumbing",
   "Painting",
   "Electrician"
 ]);
});

app.get("/api/bookings", verifyToken, async (req,res)=>{
  const bookings = await Booking.find();
  res.json(bookings);
});
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
 console.log("Backend running on " + PORT);
});
