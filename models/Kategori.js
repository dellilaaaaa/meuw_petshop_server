
const mongoose = require("mongoose");

const kategoriSchema = new mongoose.Schema(
  {
    id_kategori: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      maxlength: 4
    },
    nama_kategori: {
      type: String,
      required: [true, "Nama kategori harus diisi"],
      maxlength: [50, "Nama kategori maksimal 50 karakter"]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Kategori", kategoriSchema);
