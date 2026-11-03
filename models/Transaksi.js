const mongoose = require('mongoose');

const TransaksiSchema = new mongoose.Schema({
  id_transaksi: {
    type: String,
    required: true,
    unique: true
  },
  id_user: {
    type: String,
    required: true,
    ref: 'User'
  },
  id_toko: {
    type: String,
    required: true,
    ref: 'Toko'
  },
  tanggal: {
    type: Date,
    default: Date.now
  },
  total_harga: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Diproses', 'Selesai', 'Dibatalkan'],
    default: 'Pending'
  }
}, {
  timestamps: false
});

module.exports = mongoose.model('Transaksi', TransaksiSchema);