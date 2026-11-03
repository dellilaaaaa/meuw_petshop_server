const mongoose = require('mongoose');

const HistoriTransaksiSchema = new mongoose.Schema({
  id_histori: {
    type: String,
    required: true,
    unique: true
  },
  id_transaksi: {
    type: String,
    required: true,
    ref: 'Transaksi' // Mengacu ke model Transaksi
  },
  status_sebelumnya: {
    type: String,
    default: null
  },
  status_terbaru: {
    type: String,
    required: true
  },
  tanggal_perubahan: {
    type: Date,
    default: Date.now
  },
  catatan: {
    type: String,
    default: ''
  }
}, {
  timestamps: false
});

module.exports = mongoose.model('HistoriTransaksi', HistoriTransaksiSchema);