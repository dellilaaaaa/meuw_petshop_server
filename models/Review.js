const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    id_review: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      maxlength: 4
    },
    id_user: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      maxlength: 4
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating harus berupa bilangan bulat"
      }
    },
    komentar: {
      type: String,
      default: ""
    },
    tanggal_review: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

module.exports = mongoose.model("Review", reviewSchema);