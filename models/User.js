const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    id_user: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      maxlength: 4
    }, 
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    nama: {
      type: String,
      required: true,
      maxlength: 150,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 50,
      trim: true
    },
    no_telp: {
      type: String,
      required: true,
      unique: true,
      maxlength: 15,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    alamat: {
      type: String,
      required: true,
      maxlength: 255,
      trim: true
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);