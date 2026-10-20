const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    id_toko: {
      type: Number,
      required: true,
      unique: true,
    },
    nama_toko: {
      type: String,
      required: true,
      trim: true,
    },
    alamat: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Store", storeSchema, "toko");