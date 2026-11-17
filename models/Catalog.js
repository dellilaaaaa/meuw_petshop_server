
const mongoose = require("mongoose");

const catalogSchema = new mongoose.Schema(
  {
    id_barang: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      maxlength: 4
    },
    id_kategori: {
      type: String,
      ref: "Kategori",
      required: [true, "ID Kategori harus diisi"],
      maxlength: 4
    },
    nama_barang: {
      type: String,
      required: [true, "Nama barang harus diisi"],
      maxlength: 150
    },
    harga: {
      type: Number,
      required: [true, "Harga barang harus diisi"],
      min: 0,
      max: 9999999999.99
    },
    foto: {
      type: String,
      default: ""
    },
    deskripsi: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Catalog", catalogSchema);
