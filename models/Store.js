
const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    id_toko: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      maxlength: 4
    },
    nama_toko: {
      type: String,
      required: [true, "Nama toko harus diisi"],
      trim: true
    },
    alamat: {
      type: String,
      required: [true, "Alamat toko harus diisi"],
      trim: true
    }
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.model("Store", storeSchema, "toko");
