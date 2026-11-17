
const mongoose = require("mongoose");

const detailTransaksiSchema = new mongoose.Schema(
  {
    id_detail_transaksi: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      maxlength: 4
    },
    id_transaksi: {
      type: String,
      required: true
    },
    id_barang: {
      type: String,
      required: true
    },
    jumlah: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Jumlah barang harus berupa bilangan bulat"
      }
    },
    harga_satuan: {
      type: Number,
      required: true,
      min: 0,
      max: 9999999999.99
    }
  },
  {
    timestamps: false
  }
);

module.exports = mongoose.model("DetailTransaksi", detailTransaksiSchema);
