
const mongoose = require("mongoose");

const transaksiSchema = new mongoose.Schema(
  {
    id_transaksi: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      maxlength: 4
    },
    id_user: {
      type: String,
      required: true,
      maxlength: 4
    },
    id_toko: {
      type: String,
      required: true,
      maxlength: 4
    },
    tanggal: {
      type: Date,
      default: Date.now
    },
    total_harga: {
      type: Number,
      required: true,
      min: 0,
      max: 9999999999.99
    },
    status: {
      type: String,
      enum: ["Pending", "Diproses", "Selesai", "Dibatalkan"],
      default: "Pending",
      maxlength: 20
    }
  },
  {
    timestamps: false
  }
);

module.exports = mongoose.model("Transaksi", transaksiSchema);
