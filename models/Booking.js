const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  service: String,
  date: String,
  time: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", BookingSchema);
