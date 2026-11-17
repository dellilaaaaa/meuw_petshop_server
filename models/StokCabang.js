
const mongoose = require("mongoose");

const stokCabangSchema = new mongoose.Schema(
  {
    id_stok: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      maxlength: 4
    },
    id_toko: {
      type: String,
      required: true
    },
    id_barang: {
      type: String,
      required: true
    },
    jumlah_stok: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Jumlah stok harus berupa bilangan bulat"
      }
    }
  },
  {
    collection: "stok_cabangs",
    timestamps: false
  }
);

module.exports = mongoose.model("StokCabang", stokCabangSchema);
