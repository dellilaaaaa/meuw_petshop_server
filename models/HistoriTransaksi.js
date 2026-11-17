
const mongoose = require("mongoose");

const historiTransaksiSchema = new mongoose.Schema(
  {
    id_histori: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      maxlength: 4
    },
    id_transaksi: {
      type: String,
      required: true,
      maxlength: 4
    },
    status_sebelumnya: {
      type: String,
      default: null
    },
    status_terbaru: {
      type: String,
      required: true,
      maxlength: 20
    },
    tanggal_perubahan: {
      type: Date,
      default: Date.now
    },
    catatan: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: false
  }
);

module.exports = mongoose.model(
  "HistoriTransaksi",
  historiTransaksiSchema
);
