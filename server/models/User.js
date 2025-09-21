const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  // OTP fields for password reset
  resetPasswordOTP: {
    type: String,
    default: null,
  },
  resetPasswordOTPExpires: {
    type: Date,
    default: null,
  },
  refreshToken: {
    type: String,
    default: null,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

const User = mongoose.model("User", UserSchema);
module.exports = User;