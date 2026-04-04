const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    picture: { type: String },
    // Google API tokens
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    preferences: {
      ttsSpeed: { type: Number, default: 1.0 },
      autoSummarize: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
