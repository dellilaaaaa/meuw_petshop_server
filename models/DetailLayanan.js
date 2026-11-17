
const mongoose = require("mongoose");

const detailLayananSchema = new mongoose.Schema(
  {
    id_detail_layanan: {
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
    id_layanan: {
      type: String,
      required: true
    },
    jumlah: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Jumlah layanan harus berupa bilangan bulat"
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

module.exports = mongoose.model("DetailLayanan", detailLayananSchema);
