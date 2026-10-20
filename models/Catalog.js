const mongoose = require("mongoose");

const catalogSchema = new mongoose.Schema(
  {
    nama_barang: {
      type: String,
      required: [true, "Nama barang harus diisi"],
    },
    id_kategori: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kategori",
      required: [true, "ID Kategori harus diisi"],
    },
    harga: {
      type: Number,
      required: [true, "Harga barang harus diisi"],
    },
    foto: {
      type: String,
      default: "",
    },
    deskripsi: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Catalog", catalogSchema);