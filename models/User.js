const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    no_telp: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    alamat: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);